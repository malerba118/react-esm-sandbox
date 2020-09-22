import React, { useRef } from 'react'
import { v4 as uuid } from 'uuid'
import { jsonToDataUrl } from './utils/url'
import { SourceFiles, ImportMap } from './types'
import Babel from '@babel/standalone'

const transpile = (code: string) => {
  return Babel.transform(code, {
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
  }).code
}

const useConstant = <T extends any>(value: T): T => {
  return useRef(value).current
}

export interface InterpreterProps {
  files: SourceFiles
  entrypoint: string
  importMap: ImportMap
}

const importMapFromFiles = (files: SourceFiles, baseUrl: string) => {
  const imports = {}
  Object.keys(files).forEach((filePath) => {
    const url = new URL(filePath, baseUrl).href
    const transpiled = transpile(files[filePath].contents)
    imports[url] = `data:application/javascript;charset=utf-8;base64,${btoa(
      transpiled || ''
    )}`
  })
  return imports
}

export const Interpreter = ({
  files = {},
  entrypoint,
  importMap
}: InterpreterProps) => {
  const interpreterId = useConstant(uuid())
  const baseUrl = new URL(
    interpreterId + '/' + entrypoint,
    window.location.href
  ).href
  //   const [ready, setReady] = useState(false)

  //   useEffect(() => {
  //     messenger.then((worker) => {
  //       const event: FilesUpdatedEvent = {
  //         interpreterId,
  //         type: InterpreterEventType.FilesUpdated,
  //         payload: JSON.stringify(files)
  //       }
  //       worker
  //         .postMessage(event)
  //         .then(() => {
  //           setReady(true)
  //         })
  //         .catch((err) => {
  //           console.log('OOPSSSS', err)
  //         })
  //     })
  //   }, [files])

  const _importMap = {
    ...importMap,
    imports: {
      ...importMap.imports,
      ...importMapFromFiles(files, baseUrl)
    }
  }

  const importMapUrl = jsonToDataUrl(_importMap)

  const resolvedEntrypoint = new URL(entrypoint, baseUrl).href

  const doc = `
    <!DOCTYPE html>
    <html>
        <head>
        <title>Page Title</title>
        </head>
        <body>
            <script defer src="/es-module-shims.js"></script>
            <script type="importmap-shim" src="${importMapUrl}"></script>
            <script data-alias="${baseUrl}" type="module-shim" src="${_importMap.imports[resolvedEntrypoint]}"></script>
        </body>
    </html>
  `
  //   if (!ready) {
  //     return null
  //   }

  return <iframe srcDoc={doc} />
}
