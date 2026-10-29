import { createRoot } from 'react-dom/client';
import { App } from './app/App';
import './krds/dark.generated.css';
import './krds/syntax.generated.css';
import './styles.css';
import './screens/screens.css';

createRoot(document.getElementById('root')).render(<App />);

// 설치형 웹 앱(PWA, D-03). 배포 경로(BASE_URL) 기준으로 서비스 워커를 등록한다. 개발 서버에서는 등록하지 않는다.
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register(`${import.meta.env.BASE_URL}sw.js`, { scope: import.meta.env.BASE_URL });
  });
}
