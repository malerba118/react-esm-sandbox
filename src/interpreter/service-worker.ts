import registerPromiseWorker from 'promise-worker/register'
import { InterpreterEventType } from './types'

const sw: any = self

let interpreterSourceFiles = {}

registerPromiseWorker(({ interpreterId, type, payload }) => {
  if (type === InterpreterEventType.FilesUpdated) {
    interpreterSourceFiles[interpreterId] = payload
  }
})

sw.addEventListener('install', function () {
  sw.skipWaiting()
})

sw.addEventListener('fetch', function (event: any) {
  Object.keys(interpreterSourceFiles).forEach((interpreterId) => {
    Object.keys(interpreterSourceFiles[interpreterId]).forEach((filePath) => {
      if (event.request.url.endsWith(`${interpreterId}/${filePath}`)) {
        event.respondWith(
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
})
