import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GlobalBar } from '../components/Identity/GlobalBar';
import { Sidebar } from '../components/Navigation/Sidebar';
import { Footer } from '../components/Identity/Footer';
import { NoticeBanner } from '../components/Feedback/NoticeBanner';
import { Masthead } from '../components/Identity/Masthead';
import ErrorScreen from '../screens/P13_Error';
import { routes } from './routes';
import { TabBar } from '../components/Navigation/TabBar';
import { useProjectNav } from './projectNav';
import '../components/Layout/shell.css';

/** 화면이 바뀌면 맨 위로, 본문에 초점(화면 낭독기가 새 화면을 읽도록). 좁은 화면 서랍도 닫는다. */
function FocusOnNavigate({ onNavigate }) {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
    document.getElementById('main')?.focus({ preventScroll: true });
    onNavigate();
  }, [pathname, onNavigate]);
  return null;
}

/** 로그인처럼 혼자 서는 화면은 왼쪽 메뉴를 두지 않는다(Figma G-08). */
const NO_SIDEBAR = ['/login'];

function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const project = useProjectNav();
  const { pathname } = useLocation();
  const bare = NO_SIDEBAR.includes(pathname);
  const closeNav = useCallback(() => setNavOpen(false), []);
  return (
    <>
      <FocusOnNavigate onNavigate={closeNav} />
      <Masthead />
      <GlobalBar navOpen={navOpen} onToggleNav={() => setNavOpen((v) => !v)} />
      <NoticeBanner message={import.meta.env.VITE_NOTICE} />
      <div className={'rb-shell' + (bare ? ' is-bare' : '') + (project ? ' has-project' : '')} data-figma="body">
        {bare ? null : <Sidebar project={project} open={navOpen} onClose={closeNav} />}
        <main id="main" tabIndex={-1} className="rb-main">
          <Routes>
            {routes.map(({ id, path, Screen }) => (
              <Route key={id + path} path={path} element={<Screen />} />
            ))}
            <Route path="*" element={<ErrorScreen kind="not-found" />} />
          </Routes>
        </main>
      </div>
      <Footer />
      <TabBar />
    </>
  );
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Shell />
    </BrowserRouter>
  );
}
