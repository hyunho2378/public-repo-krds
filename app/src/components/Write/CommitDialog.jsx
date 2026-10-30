// R-27 커밋 대화창. GitHub의 Commit changes 대화창 구성을 그대로 옮긴다.
// 커밋 메시지, 확장 설명, 바로 반영 / 새 브랜치 만들어 변경 제안, 새 브랜치 이름.
// 시험판에서는 실제로 저장하지 않는다. 마지막 단계에서 사실대로 알린다(가짜 저장 금지).
import { useEffect, useRef, useState } from 'react';
import { t } from '../../copy/ko';
import { FormField } from '../Input/FormField';

export function CommitDialog({ open, onClose, defaultMessage, branch, onSubmit, submitLabel }) {
  const [message, setMessage] = useState(defaultMessage || '');
  const [detail, setDetail] = useState('');
  const [target, setTarget] = useState('direct');
  const [newBranch, setNewBranch] = useState(t.fn.patchBranch(branch || 'main'));
  const panel = useRef(null);
  const opener = useRef(null);

  useEffect(() => setMessage(defaultMessage || ''), [defaultMessage]);

  // 대화창 안에 초점을 가두고 Esc로 닫는다(KRDS 모달 규칙).
  useEffect(() => {
    if (!open) return undefined;
    opener.current = document.activeElement;
    const timer = setTimeout(() => panel.current?.querySelector('input,textarea,button')?.focus(), 60);
    const onKey = (e) => {
      if (e.key === 'Escape') return onClose();
      if (e.key !== 'Tab') return undefined;
      const items = panel.current?.querySelectorAll('input,textarea,button,a[href]');
      if (!items?.length) return undefined;
      const first = items[0];
      const last = items[items.length - 1];
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
      return undefined;
    };
    document.addEventListener('keydown', onKey);
    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', onKey);
      opener.current?.focus?.();
    };
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="rb-modal-dim" role="presentation" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="rb-modal" role="dialog" aria-modal="true" aria-labelledby="commit-title" ref={panel}>
        <h2 id="commit-title" className="krds-text-heading-xsmall">{t.Commit_title}</h2>
        <FormField
          id="commit-message"
          label={t.Commit_message}
          required
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          hint={t.Commit_messageHint}
        />
        <FormField
          id="commit-detail"
          label={t.Commit_detail}
          multiline
          value={detail}
          onChange={(e) => setDetail(e.target.value)}
          hint={t.Commit_detailHint}
        />
        <fieldset className="rb-commit-target">
          <legend className="krds-text-body-small-bold">{t.Commit_where}</legend>
          <div className="krds-form-check">
            <input id="commit-direct" type="radio" name="commit-target" checked={target === 'direct'} onChange={() => setTarget('direct')} aria-describedby="commit-direct-hint" />
            <label htmlFor="commit-direct">{t.fn.commitDirect(branch || 'main')}</label>
          </div>
          <p id="commit-direct-hint" className="rb-side-hint">{t.Commit_directHint}</p>
          <div className="krds-form-check">
            <input id="commit-branch-opt" type="radio" name="commit-target" checked={target === 'branch'} onChange={() => setTarget('branch')} aria-describedby="commit-branch-hint" />
            <label htmlFor="commit-branch-opt">{t.Commit_newBranch}</label>
          </div>
          <p id="commit-branch-hint" className="rb-side-hint">{t.Commit_newBranchHint}</p>
          {target === 'branch' ? (
            <FormField id="commit-branch" label={t.Commit_branchName} required value={newBranch} onChange={(e) => setNewBranch(e.target.value)} />
          ) : null}
        </fieldset>
        <div className="rb-modal-actions">
          <button type="button" className="krds-btn small tertiary" onClick={onClose}>{t.Commit_cancel}</button>
          <button
            type="button"
            className="krds-btn small primary"
            disabled={!message.trim() || (target === 'branch' && !newBranch.trim())}
            onClick={() => onSubmit({ message, detail, target, newBranch })}
          >
            {submitLabel || (target === 'branch' ? t.Commit_propose : t.Commit_submit)}
          </button>
        </div>
      </div>
    </div>
  );
}
