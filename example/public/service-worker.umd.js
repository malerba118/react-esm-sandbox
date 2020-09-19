(function (factory) {
  typeof define === 'function' && define.amd ? define(factory) :
  factory();
}((function () {
  self.addEventListener('install', function (event) {
    self.skipWaiting();
  });
  self.addEventListener('fetch', function (event) {
    console.log('Foo', event.request);

    if (event.request.url.endsWith('/blah/foo/bar')) {
      event.respondWith(new Response(JSON.stringify({
        foo: 25
      }), {
        headers: {
          'Content-Type': 'application/json'
        }
      }));
    }
  });

})));
//# sourceMappingURL=service-worker.umd.js.map
