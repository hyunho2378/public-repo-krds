// Figma: KRDS dropdown(krds-drop-wrap). 바깥 누름, Esc로 닫힘. 열림 상태 aria-expanded.
import { useEffect, useRef, useState } from 'react';

export function Drop({ button, className = '', btnClass = 'krds-btn medium tertiary', label, children, align = 'right' }) {
  const [open, setOpen] = useState(false);
  const wrap = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDoc = (e) => !wrap.current?.contains(e.target) && setOpen(false);
    const onKey = (e) => e.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onDoc);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDoc);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);
  return (
    <div ref={wrap} className={`krds-drop-wrap rb-drop rb-drop-${align}${open ? ' rb-drop-open' : ''} ${className}`}>
      <button type="button" className={`${btnClass} drop-btn`} aria-expanded={open} aria-haspopup="true" aria-label={label} onClick={() => setOpen(!open)}>
        {button}
        <i className="svg-icon ico-toggle" aria-hidden="true" />
      </button>
      <div className="drop-menu">
        <div className="drop-in">{typeof children === 'function' ? children(() => setOpen(false)) : children}</div>
      </div>
    </div>
  );
}
