import React, { useRef, useEffect, useState, useMemo } from 'react'
import { v4 as uuid } from 'uuid'
import { jsonToDataUrl, resolveUrl, getFileExtension } from './utils/url'
import { keyBy } from './utils/key-by'
import { useConstant } from './utils/hooks'
import { SourceFile, TranspiledFile, ImportMap, Log, Transform } from './types'

export interface InterpreterProps {
  document?: string
  files: SourceFile[]
  entrypoint: string
  importMap: ImportMap
  onLoading?: () => void
  onLoad?: () => void
  onError?: (error: Error) => void
  onLog?: (log: Log) => void
  transforms?: Record<string, Transform>
}

const importsFromFiles = (files: TranspiledFile[], baseUrl: string) => {
  const imports = {}
  files.forEach((file) => {
    const url = resolveUrl(baseUrl, file.path)
    imports[
      url
    ] = `data:application/javascript;charset=utf-8,${encodeURIComponent(
      file.contents || ''
    )}`
  })
  return imports
}

type GetNextTranspiledFilesMapParams = {
  prevSourceFilesMap: Record<string, SourceFile>
  nextSourceFilesMap: Record<string, SourceFile>
  transpiledFilesMap: Record<string, TranspiledFile>
  transforms: Record<string, Transform>
}

const getNextTranspiledFilesMap = ({
  prevSourceFilesMap,
  nextSourceFilesMap,
  transpiledFilesMap,
  transforms
}: GetNextTranspiledFilesMapParams) => {
  const nextTranspiledFilesMap: Record<string, TranspiledFile> = {}
  Object.values(nextSourceFilesMap).forEach((nextSourceFile) => {
    const prevSourceFile = prevSourceFilesMap[nextSourceFile.path]
    if (
      !prevSourceFile ||
      prevSourceFile.contents !== nextSourceFile.contents
    ) {
      const fileExtension = getFileExtension(nextSourceFile.path)
      const transform = transforms[fileExtension]
      // transform and add to nextTranspiledFilesMap
      nextTranspiledFilesMap[nextSourceFile.path] = {
        path: nextSourceFile.path,
        contents:
          transform?.(nextSourceFile.contents) ?? nextSourceFile.contents
      }
    } else {
      // copy over old transpiled file to nextTranspiledFilesMap
      nextTranspiledFilesMap[nextSourceFile.path] =
        transpiledFilesMap[nextSourceFile.path]
    }
  })
  return nextTranspiledFilesMap
}

type BuildDocumentParams = {
  interpreterId: string
  inputDocument: string
  baseUrl: string
  importMapUrl: string
  entrypointUrl: string
}

const buildDocument = ({
  interpreterId,
  inputDocument,
  baseUrl,
  importMapUrl,
  entrypointUrl
}: BuildDocumentParams): string => {
  return (
    `<script>
  const postMessage = ({type, payload}) => {
    window.parent.postMessage(
      { 
        interpreterId: '${interpreterId}',
        type,
        payload
      }, 
      '*'
    )
  }

  const createConsoleProxy = (type, fn) => {
    return (...args) => {
      postMessage({
        type: 'log',
        payload: {
          type,
          data: args
        }
      })
      fn(...args)
    }
  }

  const _debug = console.debug,
        _log = console.log,
        _info = console.info,
        _warn = console.warn,
        _error = console.error

  console.debug = createConsoleProxy('debug', _debug)
  console.log = createConsoleProxy('log', _log)
  console.info = createConsoleProxy('info', _info)
  console.warn = createConsoleProxy('warn', _warn)
  console.error = createConsoleProxy('error', _error)
</script>` +
    inputDocument +
    `
<script defer src="/es-module-shims.js"></script>
<script type="importmap-shim" src="${importMapUrl}"></script>
<script data-alias="${baseUrl}" type="module-shim">
  postMessage({
    type: 'loading',
  })
  import("${entrypointUrl}")
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
  )
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
  onLog,
  transforms = {}
}: InterpreterProps) => {
  const interpreterId = useConstant(uuid())
  const baseUrl = useConstant(resolveUrl(window.location.origin, entrypoint))
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
          onLog?.(event.data.payload)
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
      transpiledFilesMap,
      transforms
    })
    setTranspiledFilesMap(nextTranspiledFilesMap)
    prevSourceFilesMapRef.current = nextSourceFilesMap
  }, [files])

  const _importMap = useMemo(() => {
    return {
      ...importMap,
      imports: {
        ...importMap.imports,
        ...importsFromFiles(Object.values(transpiledFilesMap), baseUrl)
      }
    }
  }, [JSON.stringify(importMap), transpiledFilesMap, baseUrl])

  const importMapUrl = useMemo(() => jsonToDataUrl(_importMap), [_importMap])

  const entrypointUrl = _importMap.imports[baseUrl]

  const doc = useMemo(() => {
    return buildDocument({
      interpreterId,
      inputDocument: document,
      baseUrl,
      entrypointUrl,
      importMapUrl
    })
  }, [interpreterId, document, baseUrl, entrypointUrl, importMapUrl])

  if (Object.keys(transpiledFilesMap).length === 0) {
    return null
  }

  return <iframe srcDoc={doc} />
}
