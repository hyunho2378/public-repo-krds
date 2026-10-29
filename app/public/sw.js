// 공공 저장소 시제품 서비스 워커(D-03). 앱 껍데기(화면 파일)는 먼저 저장해 두고, 화면 이동은 네트워크 우선, 끊기면 저장본, 그것도 없으면 오프라인 안내.
// API 응답(자료)은 저장하지 않는다(오래된 자료를 사실처럼 보이지 않게).
const VERSION = 'rb-shell-v1';
const SCOPE = self.registration.scope;
const SHELL = ['', 'offline.html', 'manifest.webmanifest', 'krds/resources/css/component/krds-built.css', 'pwa/icon-192.png'].map((p) => new URL(p, SCOPE).href);

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(VERSION).then((c) => c.addAll(SHELL)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter((k) => k !== VERSION).map((k) => caches.delete(k)))).then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin || url.pathname.includes('/api/') || url.pathname.includes('/auth/')) return;
  if (req.mode === 'navigate') {
    event.respondWith(
      fetch(req)
        .then((res) => {
          const copy = res.clone();
          caches.open(VERSION).then((c) => c.put(req, copy));
          return res;
        })
        .catch(async () => (await caches.match(req)) || (await caches.match(new URL('', SCOPE).href)) || caches.match(new URL('offline.html', SCOPE).href)),
    );
    return;
  }
  // 정적 파일: 저장본 우선, 없으면 받아서 저장
  event.respondWith(
    caches.match(req).then(
      (hit) =>
        hit ||
        fetch(req).then((res) => {
          if (res.ok && /\.(js|css|svg|png|woff2?)$/.test(url.pathname)) {
            const copy = res.clone();
            caches.open(VERSION).then((c) => c.put(req, copy));
          }
          return res;
        }),
    ),
  );
});
