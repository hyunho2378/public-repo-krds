import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './krds/dark.generated.css';
import './krds/syntax.generated.css';
import './krds/layout.tokens.css';
import './krds/status.tokens.css';
import './styles.css';
import './screens/screens.css';

createRoot(document.getElementById('root')).render(<App />);

// 서비스 워커는 쓰지 않는다. 옛 빌드가 남지 않게 등록된 워커와 저장본을 지운다(public/sw.js는 옛 워커를 스스로 풀게 하는 파일).
if ('serviceWorker' in navigator) {
  navigator.serviceWorker.getRegistrations().then((rs) => rs.forEach((r) => r.unregister())).catch(() => {});
  if (typeof caches !== 'undefined') caches.keys().then((ks) => ks.forEach((k) => caches.delete(k))).catch(() => {});
}

// 새 빌드 감지: 배포본의 version.json 빌드 번호가 지금 화면과 다르면 다시 불러온다(화면에 돌아올 때와 5분마다)
if (import.meta.env.PROD && __BUILD_ID__ !== 'dev') {
  const check = () => fetch(`${import.meta.env.BASE_URL}version.json?cb=${Date.now()}`, { cache: 'no-store' })
    .then((r) => (r.ok ? r.json() : null))
    .then((j) => { if (j?.build && j.build !== __BUILD_ID__) window.location.reload(); })
    .catch(() => {});
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') check(); });
  setInterval(check, 5 * 60 * 1000);
}
