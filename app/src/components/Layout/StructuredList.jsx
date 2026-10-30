// Figma: KRDS structured_list(card). 공식 마크업(code/html/code/structured_list.html): ul.krds-structured-list > li.structured-item > .in > .card-body > a.c-text > p.c-tit, p.c-txt, p.c-date
// 항목마다 하는 일 한 줄(U2), 기관만 노출(U9, orgLabel). 설명은 2줄 말줄임(Figma).
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';
import { orgLabel } from './orgLabel';

const EXECUTION = { web: t.StructuredList_1, download: t.StructuredList_2, install: t.StructuredList_3 };
// KRDS에는 언어별 색이 없다(GitHub 고유 색은 직접 색이라 D-15 위반). 언어가 있을 때만 KRDS 아이콘 회색 점으로 표시한다.

export function cleanDescription(text) {
  return (text || '').replace(/^\s*\[[^\]]+\]\s*/, '').split(/\r?\n/)[0];
}

export function ProjectList({ items }) {
  return (
    <ul className="krds-structured-list type-full rb-list" data-krds="structured_list">
      {items.map((p) => (
        <li className="structured-item" key={p.id}>
          <div className="in">
            <div className="card-body">
              <Link className="c-text" to={`/projects/${p.id}`}>
                <p className="c-tit">
                  <span className="span">{p.name}</span>
                </p>
                <p className="c-txt rb-clamp-1">{cleanDescription(p.description) || t.StructuredList_5}</p>
                <p className="c-date rb-meta">
                  <span className="value">{orgLabel(p.organization)}</span>
                  {p.language && (
                    <span className="value rb-lang">
                      <i className="rb-lang-dot" aria-hidden="true" />
                      {p.language}
                    </span>
                  )}
                  {EXECUTION[p.execution] && <span className="krds-badge small information">{EXECUTION[p.execution]}</span>}
                  {p.last && (() => { const { rel, full } = t.fn.relativeDate(p.last); return <span className="value" title={full}>{rel}</span>; })()}
                </p>
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
