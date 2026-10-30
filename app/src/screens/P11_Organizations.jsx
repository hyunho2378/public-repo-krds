// G-04 탐색 > 그룹 = 공공 깃랩 /explore/groups(캡처 40): 제목, 한 줄 설명, 활성/비활성 탭, 필터 막대(최근 검색, 검색, 정렬, 방향), 그룹 행.
// 행: 하위 그룹 아이콘, 아바타, 이름 + 공개 지구, 오른쪽 하위 그룹 n, 프로젝트 n, 멤버 n(아이콘 + 숫자 13), '생성됨 n 전', 점 세 개.
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { u } from '../copy/ui';
import { request } from '../api/client';
import { useData } from '../api/useData';
import { Page } from '../components/Layout/Page';
import { Status } from '../components/Feedback/Status';
import { Icon } from '../components/Code/Icon';
import { Avatar } from '../components/Layout/Avatar';
import { Menu } from '../components/Navigation/Menu';
import { iconBtnClass } from '../components/Action/IconButton';
import { newWindow } from '../components/Layout/newWindow';
import { PickMenu } from './P01_Home';

const PER = 20;
const SORTS = [['created_at', u.Gr_sortCreated], ['name', u.Gr_sortName], ['updated_at', u.Gr_sortUpdated]];

/** 행마다 하위 그룹, 프로젝트, 멤버 수(목록 API에 없어 x-total로 센다). 하나씩 차례로 */
function useCounts(items) {
  const [c, setC] = useState({});
  useEffect(() => {
    let stop = false;
    (async () => {
      for (const g of items) {
        const n = async (sub) => { const r = await request(`/api/gitlab/groups/${g.id}/${sub}?per_page=1`).catch(() => null); return r ? r.pagination?.total ?? (Array.isArray(r.data) ? r.data.length : null) : null; };
        const sg = await n('subgroups'); if (stop) return;
        const pj = await n('projects'); if (stop) return;
        const mb = await n('members');
        if (!stop) setC((x) => ({ ...x, [g.id]: { sg, pj, mb } }));
      }
    })();
    return () => { stop = true; };
  }, [items]);
  return c;
}

function GroupRow({ g, n }) {
  const { rel, full } = t.fn.relativeDate(g.created_at);
  const stat = (icon, label, v) => <li title={label}><Icon name={icon} /><span>{v ?? '-'}</span><span className="sr-only">{label}</span></li>;
  return (
    <li className="rb-prow rb-grow-row" data-figma="group-row">
      <Icon name="ext/group" />
      <Avatar src={g.avatar_url} name={g.name} className="is-32" />
      <div className="rb-prow-main">
        <p className="rb-prow-title">
          <a href={g.web_url} {...newWindow(g.full_name || g.name)}>{g.full_name || g.name}</a>
          <Icon name="globe" label={u.X_public} />
        </p>
        {g.description ? <p className="rb-prow-desc">{g.description}</p> : null}
      </div>
      <div className="rb-prow-side">
        <ul className="rb-prow-stats rb-prow-plain">
          {stat('ext/group', u.Gr_subgroups, n?.sg)}
          {stat('ext/project', u.Gr_projects, n?.pj)}
          {stat('ext/users', u.Gr_members, n?.mb)}
        </ul>
        <p className="rb-prow-time" title={full}>{u.Gr_created(rel)}</p>
      </div>
      <Menu label={u.X_actions} align="right" toggle={false} btnClass={iconBtnClass('small')} button={<Icon name="ellipsis_vertical" />}>
        {(close) => (
          <ul className="drop-list">
            <li><a className="item-link" href={g.web_url} {...newWindow(u.G_newWindow)} onClick={close}>{u.G_newWindow}</a></li>
          </ul>
        )}
      </Menu>
    </li>
  );
}

export default function Organizations() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || '';
  const sort = SORTS.some(([k]) => k === params.get('sort')) ? params.get('sort') : 'created_at';
  const dir = params.get('dir') === 'asc' ? 'asc' : 'desc';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const archived = params.get('archived') === 'true';
  const [text, setText] = useState(q);
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };
  const list = useData(
    () => request(`/api/gitlab/groups?order_by=${sort === 'updated_at' ? 'id' : sort}&sort=${dir}&per_page=${PER}&page=${page}&archived=${archived}${q ? `&search=${encodeURIComponent(q)}` : ''}`),
    [q, sort, dir, page, archived],
    (d) => !d.data?.length,
  );
  const items = list.data?.data || [];
  const counts = useCounts(items);
  return (
    <Page id="G-04" title={u.Gr_title} state={list.state}>
      <h1 className="rb-x-title" data-figma="section-title">{u.Gr_title}</h1>
      <p className="krds-text-body-small rb-subtle">{u.Gr_desc}</p>
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
        <form className="rb-x-search" role="search" onSubmit={(e) => { e.preventDefault(); set({ q: text.trim() }); }}>
          <label className="sr-only" htmlFor="gr-q">{u.Gr_search}</label>
          <input id="gr-q" type="search" value={text} placeholder={u.Gr_search} onChange={(e) => setText(e.target.value)} />
          <button type="submit" className="rb-x-searchbtn" aria-label={u.X_search} title={u.X_search}><Icon name="search" /></button>
        </form>
        <div className="rb-x-sort" role="group" aria-label={u.X_sortBy}>
          <PickMenu label={u.X_sortBy} value={sort} options={SORTS} onPick={(k) => set({ sort: k })} className="rb-x-sortbtn" />
          <button type="button" className="rb-x-dir" onClick={() => set({ dir: dir === 'asc' ? 'desc' : 'asc' })} aria-label={dir === 'asc' ? u.X_sortDesc : u.X_sortAsc} title={dir === 'asc' ? u.X_sortDesc : u.X_sortAsc}>
            <Icon name={dir === 'asc' ? 'ext/sort-asc' : 'ext/sort-desc'} />
          </button>
        </div>
      </div>
      <Status {...list} />
      {list.state === 'Empty' ? <p className="krds-text-body-small rb-subtle">{u.Gr_none}</p> : null}
      {items.length ? <ul className="rb-prows">{items.map((g) => <GroupRow key={g.id} g={g} n={counts[g.id]} />)}</ul> : null}
      {items.length && (page > 1 || list.data?.pagination?.nextPage) ? (
        <nav className="rb-x-pager" aria-label={t.Pagination_1}>
          <button type="button" className="krds-btn small tertiary" disabled={page <= 1} onClick={() => set({ page: String(page - 1) })}>{t.Pagination_2}</button>
          <span className="krds-text-body-xsmall rb-subtle">{page}</span>
          <button type="button" className="krds-btn small tertiary" disabled={!list.data?.pagination?.nextPage} onClick={() => set({ page: String(page + 1) })}>{t.Pagination_3}</button>
        </nav>
      ) : null}
    </Page>
  );
}
