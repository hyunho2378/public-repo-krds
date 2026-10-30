import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { GlobalBar } from '../components/Identity/GlobalBar';
import { Sidebar } from '../components/Navigation/Sidebar';
import { Footer } from '../components/Identity/Footer';
import { NoticeBanner } from '../components/Feedback/NoticeBanner';
import { Masthead } from '../components/Identity/Masthead';
import { Breadcrumb } from '../components/Navigation/Breadcrumb';
import ErrorScreen from '../screens/P13_Error';
import { routes } from './routes';
import { useProjectNav } from './projectNav';
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

/** 로그인처럼 혼자 서는 화면은 왼쪽 바를 두지 않는다(공공 깃랩 46). */
const NO_SIDEBAR = ['/login', '/login/failed', '/login/otp', '/register', '/password'];
/** 탐색 목록 화면의 판 안 경로(공공 깃랩 '탐색 / 프로젝트') */
const EXPLORE_PATH = { '/': u.G_projects, '/explore': u.G_projects, '/organizations': u.G_groups };

function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const project = useProjectNav();
  const { pathname } = useLocation();
  const bare = NO_SIDEBAR.includes(pathname);
  const closeNav = useCallback(() => setNavOpen(false), []);
  // D-21: 왼쪽 바는 기본 펼침. '사이드바 접음'을 누르면 완전히 숨기고 상단 바의 펼침 단추로 연다(선택 기억). 768 미만은 서랍
  const mobile = !useMinWidth(breakpoint('--rb-bp-mobile'));
  const [hidden, setHidden] = useBoolPref('rb-sidebar-hidden', false);
  const sideShown = !bare && !mobile && !hidden;
  const explore = EXPLORE_PATH[pathname];
  return (
    <>
      <FocusOnNavigate onNavigate={closeNav} />
      <Masthead />
      <GlobalBar
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((v) => !v)}
        hasNav={!bare}
        sideHidden={!bare && !mobile && hidden}
        onShowSide={() => setHidden(false)}
        area={u.G_explore}
      />
      <NoticeBanner message={import.meta.env.VITE_NOTICE} />
      <div className={'rb-shell' + (sideShown ? ' has-side' : '') + (bare ? ' is-bare' : '')} data-figma="body">
        {bare || (!sideShown && !mobile) ? null : (
          <Sidebar project={project} open={navOpen} onClose={closeNav} onHide={() => setHidden(true)} />
        )}
        <div className="rb-panel">
          <div className="rb-panel-in">
            {explore ? <Breadcrumb home={false} items={[[u.G_explore, '/'], [explore, null]]} /> : null}
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
        </div>
      </div>
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
