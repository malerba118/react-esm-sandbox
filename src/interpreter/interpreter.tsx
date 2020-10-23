import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
  useImperativeHandle,
  forwardRef,
  CSSProperties,
  MutableRefObject
} from 'react'
import classnames from 'classnames'
import {
  jsonToDataUrl,
  resolveUrl,
  getFileExtension,
  jsToDataUrl
} from '../utils/url'
import { v4 as uuid } from '../utils/uuid'
import { keyBy } from '../utils/key-by'
import { useConstant } from '../utils/hooks'
import { SourceFile, TranspiledFile, ImportMap, Log, Transform } from '../types'
import esmShims from './esm-shims.txt'
import classes from './interpreter.module.css'

const esmShimsUrl = jsToDataUrl(esmShims)

export interface InterpreterProps {
  doc?: string
  files: SourceFile[]
  entrypoint: string
  importMap?: ImportMap
  onLoading?: () => void
  onLoad?: () => void
  onError?: (error: Error) => void
  onLog?: (log: Log) => void
  transforms?: Record<string, Transform>
  className?: string
  style?: CSSProperties
  data?: any
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

const getNextTranspiledFilesMap = async ({
  prevSourceFilesMap,
  nextSourceFilesMap,
  transpiledFilesMap,
  transforms
}: GetNextTranspiledFilesMapParams) => {
  const transpiledFilePromises = Object.entries(nextSourceFilesMap).map(
    async ([nextSourceFilePath, nextSourceFile]) => {
      const prevSourceFile = prevSourceFilesMap[nextSourceFilePath]
      if (
        !prevSourceFile ||
        prevSourceFile.contents !== nextSourceFile.contents
      ) {
        const fileExtension = getFileExtension(nextSourceFile.path)
        const transform = transforms[fileExtension]
        // transform and add to nextTranspiledFilesMap
        return {
          path: nextSourceFile.path,
          contents:
            (await transform?.(nextSourceFile.contents)) ??
            nextSourceFile.contents
        }
      } else {
        // copy over old transpiled file to nextTranspiledFilesMap
        return transpiledFilesMap[nextSourceFile.path]
      }
    }
  )

  return Promise.all(transpiledFilePromises).then((files) =>
    keyBy(files, 'path')
  )
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
    window.__esm_sandbox__ = {
      postMessage({type, payload}) {
        window.parent.postMessage(
          { 
            interpreterId: '${interpreterId}',
            type,
            payload
          }, 
          '*'
        )
      },
      createConsoleProxy(method, fn) {
        return (...args) => {
          this.postMessage({
            type: 'log',
            payload: {
              method,
              data: args
            }
          })
          fn(...args)
        }
      }
    }

  const _debug = console.debug,
        _log = console.log,
        _info = console.info,
        _warn = console.warn,
        _error = console.error
        _table = console.table

  console.debug = __esm_sandbox__.createConsoleProxy('debug', _debug)
  console.log = __esm_sandbox__.createConsoleProxy('log', _log)
  console.info = __esm_sandbox__.createConsoleProxy('info', _info)
  console.warn = __esm_sandbox__.createConsoleProxy('warn', _warn)
  console.error = __esm_sandbox__.createConsoleProxy('error', _error)
  console.table = __esm_sandbox__.createConsoleProxy('table', _table)

  window.onerror = function myErrorHandler(errorMsg, url, lineNumber) {
    __esm_sandbox__.postMessage({
      type: 'error',
      payload: new Error(errorMsg)
    });
    return false;
  }
</script>` +
    inputDocument +
    `
<script defer src="${esmShimsUrl}"></script>
<script type="importmap-shim" src="${importMapUrl}"></script>
<script data-alias="${baseUrl}" type="module-shim">
__esm_sandbox__.postMessage({
    type: 'loading',
  })
  import("${entrypointUrl}")
      .then(() => {
        __esm_sandbox__.postMessage({
          type: 'loaded',
        })
      })
      .catch((err) => {
        __esm_sandbox__.postMessage({
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

export type InterpreterHandle = {
  execute: () => void
  iframeRef: MutableRefObject<HTMLIFrameElement | null>
}

export const Interpreter = forwardRef<InterpreterHandle, InterpreterProps>(
  (
    {
      doc = defaultDocument,
      files = [],
      entrypoint,
      importMap,
      onLoading,
      onLoad,
      onError,
      onLog,
      className,
      transforms = {},
      style,
      data
    }: InterpreterProps,
    ref
  ) => {
    const interpreterId = useConstant(() => uuid())
    const baseUrl = useConstant(() =>
      resolveUrl(window.location.origin, entrypoint)
    )
    const [transpiledFilesMap, setTranspiledFilesMap] = useState<
      Record<string, TranspiledFile>
    >({})
    const prevSourceFilesMapRef = useRef<Record<string, SourceFile>>({})
    const [key, setKey] = useState(0)
    const inputRef = useRef<HTMLIFrameElement | null>(null)

    const incrementKey = useCallback(() => {
      setKey((prev) => prev + 1)
    }, [setKey])

    useImperativeHandle(
      ref,
      () => ({
        execute: () => {
          incrementKey()
        },
        iframeRef: inputRef
      }),
      [inputRef, incrementKey]
    )

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
      getNextTranspiledFilesMap({
        prevSourceFilesMap: prevSourceFilesMapRef.current,
        nextSourceFilesMap,
        transpiledFilesMap,
        transforms
      })
        .then((nextTranspiledFilesMap) => {
          setTranspiledFilesMap(nextTranspiledFilesMap)
          prevSourceFilesMapRef.current = nextSourceFilesMap
        })
        .catch((err) => {
          onError?.(err)
        })
    }, [files])

    useEffect(() => {
      inputRef.current?.contentWindow?.postMessage(data, '*')
    }, [data])

    const _importMap = useMemo(() => {
      return {
        ...importMap,
        imports: {
          ...importMap?.imports,
          ...importsFromFiles(Object.values(transpiledFilesMap), baseUrl)
        }
      }
    }, [JSON.stringify(importMap), transpiledFilesMap, baseUrl])

    const importMapUrl = useMemo(() => jsonToDataUrl(_importMap), [_importMap])

    const entrypointUrl = _importMap.imports[baseUrl]

    const builtDoc = useMemo(() => {
      return buildDocument({
        interpreterId,
        inputDocument: doc,
        baseUrl,
        entrypointUrl,
        importMapUrl
      })
    }, [interpreterId, doc, baseUrl, entrypointUrl, importMapUrl])

    if (Object.keys(transpiledFilesMap).length === 0) {
      return null
    }

    const rootClasses = classnames(classes.root, className)

    return (
      <iframe
        ref={inputRef}
        key={key}
        className={rootClasses}
        style={style}
        srcDoc={builtDoc}
      />
    )
  }
)
