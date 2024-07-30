importScripts(
  "/assets/js/uv/uv.bundle.js",
  "/assets/js/uv/uv.config.js",
  "/assets/js/uv/uv.sw.js"
);

const uv = new UVServiceWorker();

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      if (event.request.url.startsWith(location.origin + __uv$config.prefix)) {
        console.log("Using uv")
        return await uv.fetch(event);
      }
      console.log("Using reg fetch ")
      return await fetch(event.request);
    })()
  );
});
