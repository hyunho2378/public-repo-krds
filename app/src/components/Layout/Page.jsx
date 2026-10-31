// 화면 바탕. data-screen-id는 Figma 섹션(P-번호)과 대조할 때 쓴다.
import { plain } from '../Help/Phrase';
import { t } from '../../copy/ko';
import { useEffect, useRef } from 'react';

export function Page({ id, title, state, children, noFigma = false }) {
  const root = useRef(null);
  // 화면 대조용 표식: 본문 첫 소제목에 section-title 이름을 단다(보이는 것은 바뀌지 않는다)
  useEffect(() => {
    const el = root.current;
    if (!el) return undefined;
    const tag = () => {
      const h = el.querySelector('h2:not(aside h2):not(nav h2)');
      if (h && !h.hasAttribute('data-figma')) h.setAttribute('data-figma', 'section-title');
      // 화면 머리: 이름표가 없으면 첫 h1에 page-head(Figma 대조 이름표, 2026. 10. 31.)
      const h1 = [...el.querySelectorAll('h1')].find((x) => !x.classList.contains('rb-md-h1') && !x.closest('.rb-md, .rb-readme, .rb-md-body'));
      if (h1 && !el.querySelector('[data-figma="page-head"]') && !h1.hasAttribute('data-figma')) h1.setAttribute('data-figma', 'page-head');
    };
    tag();
    const mo = new MutationObserver(tag);
    mo.observe(el, { childList: true, subtree: true });
    return () => mo.disconnect();
  }, []);
  useEffect(() => {
    if (title) document.title = t.fn.docTitle(plain(title));
  }, [title]);
  return (
    <div ref={root} className="rb-page" data-figma={noFigma ? undefined : 'main'} data-screen-id={id} data-state={state}>
      {children}
    </div>
  );
}
