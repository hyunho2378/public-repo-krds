// P-11 기관 둘러보기(F-33). 같은 이름은 합쳐서 보여 준다(불편 13).
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { product } from '../api/client';
import { useData } from '../api/useData';
import { hasData } from '../api/devState';
import { Page } from '../components/Layout/Page';
import { Breadcrumb } from '../components/Navigation/Breadcrumb';
import { Status, EmptyState } from '../components/Feedback/Status';

export default function Organizations() {
  const [filter, setFilter] = useState('');
  const orgs = useData(() => product.get('/organizations'), []);
  const items = hasData(orgs.state) ? orgs.data.data.items.filter((o) => o.name.includes(filter.trim())).sort((a, b) => b.projectCount - a.projectCount) : [];
  return (
    <Page id="P-11" title={t.P11_1} state={orgs.state}>
      <Breadcrumb items={[[t.Header_2, '/'], [t.P11_1]]} />
      <h1 className="krds-text-heading-xlarge" data-figma="section-title">{phrase(t.P11_1)}</h1>
      <div className="rb-search">
        <label className="krds-text-label-medium" htmlFor="org-filter">{t.P11_2}</label>
        <input className="krds-input medium" id="org-filter" type="search" placeholder={t.P11_3} value={filter} onChange={(e) => setFilter(e.target.value)} />
      </div>
      <Status {...orgs} />
      {hasData(orgs.state) && (items.length ? (
        <ul className="krds-structured-list rb-list">
          {items.map((o) => (
            <li className="structured-item" key={o.name}>
              <Link className="rb-list-link rb-row" to={`/search?q=${encodeURIComponent(o.name)}`}>
                <span className="krds-text-heading-small">{o.name}</span>
                <span className="krds-text-body-medium rb-subtle">{t.fn.orgCount(o.projectCount)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <EmptyState title={t.P11_5}>{t.P11_4}</EmptyState>
      ))}
    </Page>
  );
}
