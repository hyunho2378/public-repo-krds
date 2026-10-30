// P-01 첫 화면. 로그인 없이 업무 문장 검색(U1, U5). Figma 섹션 11038:685
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { Link } from 'react-router-dom';
import { product } from '../api/client';
import { useData } from '../api/useData';
import { hasData } from '../api/devState';
import { Page } from '../components/Layout/Page';
import { TaskSearch } from '../components/Input/TaskSearch';
import { ProjectList } from '../components/Layout/StructuredList';
import { Status, EmptyState } from '../components/Feedback/Status';

export const FIELDS = [t.P01_1, t.P01_2, t.P01_3, t.P01_4, t.P01_5, t.P01_6, t.P01_7];

export default function Home() {
  const list = useData(() => product.get('/catalog?limit=5'), [], (d) => !d.data.items.length);
  return (
    <Page id="P-01" title={t.Header_2} state={list.state}>
      <h1 className="krds-text-heading-xlarge" data-figma="section-title">{phrase(t.P01_8)}</h1>
      <p className="krds-text-body-large rb-subtle">{phrase(t.P01_9)}</p>
      <TaskSearch />
      <section className="rb-stack" aria-labelledby="fields-title">
        <h2 id="fields-title" className="krds-text-heading-medium">{phrase(t.P01_10)}</h2>
        <ul className="rb-links">
          {FIELDS.map((f) => (
            <li key={f}>
              <Link className="krds-link" to={`/search?field=${encodeURIComponent(f)}`}>{f}</Link>
            </li>
          ))}
          <li><Link className="krds-link" to="/fields">{t.P01_11}</Link></li>
          <li><Link className="krds-link" to="/organizations">{t.P01_12}</Link></li>
        </ul>
      </section>
      <section className="rb-stack" aria-labelledby="recent-title">
        <h2 id="recent-title" className="krds-text-heading-medium">{phrase(t.P01_13)}</h2>
        <Status {...list} />
        {list.state === 'Empty' && <EmptyState title={t.P01_14} />}
        {hasData(list.state) && <ProjectList items={list.data.data.items} />}
        <Link className="krds-link" to="/search">{t.P01_15}</Link>
      </section>
    </Page>
  );
}
