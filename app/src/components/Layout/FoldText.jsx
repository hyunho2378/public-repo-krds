// 긴 글 접기(UX-007 14장): 정해진 줄 수(기본 3, 소개 4)까지만 보이고 나머지는 '더보기'로 펼친다. 펼치면 '접기'. 링크형 단추(KRDS 링크), nowrap, aria-expanded.
import { useId, useLayoutEffect, useRef, useState } from 'react';
import { u } from '../../copy/ui';

export function FoldText({ children, lines = 3, className = '', extra = null }) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [clamped, setClamped] = useState(false);
  const ref = useRef(null);
  useLayoutEffect(() => {
    const el = ref.current;
    if (!el) return undefined;
    const check = () => { if (!open) setClamped(el.scrollHeight > el.clientHeight + 1); };
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, [children, open, lines]);
  const foldable = clamped || open || Boolean(extra);
  return (
    <div className={'rb-fold ' + className}>
      <p ref={ref} id={id} className={'rb-fold-text' + (open ? ' is-open' : '')} style={{ '--rb-fold-lines': lines }}>{children}</p>
      {open && extra ? <div className="rb-fold-extra">{extra}</div> : null}
      {foldable ? (
        <button type="button" className="krds-link rb-fold-btn" aria-expanded={open} aria-controls={id} onClick={() => setOpen(!open)}>{open ? u.Fold_less : u.Fold_more}</button>
      ) : null}
    </div>
  );
}

/** 라벨(13 보조색) 위, 값(15) 아래의 세로 쌍. 세 열 구조를 쓰지 않는다. */
export function InfoPair({ label, children }) {
  return (
    <div className="rb-pair">
      <dt className="rb-pair-label">{label}</dt>
      <dd className="rb-pair-value">{children}</dd>
    </div>
  );
}
