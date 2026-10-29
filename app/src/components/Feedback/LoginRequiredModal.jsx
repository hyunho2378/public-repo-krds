// Figma: KRDS modal. 로그인이 필요한 행동을 누르면 이유를 먼저 보여 주고, 로그인 뒤 원래 화면으로 돌아온다(U5).
import { phrase } from '../Help/Phrase';
import { t } from '../../copy/ko';
import { useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { auth } from '../../api/client';

export function LoginRequiredModal({ action, onClose }) {
  const location = useLocation();
  const dialog = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  const returnTo = location.pathname + location.search;

  useEffect(() => {
    const opener = document.activeElement;
    const node = dialog.current;
    const focusables = () => node.querySelectorAll('a[href],button:not([disabled])');
    document.body.classList.add('scroll-no');
    focusables()[0]?.focus();
    function onKey(e) {
      if (e.key === 'Escape') close.current();
      if (e.key !== 'Tab') return;
      const list = focusables();
      const first = list[0];
      const last = list[list.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
    node.addEventListener('keydown', onKey);
    return () => {
      node.removeEventListener('keydown', onKey);
      document.body.classList.remove('scroll-no');
      opener?.focus?.();
    };
  }, []);

  return (
    <section className="krds-modal fade shown in" role="dialog" aria-modal="true" aria-labelledby="login-modal-title" ref={dialog}>
      <div className="modal-dialog">
        <div className="modal-content">
          <div className="modal-header">
            <h2 id="login-modal-title" className="modal-title">
              {t.LoginRequiredModal_2}
            </h2>
          </div>
          <div className="modal-conts">
            <div className="conts-area">
              <p>{t.fn.loginNeed(action)}</p>
              <p>{phrase(t.LoginRequiredModal_1)}</p>
            </div>
          </div>
          <div className="modal-btn btn-wrap">
            <button type="button" className="krds-btn medium tertiary" onClick={onClose}>
              {t.P15_12}
            </button>
            <a className="krds-btn medium primary" href={auth.loginUrl(returnTo)}>
              {t.P10_2}
            </a>
          </div>
        </div>
      </div>
      <div className="modal-back in" onClick={onClose} />
    </section>
  );
}
