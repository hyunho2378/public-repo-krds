// D-08 전역 틀. 공공 깃랩(gitlab.aigov.go.kr) 상단 바 배치를 그대로 따른다.
// 왼쪽: 사이드바 여닫기, 로고와 서비스명, "탐색" / 가운데: 검색 또는 이동(단축키 /) / 오른쪽: 화면 설정, 등록, 로그인 또는 내 계정.
// 부품과 값은 KRDS만 쓴다.
import { IconButton, iconBtnClass } from '../Action/IconButton';
import { useEffect, useRef, useState } from 'react';
import { Link, NavLink, useLocation, useNavigate } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { useProjectNav } from '../../app/projectNav';
import { Icon } from '../Code/Icon';
import { ScreenModeItems, useScreenMode } from './ScreenMode';
import { Menu } from '../Navigation/Menu';
import { Logo } from './Logo';
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
      data-figma="global-search"
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

export function GlobalBar({ onToggleNav, navOpen, hasNav = true }) {
  const nav = useProjectNav();
  const location = useLocation();
  const { signedIn } = useAuth();
  // UX-007 1장: 기본은 어두운 화면. 로그인 여부와 상관없이 항상 적용되어야 하므로 여기서 한 번 불러 쓴다(전에는 로그인 후에만 불리는 버그가 있었다)
  const [mode, setMode] = useScreenMode();
  const loginTo = `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`;
  return (
    <header className="rb-gbar" data-figma="header" data-krds="header" data-auth={signedIn ? 'Signed-in' : 'Guest'}>
      <div className="rb-gbar-in">
        {hasNav ? (
          <IconButton icon="menu" label={t.GlobalBar_navToggle} size="medium" className="rb-gbar-navtoggle" aria-expanded={navOpen} aria-controls="rb-sidebar" onClick={onToggleNav} />
        ) : null}
        <div className="rb-gbar-left">
          <Link className="rb-gbar-brand" to="/" aria-label={u.Brand_home}>
            <Logo size={24} />
            <span className="rb-gbar-brand-text" aria-hidden="true">{SERVICE_NAME}</span>
          </Link>
          {nav ? (
            <span className="rb-gbar-path" data-figma="repo-path" role="group" aria-label={`${nav.owner} / ${nav.name}`} title={`${nav.owner} / ${nav.name}`}>
              <Link className="rb-gbar-pathlink is-owner" to={`/search?q=${encodeURIComponent(nav.owner || '')}`}>{nav.owner}</Link>
              <span className="rb-gbar-sep" aria-hidden="true">/</span>
              <Link className="rb-gbar-pathlink is-name" to={`/projects/${nav.id}`}>{nav.name}</Link>
            </span>
          ) : null}
          {nav ? null : (
            <NavLink end className="rb-gbar-btn rb-gbar-explore" to="/">
              <Icon name="view_all" />
              <span>{t.GlobalBar_explore}</span>
            </NavLink>
          )}
        </div>
        <GlobalSearch />
        <IconButton to="/search" icon="search" label={t.GlobalBar_searchLabel} size="medium" className="rb-gbar-searchlink" data-figma="global-search" />
        <div className="rb-gbar-right">
          {signedIn ? (
            <>
              <IconButton to="/notifications" icon="bell" label={t.TabBar_alerts} size="medium" title={t.TabBar_alerts} />
              <IconButton to="/projects/new" icon="plus" label={t.GlobalBar_create} size="medium" title={t.GlobalBar_create} />
              <AccountMenu mode={mode} setMode={setMode} />
            </>
          ) : (
            <>
              <ScreenModeMenu mode={mode} setMode={setMode} />
              <Link className="krds-btn small tertiary rb-gbar-cta" to={loginTo}>{t.Header_login}</Link>
              <Link className="krds-btn small primary rb-gbar-cta" to="/register">{u.Hdr_signup}</Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** 게스트도 화면 설정을 바꿀 수 있다(로그인 전용 버그 고침). */
function ScreenModeMenu({ mode, setMode }) {
  return (
    <Menu label={t.Header_6} className="rb-gbar-drop" align="right" toggle={false} btnClass={iconBtnClass('medium')} btnProps={{ title: t.Header_6 }} button={<Icon name="setting" />}>
      <ScreenModeItems mode={mode} setMode={setMode} />
    </Menu>
  );
}

/** 로그인 뒤 내 계정 메뉴. 화면 설정도 이 안에 둔다(Figma R-01 Signed-in). */
function AccountMenu({ mode, setMode }) {
  return (
    <Menu label={t.GlobalBar_account} className="rb-gbar-drop" align="right" toggle={false} btnClass={iconBtnClass('medium')} btnProps={{ title: t.GlobalBar_account }} button={<Icon name="my" />}>
      {(close) => (
        <>
          <div className="rb-menu-group">
            <ul>
              <li><Link className="item-link" to="/my" onClick={close}><span>{t.Header_my}</span></Link></li>
              <li><Link className="item-link" to="/settings" onClick={close}><span>{t.Settings_title}</span></Link></li>
            </ul>
          </div>
          <ScreenModeItems mode={mode} setMode={setMode} />
        </>
      )}
    </Menu>
  );
}
