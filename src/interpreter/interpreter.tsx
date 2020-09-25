import React, { useRef, useEffect, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { jsonToDataUrl } from './utils/url'
import { keyBy } from './utils/key-by'
import { SourceFile, TranspiledFile, ImportMap } from './types'
import Babel from '@babel/standalone'

const transpile: Transform = (code: string) => {
  return (
    Babel.transform(code, {
      presets: [
        [
          'env',
          {
            targets: '> 0.25%, not dead',
            // no module transpilation to CJS (!important)
            modules: false
          }
        ],
        'react',
        ['typescript', { allExtensions: true, isTSX: true }]
      ]
    }).code || ''
  )
}

type Transform = (code: string) => string

type LogType =
  | 'log'
  | 'warn'
  | 'error'
  | 'info'
  | 'debug'
  | 'command'
  | 'result'

type Log = {
  type: LogType
  data: any[]
}

const useConstant = <T extends any>(value: T): T => {
  return useRef(value).current
}

export interface InterpreterProps {
  document?: string
  files: SourceFile[]
  entrypoint: string
  importMap: ImportMap
  onLoading?: () => void
  onLoad?: () => void
  onError?: (error: Error) => void
  onLog?: (log: Log) => void
}

const importsFromFiles = (files: TranspiledFile[], baseUrl: string) => {
  const imports = {}
  files.forEach((file) => {
    const url = new URL(file.path, baseUrl).href
    imports[url] = `data:application/javascript;charset=utf-8;base64,${btoa(
      file.contents || ''
    )}`
  })
  return imports
}

type GetNextTranspiledFilesMapOptions = {
  prevSourceFilesMap: Record<string, SourceFile>
  nextSourceFilesMap: Record<string, SourceFile>
  transpiledFilesMap: Record<string, TranspiledFile>
  transform?: Transform
}

const getNextTranspiledFilesMap = ({
  prevSourceFilesMap,
  nextSourceFilesMap,
  transpiledFilesMap,
  transform = transpile
}: GetNextTranspiledFilesMapOptions) => {
  const nextTranspiledFilesMap: Record<string, TranspiledFile> = {}
  Object.values(nextSourceFilesMap).forEach((nextSourceFile) => {
    const prevSourceFile = prevSourceFilesMap[nextSourceFile.path]
    if (
      !prevSourceFile ||
      prevSourceFile.contents !== nextSourceFile.contents
    ) {
      // transform and add to nextTranspiledFilesMap
      nextTranspiledFilesMap[nextSourceFile.path] = {
        path: nextSourceFile.path,
        contents: transform(nextSourceFile.contents)
      }
    } else {
      // copy over old transpiled file to nextTranspiledFilesMap
      nextTranspiledFilesMap[nextSourceFile.path] =
        transpiledFilesMap[nextSourceFile.path]
    }
  })
  return nextTranspiledFilesMap
}

const defaultDocument = `<!DOCTYPE html>
<html>
    <head>
      <title>ESM Sandbox</title>
    </head>
    <body>
      <div id="root"></div>
    </body>
</html>`

export const Interpreter = ({
  document = defaultDocument,
  files = [],
  entrypoint,
  importMap,
  onLoading,
  onLoad,
  onError,
  onLog
}: InterpreterProps) => {
  const interpreterId = useConstant(uuid())
  const baseUrl = new URL(entrypoint, window.location.href).href
  const [transpiledFilesMap, setTranspiledFilesMap] = useState<
    Record<string, TranspiledFile>
  >({})
  const prevSourceFilesMapRef = useRef<Record<string, SourceFile>>({})

  useEffect(() => {
    const listener = (event: MessageEvent) => {
      if (event.data?.interpreterId === interpreterId) {
        if (event.data.type === 'loading') {
          onLoading?.()
        } else if (event.data.type === 'loaded') {
          onLoad?.()
        } else if (event.data.type === 'error') {
          onError?.(event.data.payload)
        } else if (event.data.type === 'log') {
          onLog?.({
            type: event.data.subtype,
            data: event.data.payload
          })
        }
      }
    }
    window.addEventListener('message', listener)
    return () => window.removeEventListener('message', listener)
  }, [])

  useEffect(() => {
    const nextSourceFilesMap = keyBy(files, 'path')
    const nextTranspiledFilesMap = getNextTranspiledFilesMap({
      prevSourceFilesMap: prevSourceFilesMapRef.current,
      nextSourceFilesMap,
      transpiledFilesMap
    })
    setTranspiledFilesMap(nextTranspiledFilesMap)
    prevSourceFilesMapRef.current = nextSourceFilesMap
  }, [files])

  const _importMap = {
    ...importMap,
    imports: {
      ...importMap.imports,
      ...importsFromFiles(Object.values(transpiledFilesMap), baseUrl)
    }
  }

  const importMapUrl = jsonToDataUrl(_importMap)

  const resolvedEntrypoint = new URL(entrypoint, baseUrl).href

  const doc =
    document +
    `
    <script>
    const postMessage = ({type, subtype, payload}) => {
      window.parent.postMessage(
        { 
          interpreterId: '${interpreterId}',
          type,
          subtype,
          payload
        }, 
        '*'
      )
    }
    </script>
    <script defer src="/es-module-shims.js"></script>
    <script type="importmap-shim" src="${importMapUrl}"></script>
    <script data-alias="${baseUrl}" type="module-shim">
      postMessage({
        type: 'loading',
      })
      import("${_importMap.imports[resolvedEntrypoint]}")
          .then(() => {
            postMessage({
              type: 'loaded',
            })
          })
          .catch((err) => {
            postMessage({
              type: 'error',
              payload: err
            })
          })
    </script>
  `

  if (Object.keys(transpiledFilesMap).length === 0) {
    return null
  }

  return <iframe srcDoc={doc} />
}
