import { v4 as uuid } from 'uuid'

const _messanger = async (obj: Window | ServiceWorker) => {
  if (obj instanceof Window) {
    if (navigator.serviceWorker) {
        const registration = await navigator.serviceWorker.ready
    
        let resolvers: Record<string, Function> = {}
        let handlers: Record<string, Function> = {}
    
        const messageListener = (event: MessageEvent) => {
          const id = event.data?.id
          if (id) {
// Message response
const resolver = resolvers[event.data?.id]
if (resolver) {
  resolver(event.data.payload)
  delete resolvers[event.data?.id]
}

// Message request
if (handlers)
          }
        }

        navigator.serviceWorker.addEventListener('message', messageListener)

        const send = (payload: any) => {
          return new Promise((resolve, reject) => {
            if (registration.active) {
              const id = uuid()
              resolvers[id] = resolve
              registration.active.postMessage({ id, payload })
            } else {
              reject(new Error('No active registration'))
            }
          })
        }

        const receive = async (handler: (data: any) => Promise<any>) => {
            await
        }
    
        return {
          send,
          receive
        }
      }
  }
}

let messangerPromise: any

const messanger = (obj: Window | ServiceWorker) => {
  if (!messanger) {
    messangerPromise = _messanger(obj)
  }
  return messangerPromise
}

export { messanger }
