// 서비스 워커 폐기용 파일. 이 정적 배포에서는 서비스 워커를 쓰지 않는다(옛 빌드가 계속 보이는 문제).
// 브라우저가 이 파일을 새로 받으면 옛 워커 대신 설치되어, 모든 저장본을 지우고 스스로 등록을 풀고 열린 화면을 새로 고친다.
self.addEventListener('install', () => self.skipWaiting());
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
      .then(() => self.registration.unregister())
      .then(() => self.clients.matchAll({ type: 'window' }))
      .then((clients) => clients.forEach((c) => c.navigate(c.url))),
  );
});
// fetch를 가로채지 않는다: 모든 요청은 서버로 간다
