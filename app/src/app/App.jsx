import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Header } from '../components/Identity/Header';
import { Footer } from '../components/Identity/Footer';
import { NoticeBanner } from '../components/Feedback/NoticeBanner';
import ErrorScreen from '../screens/P13_Error';
import { routes } from './routes';
import { TabBar } from '../components/Navigation/TabBar';

/** 화면이 바뀌면 맨 위로, 본문에 초점(화면 낭독기가 새 화면을 읽도록). 검색 조건만 바뀐 경우는 그대로. */
function FocusOnNavigate() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
  }, [pathname]);
  return null;
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <FocusOnNavigate />
      <Header />
      <NoticeBanner message={import.meta.env.VITE_NOTICE} />
      <main id="main" tabIndex={-1} className="inner rb-main">
        <Routes>
          {routes.map(({ id, path, Screen }) => (
            <Route key={id} path={path} element={<Screen />} />
          ))}
          <Route path="*" element={<ErrorScreen kind="not-found" />} />
        </Routes>
      </main>
      <Footer />
      <TabBar />
    </BrowserRouter>
  );
}
