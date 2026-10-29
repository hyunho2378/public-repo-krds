// Figma: KRDS structured_list. 항목마다 하는 일 한 줄(U2), 기관만 노출(U9).
import { t } from '../../copy/ko';
import { orgLabel } from './orgLabel';
import { Link } from 'react-router-dom';

const EXECUTION = { web: t.StructuredList_1, download: t.StructuredList_2, install: t.StructuredList_3, unknown: t.StructuredList_4 };

export function cleanDescription(text) {
  return (text || '').replace(/^\s*\[[^\]]+\]\s*/, '').split(/\r?\n/)[0];
}

export function ProjectList({ items }) {
  return (
    <ul className="krds-structured-list rb-list" data-krds="structured_list">
      {items.map((p) => (
        <li className="structured-item" key={p.id}>
          <Link className="rb-list-link" to={`/projects/${p.id}`}>
            <span className="krds-text-heading-small rb-list-title">{p.name}</span>
            <span className="krds-text-body-medium rb-subtle rb-clamp">{cleanDescription(p.description) || t.StructuredList_5}</span>
            <span className="krds-text-body-small rb-subtle">
              {orgLabel(p.organization) || t.StructuredList_6} / {EXECUTION[p.execution] || EXECUTION.unknown}
              {p.last ? t.fn.updatedSuffix(p.last.replaceAll('-', '. ') + '.') : ''}
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
