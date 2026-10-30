// Figma: KRDS breadcrumb
import { t } from '../../copy/ko';
import { Link } from 'react-router-dom';

export function Breadcrumb({ items }) {
  return (
    <nav data-figma="breadcrumb" className="krds-breadcrumb-wrap" aria-label={t.Breadcrumb_1}>
      <ol className="breadcrumb">
        <li className="home">
          <Link className="txt" to="/">{t.Breadcrumb_2}</Link>
        </li>
        {items.map(([label, to], i) => (
          <li key={label + i}>
            {to ? (
              <Link className="txt" to={to}>{label}</Link>
            ) : (
              <span className="txt" aria-current="page">{label}</span>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
