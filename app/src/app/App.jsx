import { useCallback, useEffect, useMemo, useState } from 'react';
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
import { projectIdOf, sidebarMode } from './screenKind';
import { DockContext } from './dock';
import { DockPanel } from '../components/Layout/DockPanel';
import { RepoTabs } from '../components/Navigation/RepoTabs';
import { u } from '../copy/ui';
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
  const mode = sidebarMode(pathname, bare);
  const pid = projectIdOf(pathname);
  const closeNav = useCallback(() => setNavOpen(false), []);
  // D-18: 왼쪽 메뉴는 전역 개인 목록(full)에서만 펼쳐 둔다. 이용자 선택은 기억하고, 기본은 1280 미만 접힘
  const wide = useMinWidth(breakpoint('--rb-bp-side-open'));
  const mobile = !useMinWidth(breakpoint('--rb-bp-mobile'));
  const [pref, setPref] = useBoolPref(SIDEBAR_KEY + 'list', !wide);
  const collapsed = mode === 'full' && !mobile && pref;
  const toggleCollapsed = useCallback(() => setPref(!pref), [pref, setPref]);
  // D-18 4장: 도킹 패널. 저장소 화면에서만 있고 기본 닫힘, 열림 여부 기억
  const [dockOpen, setDockOpen] = useBoolPref('rb-dock-open', false);
  const [slot, setSlot] = useState(null);
  const dockAvailable = !!pid && !bare;
  const dock = useMemo(() => ({ open: dockAvailable && dockOpen, setOpen: setDockOpen, slot, available: dockAvailable }), [dockAvailable, dockOpen, setDockOpen, slot]);
  return (
    <DockContext.Provider value={dock}>
      <FocusOnNavigate onNavigate={closeNav} />
      <Masthead />
      <GlobalBar navOpen={navOpen} onToggleNav={() => setNavOpen((v) => !v)} hasNav={mode !== 'none'} />
      {pid && !bare ? <RepoTabs id={pid} nav={project} /> : null}
      <NoticeBanner message={import.meta.env.VITE_NOTICE} />
      <div className="rb-work">
      <div className={'rb-shell is-' + mode + (collapsed ? ' is-collapsed' : '')} data-figma="body">
        {mode === 'none' ? null : <Sidebar project={null} open={navOpen} onClose={closeNav} collapsed={collapsed} onToggleCollapsed={toggleCollapsed} />}
        <main id="main" tabIndex={-1} className="rb-main">
          <Routes>
            {routes.map(({ id, path, Screen }) => (
              <Route key={id + path} path={path} element={<Screen />} />
            ))}
            <Route path="*" element={<ErrorScreen kind="not-found" />} />
          </Routes>
        </main>
      </div>
      <DockPanel open={dock.open} onClose={() => setDockOpen(false)} title={u.Dock_info} slotRef={setSlot} />
      </div>
      <Footer />
      <TabBar />
    </DockContext.Provider>
  );
}

export function App() {
  return (
    <BrowserRouter basename={import.meta.env.BASE_URL.replace(/\/$/, '')}>
      <Shell />
    </BrowserRouter>
  );
}
