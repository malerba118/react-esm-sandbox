import PromiseWorker from 'promise-worker'

const waitForWorker = async (): Promise<ServiceWorkerContainer> => {
  if (navigator.serviceWorker.controller) {
    // already active and controlling this page
    return navigator.serviceWorker
  }
  // wait for a new service worker to control this page
  return new Promise<ServiceWorkerContainer>(function (resolve) {
    function onControllerChange() {
      navigator.serviceWorker.removeEventListener(
        'controllerchange',
        onControllerChange
      )
      resolve(navigator.serviceWorker)
    }
    navigator.serviceWorker.addEventListener(
      'controllerchange',
      onControllerChange
    )
  })
}

const Messenger = async () => {
  const serviceWorkerContainer = await waitForWorker()
  return new PromiseWorker(serviceWorkerContainer as any)
}

export { Messenger }
