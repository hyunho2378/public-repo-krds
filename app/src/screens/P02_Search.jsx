// P-02 검색 결과. 거른 조건은 주소에 남는다(F-03). 모바일은 필터를 바텀시트로. Figma 11038:1130
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { FieldsetTitle } from '../components/Input/FieldsetTitle';
import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { product } from '../api/client';
import { useData } from '../api/useData';
import { Page } from '../components/Layout/Page';
import { Breadcrumb } from '../components/Navigation/Breadcrumb';
import { Pagination } from '../components/Navigation/Pagination';
import { TaskSearch } from '../components/Input/TaskSearch';
import { ProjectList } from '../components/Layout/StructuredList';
import { Status, EmptyState } from '../components/Feedback/Status';
import { Button, LinkButton } from '../components/Action/Button';
import { FIELDS } from './P01_Home';

const SIZE = 10;
const ENVIRONMENTS = [
  ['web', t.StructuredList_1],
  ['download', t.StructuredList_2],
  ['install', t.StructuredList_3],
];

function Filters({ params, toggle, clear, facets }) {
  return (
    <div className="rb-stack">
      <fieldset className="rb-stack">
        <FieldsetTitle className="krds-text-body-medium-bold">{t.P02_1}</FieldsetTitle>
        {FIELDS.map((f) => (
          <div className="krds-form-check" key={f}>
            <input id={`field-${f}`} type="checkbox" checked={params.get('field') === f} onChange={() => toggle('field', f)} />
            <label htmlFor={`field-${f}`}>{facets ? t.fn.facet(f, facets.field[f] || 0) : f}</label>
          </div>
        ))}
      </fieldset>
      <fieldset className="rb-stack">
        <FieldsetTitle className="krds-text-body-medium-bold">{t.P02_2}</FieldsetTitle>
        {ENVIRONMENTS.map(([v, label]) => (
          <div className="krds-form-check" key={v}>
            <input id={`env-${v}`} type="checkbox" checked={params.get('environment') === v} onChange={() => toggle('environment', v)} />
            <label htmlFor={`env-${v}`}>{facets ? t.fn.facet(label, facets.execution[v] || 0) : label}</label>
          </div>
        ))}
      </fieldset>
      <Button Type="text" Size="small" onClick={clear}>{t.P02_3}</Button>
    </div>
  );
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const [sheet, setSheet] = useState(false);
  const page = Number(params.get('page') || 1);
  const query = params.get('q') || '';
  const key = params.toString();

  const result = useData(
    () => {
      const q = new URLSearchParams({ limit: String(SIZE), page: String(page) });
      if (params.get('field')) q.set('field', params.get('field'));
      if (params.get('environment')) q.set('execution', params.get('environment'));
      if (query) q.set('query', query);
      return product.get('/catalog?' + q.toString());
    },
    [key],
    (d) => !d.data.items.length,
  );

  function update(next) {
    next.delete('page');
    setParams(next);
  }
  function toggle(k, v) {
    const next = new URLSearchParams(params);
    params.get(k) === v ? next.delete(k) : next.set(k, v);
    update(next);
  }
  function clear() {
    update(new URLSearchParams(query ? { q: query } : {}));
  }
  const active = ['field', 'environment'].filter((k) => params.get(k));

  return (
    <Page id="P-02" title={query ? t.fn.searchTitle(query) : t.P02_4} state={result.state}>
      <Breadcrumb items={[[t.Header_2, '/'], [t.P02_5]]} />
      <h1 className="krds-text-heading-xlarge">{query ? t.fn.searchTitle(query) : t.P02_6}</h1>
      <TaskSearch initial={query} keep={params} />
      <div className="rb-two-col">
        <aside className="rb-side rb-filter-pc" aria-label={t.P02_7}>
          <h2 className="krds-text-heading-small">{phrase(t.P02_8)}</h2>
          <Filters params={params} toggle={toggle} clear={clear} facets={result.data?.data.facets} />
        </aside>
        <section className="rb-stack rb-grow" aria-label={t.P02_5}>
          <div className="rb-result-bar">
            <p role="status" className="krds-text-heading-small">
              {result.state === 'Ideal' ? t.fn.resultCount(result.data.data.total) : result.state === 'Empty' ? t.P02_9 : ''}
            </p>
            <Button Type="tertiary" Size="small" className="krds-btn small tertiary rb-filter-mobile" aria-expanded={sheet} onClick={() => setSheet(true)}>
              {t.fn.filterButton(active.length)}
            </Button>
          </div>
          <Status {...result} />
          {result.state === 'Empty' && (
            <EmptyState
              title={t.fn.emptyQuery(query)}
              actions={
                <>
                  {active.length > 0 && <Button Type="secondary" onClick={clear}>{t.P02_11}</Button>}
                  <LinkButton Type="text" to={`/requests?new=1&q=${encodeURIComponent(query)}`}>{t.P02_12}</LinkButton>
                </>
              }
            >
              {t.P02_emptyHint}
            </EmptyState>
          )}
          {result.state === 'Ideal' && (
            <>
              <ProjectList items={result.data.data.items} />
              <Pagination
                page={page}
                total={result.data.data.total}
                size={SIZE}
                onChange={(p) => {
                  const next = new URLSearchParams(params);
                  next.set('page', String(p));
                  setParams(next);
                  document.getElementById('main')?.focus();
                }}
              />
            </>
          )}
          {result.state === 'Ideal' && result.data.data.sourceDate && (
            <p className="krds-text-body-small rb-subtle">{t.fn.sourceDate(result.data.data.sourceDate)}</p>
          )}
        </section>
      </div>
      {sheet && (
        <div className="krds-bottom-sheet rb-sheet is-open" role="dialog" aria-modal="true" aria-labelledby="sheet-title">
          <div className="modal-back" onClick={() => setSheet(false)} />
          <div className="rb-sheet-body">
            <h2 id="sheet-title" className="krds-text-heading-small">{phrase(t.P02_8)}</h2>
            <Filters params={params} toggle={toggle} clear={clear} facets={result.data?.data.facets} />
            <Button onClick={() => setSheet(false)}>{t.P02_13}</Button>
          </div>
        </div>
      )}
    </Page>
  );
}
