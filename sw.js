/* Para que la pagina abra sin senal.
   El armazon se guarda; los datos NUNCA (viajan cifrados y los guarda la
   propia pagina en el telefono, ya descifrados, con su propio control). */
const CAJA = "taller-timco-v1";
const ARMAZON = ["./", "./index.html", "./icono-192.png", "./icono-512.png",
                 "./manifest.webmanifest"];

self.addEventListener("install", ev => {
  self.skipWaiting();
  ev.waitUntil(caches.open(CAJA).then(c => c.addAll(ARMAZON)).catch(()=>{}));
});

self.addEventListener("activate", ev => {
  ev.waitUntil(caches.keys().then(ks =>
    Promise.all(ks.filter(k => k !== CAJA).map(k => caches.delete(k)))
  ).then(() => self.clients.claim()));
});

self.addEventListener("fetch", ev => {
  const url = new URL(ev.request.url);
  if (ev.request.method !== "GET" || url.origin !== location.origin) return;
  // datos.json siempre de la red: si no hay, la pagina usa lo suyo guardado.
  if (url.pathname.endsWith("datos.json")) return;
  ev.respondWith(
    fetch(ev.request)
      .then(r => {
        const copia = r.clone();
        caches.open(CAJA).then(c => c.put(ev.request, copia)).catch(()=>{});
        return r;
      })
      .catch(() => caches.match(ev.request).then(r => r || caches.match("./index.html")))
  );
});
