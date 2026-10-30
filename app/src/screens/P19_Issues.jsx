// P-19 이슈 목록과 상세(F-31 연동). GitHub Issues 목록 구성: 열림/닫힘, 제목, 라벨, 번호, 날짜, 댓글 수.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { u } from '../copy/ui';
import { w } from '../copy/work';
import { SORTS, matchTitle, sortItems } from '../components/Code/ListTools';
import { Drop } from '../components/Code/Drop';
import { Icon } from '../components/Code/Icon';
import { LinkButton } from '../components/Action/Button';
import { Readme } from '../components/Help/Readme';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';
import './parts/glWork.css';

export function StateTabs({ value, onChange, items, label }) {
  return (
    <div className="krds-tab-area rb-subnav" role="tablist" aria-label={label}>
      <div className="tab fill">
        <ul>
          {items.map(([v, l]) => (
            <li key={v} className={v === value ? 'active' : ''}>
              <button type="button" role="tab" aria-selected={v === value} className="btn-tab" onClick={() => onChange(v)}>{l}</button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export function Issues() {
  const frame = useProject();
  const [st, setSt] = useState('opened');
  const [sort, setSort] = useState('newest');
  const [query, setQuery] = useState('');
  const body = useData(async () => {
    const [opened, closed] = await Promise.all([gitlab.issues(frame.id, 'opened'), gitlab.issues(frame.id, 'closed')]);
    return { opened: opened.data, closed: closed.data };
  }, [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-11" data={frame} />;
  const all = body.data;
  const list = all ? sortItems(matchTitle(all[st], query), sort) : null;
  const stateName = st === 'opened' ? t.P19_open : t.P19_closed;
  return (
    <ProjectFrame screenId="R-11" tab="/feedback" tabLabel={t.P19_title} data={frame} state={all ? (all.opened.length + all.closed.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <div className="gl-work-tabs">
          <span className="gl-work-tab">{w.all}</span>
          <LinkButton to={`/projects/${frame.id}/issues/new`} Type="secondary" Size="small">{w.new}</LinkButton>
        </div>
        <div className="gl-work-filter">
          <div className="gl-work-bar" role="search">
            <span className="gl-work-token">{w.status} {w.is}
              <Drop label={w.status} align="left" btnClass="krds-btn small text" button={<span>{stateName}</span>}>
                {(close) => (
                  <ul className="drop-list" aria-label={w.status}>
                    {[['opened', t.P19_open], ['closed', t.P19_closed]].map(([k, n]) => (
                      <li key={k}><button type="button" className={'item-link' + (k === st ? ' active' : '')} onClick={() => { close(); setSt(k); }}>{n}</button></li>
                    ))}
                  </ul>
                )}
              </Drop>
            </span>
            <input type="search" value={query} placeholder={w.search} aria-label={u.List_searchLabel} onChange={(e) => setQuery(e.target.value)} />
            <Icon name="search" />
          </div>
          <Drop label={w.display} align="right" button={<span>{w.display}</span>}>
            {(close) => (
              <ul className="drop-list" aria-label={u.List_sort}>
                {SORTS.map(([k, n]) => (
                  <li key={k}><button type="button" className={'item-link' + (k === sort ? ' active' : '')} onClick={() => { close(); setSort(k); }}>{n}</button></li>
                ))}
              </ul>
            )}
          </Drop>
        </div>
        {!all ? <Status {...body} /> : (
          <>
            <p className="gl-work-count">{list.length} {w.item}</p>
            {list.length ? (
              <ul className="rb-row-list">
                {list.map((i) => (
                  <li className="rb-row" key={i.iid}>
                    <div className="rb-row-main">
                      <p className="rb-row-title">
                        <Link className="krds-link krds-text-body-small rb-ellipsis" to={`/projects/${frame.id}/issues/${i.iid}`}>{i.title}</Link>
                        {i.labels?.length ? i.labels.map((l) => <span key={l} className="rb-pill">{l}</span>) : null}
                      </p>
                      <p className="krds-text-body-xsmall rb-row-meta"><span>{t.fn.issueNo(i.iid)}</span><span>{day(i.created_at)}</span></p>
                    </div>
                    <div className="rb-row-side krds-text-body-xsmall rb-subtle">{t.fn.commentCount(i.user_notes_count || 0)}</div>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="gl-work-empty">
                <h3>{w.noResult}</h3>
                <p>{w.noResultHelp}</p>
                <LinkButton to={`/projects/${frame.id}/issues/new`} Type="secondary" Size="small">{w.new}</LinkButton>
              </div>
            )}
          </>
        )}
      </div>
    </ProjectFrame>
  );
}

export function Issue() {
  const { iid } = useParams();
  const frame = useProject();
  const body = useData(async () => (await gitlab.issue(frame.id, iid)).data, [frame.id, iid]);
  if (!frame.data) return <ProjectFrame screenId="R-12" data={frame} />;
  const i = body.data;
  return (
    <ProjectFrame screenId="R-12" tab="/feedback" tabLabel={t.P19_title} crumbs={[[t.Side_issues, `/projects/${frame.id}/issues`], [`#${iid}`]]} data={frame} state={i ? 'Ideal' : body.state}>
      {!i ? <Status {...body} /> : (
        <div className="rb-code-area">
          <div className="rb-detail-head">
            <h2 className="krds-text-heading-small">{i.title} <span className="rb-subtle">{t.fn.issueNo(i.iid)}</span></h2>
            <p className="krds-text-body-xsmall rb-row-meta">
              <span className="rb-pill">{i.state === 'opened' ? t.P19_open : t.P19_closed}</span>
              <span>{day(i.created_at)}</span>
              <span>{t.fn.commentCount(i.user_notes_count || 0)}</span>
              <span>{u.Meta_assignee} {i.assignees?.length ? i.assignees.map((a) => a.name).join(', ') : u.Meta_none}</span>
              <span>{u.Meta_milestone} {i.milestone?.title || u.Meta_none}</span>
              <span className="rb-labels">{u.Meta_labels} {i.labels?.length ? i.labels.map((l) => <span key={l} className="rb-pill">{l}</span>) : u.Meta_none}</span>
            </p>
          </div>
          <div className="rb-detail-body">{i.description ? <Readme source={i.description} /> : <p className="rb-subtle">{t.P19_noBody}</p>}</div>
        </div>
      )}
    </ProjectFrame>
  );
}
