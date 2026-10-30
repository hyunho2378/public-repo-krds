// 공통 메뉴 부품(UX-007 12장). 더보기, 드롭다운, 정렬, 화면 설정, 아바타, 사이드바 묶음이 모두 이 하나를 쓴다.
// 항목은 한 줄(nowrap) 높이 32, 간격 0, 폭은 가장 긴 항목 + 좌우 12(160~320). 버튼 아래 왼쪽/오른쪽 끝 정렬이고 화면 가장자리 12 안으로 들어온다.
// 항목 마크업: <ul className="drop-list"><li><a|button className="item-link">글자</a></li></ul>, 묶음 이름은 <p className="rb-menu-title">
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

export function Menu({ label, button, btnClass = 'krds-btn small tertiary', btnProps = {}, className = '', align = 'right', side = false, toggle = true, panelClass = '', children }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const wrap = useRef(null);
  const btn = useRef(null);
  const panel = useRef(null);
  const close = () => setOpen(false);

  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); btn.current?.focus(); } };
    const onMove = () => setOpen(false);
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    window.addEventListener('resize', onMove);
    window.addEventListener('scroll', onMove, true);
    return () => {
      document.removeEventListener('mousedown', onDown);
      document.removeEventListener('keydown', onKey);
      window.removeEventListener('resize', onMove);
      window.removeEventListener('scroll', onMove, true);
    };
  }, [open]);

  // 그린 뒤 크기를 재서 위치를 정한다. 가장자리 여백은 CSS(--rb-menu-edge)를 scroll-margin으로 읽는다
  useLayoutEffect(() => {
    if (!open) { setPos(null); return; }
    const b = btn.current.getBoundingClientRect();
    const p = panel.current;
    const edge = parseFloat(getComputedStyle(p).scrollMarginTop) || 0;
    const vw = document.documentElement.clientWidth;
    const vh = window.innerHeight;
    const w = p.offsetWidth;
    let left = side ? b.right : align === 'left' ? b.left : b.right - w;
    left = Math.max(edge, Math.min(left, vw - w - edge));
    let top = side ? b.top : b.bottom;
    const room = vh - edge - top;
    if (side && p.offsetHeight > room) top = Math.max(edge, vh - edge - p.offsetHeight);
    setPos({ left, top, maxHeight: Math.max(vh - edge - top, 0) });
  }, [open, align, side]);

  return (
    <div ref={wrap} className={`krds-drop-wrap rb-drop${open ? ' rb-drop-open' : ''} ${className}`}>
      <button
        ref={btn}
        type="button"
        className={`${btnClass} drop-btn${open ? ' active' : ''}`}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label={label}
        {...btnProps}
        onClick={(e) => { btnProps.onClick?.(e); setOpen(!open); }}
      >
        {button}
        {toggle ? <i className="svg-icon ico-toggle" aria-hidden="true" /> : null}
      </button>
      {open ? (
        <div ref={panel} className={`rb-menu ${panelClass}`} role="menu" aria-label={label} style={pos ? { left: pos.left, top: pos.top, maxHeight: pos.maxHeight } : { left: 0, top: 0, visibility: 'hidden' }}>
          {typeof children === 'function' ? children(close) : children}
        </div>
      ) : null}
    </div>
  );
}
