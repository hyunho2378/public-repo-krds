import { useCallback, useEffect, useLayoutEffect, useState } from 'react';
import { BrowserRouter, Navigate, Routes, Route, useLocation, useNavigate, useNavigationType } from 'react-router-dom';
import { useAuth } from '../components/Identity/useAuth';
import { Toasts } from '../components/Feedback/Toast';
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
import { t } from '../copy/ko';
import { breakpoint, useBoolPref, useMinWidth } from './prefs';
import '../components/Layout/shell.css';
import '../components/Layout/v2-measure.css';

/** 화면이 바뀌면 맨 위로, 본문에 초점(화면 낭독기가 새 화면을 읽도록). 좁은 화면 서랍도 닫는다.
 *  D-22: 뒤로/앞으로 가기(POP)에서는 그 화면의 스크롤 위치를 되살린다(이 탭에서만 기억). */
const scrollMemo = new Map();
// 본문 높이를 계속 적어 둔다(ResizeObserver는 그린 뒤에 알리므로 화면이 바뀐 순간에는 이전 화면 높이가 남아 있다)
if (typeof window !== 'undefined' && 'ResizeObserver' in window) {
  const watch = () => {
    const m = document.getElementById('main');
    if (!m) { requestAnimationFrame(watch); return; }
    new ResizeObserver(([e]) => { if (!m.style.minHeight) m.dataset.h = String(Math.round(e.contentRect.height)); }).observe(m);
  };
  requestAnimationFrame(watch);
}
/** 스크롤 상자: 공공 깃랩처럼 쪽 전체가 아니라 본문 판 안이 스크롤된다(audit_v3 G-04). 판이 없는 화면(로그인)은 창 */
export function scrollBox() {
  const el = document.getElementById('rb-scroll');
  return el && getComputedStyle(el).overflowY === 'auto' ? el : document.scrollingElement;
}
let firstPaint = true;
// 마지막 스크롤 위치를 계속 적어 둔다(화면이 바뀌는 순간 새 내용 높이에 눌려 값이 줄어드는 것을 피한다)
let lastY = 0;
if (typeof document !== 'undefined') document.addEventListener('scroll', (e) => { const t = e.target === document ? document.scrollingElement : e.target; if (t && (t.id === 'rb-scroll' || t === document.scrollingElement)) lastY = t.scrollTop; }, { capture: true, passive: true });
function FocusOnNavigate({ onNavigate }) {
  const { pathname, key } = useLocation();
  const type = useNavigationType();
  // 화면이 바뀌는 순간(그리기 전) 본문 높이를 이전 높이로 붙잡아 바닥글과 스크롤이 튀지 않게 한다. 700ms 뒤 푼다
  useLayoutEffect(() => {
    const main = document.getElementById('main');
    if (!main || !main.dataset.h) return undefined;
    main.style.minHeight = `${main.dataset.h}px`;
    const release = setTimeout(() => { main.style.minHeight = ''; }, 700);
    return () => { clearTimeout(release); main.style.minHeight = ''; };
  }, [pathname]);
  // 뒤로 가기(POP): 그리기 전에 즉시 같은 위치로(부드러운 이동 없음, audit_v3 05-18). 내용이 늦게 차면 높이가 될 때까지 몇 프레임 다시 맞춘다
  useLayoutEffect(() => {
    const box = scrollBox();
    const y = type === 'POP' ? scrollMemo.get(key) : undefined;
    let n = 0; let raf = 0;
    const put = () => { const b = scrollBox(); b.scrollTo({ top: y, behavior: 'instant' }); if (Math.abs(b.scrollTop - y) > 1 && n++ < 60) raf = requestAnimationFrame(put); };
    if (y == null) box.scrollTo({ top: 0, behavior: 'instant' });
    else put();
    lastY = y ?? 0;
    // 떠나는 화면의 위치는 새 화면이 맨 위로 올리기 전(레이아웃 정리 단계)에 적는다
    return () => { cancelAnimationFrame(raf); scrollMemo.set(key, lastY); };
  }, [pathname, key, type]);
  useEffect(() => {
    // 처음 연 화면은 초점을 옮기지 않는다(첫 Tab이 '본문 바로가기'부터, audit_v3 G-09). 이후 이동에서만 본문에 초점
    if (firstPaint) firstPaint = false;
    else document.getElementById('main')?.focus({ preventScroll: true });
    onNavigate();
  }, [pathname, key, type, onNavigate]);
  return null;
}

