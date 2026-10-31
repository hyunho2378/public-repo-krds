// P-22 공공 깃랩 프로젝트 메뉴 나머지. 활동, 위키, 파이프라인, 패키지, 라벨, 마일스톤, 멤버, 보드, 스니펫.
// 원래 GitLab에 있는 메뉴를 빼지 않는다(PRD 0장). 읽기는 공개 API로 실제 자료를 쓰고,
// 로그인해야 볼 수 있는 메뉴는 GitLab과 같게 로그인 안내를 보여 준다(가짜 자료를 만들지 않는다).
import { newWindow } from '../components/Layout/newWindow';
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { FilterSearch } from './parts/FilterSearch';
import { Icon } from '../components/Code/Icon';
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { u } from '../copy/ui';
import { orgLabel } from '../components/Layout/orgLabel';
import { day } from './parts/repoCommon';
import { rp } from '../copy/work';
import { IconButton } from '../components/Action/IconButton';
import { Avatar } from '../components/Layout/Avatar';
import './parts/glRepo.css';
import { gql, Q } from './parts/glGraphql';
import { au, p1, bd } from '../copy/work';
import { ago } from './parts/glTime';
import { EmptyArt } from './parts/EmptyArt';
import { HistoryButton } from './parts/HistoryButton';
import { IconButton as IconBtn2 } from '../components/Action/IconButton';
import '../components/Code/code.css';


