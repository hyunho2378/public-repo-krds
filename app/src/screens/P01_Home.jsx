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
import { loadCards } from '../api/cards';

export const FIELDS = [t.P01_1, t.P01_2, t.P01_3, t.P01_4, t.P01_5, t.P01_6, t.P01_7];
// 공공 깃랩 정렬 메뉴 순서와 낱말: 이름, 만든 날짜, 업데이트 날짜, 별점(audit_v3 E-10)
const SORTS = [['name', u.X_sortName], ['created_at', u.X_sortCreated], ['last_activity_at', u.X_sortUpdated], ['star_count', u.X_sortStars]];
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

/** 공공 깃랩 정렬 드롭다운과 같은 단추 + 메뉴(KRDS 메뉴 부품, 네이티브 select 금지 UX-007 12장) */
export function PickMenu({ label, value, options, onPick, className }) {
  const current = options.find(([k]) => k === value)?.[1] || options[0][1];
  return (
    <Menu label={label} align="right" btnClass={className} btnProps={{ 'aria-label': `${label}: ${current}` }} button={<span>{current}</span>}>
      {(close) => (
        <ul className="drop-list" role="menu">
          {options.map(([k, text]) => (
            <li key={k || 'all'}>
              <button type="button" role="menuitemradio" aria-checked={k === value} className="item-link" onClick={() => { onPick(k); close(); }}>{text}</button>
            </li>
          ))}
        </ul>
      )}
    </Menu>
  );
}

export default function Home() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const archived = params.get('archived') === 'true';
  const sort = SORTS.some(([k]) => k === params.get('sort')) ? params.get('sort') : 'last_activity_at';
  const dir = params.get('dir') === 'asc' ? 'asc' : 'desc';
  const q = params.get('q') || '';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const field = params.get('field') || '';
  const cards = useData(loadCards, []);
  const fieldOpts = cards.data ? cards.data.fields() : [];
  const [text, setText] = useState(q);
  const [warn, setWarn] = useState(false);
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };
  const list = useData(
    async () => {
      // 덧붙임 '업무 분야'를 고르면 그 분야 소개 카드의 프로젝트만(공공 깃랩 자료로 행을 그린다)
      if (field && cards.data) {
        const ids = cards.data.idsInField(field).slice((page - 1) * PER, page * PER);
        const rows = [];
        for (const id of ids) { const r = await request(`/api/gitlab/projects/${id}`).catch(() => null); if (r?.data) rows.push(r.data); }
        return { data: rows, pagination: { total: cards.data.idsInField(field).length, nextPage: page * PER < cards.data.idsInField(field).length ? String(page + 1) : null } };
      }
      return request(`/api/gitlab/projects?order_by=${sort}&sort=${dir}&archived=${archived}&per_page=${PER}&page=${page}${q ? `&search=${encodeURIComponent(q)}` : ''}`);
    },
    [sort, dir, archived, q, page, field, !!cards.data],
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
    <Page id="G-01" title={u.X_title} state={list.state}>
      <h1 className="rb-x-title" data-figma="page-head">{u.X_title}</h1>
      <div className="krds-tab-area rb-x-tabs" data-figma="gl-tabs">
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
      <div className="rb-x-filter" data-figma="gl-filter">
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
        {/* 덧붙임(D-21 4장, UX/14 2): 업무 분야 선택 1개. 별도 줄 없이 필터 막대 안 정렬 앞 한 칸(2026. 10. 31. 사용자 지적) */}
        {fieldOpts.length ? (
          <div className="rb-x-extra" data-figma="extra-field-filter">
            <PickMenu label={u.X_field} value={field} options={[['', u.X_fieldAll], ...fieldOpts.map((f) => [f.name, `${f.name} ${f.count}`])]} onPick={(f) => set({ field: f })} className="rb-x-sortbtn" />
          </div>
        ) : null}
        <div className="rb-x-sort" role="group" aria-label={u.X_sortBy}>
          <PickMenu label={u.X_sortBy} value={sort} options={SORTS} onPick={(k) => set({ sort: k })} className="rb-x-sortbtn" />
          <button type="button" className="rb-x-dir" onClick={() => set({ dir: dir === 'asc' ? 'desc' : 'asc' })} aria-label={dir === 'asc' ? u.X_sortDesc : u.X_sortAsc} title={dir === 'asc' ? u.X_sortDesc : u.X_sortAsc}>
            <Icon name={dir === 'asc' ? 'ext/sort-asc' : 'ext/sort-desc'} />
          </button>
        </div>
      </div>
      {warn ? <p id="x-filter-warn" className="krds-text-body-xsmall rb-subtle" role="status">{u.X_min3}</p> : null}
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
