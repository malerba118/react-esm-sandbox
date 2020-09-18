self.addEventListener('install', function (event) {
    self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
    console.log('Foo', event.request);
    if (event.request.url.endsWith('/blah/foo/bar')) {
        event.respondWith(new Response(JSON.stringify({ foo: 22 }),{
            headers: { "Content-Type" : "application/json" }
        }));
    }
});
  