function MembersView({ list }) {
  const [q, setQ] = useState('');
  const rows = list.filter((m) => `${m.name} ${m.username}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <div data-figma="page-head" className="gl-ph-pad"><h2 className="gl-page-title">{rp.membersTitle}</h2></div>
      <p className="gl-page-help">{rp.membersHelp}</p>
      <div className="gl-tabs" data-figma="gl-tabs" role="tablist">
        <span className="gl-tab active" role="tab" aria-selected="true">{rp.tabMembers} <span className="gl-mr-count">{list.length}</span></span>
        <span className="gl-tab" role="tab" aria-selected="false">{rp.tabDirect} <span className="gl-mr-count">{list.length}</span></span>
      </div>
      <div className="gl-work-filter" data-figma="gl-filter">
        <div className="gl-work-bar" role="search">
          <HistoryButton label={rp.recent} onClick={() => setQ('')} />
          <input type="search" value={q} placeholder={rp.filterMembers} aria-label={rp.filterMembers} onChange={(e) => setQ(e.target.value)} />
          <FilterSearch label={u.List_searchLabel} />
        </div>
        <span className="krds-btn small tertiary">{rp.sortAccount}</span>
        <IconButton icon="ext/sort-desc" label={rp.desc} />
      </div>
      <div className="gl-table-wrap">
        <table className="gl-table">
          <thead><tr><th scope="col">{rp.colAccount}</th><th scope="col">{rp.colSource}</th><th scope="col">{rp.colRole}</th><th scope="col">{rp.colExpire}</th><th scope="col">{rp.colActivity}</th></tr></thead>
          <tbody>
            {rows.map((m) => (
              <tr key={m.id}>
                <td><div className="gl-acct"><Avatar src={m.avatar_url} name={m.name} seed={m.id} /><div><strong>{m.name}</strong><small>@{m.username}</small></div></div></td>
                <td className="gl-source">{au.sourceDirect(m.name)}</td>
                <td>{rp.roles[m.access_level] || m.access_level}</td>
                <td><span className="gl-date-input">{au.expireHint}</span></td>
                <td>{m.created_at ? `${rp.joined} ${day(m.created_at)}` : ''}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function BoardView({ list }) {
  const [q, setQ] = useState('');
  const keep = (c) => c.nodes.filter((i) => i.title.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <div className="gl-work-filter" data-figma="gl-filter">
        <span className="krds-btn small tertiary">{list.boards[0]?.name || 'Development'}<Icon name="arrow-down" /></span>
        <div className="gl-work-bar" role="search">
          <input type="search" value={q} placeholder={rp.search} aria-label={rp.search} onChange={(e) => setQ(e.target.value)} />
          <FilterSearch label={u.List_searchLabel} />
        </div>
        <span className="gl-filter-tools">
          <IconButton icon="ext/sliders" data-figma="filter-display" label={bd.display} />
          <IconButton icon="setting" data-figma="filter-settings" label={bd.settings} />
          <IconButton icon="ext/expand" data-figma="filter-expand" label={bd.expand} />
        </span>
      </div>
      <div className="gl-board">
        {[[au.colOpen, list.open], [au.colClosed, list.closed]].map(([name, col]) => (
          <section key={name} className="gl-board-col">
            <h3><span>{name}</span><span>{au.cardCount(col.count)}</span></h3>
            {keep(col).map((i) => <a key={i.iid} className="gl-card" href={i.webUrl} {...newWindow(i.title)}>{i.title}<small>#{i.iid}</small></a>)}
          </section>
        ))}
      </div>
    </>
  );
}

function LabelsView({ list, id }) {
  const [q, setQ] = useState('');
  const [arch, setArch] = useState(false);
  const rows = (arch ? [] : list).filter((l) => l.name.toLowerCase().includes(q.trim().toLowerCase())).sort((a, b) => a.name.localeCompare(b.name));
  const prio = rows.filter((l) => l.priority != null);
  const other = rows.filter((l) => l.priority == null);
  const row = (l) => (
    <li className="gl-label-row" key={l.id || l.name}>
      <span className="gl-label-name" style={{ background: l.color, color: l.text_color }}>{l.name}</span>
      <span className="gl-label-links">
        <Link className="krds-link" to={`/projects/${id}/issues`}>{rp.toIssues}</Link>
        <Link className="krds-link" to={`/projects/${id}/merge-requests`}>{rp.toMrs}</Link>
      </span>
    </li>
  );
  return (
    <>
      <div className="gl-tabs">
        <span className="gl-tabs-left" data-figma="gl-tabs">
        <button type="button" className={'gl-tab' + (arch ? '' : ' active')} onClick={() => setArch(false)}>{rp.tabActive}</button>
        <button type="button" className={'gl-tab' + (arch ? ' active' : '')} onClick={() => setArch(true)}>{rp.tabArchived}</button>
        </span>
        <span className="gl-tools">
          <span className="gl-work-bar"><input type="search" value={q} placeholder={rp.search} aria-label={rp.search} onChange={(e) => setQ(e.target.value)} /><FilterSearch label={u.List_searchLabel} /></span>
        </span>
      </div>
      <section className="gl-box">
        <h2 className="gl-box-head">{rp.prio} <span className="rb-subtle">{prio.length}</span></h2>
        <p className="gl-box-help">{rp.prioHelp}</p>
        {prio.length ? <ul>{prio.map(row)}</ul> : <div className="gl-empty-big"><EmptyArt kind="label" /></div>}
      </section>
      <section className="gl-box">
        <h2 className="gl-box-head">{rp.others} <span className="rb-subtle">{other.length}</span></h2>
        {other.length ? <ul>{other.map(row)}</ul> : <p className="gl-box-empty">{rp.items} 0</p>}
      </section>
    </>
  );
}


function PageSearch({ value, onChange, placeholder, children }) {
  return (
    <div className="gl-work-filter" data-figma="gl-filter">
      <div className="gl-work-bar" role="search">
        <input type="search" value={value} placeholder={placeholder} aria-label={placeholder} onChange={(e) => onChange(e.target.value)} />
        <FilterSearch label={u.List_searchLabel} />
      </div>
      {children}
    </div>
  );
}

function WikiEmpty() {
  return (
    <div className="gl-empty-big"><EmptyArt kind="doc" /><h2>{p1.wikiTitle}</h2><p className="gl-wiki-body">{p1.wikiBody}</p></div>
  );
}

function PackagesView({ list }) {
  const [q, setQ] = useState('');
  const rows = list.filter((x) => `${x.name} ${x.version}`.toLowerCase().includes(q.trim().toLowerCase()));
  return (
    <>
      <div data-figma="page-head" className="gl-ph"><h1 className="gl-page-title">{p1.pkgTitle}</h1>
      <p className="gl-pkg-count"><Icon name="ext/catalog" /> {p1.pkgCount(list.length)}</p></div>
      <PageSearch value={q} onChange={setQ} placeholder={p1.pkgFilter}>
        <span className="krds-btn small tertiary">{p1.pkgSort}<Icon name="arrow-down" /></span>
        <IconButton icon="ext/sort-desc" label={rp.desc} />
      </PageSearch>
      {rows.length ? (
        <ul className="rb-plain-list">{rows.map((x) => <li className="rb-plain-row" key={x.id}><span className="rb-plain-main">{x.name}</span><span className="rb-plain-sub rb-subtle">{x.version}</span><span className="rb-plain-meta rb-subtle">{x.package_type}</span></li>)}</ul>
      ) : (
        <div className="gl-empty-big"><EmptyArt kind="doc" /><h2>{p1.pkgEmpty}</h2><p>{p1.pkgEmptyBody}</p></div>
      )}
    </>
  );
}

function PipelinesView({ list }) {
  const [q, setQ] = useState('');
  const rows = list.filter((x) => `${x.id} ${x.ref} ${x.sha}`.toLowerCase().includes(q.trim().toLowerCase()));
  const cls = (st) => (st === 'success' ? 'is-opened' : st === 'failed' ? 'is-closed' : 'is-merged');
  return (
    <>
      <PageSearch value={q} onChange={setQ} placeholder={p1.plFilter}>
        <span className="krds-btn small tertiary">{p1.plShowId}<Icon name="arrow-down" /></span>
      </PageSearch>
      <div className="gl-table-wrap">
        <table className="gl-table gl-pl">
          <thead><tr><th scope="col">{p1.plStatus}</th><th scope="col">{p1.plPipeline}</th><th scope="col">{p1.plBy}</th><th scope="col">{p1.plStages}</th><th scope="col">{p1.plAction}</th></tr></thead>
          <tbody>
            {rows.map((x) => (
              <tr key={x.id}>
                <td><span className={`gl-badge ${cls(x.status)}`}>{p1.plStatusName[x.status] || x.status}</span><br /><small className="gl-source">{ago(x.created_at)}</small></td>
                <td><strong>#{x.id}</strong><br /><code className="gl-chip">{x.ref}</code> <code className="gl-chip">{(x.sha || '').slice(0, 8)}</code></td>
                <td /><td /><td />
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

const ACT_KIND = { push: (e) => e.action_name.startsWith('pushed'), merge: (e) => e.target_type === 'MergeRequest', issue: (e) => e.target_type === 'Issue', note: (e) => e.action_name === 'commented on', wiki: (e) => e.target_type === 'WikiPage::Meta', design: (e) => e.target_type === 'DesignManagement::Design', team: (e) => ['joined', 'left'].includes(e.action_name) };

function ActivityView({ list }) {
  const [tab, setTab] = useState('all');
  const rows = tab === 'all' ? list : list.filter(ACT_KIND[tab]);
  return (
    <>
      <div className="gl-tabs-row">
      <div className="gl-tabs" data-figma="gl-tabs" role="tablist">
        {p1.actTabs.map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={'gl-tab' + (tab === k ? ' active' : '')} onClick={() => setTab(k)}>{n}</button>)}
      </div>
      <IconButton icon="ext/rss" label={p1.rss} />
      </div>
      {rows.length ? (
        <ul className="rb-plain-list">
          {rows.map((e) => {
            const pd = e.push_data;
            return (
              <li className="gl-act" key={e.id}>
                <Avatar src={e.author?.avatar_url} name={e.author?.name} seed={e.author?.id} />
                <div className="gl-act-main">
                  <strong>{e.author?.name}</strong> <span className="rb-subtle">@{e.author?.username}</span>
                  <div>{pd ? (pd.ref_type === 'tag' ? p1.pushedTag(pd.ref) : p1.pushedBranch(pd.ref)) : `${t.P22_action[e.action_name] || e.action_name} ${e.target_title || ''}`}</div>
                  {pd?.commit_title ? <div><code>{(pd.commit_to || '').slice(0, 8)}</code> · {pd.commit_title}</div> : null}
                  {pd?.commit_count > 1 ? <div>{p1.moreCommits(pd.commit_count - 1)}</div> : null}
                </div>
                <span className="gl-act-time">{ago(e.created_at)}</span>
              </li>
            );
          })}
        </ul>
      ) : <p className="rb-subtle">{p1.actNone}</p>}
    </>
  );
}

/** 메뉴별 설정: 자료 부르는 함수, 제목, 쉬운 설명, 빈 상태 문구, 줄 그리기. */
const SECTIONS = {
  activity: {
    load: (id) => gitlab.events(id),
    title: () => t.P22_activity,
    hint: () => t.P22_activityHint,
    empty: () => t.P22_activityNone,
    row: (e) => ({
      key: e.id,
      main: `${orgLabel(e.author?.name) || t.P22_someone} ${t.P22_action[e.action_name] || e.action_name}`,
      sub: e.push_data?.commit_title || e.target_title || '',
      meta: day(e.created_at),
    }),
  },
  wiki: {
    load: (id) => gitlab.wikis(id),
    title: () => t.P22_wiki,
    hint: () => t.P22_wikiHint,
    empty: () => t.P22_wikiNone,
    row: (w) => ({ key: w.slug, main: w.title, sub: '', meta: w.format || '' }),
  },
  pipelines: {
    load: (id) => gitlab.pipelines(id),
    title: () => t.P22_pipelines,
    hint: () => t.P22_pipelinesHint,
    empty: () => t.P22_pipelinesNone,
    row: (p) => ({ key: p.id, main: `#${p.id} ${p.ref || ''}`, sub: p.status || '', meta: day(p.created_at) }),
  },
  packages: {
    load: (id) => gitlab.packages(id),
    title: () => t.P22_packages,
    hint: () => t.P22_packagesHint,
    empty: () => t.P22_packagesNone,
    row: (p) => ({ key: p.id, main: p.name, sub: p.version || '', meta: p.package_type || '' }),
  },
  labels: {
    load: (id) => gitlab.labels(id),
    title: () => t.P22_labels,
    hint: () => t.P22_labelsHint,
    empty: () => t.P22_labelsNone,
    row: (l) => ({ key: l.id || l.name, main: l.name, sub: l.description || '', meta: '' }),
  },
  milestones: {
    load: (id) => gitlab.milestones(id),
    title: () => t.P22_milestones,
    hint: () => t.P22_milestonesHint,
    empty: () => t.P22_milestonesNone,
    row: (m) => ({ key: m.id, main: m.title, sub: m.description || '', meta: m.due_date || '' }),
  },
  members: {
    load: (id) => gitlab.members(id),
    title: () => t.P22_members,
    hint: () => t.P22_membersHint,
    empty: () => t.P22_membersNone,
    row: (m) => ({ key: m.id, main: orgLabel(m.name) || t.P22_someone, sub: '', meta: '' }),
  },
  boards: {
    load: (id) => gitlab.boards(id),
    title: () => t.P22_boards,
    hint: () => t.P22_boardsHint,
    empty: () => t.P22_boardsNone,
    row: (b) => ({ key: b.id, main: b.name, sub: '', meta: '' }),
  },
  snippets: {
    load: (id) => gitlab.snippets(id),
    title: () => t.P22_snippets,
    hint: () => t.P22_snippetsHint,
    empty: () => t.P22_snippetsNone,
    row: (s) => ({ key: s.id, main: s.title, sub: s.file_name || '', meta: day(s.created_at) }),
  },
};

