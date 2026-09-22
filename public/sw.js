const CACHE_NAME = "deen-diary-v1";
const APP_SHELL = ["/", "/manifest.webmanifest", "/icons/icon.svg"];
const API_HOSTS = ["api.aladhan.com", "api.quran.com", "verses.quran.com", "audio.quran.com"];
const STALE_MS = 24 * 60 * 60 * 1000;

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => cache.addAll(APP_SHELL))
      .catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

async function networkFirst(request) {
  const cache = await caches.open(CACHE_NAME);
  try {
    const response = await fetch(request);
    if (response && (response.status === 200 || response.type === "opaque")) {
      cache.put(request, response.clone());
    }
    return response;
  } catch (err) {
    const cached = await cache.match(request);
    if (cached) return cached;
    throw err;
  }
}

async function staleWhileRevalidate(request) {
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  if (cached && Date.now() - (new Date(cached.headers.get("date") || Date.now()).getTime()) < STALE_MS) {
    return cached;
  }
  const network = await fetch(request).catch(() => null);
  if (network && network.ok) {
    cache.put(request, network.clone());
    return network;
  }
  if (cached) return cached;
  return network;
}

self.addEventListener("fetch", (event) => {
  const url = new URL(event.request.url);

  if (event.request.method !== "GET") return;

  if (url.origin === self.location.origin) {
    if (url.pathname.startsWith("/_next/static")) {
      event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
      return;
    }
    if (event.request.mode === "navigate") {
      event.respondWith(networkFirst(event.request));
      return;
    }
    event.respondWith(caches.match(event.request).then((r) => r || fetch(event.request)));
    return;
  }

  if (API_HOSTS.some((h) => url.hostname === h || url.hostname.endsWith("." + h))) {
    event.respondWith(staleWhileRevalidate(event.request));
  }
});