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
import { screenKind } from './screenKind';
import { breakpoint, useBoolPref, useMinWidth } from './prefs';
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
const SIDEBAR_KEY = 'rb-sidebar-collapsed-';

function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const project = useProjectNav();
  const { pathname } = useLocation();
  const bare = NO_SIDEBAR.includes(pathname);
  const closeNav = useCallback(() => setNavOpen(false), []);
  // D-17 5장: 이용자가 고른 값이 있으면 그것, 없으면 화면 종류와 폭으로 기본값(1920 미만 접힘, 상세 화면은 모든 폭에서 접힘)
  // 홈과 목록, 상세는 따로 기억한다(상세에서 펼친 선택이 목록의 기본값을 바꾸지 않게)
  const kind = screenKind(pathname);
  const wide = useMinWidth(breakpoint('--rb-bp-side-open'));
  const mobile = !useMinWidth(breakpoint('--rb-bp-mobile'));
  const [pref, setPref] = useBoolPref(SIDEBAR_KEY + (kind === 'detail' ? 'detail' : 'list'), kind === 'detail' ? true : !wide);
  const collapsed = !mobile && pref;
  const toggleCollapsed = useCallback(() => setPref(!pref), [pref, setPref]);
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
