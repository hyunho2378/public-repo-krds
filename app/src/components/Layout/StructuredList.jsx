// Figma: KRDS structured_list(card). 공식 마크업(code/html/code/structured_list.html): ul.krds-structured-list > li.structured-item > .in > .card-body > a.c-text > p.c-tit, p.c-txt, p.c-date
// 항목마다 하는 일 한 줄(U2), 기관만 노출(U9, orgLabel). 설명은 2줄 말줄임(Figma).
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';
import { orgLabel } from './orgLabel';

const EXECUTION = { web: t.StructuredList_1, download: t.StructuredList_2, install: t.StructuredList_3, unknown: t.StructuredList_4 };

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
                <p className="c-txt rb-clamp">{cleanDescription(p.description) || t.StructuredList_5}</p>
                <p className="c-date">
                  <span className="value">{orgLabel(p.organization)}</span>
                  <span className="value">{EXECUTION[p.execution] || EXECUTION.unknown}</span>
                  {p.last && <span className="value">{t.fn.updatedOn(p.last.replaceAll('-', '. ') + '.')}</span>}
                </p>
              </Link>
            </div>
          </div>
        </li>
      ))}
    </ul>
  );
}
