// D-08 전역 틀. 공공 깃랩(gitlab.aigov.go.kr) 상단 바 배치를 그대로 따른다.
// 왼쪽: 사이드바 여닫기, 로고와 서비스명, "탐색" / 가운데: 검색 또는 이동(단축키 /) / 오른쪽: 화면 설정, 등록, 로그인 또는 내 계정.
// 부품과 값은 KRDS만 쓴다.
import { IconButton, iconBtnClass } from '../Action/IconButton';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { Icon } from '../Code/Icon';
import { ScreenModeItems, useScreenMode } from './ScreenMode';
import { Menu } from '../Navigation/Menu';
import { Logo } from './Logo';
import { Avatar } from '../Layout/Avatar';
import { snapshotIndex } from '../../api/snapshot';
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
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState([]);
  const wrap = useDismiss(open, () => setOpen(false));
  // GitLab, GitHub와 같게 / 를 누르면 검색창으로 간다.
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== '/' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      input.current?.focus();
      setOpen(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  // 공공 깃랩 51b: 입력하면 '다음 위치에서 검색'과 프로젝트 제안(저장된 공개 목록, 점검 중에도 동작)
  useEffect(() => {
    const q = value.trim().toLowerCase();
    if (q.length < 2) { setHits([]); return undefined; }
    let live = true;
    snapshotIndex().then((idx) => {
      if (!live || !idx) return;
      setHits((idx.projects || []).filter((p) => p.name.toLowerCase().includes(q) || (p.path_with_namespace || '').toLowerCase().includes(q)).slice(0, 5));
    });
    return () => { live = false; };
  }, [value]);
  const go = (to) => { setOpen(false); navigate(to); };
  const q = value.trim();
  return (
    <div className="rb-gsearch" ref={wrap}>
      <form
        className="rb-gbar-search"
        data-figma="global-search"
        role="search"
        onSubmit={(e) => {
          e.preventDefault();
          go(`/search?q=${encodeURIComponent(q)}`);
        }}
      >
        <label className="sr-only" htmlFor="global-search">{t.GlobalBar_searchLabel}</label>
        <Icon name="search" />
        <input
          id="global-search"
          ref={input}
          type="search"
          value={value}
          autoComplete="off"
          aria-expanded={open && !!q}
          aria-controls="rb-gsearch-panel"
          onFocus={() => setOpen(true)}
          onChange={(e) => { setValue(e.target.value); setOpen(true); }}
          placeholder={t.GlobalBar_searchPlaceholder}
        />
        <kbd className="rb-gbar-kbd" aria-hidden="true">/</kbd>
      </form>
      {open && q ? (
        <div id="rb-gsearch-panel" className="rb-menu rb-gsearch-panel" role="listbox" aria-label={t.GlobalBar_searchLabel}>
          <p className="rb-menu-title">{u.Q_in(q)}</p>
          <ul className="drop-list">
            <li><button type="button" className="item-link" onClick={() => go(`/search?q=${encodeURIComponent(q)}`)}><Icon name="search" /><span>{u.Q_all}</span></button></li>
          </ul>
          {hits.length ? (
            <>
              <p className="rb-menu-title">{u.Q_projects}</p>
              <ul className="drop-list">
                {hits.map((p) => (
                  <li key={p.id}><button type="button" className="item-link" onClick={() => go(`/projects/${p.id}`)}><Avatar src={p.avatar_url} name={p.name} /><span>{p.namespace?.name ? `${p.namespace.name} / ` : ''}{p.name}</span></button></li>
                ))}
              </ul>
            </>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export function GlobalBar({ onToggleNav, navOpen, hasNav = true, sideHidden = false, onShowSide, area }) {
  const location = useLocation();
  const { signedIn } = useAuth();
  // UX-007 1장: 기본은 어두운 화면. 로그인 여부와 상관없이 항상 적용되어야 하므로 여기서 한 번 불러 쓴다(전에는 로그인 후에만 불리는 버그가 있었다)
  const [mode, setMode] = useScreenMode();
  const loginTo = `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`;
  return (
    <header className="rb-gbar" data-figma="topbar" data-krds="header" data-auth={signedIn ? 'Signed-in' : 'Guest'}>
      <div className="rb-gbar-in">
        <div className="rb-gbar-left">
          {hasNav ? (
            <IconButton icon="menu" label={t.GlobalBar_navToggle} size="medium" className="rb-gbar-navtoggle" aria-expanded={navOpen} aria-controls="rb-sidebar" onClick={onToggleNav} />
          ) : null}
          {/* D-21: 사이드바를 접으면 상단 바 맨 왼쪽에 펼침 단추(공공 깃랩 방식) */}
          {sideHidden ? (
            <IconButton icon="panel_close" label={u.G_sideExpand} size="medium" className="rb-gbar-sideopen" title={u.G_sideExpand} onClick={onShowSide} />
          ) : null}
          <Link className="rb-gbar-brand" to="/" aria-label={u.Brand_home}>
            <Logo size={24} />
          </Link>
          {hasNav && area ? <span className="rb-gbar-area">{area}</span> : null}
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
              {/* 공공 깃랩 순서: 등록, 로그인 */}
              <Link className="krds-btn small tertiary rb-gbar-cta" to="/register">{u.Hdr_signup}</Link>
              <Link className="krds-btn small primary rb-gbar-cta" to={loginTo}>{t.Header_login}</Link>
              <IconButton to={loginTo} icon="my" label={t.Header_login} size="medium" className="rb-gbar-user" title={t.Header_login} />
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
