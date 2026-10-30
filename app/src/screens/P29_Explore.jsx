// G-01 탐색. 공공 깃랩 탐색(Explore) 화면처럼 공개 프로젝트를 탭으로 나눠 본다.
// 탭은 주소에 남아 뒤로 가기와 공유가 된다. 자료는 서버 검색 색인(공개 목록 스냅샷)을 쓴다.
import { Link, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { product } from '../api/client';
import { useData } from '../api/useData';
import { Page } from '../components/Layout/Page';
import { Status } from '../components/Feedback/Status';
import { ProjectList } from '../components/Layout/StructuredList';

// 탭마다 정렬 기준이 다르다. 서버 검색은 점수 순으로 주므로 받은 뒤 다시 늘어놓는다.
const TABS = [
  ['recent', (x) => x.Explore_recent, (a, b) => String(b.last || '').localeCompare(String(a.last || ''))],
  ['name', (x) => x.Explore_name, (a, b) => String(a.name).localeCompare(String(b.name), 'ko')],
  ['org', (x) => x.Explore_org, (a, b) => String(a.organization || '').localeCompare(String(b.organization || ''), 'ko')],
];

export default function Explore() {
  const [params, setParams] = useSearchParams();
  const tab = TABS.some(([k]) => k === params.get('tab')) ? params.get('tab') : 'recent';
  const body = useData(
    async () => (await product.post('/search', { query: '', limit: 20 })).data,
    [tab],
    (d) => !d?.items?.length,
  );
  const items = [...(body.data?.items || [])].sort(TABS.find(([k]) => k === tab)[2]);
  return (
    <Page id="G-01" title={t.Explore_title} state={body.state}>
      <h1 className="krds-text-heading-small" data-figma="section-title">{t.Explore_title}</h1>
      <div className="rb-code-views" role="tablist" aria-label={t.Explore_tabsLabel} data-figma="tabs">
        {TABS.map(([key, label]) => (
          <button
            key={key}
            type="button"
            role="tab"
            aria-selected={tab === key}
            className={'rb-code-view' + (tab === key ? ' active' : '')}
            onClick={() => {
              const next = new URLSearchParams(params);
              next.set('tab', key);
              setParams(next);
            }}
          >
            {label(t)}
          </button>
        ))}
      </div>
      {items.length ? <ProjectList items={items} /> : <Status {...body} />}
      {body.data?.total ? (
        <p className="krds-text-body-small rb-subtle">{t.fn.exploreTotal(body.data.total)}</p>
      ) : null}
      <p className="krds-text-body-small rb-subtle">
        <Link className="krds-link" to="/search">{t.Explore_toSearch}</Link>
      </p>
    </Page>
  );
}
