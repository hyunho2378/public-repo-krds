// P-20 변경 제안(머지 리퀘스트) 목록과 상세, 읽기 전용. 코드 탭 하위 메뉴.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
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
import { mr } from '../copy/work';
import { ago } from './parts/glTime';
import { Readme } from '../components/Help/Readme';
import { DiffView } from '../components/Code/DiffView';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';
import './parts/glMr.css';

const LABEL = { opened: t.P20_opened, merged: mr.tabMerged, closed: t.P20_closed };

const STATES = [['opened', mr.tabOpen], ['merged', mr.tabMerged], ['closed', mr.tabClosed], ['all', mr.tabAll]];
const PILL = { merged: mr.tabMerged, closed: mr.tabClosed };

export function MergeRequests() {
  const frame = useProject();
  const [st, setSt] = useState('all');
  const [sortKey, setSortKey] = useState('created_at');
  const [dir, setDir] = useState('desc');
  const [query, setQuery] = useState('');
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
  const list = all ? [...matchTitle(all[st], query)].sort((x, y) => (new Date(y[sortKey] || 0) - new Date(x[sortKey] || 0)) * (dir === 'desc' ? 1 : -1)) : null;
  return (
    <ProjectFrame screenId="R-16" tab="" tabLabel={t.P20_title} data={frame} state={all ? (all.all.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <div className="gl-mr-tabs" role="tablist" aria-label={t.P20_title}>
          {STATES.map(([k, n]) => (
            <button key={k} type="button" role="tab" aria-selected={k === st} className="gl-mr-tab" onClick={() => setSt(k)}>
              <span>{n}</span>{all ? <span className="gl-mr-count">{all[k].length}</span> : null}
            </button>
          ))}
        </div>
        <div className="gl-work-filter">
          <div className="gl-work-bar" role="search">
            <button type="button" className="krds-btn small text" aria-label={mr.recent} onClick={() => setQuery('')}><Icon name="ext/history" /></button>
            <input type="search" value={query} placeholder={mr.search} aria-label={mr.searchLabel} onChange={(e) => setQuery(e.target.value)} />
            <Icon name="search" />
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
          <button type="button" className="krds-btn small tertiary" aria-label={dir === 'desc' ? mr.desc : mr.asc} onClick={() => setDir(dir === 'desc' ? 'asc' : 'desc')}><Icon name={dir === 'desc' ? 'ext/sort-desc' : 'ext/sort-asc'} /></button>
        </div>
        {!all ? <Status {...body} /> : (
          list.length ? (
            <ul className="rb-row-list">
              {list.map((m) => (
                <li className="gl-mr-row" key={m.iid}>
                  <div className="gl-mr-main">
                    <p className="gl-mr-title"><Link to={`/projects/${frame.id}/merge-requests/${m.iid}`}>{m.title}</Link></p>
                    <p className="gl-mr-meta">!{m.iid} · {ago(m.created_at)} {mr.createdBy(m.author?.name || '')}</p>
                  </div>
                  <div className="gl-mr-side">
                    {PILL[m.state] ? <span className="rb-pill">{PILL[m.state]}</span> : null}
                    <p className="gl-mr-meta">{mr.updated(ago(m.updated_at))}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : <EmptyState title={query ? u.List_none : mr.none} />
        )}
      </div>
    </ProjectFrame>
  );
}

export function MergeRequest() {
  const { iid } = useParams();
  const frame = useProject();
  const [view, setView] = useState('talk');
  const [notice, setNotice] = useState(false);
  const { signedIn, role } = useAuth();
  const body = useData(async () => (await gitlab.mergeRequest(frame.id, iid)).data, [frame.id, iid]);
  const commits = useData(async () => {
    try {
      const r = await request(`/api/gitlab/projects/${encodeURIComponent(frame.id)}/merge_requests/${encodeURIComponent(iid)}/commits`);
      return r.data || [];
    } catch {
      return [];
    }
  }, [frame.id, iid]);
  const changes = useData(async () => {
    try {
      const r = await request(`/api/gitlab/projects/${encodeURIComponent(frame.id)}/merge_requests/${encodeURIComponent(iid)}/changes`);
      return r.data?.changes || [];
    } catch {
      return [];
    }
  }, [frame.id, iid]);
  const pipes = useData(async () => {
    try {
      const r = await request(`/api/gitlab/projects/${encodeURIComponent(frame.id)}/merge_requests/${encodeURIComponent(iid)}/pipelines`);
      return r.data || [];
    } catch {
      return [];
    }
  }, [frame.id, iid]);
  if (!frame.data) return <ProjectFrame screenId="R-17" data={frame} />;
  const m = body.data;
  return (
    <ProjectFrame screenId="R-17" tab="" tabLabel={t.P20_title} crumbs={[[t.P20_title, `/projects/${frame.id}/merge-requests`], [`!${iid}`]]} data={frame} state={m ? 'Ideal' : body.state}>
      {!m ? <Status {...body} /> : (
        <div className="rb-code-area">
          <div className="gl-mr-head">
            <h2>{m.title}</h2>
            <p className="gl-mr-meta">
              <span className="rb-pill">{LABEL[m.state] || m.state}</span> !{m.iid} · {ago(m.created_at)} {mr.createdBy(m.author?.name || '')}
            </p>
            <p className="gl-mr-meta rb-break-any">{mr.source} {m.source_branch}, {mr.target} {m.target_branch}</p>
          </div>
          <div className="rb-code-views" role="tablist" aria-label={t.P20_tabsLabel}>
            {[['talk', mr.overview], ['commits', `${mr.commits} ${commits.data?.length ?? 0}`], ['pipes', `${mr.pipelines} ${pipes.data?.length ?? 0}`], ['files', `${mr.changes} ${changes.data?.length ?? 0}`]].map(([key, label]) => (
              <button key={key} type="button" role="tab" aria-selected={view === key} className={'rb-code-view' + (view === key ? ' active' : '')} onClick={() => setView(key)}>{label}</button>
            ))}
          </div>
          {view === 'talk' ? (
            m.description ? <div className="rb-detail-body"><Readme source={m.description} /></div> : <EmptyState title={t.P20_noDesc} />
          ) : view === 'commits' ? (
            commits.data?.length ? (
              <ul className="rb-plain-list">
                {commits.data.map((c) => (
                  <li className="rb-plain-row" key={c.id}>
                    <span className="rb-plain-main rb-ellipsis">{c.title}</span>
                    <span className="rb-plain-sub rb-subtle">{c.author_name}</span>
                    <span className="rb-plain-meta rb-subtle">{day(c.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title={t.P20_noCommits} />
          ) : view === 'pipes' ? (
            pipes.data?.length ? (
              <ul className="rb-plain-list">
                {pipes.data.map((p) => (
                  <li className="gl-mr-pipe" key={p.id}>
                    <span className="rb-pill">{p.status}</span>
                    <span>#{p.id}</span>
                    <span className="rb-break-any">{p.ref}</span>
                    <span className="rb-subtle">{ago(p.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title={mr.noPipelines} />
          ) : (
            changes.data?.length ? <DiffView files={changes.data} /> : <EmptyState title={t.P17_noDiff} />
          )}
          {signedIn && atLeast(role, 'developer') && m.state === 'opened' ? (
            <div className="rb-write-actions">
              <button type="button" className="krds-btn small tertiary" onClick={() => setNotice(true)}>{t.P20_close}</button>
              <button type="button" className="krds-btn small primary" onClick={() => setNotice(true)}>{t.P20_merge}</button>
            </div>
          ) : null}
          {signedIn && atLeast(role, 'developer') && m.state === 'closed' ? (
            <div className="rb-write-actions">
              <button type="button" className="krds-btn small tertiary" onClick={() => setNotice(true)}>{t.P20_reopen}</button>
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
