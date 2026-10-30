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
const NO_SIDEBAR = ['/login', '/login/failed', '/login/otp', '/register', '/password'];
// D-17 1장: 상세 화면(파일 보기, 커밋 상세, 비교, 이슈/변경제안 상세, 쓰기 화면)은 모든 폭에서 접힘이 기본
const DETAIL_PATH = /\/code\/.+|\/changes\/[^/]+$|\/compare|\/issues\/\d+|\/merge-requests\/\d+|\/new$|\/upload$|\/branches\/new$/;
const SIDEBAR_KEY = 'rb-sidebar-collapsed';

function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const project = useProjectNav();
  const { pathname } = useLocation();
  const bare = NO_SIDEBAR.includes(pathname);
  const closeNav = useCallback(() => setNavOpen(false), []);
  // D-17 5장: 이용자가 고른 값이 있으면 그것만, 없으면 화면 종류와 폭으로 기본값 계산(처음 마운트할 때만)
  const [collapsed, setCollapsed] = useState(() => {
    try {
      const saved = localStorage.getItem(SIDEBAR_KEY);
      if (saved !== null) return saved === '1';
    } catch { /* 무시 */ }
    return DETAIL_PATH.test(pathname) || (typeof window !== 'undefined' && window.innerWidth < 1920);
  });
  const toggleCollapsed = useCallback(() => {
    setCollapsed((v) => {
      const next = !v;
      try { localStorage.setItem(SIDEBAR_KEY, next ? '1' : '0'); } catch { /* 무시 */ }
      return next;
    });
  }, []);
  return (
    <>
      <FocusOnNavigate onNavigate={closeNav} />
      <Masthead />
      <GlobalBar navOpen={navOpen} onToggleNav={() => setNavOpen((v) => !v)} />
      <NoticeBanner message={import.meta.env.VITE_NOTICE} />
      <div className={'rb-shell' + (bare ? ' is-bare' : '') + (project ? ' has-project' : '') + (collapsed ? ' is-collapsed' : '')} data-figma="body">
        {bare ? null : <Sidebar project={project} open={navOpen} onClose={closeNav} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />}
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
