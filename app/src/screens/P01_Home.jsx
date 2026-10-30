// A-01 첫 화면 = 공공 깃랩 '탐색 / 프로젝트'(캡처 01, 72 그대로, D-21 4장).
// 제목, 활성/비활성 탭, 필터 막대(최근 검색, 검색칸 최소 3자, 정렬, 정렬 방향), 목록 행, 쪽 넘김.
// 덧붙임은 필터 막대 아래 '업무 분야' 선택 한 줄뿐이다(UX/14 3-1: 한 화면에 덧붙임 묶음 하나).
import { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { u } from '../copy/ui';
import { request } from '../api/client';
import { useData } from '../api/useData';
import { readPref, writePref } from '../app/prefs';
import { Page } from '../components/Layout/Page';
import { Status } from '../components/Feedback/Status';
import { Icon } from '../components/Code/Icon';
import { Menu } from '../components/Navigation/Menu';
import { ProjectRow } from '../components/Layout/ProjectRow';

export const FIELDS = [t.P01_1, t.P01_2, t.P01_3, t.P01_4, t.P01_5, t.P01_6, t.P01_7];
const SORTS = [['last_activity_at', u.X_sortUpdated], ['created_at', u.X_sortCreated], ['name', u.X_sortName], ['star_count', u.X_sortStars]];
const PER = 20;
const RECENT_KEY = 'rb-explore-recent';

function recentList() {
  try { return JSON.parse(readPref(RECENT_KEY) || '[]'); } catch { return []; }
}

/** 행마다 열린 머지 리퀘스트 수(목록 API에 없어 x-total로 센다). 화면에 보이는 행만, 하나씩 차례로 */
function useMrCounts(items) {
  const [counts, setCounts] = useState({});
  useEffect(() => {
    let stop = false;
    (async () => {
      for (const p of items) {
        if (stop) return;
        const count = async (kind) => {
          const r = await request(`/api/gitlab/projects/${p.id}/${kind}?state=opened&per_page=1`).catch(() => null);
          return r ? r.pagination?.total ?? (Array.isArray(r.data) ? r.data.length : null) : null;
        };
        const mr = await count('merge_requests');
        const issues = p.open_issues_count == null ? await count('issues') : p.open_issues_count;
        if (!stop) setCounts((c) => ({ ...c, [p.id]: { mr, issues } }));
      }
    })();
    return () => { stop = true; };
  }, [items]);
  return counts;
}

export default function Home() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const archived = params.get('archived') === 'true';
  const sort = SORTS.some(([k]) => k === params.get('sort')) ? params.get('sort') : 'last_activity_at';
  const dir = params.get('dir') === 'asc' ? 'asc' : 'desc';
  const q = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [text, setText] = useState(q);
  const [warn, setWarn] = useState(false);
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };
  const list = useData(
    () => request(`/api/gitlab/projects?order_by=${sort}&sort=${dir}&archived=${archived}&per_page=${PER}&page=${page}${q ? `&search=${encodeURIComponent(q)}` : ''}`),
    [sort, dir, archived, q, page],
    (d) => !d.data?.length,
  );
  const items = list.data?.data || [];
  const mrs = useMrCounts(items);
  const submit = (e) => {
    e.preventDefault();
    const v = text.trim();
    if (v && v.length < 3) { setWarn(true); return; }
    setWarn(false);
    if (v) writePref(RECENT_KEY, JSON.stringify([v, ...recentList().filter((x) => x !== v)].slice(0, 5)));
    set({ q: v });
  };
  const total = list.data?.pagination?.total;
  const hasNext = !!list.data?.pagination?.nextPage;
  return (
    <Page id="A-01" title={u.X_title} state={list.state}>
      <h1 className="rb-x-title" data-figma="section-title">{u.X_title}</h1>
      <div className="krds-tab-area rb-x-tabs" data-figma="tabs">
        <div className="tab line" role="tablist" aria-label={u.X_tabs}>
          <ul>
            {[[false, u.X_active], [true, u.X_inactive]].map(([v, label]) => (
              <li key={label} className={archived === v ? 'active' : undefined}>
                <button type="button" role="tab" aria-selected={archived === v} className="btn-tab" onClick={() => set({ archived: v ? 'true' : '' })}>{label}</button>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <div className="rb-x-filter" data-figma="filter-bar">
        <Menu label={u.X_recent} align="left" toggle btnClass="rb-x-recent" btnProps={{ title: u.X_recent }} button={<Icon name="ext/history" />}>
          {(close) => {
            const r = recentList();
            return (
              <ul className="drop-list">
                {r.length ? r.map((x) => (
                  <li key={x}><button type="button" className="item-link" onClick={() => { setText(x); set({ q: x }); close(); }}>{x}</button></li>
                )) : <li><span className="item-link rb-subtle">{u.X_recentNone}</span></li>}
              </ul>
            );
          }}
        </Menu>
        <form className="rb-x-search" role="search" onSubmit={submit}>
          <label className="sr-only" htmlFor="x-filter">{u.X_filter}</label>
          <input id="x-filter" type="search" value={text} placeholder={u.X_filter} onChange={(e) => setText(e.target.value)} aria-describedby={warn ? 'x-filter-warn' : undefined} />
          <button type="submit" className="rb-x-searchbtn" aria-label={u.X_search} title={u.X_search}><Icon name="search" /></button>
        </form>
        <div className="rb-x-sort" role="group" aria-label={u.X_sortBy}>
          <label className="sr-only" htmlFor="x-sort">{u.X_sortBy}</label>
          <select id="x-sort" className="krds-form-select small" value={sort} onChange={(e) => set({ sort: e.target.value })}>
            {SORTS.map(([k, label]) => <option key={k} value={k}>{label}</option>)}
          </select>
          <button type="button" className="rb-x-dir" onClick={() => set({ dir: dir === 'asc' ? 'desc' : 'asc' })} aria-label={dir === 'asc' ? u.X_sortDesc : u.X_sortAsc} title={dir === 'asc' ? u.X_sortDesc : u.X_sortAsc}>
            <Icon name={dir === 'asc' ? 'ext/sort-asc' : 'ext/sort-desc'} />
          </button>
        </div>
      </div>
      {warn ? <p id="x-filter-warn" className="krds-text-body-xsmall rb-subtle" role="status">{u.X_min3}</p> : null}
      {/* 덧붙임(D-21 4장, UX/14 2): 업무 분야 선택 한 줄. 고르면 업무 분야 검색 결과로 간다 */}
      <div className="rb-x-extra" data-figma="extra-field-filter">
        <label htmlFor="x-field" className="krds-text-body-xsmall rb-subtle">{u.X_field}</label>
        <select id="x-field" className="krds-form-select small" defaultValue="" onChange={(e) => e.target.value && navigate(`/search?field=${encodeURIComponent(e.target.value)}`)}>
          <option value="">{u.X_fieldAll}</option>
          {FIELDS.map((f) => <option key={f} value={f}>{f}</option>)}
        </select>
      </div>
      <Status {...list} />
      {list.state === 'Empty' ? <p className="krds-text-body-small rb-subtle">{u.X_none}</p> : null}
      {items.length ? <ul className="rb-prows">{items.map((p) => <ProjectRow key={p.id} p={p} mrs={mrs[p.id]?.mr} issues={mrs[p.id]?.issues} />)}</ul> : null}
      {items.length && (page > 1 || hasNext) ? (
        <nav className="rb-x-pager" aria-label={t.Pagination_1}>
          <button type="button" className="krds-btn small tertiary" disabled={page <= 1} onClick={() => set({ page: String(page - 1) })}>{t.Pagination_2}</button>
          <span className="krds-text-body-xsmall rb-subtle">{total ? `${page} / ${Math.ceil(total / PER)}` : page}</span>
          <button type="button" className="krds-btn small tertiary" disabled={!hasNext} onClick={() => set({ page: String(page + 1) })}>{t.Pagination_3}</button>
        </nav>
      ) : null}
    </Page>
  );
}
