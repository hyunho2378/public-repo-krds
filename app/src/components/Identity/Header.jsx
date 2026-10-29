// Figma: KRDS masthead + header. 공식 마크업(krds-ui-kit code/html/code/header.html, masthead.html).
// 서비스명과 기관 로고가 정해지기 전이라 로고 자리에는 서비스명 글자를 둔다. 정부 상징은 쓰지 않는다(공식 누리집이 아님).
import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { Link, NavLink, useLocation } from 'react-router-dom';
import { t } from '../../copy/ko';
import { phrase } from '../Help/Phrase';
import { ScreenModeOptions, useScreenMode } from './ScreenMode';

export const SERVICE_NAME = t.Header_service;

export const MAIN_MENU = [
  ['/', t.Header_menuFind],
  ['/requests', t.Header_menuRequests],
  ['/publish', t.Header_menuPublish],
  ['/help', t.Header_menuHelp],
];

function useLoginTo() {
  const location = useLocation();
  return `/login?returnTo=${encodeURIComponent(location.pathname + location.search)}`;
}

function ModeDropdown({ mode, setMode }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const close = (e) => {
      if (e.type === 'keydown' ? e.key === 'Escape' : !wrap.current.contains(e.target)) setOpen(false);
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);
  return (
    <div className="krds-drop-wrap" ref={wrap}>
      <button type="button" className={'krds-btn small text drop-btn' + (open ? ' active' : '')} aria-expanded={open} aria-controls="mode-menu" onClick={() => setOpen(!open)}>
        {t.Header_mode} <i className="svg-icon ico-toggle" aria-hidden="true" />
      </button>
      <div id="mode-menu" className="drop-menu" style={{ display: open ? 'block' : 'none' }}>
        <div className="drop-in">
          <ScreenModeOptions name="mode-utility" mode={mode} setMode={setMode} />
        </div>
      </div>
    </div>
  );
}

function MobileNav({ open, onClose, mode, setMode }) {
  const panel = useRef(null);
  const loginTo = useLoginTo();
  useEffect(() => {
    if (!open) return undefined;
    const opener = document.activeElement;
    document.body.classList.add('is-gnb-mobile');
    const timer = setTimeout(() => panel.current?.querySelector('a,button')?.focus(), 150);
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      document.body.classList.remove('is-gnb-mobile');
      document.removeEventListener('keydown', onKey);
      opener?.focus?.();
    };
  }, [open, onClose]);
  return createPortal(
    <div id="mobile-nav" className={'krds-main-menu-mobile' + (open ? ' is-open is-backdrop' : '')} aria-hidden={!open}>
      <div className="gnb-wrap" ref={panel} role="dialog" aria-modal="true" aria-label={t.Header_allMenu}>
        <div className="gnb-header">
          <div className="gnb-login">
            <Link className="krds-btn large text" to={loginTo} onClick={onClose}>
              <i className="svg-icon ico-log" aria-hidden="true" /> {t.Header_login}
            </Link>
          </div>
          <div className="gnb-login">
            <Link className="krds-btn large text" to="/my" onClick={onClose}>
              {t.Header_my}
            </Link>
          </div>
        </div>
        <div className="gnb-body">
          <div className="gnb-menu">
            <div className="menu-wrap">
              <ul>
                {MAIN_MENU.map(([to, label]) => (
                  <li key={to}>
                    <NavLink className={({ isActive }) => 'gnb-main-trigger' + (isActive ? ' active' : '')} end={to === '/'} to={to} onClick={onClose}>
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className="gnb-bottom rb-gnb-mode">
            <ScreenModeOptions name="mode-menu" mode={mode} setMode={setMode} />
          </div>
        </div>
        <button type="button" className="krds-btn medium icon" id="close-nav" onClick={onClose}>
          <span className="sr-only">{t.Header_closeMenu}</span>
          <i className="svg-icon ico-popup-close" aria-hidden="true" />
        </button>
      </div>
    </div>,
    document.body,
  );
}

export function Header() {
  const [open, setOpen] = useState(false);
  const [mode, setMode] = useScreenMode();
  const loginTo = useLoginTo();
  const close = useRef(() => setOpen(false)).current;

  return (
    <>
      <a className="rb-skip" href="#main">{t.Header_skip}</a>
      <div id="krds-masthead" className="rb-masthead">
        <div className="toggle-wrap">
          <div className="toggle-head">
            <div className="inner">
              <span className="nuri-txt">{phrase(t.Header_masthead)}</span>
            </div>
          </div>
        </div>
      </div>
      <header id="krds-header" data-krds="header">
        <div className="header-in">
          <div className="header-container">
            <div className="inner">
              <div className="header-utility">
                <ul className="utility-list">
                  <li><ModeDropdown mode={mode} setMode={setMode} /></li>
                  <li><Link className="krds-btn small text" to="/help">{t.Header_menuHelp}</Link></li>
                </ul>
              </div>
              <div className="header-branding">
                <h2 className="logo rb-logo">
                  <Link to="/">{SERVICE_NAME}</Link>
                </h2>
                <div className="header-actions">
                  <Link className="btn-navi login" to={loginTo}>{t.Header_login}</Link>
                  <Link className="btn-navi my" to="/my">{t.Header_my}</Link>
                  <button type="button" className="btn-navi all" aria-controls="mobile-nav" aria-expanded={open} onClick={() => setOpen(true)}>
                    {t.Header_allMenu}
                  </button>
                </div>
              </div>
            </div>
          </div>
          <nav className="krds-main-menu" aria-label={t.Header_mainMenu}>
            <div className="inner">
              <ul className="gnb-menu">
                {MAIN_MENU.map(([to, label]) => (
                  <li key={to}>
                    <NavLink className={({ isActive }) => 'gnb-main-trigger is-link' + (isActive ? ' active' : '')} end={to === '/'} to={to}>
                      {label}
                    </NavLink>
                  </li>
                ))}
              </ul>
            </div>
          </nav>
          <MobileNav open={open} onClose={close} mode={mode} setMode={setMode} />
        </div>
      </header>
    </>
  );
}
