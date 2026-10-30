// D-22 2장 단축키: '?'로 여는 단축키 목록 대화상자(KRDS modal). Esc로 닫고, 초점은 연 자리로 돌아간다.
import { useEffect, useRef } from 'react';
import { u } from '../../copy/ui';

export function ShortcutsDialog({ onClose }) {
  const box = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    const opener = document.activeElement;
    box.current?.querySelector('button')?.focus();
    const onKey = (e) => { if (e.key === 'Escape') close.current(); };
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('keydown', onKey); opener?.focus?.(); };
  }, []);
  return (
    <section className="krds-modal fade shown in rb-keys" role="dialog" aria-modal="true" aria-labelledby="rb-keys-title" ref={box}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header"><h2 id="rb-keys-title" className="modal-title">{u.K_title}</h2></div>
          <div className="modal-conts">
            <dl className="rb-keys-list">
              {u.K_list.map(([k, v]) => (
                <div key={k} className="rb-keys-row"><dt><code>{k}</code></dt><dd>{v}</dd></div>
              ))}
            </dl>
          </div>
          <div className="modal-btn btn-wrap">
            <button type="button" className="krds-btn small tertiary" onClick={onClose}>{u.K_close}</button>
          </div>
        </div>
      </div>
      <div className="modal-back in" onClick={onClose} />
    </section>
  );
}
