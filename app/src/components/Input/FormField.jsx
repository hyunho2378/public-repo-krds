// Figma: KRDS text_input / textarea 상태(기본, 오류). 공식 마크업(text_input_state.html): form-group > form-tit > form-conts(.is-error) > form-hint-invalid
import { t } from '../../copy/ko';

export function FormField({ id, label, required = false, hint, error, multiline = false, ...props }) {
  const describedBy = [hint && `${id}-hint`, error && `${id}-error`].filter(Boolean).join(' ') || undefined;
  const Control = multiline ? 'textarea' : 'input';
  return (
    <div className="form-group">
      <div className="form-tit">
        <label htmlFor={id}>
          {label} <span className={'rb-required' + (required ? ' is-req' : '')}>{required ? t.req : t.opt}</span>
        </label>
      </div>
      <div className={'form-conts' + (error ? ' is-error' : '')}>
        <Control id={id} className={'krds-input' + (multiline ? ' rb-textarea' : '')} aria-invalid={error ? true : undefined} aria-describedby={describedBy} {...props} />
      </div>
      {hint && <p id={`${id}-hint`} className="form-hint">{hint}</p>}
      {error && <p id={`${id}-error`} className="form-hint-invalid">{error}</p>}
    </div>
  );
}

/** 제출 때 빈 필수 칸을 찾아 오류를 돌려주고 첫 칸에 초점을 옮긴다. */
export function requireFields(values, ids) {
  const errors = {};
  for (const [key, id] of Object.entries(ids)) if (!String(values[key] || '').trim()) errors[key] = t.err_required;
  const first = Object.keys(ids).find((k) => errors[k]);
  if (first) document.getElementById(ids[first])?.focus();
  return errors;
}
