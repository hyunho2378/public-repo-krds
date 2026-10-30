// P-19 이슈 목록과 상세(F-31 연동). GitHub Issues 목록 구성: 열림/닫힘, 제목, 라벨, 번호, 날짜, 댓글 수.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { Readme } from '../components/Help/Readme';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';

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
  const body = useData(async () => (await gitlab.issues(frame.id, st)).data, [frame.id, st]);
  if (!frame.data) return <ProjectFrame screenId="R-11" data={frame} />;
  const list = body.data;
  return (
    <ProjectFrame screenId="R-11" tab="/feedback" tabLabel={t.P19_title} data={frame} state={list ? (list.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <div className="rb-detail-head">
          <h2 className="krds-text-heading-medium">{t.P19_title}</h2>
          <p className="krds-text-body-medium rb-subtle">{t.P19_help}</p>
        </div>
        <StateTabs value={st} onChange={setSt} label={t.P19_title} items={[['opened', t.P19_open], ['closed', t.P19_closed]]} />
        {!list ? <Status {...body} /> : list.length ? (
          <ul className="rb-row-list">
            {list.map((i) => (
              <li className="rb-row" key={i.iid}>
                <div className="rb-row-main">
                  <p className="rb-row-title">
                    <span className="rb-pill">{i.state === 'opened' ? t.P19_open : t.P19_closed}</span>
                    <Link className="krds-link krds-text-body-large rb-ellipsis" to={`/projects/${frame.id}/issues/${i.iid}`}>{i.title}</Link>
                  </p>
                  <p className="krds-text-body-small rb-row-meta"><span>{t.fn.issueNo(i.iid)}</span><span>{day(i.created_at)}</span></p>
                  {i.labels?.length ? <p className="rb-labels">{i.labels.map((l) => <span key={l} className="rb-pill">{l}</span>)}</p> : null}
                </div>
                <div className="rb-row-side krds-text-body-small rb-subtle">{t.fn.commentCount(i.user_notes_count || 0)}</div>
              </li>
            ))}
          </ul>
        ) : <EmptyState title={t.P19_none} />}
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
          <Link className="krds-link" to={`/projects/${frame.id}/issues`}>{t.P19_back}</Link>
          <div className="rb-detail-head">
            <h2 className="krds-text-heading-medium">{i.title} <span className="rb-subtle">{t.fn.issueNo(i.iid)}</span></h2>
            <p className="krds-text-body-small rb-row-meta">
              <span className="rb-pill">{i.state === 'opened' ? t.P19_open : t.P19_closed}</span>
              <span>{day(i.created_at)}</span>
              <span>{t.fn.commentCount(i.user_notes_count || 0)}</span>
            </p>
            {i.labels?.length ? <p className="rb-labels">{i.labels.map((l) => <span key={l} className="rb-pill">{l}</span>)}</p> : null}
          </div>
          <div className="rb-detail-body">{i.description ? <Readme source={i.description} /> : <p className="rb-subtle">{t.P19_noBody}</p>}</div>
        </div>
      )}
    </ProjectFrame>
  );
}