const GQL_SECTIONS = ['labels', 'members', 'boards', 'milestones', 'snippets'];
const GQL_LOAD = {
  labels: async (path) => (await gql(Q.labels, { p: path })).project.labels.nodes.map((n) => ({ id: n.title, name: n.title, color: n.color, text_color: n.textColor, description: n.description })),
  // 공공 깃랩 멤버 화면은 서버가 그려 공개 API에 없다. 공개 프로젝트 정보의 소유자(project.owner)로 소유자 한 줄만 만든다(지어낸 값 없음)
  members: async (path, owner, project) => {
    const ns = project?.namespace;
    const o = owner || (ns?.kind === 'user' ? { id: ns.id, name: ns.name, username: ns.path, avatar_url: ns.avatar_url } : null);
    return o ? [{ id: o.id, name: o.name, username: o.username, avatar_url: o.avatar_url, access_level: 50 }] : [];
  },
  boards: async (path) => { const p = (await gql(Q.board, { p: path })).project; return { boards: p.boards.nodes, open: p.open, closed: p.closed }; },
  milestones: async (path) => (await gql(Q.milestones, { p: path })).project.milestones.nodes,
  snippets: async (path) => (await gql(Q.snippets, { p: path })).project.snippets.nodes,
};

export const SECTION_KEYS = Object.keys(SECTIONS);
const SECTION_SCREEN = { boards: 'R-13', labels: 'R-14', milestones: 'R-15', pipelines: 'R-18', packages: 'R-20', wiki: 'R-21', snippets: 'R-22', members: 'R-23', activity: 'R-24' };

