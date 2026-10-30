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
import { ListBox, SearchBox, matchTitle, sortItems } from '../components/Code/ListTools';
import { Readme } from '../components/Help/Readme';
import { DiffView } from '../components/Code/DiffView';
import { StateTabs } from './P19_Issues';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';

const LABEL = { opened: t.P20_opened, merged: t.P20_merged, closed: t.P20_closed };

export function MergeRequests() {
  const frame = useProject();
  const [st, setSt] = useState('opened');
  const [sort, setSort] = useState('newest');
  const [query, setQuery] = useState('');
  const body = useData(async () => {
    const [opened, merged, closed] = await Promise.all(['opened', 'merged', 'closed'].map((s) => gitlab.mergeRequests(frame.id, s)));
    return { opened: opened.data, merged: merged.data, closed: closed.data };
  }, [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-16" data={frame} />;
  const all = body.data;
  const list = all ? sortItems(matchTitle(all[st], query), sort) : null;
  return (
    <ProjectFrame screenId="R-16" tab="" tabLabel={t.P20_title} data={frame} state={all ? (all.opened.length + all.merged.length + all.closed.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <SearchBox value={query} onChange={setQuery} />
        {!all ? <Status {...body} /> : (
          <ListBox label={t.P20_title} value={st} onChange={setSt} sort={sort} onSort={setSort}
            states={[['opened', t.P20_opened, all.opened.length], ['merged', t.P20_merged, all.merged.length], ['closed', t.P20_closed, all.closed.length]]}>
            {list.length ? (
              <ul className="rb-row-list">
                {list.map((m) => (
                  <li className="rb-row" key={m.iid}>
                    <div className="rb-row-main">
                      <p className="rb-row-title">
                        <Link className="krds-link krds-text-body-small rb-ellipsis" to={`/projects/${frame.id}/merge-requests/${m.iid}`}>{m.title}</Link>
                      </p>
                      <p className="krds-text-body-xsmall rb-row-meta"><span>{t.fn.issueNo(m.iid)}</span><span>{day(m.created_at)}</span><span className="rb-break-any">{u.MR_from} {m.source_branch} {u.MR_to} {m.target_branch}</span></p>
                    </div>
                    <div className="rb-row-side krds-text-body-xsmall rb-subtle">{t.fn.commentCount(m.user_notes_count || 0)}</div>
                  </li>
                ))}
              </ul>
            ) : <EmptyState title={query ? u.List_none : t.P20_none} />}
          </ListBox>
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
  if (!frame.data) return <ProjectFrame screenId="R-17" data={frame} />;
  const m = body.data;
  return (
    <ProjectFrame screenId="R-17" tab="" tabLabel={t.P20_title} crumbs={[[t.P20_title, `/projects/${frame.id}/merge-requests`], [`!${iid}`]]} data={frame} state={m ? 'Ideal' : body.state}>
      {!m ? <Status {...body} /> : (
        <div className="rb-code-area">
          <Link className="krds-link" to={`/projects/${frame.id}/merge-requests`}>{t.P20_back}</Link>
          <div className="rb-detail-head">
            <h2 className="krds-text-heading-small">{m.title} <span className="rb-subtle">{t.fn.issueNo(m.iid)}</span></h2>
            <p className="krds-text-body-xsmall rb-row-meta">
              <span className="rb-pill">{LABEL[m.state] || m.state}</span>
              <span>{day(m.created_at)}</span>
              <span className="rb-break-any">{t.P20_from} {m.source_branch}</span>
              <span className="rb-break-any">{t.P20_to} {m.target_branch}</span>
            </p>
          </div>
          <div className="rb-code-views" role="tablist" aria-label={t.P20_tabsLabel}>
            {[['talk', t.P20_tabTalk], ['commits', t.fn.tabCommits(commits.data?.length ?? 0)], ['files', t.fn.tabFiles(changes.data?.length ?? 0)]].map(([key, label]) => (
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
