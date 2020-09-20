import registerPromiseWorker from 'promise-worker/register'
import {
  InterpreterEventType,
  InterpreterEvent,
  SourceFiles,
  SourceFile
} from './types'
import hash from 'md5'
import Babel from '@babel/standalone'

const sw: any = self

let interpreterSourceFiles: Record<string, Record<string, SourceFile>> = {}
let interpreterTranspiledFiles: Record<string, Record<string, string>> = {}

const transpile = (code: string) => {
  return Babel.transform(code, {
    presets: [['typescript', { allExtensions: true }]]
  }).code
}

const hasFileChanged = (oldSource: string, newSource: string) => {
  return hash(oldSource ?? '') !== hash(newSource)
}

const updateTranspiledFiles = (interpreterId: string, files: SourceFiles) => {
  const nextTranspiledFiles = {}
  Object.keys(files).forEach((filePath) => {
    if (
      hasFileChanged(
        interpreterSourceFiles[interpreterId]?.[filePath]?.contents,
        files[filePath].contents
      )
    ) {
      nextTranspiledFiles[filePath] = transpile(files[filePath].contents)
    } else {
      nextTranspiledFiles[filePath] =
        interpreterTranspiledFiles[interpreterId][filePath]
    }
  })
  console.log(nextTranspiledFiles)
  interpreterTranspiledFiles[interpreterId] = nextTranspiledFiles
}

registerPromiseWorker(({ interpreterId, type, payload }: InterpreterEvent) => {
  if (type === InterpreterEventType.FilesUpdated) {
    updateTranspiledFiles(interpreterId, payload)
    interpreterSourceFiles[interpreterId] = payload
  }
  if (type === InterpreterEventType.Unmounted) {
    delete interpreterSourceFiles[interpreterId]
    delete interpreterTranspiledFiles[interpreterId]
  }
})

sw.addEventListener('install', function () {
  sw.skipWaiting()
})

sw.addEventListener('fetch', function (event: any) {
  Object.keys(interpreterSourceFiles).forEach((interpreterId) => {
    Object.keys(interpreterSourceFiles[interpreterId]).forEach((filePath) => {
      console.log(`${interpreterId}/${filePath}`)
      if (event.request.url.endsWith(`${interpreterId}/${filePath}`)) {
        return event.respondWith(
          new Response(interpreterTranspiledFiles[interpreterId][filePath], {
            headers: { 'Content-Type': 'application/javascript' }
          })
        )
      }
    })
  })
  event.respondWith(fetch(event.request))
})