/** 없는 주소: 공공 깃랩은 로그아웃 상태면 로그인 화면으로 보내고 '로그인하거나 등록한 뒤 계속' 안내를 띄운다(audit_v3 ER-01). 로그인 상태면 화면 없음 */
function NotFoundOrLogin() {
  const { signedIn, ready } = useAuth();
  const loc = useLocation();
  if (ready === false) return null;
  if (!signedIn) return <Navigate to={`/login?reason=auth&returnTo=${encodeURIComponent(loc.pathname + loc.search)}`} replace />;
  return <ErrorScreen kind="not-found" />;
}

/** 로그인처럼 혼자 서는 화면은 왼쪽 바를 두지 않는다(공공 깃랩 46). */
const NO_SIDEBAR = ['/login', '/login/failed', '/login/otp', '/register', '/password'];
/** 공공 깃랩 검색 결과는 사이드바 없이 판 전체 폭(audit_v3 SR-01). 상단 바는 있다 */
const NO_SIDE_ONLY = ['/search'];
/** 탐색 목록 화면의 판 안 경로(공공 깃랩 '탐색 / 프로젝트') */
/** 판 안 경로 줄(전역 화면). Figma G·A 변형의 경로 줄 글과 같게, 공공 깃랩 실측이 있는 곳(검색 = '검색' 한 칸)은 실측대로 */
const CRUMB_HOME = { [u.G_explore]: '/', [t.Header_5]: '/help', [u.Crumb_user]: '/settings', [u.Crumb_project]: '/my' };
const PATH_CRUMB = {
  '/': [u.G_explore, u.G_projects], '/explore': [u.G_explore, u.G_projects], '/organizations': [u.G_explore, u.G_groups],
  '/explore/topics': [u.G_explore, u.G_topics], '/explore/snippets': [u.G_explore, u.G_snippets],
  '/search': [u.S_title], '/projects/new': [u.Crumb_project, t.NewProject_title], '/help': [u.G_explore, t.Header_5],
  '/my': [u.G_explore, u.Crumb_myWork], '/notifications': [u.G_explore, u.Crumb_alerts], '/settings': [u.Crumb_user, u.Crumb_profile],
  '/error': [u.Crumb_error], '/requests': [u.G_explore, u.Crumb_requests], '/insights': [u.G_explore, u.Crumb_insights],
  '/mcp': [t.Header_5, u.Crumb_mcp], '/collaborate': [u.G_explore, u.Crumb_collab], '/checklist': [u.G_explore, u.Crumb_checklist],
};

/** D-22 단축키(2026. 10. 31. 개정): 공공 깃랩 '?' 대화상자에 있는 키 중 우리 화면이 있는 것만 쓴다(대응표 UX/16 6절).
 *  전역: ? 목록, s 또는 / 검색(GlobalBar), f 필터 막대, ⌘(Ctrl)+\ 사이드바, Shift+h 홈, Shift+p 내 프로젝트
 *  프로젝트: g o 개요, g f 파일, g c 커밋, g n 리포지토리 그래프, g r 릴리스, g i 작업 항목, g m 머지 리퀘스트, g p 파이프라인, g j 작업, Shift+c 브랜치 비교, t 파일 찾기(RepoParts) */
