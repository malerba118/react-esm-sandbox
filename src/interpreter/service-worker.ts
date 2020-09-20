import registerPromiseWorker from 'promise-worker/register'
import { InterpreterEventType, InterpreterEvent } from './types'

const sw: any = self

let interpreterSourceFiles = {}

registerPromiseWorker(({ interpreterId, type, payload }: InterpreterEvent) => {
  console.log(type)
  console.log(payload)
  if (type === InterpreterEventType.FilesUpdated) {
    interpreterSourceFiles[interpreterId] = payload
    console.log(interpreterSourceFiles)
  }
})

sw.addEventListener('install', function () {
  sw.skipWaiting()
})

sw.addEventListener('fetch', function (event: any) {
  console.log(event)
  console.log(event.request.url)
  Object.keys(interpreterSourceFiles).forEach((interpreterId) => {
    Object.keys(interpreterSourceFiles[interpreterId]).forEach((filePath) => {
      console.log(`${interpreterId}/${filePath}`)
      if (event.request.url.endsWith(`${interpreterId}/${filePath}`)) {
        return event.respondWith(
          new Response(
            interpreterSourceFiles[interpreterId][filePath].contents,
            {
              headers: { 'Content-Type': 'application/javascript' }
            }
          )
        )
      }
    })
  })
  event.respondWith(fetch(event.request))
})