export default function RepoSections({ section }) {
  const { id } = useParams();
  const conf = SECTIONS[section];
  const frame = useProject();
  const path = frame.data?.project?.path_with_namespace;
  const owner = frame.data?.project?.owner;
  const body = useData(async () => {
    if (GQL_SECTIONS.includes(section)) {
      if (!path) return null;
      return GQL_LOAD[section](path, owner, frame.data.project);
    }
    return (await conf.load(id)).data;
  }, [id, section, path]);
  if (!frame.data) return <ProjectFrame screenId={SECTION_SCREEN[section]} data={frame} />;
  const list = Array.isArray(body.data) ? body.data : section === 'boards' && body.data ? body.data : null;
  const needsLogin = body.state === 'Error' && body.status === 401;
  if (list && section === 'wiki' && !list.length) {
    return (
      <ProjectFrame screenId={SECTION_SCREEN[section]} tab="" tabLabel={conf.title()} data={frame} state="Empty">
        <div className="rb-code-area"><WikiEmpty /></div>
      </ProjectFrame>
    );
  }
  if (list && ['packages', 'pipelines', 'activity'].includes(section)) {
    return (
      <ProjectFrame screenId={SECTION_SCREEN[section]} tab="" tabLabel={section === 'packages' ? p1.pkgTitle : conf.title()} data={frame} state={list.length ? 'Ideal' : 'Empty'}>
        <div className="rb-code-area">
          {section === 'packages' ? <PackagesView list={list} /> : section === 'pipelines' ? <PipelinesView list={list} /> : <ActivityView list={list} />}
        </div>
      </ProjectFrame>
    );
  }
  if (list && section === 'boards') {
    return (
      <ProjectFrame screenId={SECTION_SCREEN[section]} tab="" tabLabel={conf.title()} data={frame} state="Ideal">
        <div className="rb-code-area"><BoardView list={list} /></div>
      </ProjectFrame>
    );
  }
  if (list && (section === 'milestones' || section === 'snippets')) {
    const empty = !list.length;
    return (
      <ProjectFrame screenId={SECTION_SCREEN[section]} tab="" tabLabel={conf.title()} data={frame} state={empty ? 'Empty' : 'Ideal'}>
        <div className="rb-code-area">
          {!empty && section === 'milestones' ? <div className="gl-tabs" data-figma="gl-tabs"><span className="gl-tab active">{au.tabOpen}</span><span className="gl-tab">{au.tabClosed}</span><span className="gl-tab">{au.tabAll}</span></div> : null}
          {empty ? (
            <div className="gl-empty-big">
              <EmptyArt kind="doc" />
              <h2>{section === 'milestones' ? au.milestoneEmpty : au.snippetEmpty}</h2>
              {section === 'milestones' ? <p>{au.milestoneBody}</p> : null}
            </div>
          ) : (
            <ul className="rb-plain-list">{list.map((m) => <li className="rb-plain-row" key={m.title}><span className="rb-plain-main">{m.title}</span><span className="rb-plain-meta rb-subtle">{m.dueDate || m.fileName || ''}</span></li>)}</ul>
          )}
        </div>
      </ProjectFrame>
    );
  }
  if (list && (section === 'members' || section === 'labels')) {
    const tab = section;
    return (
      <ProjectFrame screenId={SECTION_SCREEN[section]} tab="" tabLabel={conf.title()} data={frame} state={list.length ? 'Ideal' : 'Empty'}>
        <div className="rb-code-area">
          {section === 'members' ? <MembersView list={list} /> : <LabelsView list={list} id={id} />}
        </div>
      </ProjectFrame>
    );
  }
  const state = list ? (list.length ? 'Ideal' : 'Empty') : body.state;
  return (
    <ProjectFrame screenId={SECTION_SCREEN[section]} tab="" tabLabel={conf.title()} data={frame} state={state}>
      <div className="rb-code-area">
        <div className="rb-detail-head">
          <h2 className="krds-text-body-small-bold">
            {list ? t.fn.countLabel(conf.title(), t.fn.items(list.length)) : conf.title()}
          </h2>
          <p className="krds-text-body-xsmall rb-subtle">{conf.hint()}</p>
        </div>
        {needsLogin ? (
          <EmptyState title={t.P22_loginNeeded} action={<Link className="krds-btn small primary" to={`/login?returnTo=${encodeURIComponent(`/projects/${id}/${section}`)}`}>{t.Header_login}</Link>} />
        ) : !list ? (
          <Status {...body} />
        ) : list.length ? (
          <ul className="rb-plain-list">
            {list.map((item) => {
              const r = conf.row(item);
              return (
                <li className="rb-plain-row" key={r.key}>
                  <span className="rb-plain-main">{r.main}</span>
                  {r.sub ? <span className="rb-plain-sub rb-ellipsis">{r.sub}</span> : null}
                  {r.meta ? <span className="rb-plain-meta rb-subtle">{r.meta}</span> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title={conf.empty()} />
        )}
      </div>
    </ProjectFrame>
  );
}
