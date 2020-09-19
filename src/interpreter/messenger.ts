import PromiseWorker from 'promise-worker'

const Messenger = async () => {
  await navigator.serviceWorker.ready
  return new PromiseWorker(navigator.serviceWorker as any)
}

export { Messenger }
