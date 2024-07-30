importScripts(
  "/assets/js/uv/uv.bundle.js",
  "/assets/js/uv/uv.config.js",
  "/assets/js/uv/uv.sw.js",
  "/assets/js/scram/scramjet.codecs.js",
	"/assets/js/scram/scramjet.config.js",
	"/assets/js/scram/scramjet.worker.js"
);

const uv = new UVServiceWorker();
const scramjet = new ScramjetServiceWorker();

self.addEventListener("fetch", (event) => {
  event.respondWith(
    (async () => {
      if (event.request.url.startsWith(location.origin + __uv$config.prefix)) {
        console.log("Using ultraviolet!")
        return await uv.fetch(event);
      } else if(event.request.url.startsWith(location.origin + __scramjet$config.prefix)) {
        console.log("Using scramjet!")
        return await scramjet.fetch(event);
      }
      console.log("Hi!!!eonawoudnawuodnawod")
      return await fetch(event.request);
    })()
  );
});
