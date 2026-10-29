// Figma: KRDS pagination. 현재 쪽은 주소(page)로 유지한다.
import { t } from '../../copy/ko';
export function Pagination({ page, total, size, onChange }) {
  const last = Math.max(1, Math.ceil(total / size));
  if (last <= 1) return null;
  const pages = Array.from({ length: last }, (_, i) => i + 1).filter((p) => Math.abs(p - page) <= 2 || p === 1 || p === last);
  return (
    <nav className="krds-pagination" aria-label={t.Pagination_1}>
      <button className="page-navi prev" disabled={page <= 1} onClick={() => onChange(page - 1)}>{t.Pagination_2}</button>
      <div className="page-links">
        {pages.map((p) => (
          <button key={p} className={'page-link' + (p === page ? ' active' : '')} aria-current={p === page ? 'page' : undefined} onClick={() => onChange(p)}>
            {p}
          </button>
        ))}
      </div>
      <button className="page-navi next" disabled={page >= last} onClick={() => onChange(page + 1)}>{t.Pagination_3}</button>
    </nav>
  );
}