const G_KEYS = { o: '', f: '/code', c: '/changes', n: '/graph', r: '/releases', i: '/issues', m: '/merge-requests', p: '/pipelines', j: '/jobs' };
function useShortcuts({ toggleSide, openKeys, project }) {
  const navigate = useNavigate();
  useEffect(() => {
    let g = 0;
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === '\\') { e.preventDefault(); toggleSide(); return; }
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const el = document.activeElement;
      if (el && (el.tagName === 'INPUT' || el.tagName === 'TEXTAREA' || el.tagName === 'SELECT' || el.isContentEditable)) return;
      if (document.querySelector('[role="dialog"]') && e.key !== '?') return;
      if (e.key === '?') { e.preventDefault(); openKeys(); return; }
      if (g && Date.now() - g < 1000 && project) {
        const to = G_KEYS[e.key];
        g = 0;
        if (to != null) { e.preventDefault(); navigate(`/projects/${project.id}${to}`); return; }
      }
      if (e.key === 'g' && !e.shiftKey) { g = Date.now(); return; }
      if (e.shiftKey && e.key === 'H') { e.preventDefault(); navigate('/'); return; }
      if (e.shiftKey && e.key === 'P') { e.preventDefault(); navigate('/my'); return; }
      if (e.shiftKey && e.key === 'C' && project) { e.preventDefault(); navigate(`/projects/${project.id}/compare`); return; }
      if (e.key === 'f' && !e.shiftKey) {
        const box = document.querySelector('#main .rb-x-filter input, #main [role="search"] input, #main input[type="search"]');
        if (box) { e.preventDefault(); box.focus(); }
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [toggleSide, openKeys, project, navigate]);
}

function Shell() {
  const [navOpen, setNavOpen] = useState(false);
  const project = useProjectNav();
  const { pathname } = useLocation();
  const bare = NO_SIDEBAR.includes(pathname);
  const closeNav = useCallback(() => setNavOpen(false), []);
  // D-21: 왼쪽 바는 기본 펼침. '사이드바 접음'을 누르면 완전히 숨기고 상단 바의 펼침 단추로 연다(선택 기억). 768 미만은 서랍
  // 공공 깃랩: 1200 미만이면 사이드바가 서랍(덮개 0.64, 왼쪽에서 밀려 들어옴). 그 이상은 펼침 또는 44 아이콘 열
  const mobile = !useMinWidth(breakpoint('--rb-bp-drawer'));
  const [hidden, setHidden] = useBoolPref('rb-sidebar-hidden', false);
  const noSide = NO_SIDE_ONLY.includes(pathname);
  const sideDesk = !bare && !mobile && !noSide;
  const [keys, setKeys] = useState(false);
  const toggleSide = useCallback(() => (mobile ? setNavOpen((v) => !v) : setHidden(!hidden)), [mobile, hidden, setHidden]);
  const openKeys = useCallback(() => setKeys((v) => !v), []);
  useShortcuts({ toggleSide, openKeys, project });
  const crumb = PATH_CRUMB[pathname];
  return (
    <>
      <FocusOnNavigate onNavigate={closeNav} />
      <div className="rb-top">
      <Masthead />
      {bare ? null : <GlobalBar
        navOpen={navOpen}
        onToggleNav={() => setNavOpen((v) => !v)}
        hasNav={!bare}
        drawer={mobile && !bare && !noSide}
        sideHidden={false}
        onShowSide={() => setHidden(false)}
        area={u.G_explore}
      />}
      </div>
      <NoticeBanner message={import.meta.env.VITE_NOTICE} />
      {/* D-22: 사이드바는 접어도 그대로 두고(다시 그리지 않음) transform으로 밀어 넣는다. 본문 판은 margin-left가 같은 시간 곡선으로 따라온다 */}
      <div data-figma="body" className={'rb-shell' + (sideDesk ? ' has-side' : '') + (sideDesk && hidden ? ' is-side-hidden' : '') + (mobile && !bare && !noSide ? ' is-drawer' : '') + (bare ? ' is-bare' : '')}>
        {bare || noSide ? null : (
          <Sidebar project={project} open={navOpen} onClose={closeNav} onHide={mobile ? closeNav : () => setHidden(true)} onShow={() => setHidden(false)} hidden={sideDesk && hidden} />
        )}
        <div className="rb-panel" id="rb-scroll" data-figma="content-panel">
          <div className="rb-panel-in">
            {crumb && !bare ? <Breadcrumb home={false} items={crumb.map((c, i) => [c, i < crumb.length - 1 ? CRUMB_HOME[c] || null : null])} /> : null}
            <main id="main" tabIndex={-1} className="rb-main">
              <Routes>
                {routes.map(({ id, path, Screen }) => (
                  <Route key={id + path} path={path} element={<Screen />} />
                ))}
                <Route path="*" element={<NotFoundOrLogin />} />
              </Routes>
            </main>
            {/* D-21 7장: 바닥글은 본문과 같은 컨테이너 안, 판 맨 아래 */}
            {bare ? null : <Footer />}
          </div>
          {/* Figma G-08: 로그인처럼 혼자 서는 화면은 바닥글을 판 아래 전체 폭 띠로 둔다(D-20) */}
          {bare ? <Footer /> : null}
        </div>
      </div>
      {keys ? <ShortcutsDialog onClose={() => setKeys(false)} /> : null}
      <Toasts />
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
