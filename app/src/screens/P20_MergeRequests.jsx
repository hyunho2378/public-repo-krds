// P-20 변경 제안(머지 리퀘스트) 목록과 상세, 읽기 전용. 코드 탭 하위 메뉴.
import { useState } from 'react';
import { Link, useLocation, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { atLeast, useAuth } from '../components/Identity/useAuth';
import { gitlab, request } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { u } from '../copy/ui';
import { matchTitle } from '../components/Code/ListTools';
import { Drop } from '../components/Code/Drop';
import { Icon } from '../components/Code/Icon';
import { mr, au, p1 } from '../copy/work';
import { gql, Q } from './parts/glGraphql';
import { Avatar } from '../components/Layout/Avatar';
import { EmptyArt } from './parts/EmptyArt';
import './parts/glRepo.css';
import { IconButton } from '../components/Action/IconButton';
import { ago } from './parts/glTime';
import { Readme } from '../components/Help/Readme';
import { DiffView } from '../components/Code/DiffView';
import { day, groupByDay } from './parts/repoCommon';
import '../components/Code/code.css';
import './parts/glMr.css';
import './parts/glMrDetail.css';

const LABEL = { opened: t.P20_opened, merged: mr.tabMerged, closed: t.P20_closed };

const T = p1.tokenKey;
const TOKEN_FIELD = {
  [T.author]: (m) => `${m.author?.name || ''} ${m.author?.username || ''}`,
  [T.assignee]: (m) => (m.assignees || []).map((a) => `${a.name} ${a.username}`).join(' '),
  [T.reviewer]: (m) => (m.reviewers || []).map((a) => `${a.name} ${a.username}`).join(' '),
  [T.label]: (m) => (m.labels || []).join(' '),
  [T.milestone]: (m) => m.milestone?.title || '',
  [T.source]: (m) => m.source_branch || '',
  [T.target]: (m) => m.target_branch || '',
};
function filterMr(list, query) {
  const q = query.trim();
  const i = q.indexOf(':');
  const key = i > 0 ? q.slice(0, i).trim() : '';
  if (TOKEN_FIELD[key]) {
    const v = q.slice(i + 1).trim().toLowerCase();
    return v ? list.filter((m) => TOKEN_FIELD[key](m).toLowerCase().includes(v)) : list;
  }
  return matchTitle(list, query);
}

const STATES = [['opened', mr.tabOpen], ['merged', mr.tabMerged], ['closed', mr.tabClosed], ['all', mr.tabAll]];
const BADGE_ICON = { opened: 'ext/issues', merged: 'ext/merge-request', closed: 'close' };
const PILL = { merged: mr.tabMerged, closed: mr.tabClosed };

export function MergeRequests() {
  const frame = useProject();
  const [st, setSt] = useState('opened');
  const [sortKey, setSortKey] = useState('created_at');
  const [dir, setDir] = useState('desc');
  const [query, setQuery] = useState('');
  const [suggest, setSuggest] = useState(false);
  const body = useData(async () => {
    const [opened, merged, closed] = await Promise.all(['opened', 'merged', 'closed'].map((x) => gitlab.mergeRequests(frame.id, x)));
    const seen = new Map();
    [...opened.data, ...merged.data, ...closed.data].forEach((m) => seen.set(m.iid, m));
    const every = [...seen.values()];
    const by = (x) => every.filter((m) => m.state === x);
    return { opened: by('opened'), merged: by('merged'), closed: by('closed'), all: every };
  }, [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-16" data={frame} />;
  const all = body.data;
  const list = all ? [...filterMr(all[st], query)].sort((x, y) => (new Date(y[sortKey] || 0) - new Date(x[sortKey] || 0)) * (dir === 'desc' ? 1 : -1)) : null;
  return (
    <ProjectFrame screenId="R-16" tab="" tabLabel={t.P20_title} data={frame} state={all ? (all.all.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <div className="gl-mr-tabs" data-figma="gl-tabs" role="tablist" aria-label={t.P20_title}>
          {STATES.map(([k, n]) => (
            <button key={k} type="button" role="tab" aria-selected={k === st} className="gl-mr-tab" onClick={() => setSt(k)}>
              <span>{n}</span>{all ? <span className="gl-mr-count">{all[k].length}</span> : null}
            </button>
          ))}
        </div>
        <div className="gl-work-filter" data-figma="gl-filter">
          <div className="gl-work-bar" role="search">
            <IconButton icon="time" label={mr.recent} onClick={() => setQuery('')} />
            <input type="search" value={query} placeholder={mr.search} aria-label={mr.searchLabel} onChange={(e) => setQuery(e.target.value)} onFocus={() => setSuggest(true)} onBlur={() => setTimeout(() => setSuggest(false), 150)} />
            <Icon name="search" />
            {suggest && !query ? (
            <ul className="gl-token-list" role="listbox" aria-label={mr.searchLabel}>
              {p1.tokenSuggest.map((k) => <li key={k} role="option" aria-selected="false"><button type="button" onMouseDown={(e) => { e.preventDefault(); setQuery(k === p1.tokenSuggest[7] ? '' : `${k}: `); }}>{k}</button></li>)}
            </ul>
            ) : null}
          </div>
          <Drop label={mr.sortBy} align="right" button={<span>{sortKey === 'created_at' ? mr.sortCreated : mr.sortUpdated}</span>}>
            {(close) => (
              <ul className="drop-list" aria-label={mr.sortBy}>
                {[['created_at', mr.sortCreated], ['updated_at', mr.sortUpdated]].map(([k, n]) => (
                  <li key={k}><button type="button" className={'item-link' + (k === sortKey ? ' active' : '')} onClick={() => { close(); setSortKey(k); }}>{n}</button></li>
                ))}
              </ul>
            )}
          </Drop>
          <IconButton icon={dir === 'desc' ? 'ext/sort-desc' : 'ext/sort-asc'} label={dir === 'desc' ? mr.desc : mr.asc} onClick={() => setDir(dir === 'desc' ? 'asc' : 'desc')} />
        </div>
        {!all ? <Status {...body} /> : (
          list.length ? (
            <ul className="rb-row-list">
              {list.map((m) => (
                <li className="gl-mr-row" key={m.iid}>
                  <div className="gl-mr-main">
                    <p className="gl-mr-title"><Link to={`/projects/${frame.id}/merge-requests/${m.iid}`}>{m.title}</Link>{m.task_completion_status?.count ? <span className="gl-mr-task"> {p1.mrChecklist(m.task_completion_status.completed_count, m.task_completion_status.count)}</span> : null}</p>
                    <p className="gl-mr-meta">!{m.iid} · {ago(m.created_at)} {mr.createdBy(m.author?.name || '')}</p>
                  </div>
                  <div className="gl-mr-side">
                    <span className="gl-mr-badges">
                      {PILL[m.state] ? <span className={`gl-badge is-${m.state}`}><Icon name={BADGE_ICON[m.state]} />{PILL[m.state]}</span> : null}
                      {(m.assignees || []).map((a) => <Avatar key={a.id} src={a.avatar_url} name={a.name} seed={a.id} />)}
                    </span>
                    <p className="gl-mr-meta">{mr.updated(ago(m.updated_at))}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <div className="gl-empty-big"><EmptyArt kind="doc" /><h2>{query ? u.List_none : st === 'opened' ? mr.noneOpen : mr.none}</h2></div>
          )
        )}
      </div>
    </ProjectFrame>
  );
}

const TABS = [['', mr.overview], ['/commits', mr.commits], ['/pipelines', mr.pipelines], ['/diffs', mr.changes]];

function SideBlock({ title, count, children }) {
  return (
    <section className="gl-side-block">
      <h3>{count != null ? <span>{count} </span> : null}{title}</h3>
      <div>{children}</div>
    </section>
  );
}

const people = (nodes) => (nodes?.length ? nodes.map((n) => <span key={n.username} className="gl-person"><Avatar src={n.avatarUrl} name={n.name} seed={n.username} />{n.name}</span>) : <span className="rb-subtle">{au.none}</span>);

export function MergeRequest() {
  const { iid } = useParams();
  const frame = useProject();
  const loc = useLocation();
  const seg = loc.pathname.replace(/\/+$/, '').split('/').pop();
  const view = ['commits', 'pipelines', 'diffs'].includes(seg) ? seg : 'overview';
  const [notice, setNotice] = useState(false);
  const [newestFirst, setNewest] = useState(false);
  const { signedIn, role } = useAuth();
  const path = frame.data?.project?.path_with_namespace;
  const body = useData(async () => (await gitlab.mergeRequest(frame.id, iid)).data, [frame.id, iid]);
  const extra = useData(async () => {
    if (!path) return null;
    try { return (await gql(Q.mr, { p: path, i: String(iid) })).project.mergeRequest; } catch { return null; }
  }, [path, iid]);
  const get = (suffix, pick) => async () => {
    try {
      const r = await request(`/api/gitlab/projects/${encodeURIComponent(frame.id)}/merge_requests/${encodeURIComponent(iid)}/${suffix}`);
      return pick(r.data);
    } catch { return []; }
  };
  const commits = useData(get('commits', (d) => d || []), [frame.id, iid]);
  const changes = useData(get('changes', (d) => d?.changes || []), [frame.id, iid]);
  const pipes = useData(get('pipelines', (d) => d || []), [frame.id, iid]);
  if (!frame.data) return <ProjectFrame screenId="R-17" data={frame} />;
  const m = body.data;
  const x = extra.data;
  const base = `/projects/${frame.id}/merge-requests/${iid}`;
  const counts = { '': 0, '/commits': commits.data?.length || x?.commitCount || 0, '/pipelines': pipes.data?.length ?? 0, '/diffs': changes.data?.length ?? 0 };
  const notes0 = (x?.discussions?.nodes || []).flatMap((d) => d.notes.nodes);
  const notes = newestFirst ? [...notes0].reverse() : notes0;
  const who = m?.author?.name || '';
  const stateWord = m ? (LABEL[m.state] || m.state) : '';
  return (
    <ProjectFrame screenId="R-17" tab="" tabLabel={t.P20_title} crumbs={[[t.P20_title, `/projects/${frame.id}/merge-requests`], [`!${iid}`]]} data={frame} state={m ? 'Ideal' : body.state}>
      {!m ? <Status {...body} /> : (
        <div className="rb-code-area">
          <div className="gl-mr-head" data-figma="page-head">
            <h1 className="gl-mr-h1">{m.title}</h1>
            <p className="gl-mr-meta gl-mr-statusline">
              <span className={`gl-badge is-${m.state}`}><Icon name={BADGE_ICON[m.state] || 'close'} />{stateWord}</span>
              <span className="gl-person">{who}</span>
              <span>{au.fromTo}</span>
              <code className="gl-chip rb-break-any">{m.source_branch}</code>
              <span>{au.requestedTo}</span>
              <code className="gl-chip">{m.target_branch}</code>
              <span>{au.requested(ago(m.created_at))}</span>
            </p>
          </div>
          <div className="gl-tabs" data-figma="gl-tabs" role="tablist" aria-label={t.P20_tabsLabel}>
            {TABS.map(([suffix, label]) => {
              const on = (suffix === '' && view === 'overview') || suffix === `/${view}`;
              return (
                <Link key={suffix} role="tab" aria-selected={on} aria-current={on ? 'page' : undefined} className={'gl-tab' + (on ? ' active' : '')} to={base + suffix}>
                  {label} <span className="gl-mr-count">{counts[suffix]}</span>
                </Link>
              );
            })}
          </div>
          {view === 'overview' ? (
            <div className="gl-mr-split">
              <div className="gl-mr-main-col">
                {m.description ? <div className="rb-detail-body"><Readme source={m.description} /></div> : <p className="rb-subtle">{t.P20_noDesc}</p>}
                <div className="gl-reactions">
                  <span className="gl-react">{au.likes} {m.upvotes ?? 0}</span>
                  <span className="gl-react">{au.dislikes} {m.downvotes ?? 0}</span>
                </div>
                <section className="gl-box gl-approval">
                  <p className="gl-box-line">{x?.approvedBy?.nodes?.length ? `${au.approvedBy} ${x.approvedBy.nodes.map((n) => n.name).join(', ')}` : au.approvalOptional}</p>
                </section>
                <section className={`gl-box gl-mergebox is-${m.state}`}>
                  <p className="gl-box-line gl-box-strong">
                    {m.state === 'merged' ? au.mergedBy : m.state === 'closed' ? au.closedBy : au.openState}
                    {' '}<span className="gl-person">{(m.merged_by || m.closed_by || m.author)?.name || who}</span> {ago(m.merged_at || m.closed_at || m.updated_at)}
                  </p>
                  <div className="gl-box-body">
                    <p className="gl-mb-title">{au.mergeDetail}</p>
                    <ul><li>{m.state === 'merged' ? au.mergedInto(m.target_branch) : au.notMerged(m.target_branch)}</li></ul>
                  </div>
                </section>
                <section className="gl-activity">
                  <div className="gl-activity-head"><h2>{au.activity}</h2><div className="gl-act-tools"><span className="krds-btn small tertiary">{au.allActivity}</span><Drop label={p1.sortActivity} align="right" button={<span>{newestFirst ? p1.newest : p1.oldest}</span>}>{(close) => (<ul className="drop-list" aria-label={p1.sortActivity}>{[[true, p1.newest], [false, p1.oldest]].map(([v, n]) => <li key={n}><button type="button" className={'item-link' + (v === newestFirst ? ' active' : '')} onClick={() => { close(); setNewest(v); }}>{n}</button></li>)}</ul>)}</Drop></div></div>
                  <ul>
                    {notes.length ? notes.map((n, i) => (
                      <li key={i} className="gl-note">
                        <Avatar src={n.author?.avatarUrl} name={n.author?.name} seed={n.author?.username} />
                        <div><strong>{n.author?.name}</strong> <span className="rb-subtle">{n.system ? n.body : ''} {ago(n.createdAt)}</span>{n.system ? null : <p>{n.body}</p>}</div>
                      </li>
                    )) : (
                      <li className="gl-note">
                        <Avatar src={m.author?.avatar_url} name={who} seed={m.author?.username} />
                        <div><strong>{who}</strong> <span className="rb-subtle">{m.state === 'merged' ? au.systemMerged : m.state === 'closed' ? au.closedEvent : au.openState} {ago(m.merged_at || m.closed_at || m.updated_at)}</span></div>
                      </li>
                    )}
                  </ul>
                  <p className="gl-reply">{au.loginReply} <Link className="krds-link" to="/login">{au.register}</Link> {au.orWord} <Link className="krds-link" to="/login">{au.login}</Link> {au.pleaseDo}</p>
                </section>
              </div>
              <aside className="gl-mr-side-col" aria-label={au.participants}>
                <SideBlock title={au.assignee} count={x?.assignees?.nodes?.length ?? 0}>{people(x?.assignees?.nodes)}</SideBlock>
                <SideBlock title={au.reviewer} count={x?.reviewers?.nodes?.length ?? 0}>{people(x?.reviewers?.nodes)}</SideBlock>
                <SideBlock title={au.labels}>{x?.labels?.nodes?.length ? x.labels.nodes.map((l) => <span key={l.title} className="gl-label-name" style={{ background: l.color, color: l.textColor }}>{l.title}</span>) : <span className="rb-subtle">{au.none}</span>}</SideBlock>
                <SideBlock title={au.milestone}><span className="rb-subtle">{x?.milestone?.title || au.none}</span></SideBlock>
                <SideBlock title={au.workItems}><span className="rb-subtle">{au.none}</span></SideBlock>
                <SideBlock title={au.timeTrack}><span className="rb-subtle">{x && (x.timeEstimate || x.totalTimeSpent) ? `${x.totalTimeSpent}/${x.timeEstimate}` : au.noTime}</span></SideBlock>
                <SideBlock title={au.count(x?.participants?.nodes?.length ?? 1, au.participants)}>
                  {x?.participants?.nodes?.length ? x.participants.nodes.map((n) => <Avatar key={n.username} src={n.avatarUrl} name={n.name} seed={n.username} />) : <Avatar src={m.author?.avatar_url} name={who} seed={m.author?.username} />}
                </SideBlock>
              </aside>
            </div>
          ) : view === 'commits' ? (
            commits.data?.length ? (
              <div className="gl-commits">
                {groupByDay(commits.data, 'created_at').map((g) => (
                  <section key={g.day}>
                    <h3 className="gl-commit-day">{g.day}</h3>
                    <ul className="gl-commit-box">
                      {g.items.map((c) => (
                        <li className="gl-commit-row" key={c.id}>
                          <div><strong>{c.title}</strong><p className="gl-mr-meta">{au.committedBy(ago(c.created_at), c.author_name)}</p></div>
                          <code className="gl-chip">{(c.short_id || c.id || '').slice(0, 8)}</code>
                        </li>
                      ))}
                    </ul>
                  </section>
                ))}
              </div>
            ) : <EmptyState title={t.P20_noCommits} />
          ) : view === 'pipelines' ? (
            pipes.data?.length ? (
              <ul className="rb-plain-list">
                {pipes.data.map((p) => (
                  <li className="gl-mr-pipe" key={p.id}>
                    <span>{p.status}</span><span>#{p.id}</span><span className="rb-break-any">{p.ref}</span><span className="rb-subtle">{ago(p.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : <div className="gl-empty-big"><EmptyArt kind="doc" /><h2>{mr.noRunning}</h2></div>
          ) : (
            changes.data?.length ? <DiffView files={changes.data} /> : <EmptyState title={t.P17_noDiff} />
          )}
          {signedIn && atLeast(role, 'developer') && m.state === 'opened' ? (
            <div className="rb-write-actions">
              <button type="button" className="krds-btn small tertiary" onClick={() => setNotice(true)}>{t.P20_close}</button>
              <button type="button" className="krds-btn small primary" onClick={() => setNotice(true)}>{t.P20_merge}</button>
            </div>
          ) : null}
          {notice ? (
            <div className="rb-modal-dim" role="presentation">
              <div className="rb-modal" role="dialog" aria-modal="true" aria-labelledby="mr-notice">
                <h2 id="mr-notice" className="krds-text-body-small-bold">{t.Write_cannotTitle}</h2>
                <p className="krds-text-body-small">{t.Write_cannotStatic}</p>
                <div className="rb-modal-actions">
                  <button type="button" className="krds-btn small primary" onClick={() => setNotice(false)}>{t.Commit_cancel}</button>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </ProjectFrame>
  );
}
