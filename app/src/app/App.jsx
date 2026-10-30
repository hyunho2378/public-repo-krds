import { useCallback, useEffect, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, useNavigate } from 'react-router-dom';
import { ShortcutsDialog } from '../components/Feedback/ShortcutsDialog';
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

/** D-22 단축키: ? 목록, g c / g i / g p 이동, b 사이드바(파일 보기에서는 파일 트리가 b를 쓴다) */
function useShortcuts({ toggleSide, openKeys, project }) {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  useEffect(() => {
    let g = 0;
    const onKey = (e) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.isContentEditable)) return;
      if (e.key === '?') { e.preventDefault(); openKeys(); return; }
      if (e.key === 'g') { g = Date.now(); return; }
      if (g && Date.now() - g < 1000 && project) {
        const to = { c: '/code', i: '/issues', p: '/merge-requests' }[e.key];
        g = 0;
        if (to) { e.preventDefault(); navigate(`/projects/${project.id}${to}`); return; }
      }
      if (e.key === 'b' && !/\/code\/.+/.test(pathname)) { e.preventDefault(); toggleSide(); }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggleSide, openKeys, project, navigate, pathname]);
}

function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const project = useProjectNav();
  const { pathname } = useLocation();
  const bare = NO_SIDEBAR.includes(pathname);
  const closeNav = useCallback(() => setNavOpen(false), []);
  // D-21: 왼쪽 바는 기본 펼침. '사이드바 접음'을 누르면 완전히 숨기고 상단 바의 펼침 단추로 연다(선택 기억). 768 미만은 서랍
  const mobile = !useMinWidth(breakpoint('--rb-bp-mobile'));
  const [hidden, setHidden] = useBoolPref('rb-sidebar-hidden', false);
  const sideDesk = !bare && !mobile;
  const [keys, setKeys] = useState(false);
  const toggleSide = useCallback(() => (mobile ? setNavOpen((v) => !v) : setHidden(!hidden)), [mobile, hidden, setHidden]);
  const openKeys = useCallback(() => setKeys(true), []);
  useShortcuts({ toggleSide, openKeys, project });
  const explore = EXPLORE_PATH[pathname];
  return (
    <>
      <FocusOnNavigate onNavigate={closeNav} />
      <div className="rb-top">
      <Masthead />
      <GlobalBar
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((v) => !v)}
        hasNav={!bare}
        sideHidden={sideDesk && hidden}
        onShowSide={() => setHidden(false)}
        area={u.G_explore}
      />
      </div>
      <NoticeBanner message={import.meta.env.VITE_NOTICE} />
      {/* D-22: 사이드바는 접어도 그대로 두고(다시 그리지 않음) transform으로 밀어 넣는다. 본문 판은 margin-left가 같은 시간 곡선으로 따라온다 */}
      <div className={'rb-shell' + (sideDesk ? ' has-side' : '') + (sideDesk && hidden ? ' is-side-hidden' : '') + (bare ? ' is-bare' : '')} data-figma="body">
        {bare ? null : (
          <Sidebar project={project} open={navOpen} onClose={closeNav} onHide={() => setHidden(true)} hidden={sideDesk && hidden} />
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
            {/* D-21 7장: 바닥글은 본문과 같은 컨테이너 안, 판 맨 아래 */}
            <Footer />
          </div>
        </div>
      </div>
      {keys ? <ShortcutsDialog onClose={() => setKeys(false)} /> : null}
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
