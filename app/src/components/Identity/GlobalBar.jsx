// D-08 전역 틀. 공공 깃랩(gitlab.aigov.go.kr) 상단 바 배치를 그대로 따른다.
// 왼쪽: 사이드바 여닫기, 로고와 서비스명, "탐색" / 가운데: 검색 또는 이동(단축키 /) / 오른쪽: 화면 설정, 등록, 로그인 또는 내 계정.
// 부품과 값은 KRDS만 쓴다.
import { IconButton } from '../Action/IconButton';
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { Icon } from '../Code/Icon';
import { newWindow } from '../Layout/newWindow';
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

/** 공공 깃랩 상단 검색: 상단 바에는 단추만 있고, 누르거나 / 를 누르면 화면 전체 대화창(폭 768, 위 4, 뒤 덮개 0.64)이 열린다.
 *  Esc나 바깥을 누르면 닫히고 초점은 검색 단추로 돌아온다(audit_v3 G-05, G-07). */
function GlobalSearch() {
  const navigate = useNavigate();
  const btn = useRef(null);
  const input = useRef(null);
  const [value, setValue] = useState('');
  const [open, setOpen] = useState(false);
  const [hits, setHits] = useState([]);
  useEffect(() => {
    const onKey = (e) => {
      if ((e.key !== '/' && e.key !== 's') || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  useEffect(() => {
    if (!open) return undefined;
    input.current?.focus();
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); close(); } };
    document.addEventListener('keydown', onKey, true);
    return () => document.removeEventListener('keydown', onKey, true);
  }, [open]);
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
  function close() { setOpen(false); requestAnimationFrame(() => btn.current?.focus()); }
  const go = (to) => { setOpen(false); navigate(to); };
  const q = value.trim();
  return (
    <div className="rb-gsearch">
      <button type="button" ref={btn} className="rb-gbar-search" data-figma="global-search" aria-haspopup="dialog" aria-expanded={open} onClick={() => setOpen(true)}>
        <Icon name="search" />
        <span className="rb-gbar-search-text">{t.GlobalBar_searchPlaceholder}</span>
        <kbd className="rb-gbar-kbd" aria-hidden="true">/</kbd>
      </button>
      {open ? (
        <div className="rb-gsdlg-dim" onMouseDown={(e) => { if (e.target === e.currentTarget) close(); }}>
          <div className="rb-gsdlg" role="dialog" aria-modal="true" aria-label={t.GlobalBar_searchLabel}>
            <form
              className="rb-gsdlg-form"
              role="search"
              onSubmit={(e) => { e.preventDefault(); if (q) go(`/search?q=${encodeURIComponent(q)}`); }}
            >
              <label className="sr-only" htmlFor="global-search">{t.GlobalBar_searchLabel}</label>
              <Icon name="search" />
              <input id="global-search" ref={input} type="search" value={value} autoComplete="off" onChange={(e) => setValue(e.target.value)} placeholder={u.Q_placeholder} />
            </form>
            <div className="rb-gsdlg-list">
              {q ? (
                <>
                  <p className="rb-menu-title">{u.Q_in(q)}</p>
                  <ul className="drop-list">
                    <li><button type="button" className="item-link" onClick={() => go(`/search?q=${encodeURIComponent(q)}`)}><Icon name="search" /><span>{u.Q_all}</span></button></li>
                  </ul>
                  {hits.length ? (
                    <>
                      <p className="rb-menu-title">{u.Q_projects}</p>
                      <ul className="drop-list">
                        {hits.map((p) => (
                          <li key={p.id}><button type="button" className="item-link" onClick={() => go(`/projects/${p.id}`)}><Avatar src={p.avatar_url} name={p.namespace?.name || p.name} seed={p.id} /><span>{p.namespace?.name ? `${p.namespace.name} / ` : ''}{p.name}</span></button></li>
                        ))}
                      </ul>
                    </>
                  ) : null}
                </>
              ) : (
                <>
                  <p className="rb-menu-title">{u.Q_place}</p>
                  <ul className="drop-list">
                    <li><button type="button" className="item-link" onClick={() => go('/')}><Icon name="ext/project" /><span>{u.G_explore}</span></button></li>
                  </ul>
                </>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}

export function GlobalBar({ onToggleNav, navOpen, hasNav = true, drawer = false, sideHidden = false, onShowSide, area }) {
  const location = useLocation();
  const { signedIn, user } = useAuth();
  // UX-007 1장: 기본은 어두운 화면. 로그인 여부와 상관없이 항상 적용되어야 하므로 여기서 한 번 불러 쓴다(전에는 로그인 후에만 불리는 버그가 있었다)
  const [mode, setMode] = useScreenMode();
  const loginTo = `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`;
  return (
    <header className={'rb-gbar' + (drawer ? ' is-drawer' : '')} data-figma="topbar" data-krds="header" data-auth={signedIn ? 'Signed-in' : 'Guest'}>
      <div className="rb-gbar-in">
        <div className="rb-gbar-left">
          {hasNav ? (
            <button type="button" className="rb-gbar-icon rb-gbar-navtoggle" aria-label={t.GlobalBar_navToggle} title={t.GlobalBar_navToggle} aria-expanded={navOpen} aria-controls="rb-sidebar" onClick={onToggleNav}><Icon name="panel_open" /></button>
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
              {/* 공공 깃랩 로그인 상단 바 순서: 만들기, 작업 항목, 머지 리퀘스트, 알림(할 일), 계정 */}
              <Link className="rb-gbar-icon" to="/projects/new" aria-label={t.GlobalBar_create} title={t.GlobalBar_create}><Icon name="plus" /></Link>
              <a className="rb-gbar-icon" href="https://gitlab.aigov.go.kr/dashboard/issues" {...newWindow(u.Hdr_myIssues)} title={u.Hdr_myIssues}><Icon name="ext/issues" /></a>
              <a className="rb-gbar-icon" href="https://gitlab.aigov.go.kr/dashboard/merge_requests" {...newWindow(u.Hdr_myMrs)} title={u.Hdr_myMrs}><Icon name="ext/merge-request" /></a>
              <Link className="rb-gbar-icon" to="/notifications" aria-label={t.TabBar_alerts} title={t.TabBar_alerts}><Icon name="bell" /></Link>
              <AccountMenu mode={mode} setMode={setMode} user={user} />
              <SignedMenu mode={mode} setMode={setMode} />
            </>
          ) : (
            <>
              {/* 화면 설정 톱니는 공공 깃랩과 Figma 모두 없어 뺀다(대조 원장). 화면 설정은 '메뉴'(1024 미만), 계정 메뉴, /settings에 있다 */}
              {/* 공공 깃랩 순서와 역할: 등록(밝은 회색 채움), 로그인(어두운 회색 채움), 높이 32(audit_v3 G-03) */}
              <Link className="rb-gbar-cta is-signup" to="/register">{u.Hdr_signup}</Link>
              <Link className="rb-gbar-cta is-login" to={loginTo}>{t.Header_login}</Link>
              <GuestMenu loginTo={loginTo} mode={mode} setMode={setMode} />
            </>
          )}
        </div>
      </div>
    </header>
  );
}

/** 1024 미만: 공공 깃랩처럼 등록, 로그인을 '메뉴' 아이콘 하나로 접는다(audit_v3 05-4). 화면 설정도 이 안에 */
function GuestMenu({ loginTo, mode, setMode }) {
  return (
    <Menu label={u.Hdr_menu} className="rb-gbar-drop rb-gbar-more" align="right" toggle={false} btnClass="rb-gbar-icon" btnProps={{ title: u.Hdr_menu }} button={<Icon name="ellipsis_vertical" />}>
      {(close) => (
        <>
          <div className="rb-menu-group">
            <ul>
              <li><Link className="item-link" to="/register" onClick={close}><span>{u.Hdr_signup}</span></Link></li>
              <li><Link className="item-link" to={loginTo} onClick={close}><span>{t.Header_login}</span></Link></li>
            </ul>
          </div>
          <ScreenModeItems mode={mode} setMode={setMode} />
        </>
      )}
    </Menu>
  );
}

/** 1024 미만 로그인 상태: 만들기, 작업 항목, 머지 리퀘스트, 계정을 '메뉴' 하나로 접고 알림만 남긴다(Figma 360/768) */
function SignedMenu({ mode, setMode }) {
  return (
    <Menu label={u.Hdr_menu} className="rb-gbar-drop rb-gbar-more" align="right" toggle={false} btnClass="rb-gbar-icon" btnProps={{ title: u.Hdr_menu }} button={<Icon name="ellipsis_vertical" />}>
      {(close) => (
        <>
          <div className="rb-menu-group">
            <ul>
              <li><Link className="item-link" to="/projects/new" onClick={close}><span>{t.GlobalBar_create}</span></Link></li>
              <li><a className="item-link" href="https://gitlab.aigov.go.kr/dashboard/issues" {...newWindow(u.Hdr_myIssues)}><span>{u.Hdr_myIssues}</span></a></li>
              <li><a className="item-link" href="https://gitlab.aigov.go.kr/dashboard/merge_requests" {...newWindow(u.Hdr_myMrs)}><span>{u.Hdr_myMrs}</span></a></li>
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

/** 게스트도 화면 설정을 바꿀 수 있다(로그인 전용 버그 고침). */
function ScreenModeMenu({ mode, setMode }) {
  return (
    <Menu label={t.Header_6} className="rb-gbar-drop" align="right" toggle={false} btnClass="rb-gbar-icon" btnProps={{ title: t.Header_6 }} button={<Icon name="setting" />}>
      <ScreenModeItems mode={mode} setMode={setMode} />
    </Menu>
  );
}

/** 로그인 뒤 내 계정 메뉴. 화면 설정도 이 안에 둔다(Figma R-01 Signed-in). */
function AccountMenu({ mode, setMode, user }) {
  // 공공 깃랩: 계정 단추는 사용자 머리글자 아바타(아이콘 아님)
  const name = user?.name || user?.username || t.GlobalBar_account;
  return (
    <Menu label={t.GlobalBar_account} className="rb-gbar-drop rb-gbar-account" align="right" toggle={false} btnClass="rb-gbar-icon" btnProps={{ title: t.GlobalBar_account }} button={<Avatar src={user?.avatar_url} name={name} seed={user?.id} className="is-24" />}>
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
