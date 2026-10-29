// Figma: KRDS dropdown(krds-drop-wrap). GitHub Code 버튼과 같은 자리의 내려받기 메뉴.
import { useEffect, useRef, useState } from 'react';
import { t } from '../../copy/ko';
import { Icon } from './Icon';

export function DownloadMenu({ zipUrl, cloneUrl }) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
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
  const copy = async () => {
    await navigator.clipboard.writeText(cloneUrl);
    setNote(t.P16_cloneCopied);
    setOpen(false);
  };
  return (
    <div ref={wrap} className={`krds-drop-wrap rb-drop${open ? ' rb-drop-open' : ''}`}>
      <button type="button" className="krds-btn medium primary drop-btn" aria-expanded={open} aria-haspopup="true" onClick={() => setOpen(!open)}>
        <Icon name="download" />
        {t.P16_menu}
        <Icon name="expand_more" />
      </button>
      <div className="drop-menu">
        <div className="drop-in">
          <ul className="drop-list">
            <li><a className="item-link" href={zipUrl}>{t.P16_download}</a></li>
            {cloneUrl ? <li><button type="button" className="item-link" onClick={copy}>{t.P16_cloneCopy}</button></li> : null}
          </ul>
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{note}</p>
    </div>
  );
}
