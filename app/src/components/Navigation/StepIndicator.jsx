// Figma: KRDS step_indicator. 공식 마크업(code/html/code/step_indicator.html).
import { t } from '../../copy/ko';
export function Steps({ labels, current, label }) {
  return (
    <div className="rb-steps">
    <ol className="krds-step-wrap" aria-label={label}>
      {labels.map((name, i) => (
        <li key={name} className={i < current ? 'done' : i === current ? 'active' : ''} aria-current={i === current ? 'step' : undefined}>
          <span>
            <i className="step">{t.fn.step(i + 1)}</i>
            <span className="step-tit">{name}</span>
          </span>
        </li>
      ))}
    </ol>
    <p className="rb-step-current" aria-hidden="true">
      <span className="krds-text-body-small rb-subtle">{t.fn.stepOf(current + 1, labels.length)}</span>
      <strong className="krds-text-heading-small">{labels[current]}</strong>
    </p>
    </div>
  );
}
