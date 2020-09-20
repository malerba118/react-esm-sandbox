import React, { useEffect, useRef, useState } from 'react'
import { v4 as uuid } from 'uuid'
import { Messenger } from './messenger'
import { jsonToDataUrl } from './utils/url'
import {
  InterpreterEventType,
  SourceFiles,
  FilesUpdatedEvent,
  ImportMap
} from './types'

const useConstant = <T extends any>(value: T): T => {
  return useRef(value).current
}

const messenger = Messenger()

export interface InterpreterProps {
  files: SourceFiles
  entrypoint: string
  importMap: ImportMap
}

export const Interpreter = ({
  files = {},
  entrypoint,
  importMap
}: InterpreterProps) => {
  const interpreterId = useConstant(uuid())
  const [ready, setReady] = useState(false)

  useEffect(() => {
    messenger.then((worker) => {
      const event: FilesUpdatedEvent = {
        interpreterId,
        type: InterpreterEventType.FilesUpdated,
        payload: JSON.stringify(files)
      }
      worker
        .postMessage(event)
        .then(() => {
          setReady(true)
        })
        .catch((err) => {
          console.log('OOPSSSS', err)
        })
    })
  }, [files])

  const importMapUrl = jsonToDataUrl(importMap)

  const doc = `
    <!DOCTYPE html>
    <html>
        <head>
        <title>Page Title</title>
        </head>
        <body>
            <script defer src="https://cdn.jsdelivr.net/npm/es-module-shims@0.6.0/dist/es-module-shims.min.js"></script>
            <script type="importmap-shim" src="${importMapUrl}"></script>
            <script type="module-shim" src="${interpreterId}/${entrypoint}"></script>
        </body>
    </html>
  `
  if (!ready) {
    return null
  }

  return <iframe srcDoc={doc} />
}
