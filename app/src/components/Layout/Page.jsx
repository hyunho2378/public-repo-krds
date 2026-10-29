// 화면 바탕. data-screen-id는 Figma 섹션(P-번호)과 대조할 때 쓴다.
import { plain } from '../Help/Phrase';
import { t } from '../../copy/ko';
import { useEffect } from 'react';

export function Page({ id, title, state, children }) {
  useEffect(() => {
    if (title) document.title = t.fn.docTitle(plain(title));
  }, [title]);
  return (
    <div className="rb-page" data-screen-id={id} data-state={state}>
      {children}
    </div>
  );
}
