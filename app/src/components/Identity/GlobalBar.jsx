// D-08 전역 틀. 공공 깃랩(gitlab.aigov.go.kr) 상단 바 배치를 그대로 따른다.
// 왼쪽: 사이드바 여닫기, 로고와 서비스명, "탐색" / 가운데: 검색 또는 이동(단축키 /) / 오른쪽: 화면 설정, 등록, 로그인 또는 내 계정.
// 부품과 값은 KRDS만 쓴다.
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { t } from '../../copy/ko';
import { Icon } from '../Code/Icon';
import { ScreenModeOptions, useScreenMode } from './ScreenMode';
import { useAuth } from './useAuth';

export const SERVICE_NAME = t.Header_service;

/** 바깥을 누르거나 Esc를 누르면 닫는다. */
function useDismiss(open, onClose) {
  const wrap = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !wrap.current?.contains(e.target)) onClose();
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open, onClose]);
  return wrap;
}

function GlobalSearch() {
  const navigate = useNavigate();
  const input = useRef(null);
  const [value, setValue] = useState('');
  // GitLab, GitHub와 같게 / 를 누르면 검색창으로 간다.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <form
      className="rb-gbar-search"
      role="search"
      onSubmit={(e) => {
        e.preventDefault();
        navigate(`/search?q=${encodeURIComponent(value.trim())}`);
      }}
    >
      <label className="sr-only" htmlFor="global-search">{t.GlobalBar_searchLabel}</label>
      <Icon name="search" />
      <input
        id="global-search"
        ref={input}
        type="search"
        value={value}
        onChange={(e) => setValue(e.target.value)}
        placeholder={t.GlobalBar_searchPlaceholder}
      />
      <kbd className="rb-gbar-kbd" aria-hidden="true">/</kbd>
    </form>
  );
}

export function GlobalBar({ onToggleNav, navOpen }) {
  const location = useLocation();
  const { signedIn } = useAuth();
  const loginTo = `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`;
  return (
    <header className="rb-gbar" data-krds="header" data-auth={signedIn ? 'Signed-in' : 'Guest'}>
      <div className="rb-gbar-in">
        <button
          type="button"
          className="rb-gbar-btn rb-gbar-navtoggle"
          aria-expanded={navOpen}
          aria-controls="rb-sidebar"
          onClick={onToggleNav}
        >
          <Icon name="menu" />
          <span className="sr-only">{t.GlobalBar_navToggle}</span>
        </button>
        <Link className="rb-gbar-brand" to="/">
          <span className="rb-gbar-brand-text">{SERVICE_NAME}</span>
        </Link>
        <NavLink end className="rb-gbar-btn rb-gbar-explore" to="/">
          <Icon name="view_all" />
          <span>{t.GlobalBar_explore}</span>
        </NavLink>
        <GlobalSearch />
        <Link className="rb-gbar-btn rb-gbar-searchlink" to="/search">
          <Icon name="search" />
          <span className="sr-only">{t.GlobalBar_searchLabel}</span>
        </Link>
        <div className="rb-gbar-right">
          {signedIn ? (
            <>
              <Link className="rb-gbar-btn" to="/notifications">
                <Icon name="bell" />
                <span className="rb-gbar-btn-text">{t.TabBar_alerts}</span>
              </Link>
              <Link className="rb-gbar-btn" to="/projects/new">
                <Icon name="plus" />
                <span className="rb-gbar-btn-text">{t.GlobalBar_create}</span>
              </Link>
              <AccountMenu />
            </>
          ) : (
            <>
              <Link className="rb-gbar-btn" to="/login">
                <Icon name="my" />
                <span className="rb-gbar-btn-text">{t.GlobalBar_signup}</span>
              </Link>
              <Link className="rb-gbar-btn" to={loginTo}>
                <Icon name="login" />
                <span className="rb-gbar-btn-text">{t.Header_login}</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** 로그인 뒤 내 계정 메뉴. 화면 설정도 이 안에 둔다(Figma R-01 Signed-in). */
function AccountMenu() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useScreenMode();
  const wrap = useDismiss(open, () => setOpen(false));
  return (
    <div className="krds-drop-wrap rb-gbar-drop" ref={wrap}>
      <button type="button" className={'rb-gbar-btn' + (open ? ' active' : '')} aria-expanded={open} aria-controls="gbar-account" onClick={() => setOpen(!open)}>
        <Icon name="my" />
        <span className="rb-gbar-btn-text">{t.GlobalBar_account}</span>
      </button>
      <div id="gbar-account" className="drop-menu rb-gbar-menu" style={{ display: open ? 'block' : 'none' }}>
        <div className="drop-in">
          <ul className="drop-list">
            <li><Link className="item-link" to="/my" onClick={() => setOpen(false)}>{t.Header_my}</Link></li>
            <li><Link className="item-link" to="/settings" onClick={() => setOpen(false)}>{t.Settings_title}</Link></li>
          </ul>
          <ScreenModeOptions name="mode-account" mode={mode} setMode={setMode} />
        </div>
      </div>
    </div>
  );
}
