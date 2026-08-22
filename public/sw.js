// Safe Khoroch offline service worker
// Strategy: cache the app shell (HTML/JS/CSS/images) as people browse it,
// and serve from cache when the network is unavailable.
// Supabase / API calls are always left to the network untouched — the app's
// own local-storage layer already handles offline reads/writes for data.

const CACHE_NAME = "safekhoroch-shell-v1";
const OFFLINE_URL = "/";

self.addEventListener("install", (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(["/", "/manifest.webmanifest"]).catch(() => {})),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

function isApiRequest(url) {
  return (
    url.hostname.endsWith("supabase.co") ||
    url.hostname.endsWith("supabase.in") ||
    url.pathname.startsWith("/rest/") ||
    url.pathname.startsWith("/auth/")
  );
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return; // never intercept writes
  const url = new URL(request.url);

  // Always hit the network directly for API/auth calls — never cache these.
  if (isApiRequest(url)) return;

  // Cross-origin requests (fonts, cdn, etc): try network, fall back to cache.
  if (url.origin !== self.location.origin) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const clone = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
          return response;
        })
        .catch(() => caches.match(request)),
    );
    return;
  }

  // Same-origin navigation & assets: network-first, cache fallback,
  // and always refresh the cache with whatever the network returns.
  event.respondWith(
    fetch(request)
      .then((response) => {
        const clone = response.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(request, clone)).catch(() => {});
        return response;
      })
      .catch(async () => {
        const cached = await caches.match(request);
        if (cached) return cached;
        if (request.mode === "navigate") {
          const shell = await caches.match(OFFLINE_URL);
          if (shell) return shell;
        }
        return Response.error();
      }),
  );
});
