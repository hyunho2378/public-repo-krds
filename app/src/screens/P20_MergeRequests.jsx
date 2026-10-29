// P-20 변경 제안(머지 리퀘스트) 목록과 상세, 읽기 전용. 코드 탭 하위 메뉴.
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab, request } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { RepoSubNav } from '../components/Code/RepoSubNav';
import { Readme } from '../components/Help/Readme';
import { DiffView } from '../components/Code/DiffView';
import { StateTabs } from './P19_Issues';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';

const LABEL = { opened: t.P20_opened, merged: t.P20_merged, closed: t.P20_closed };
const TONE = { opened: 'bg-light-success', merged: 'bg-light-primary', closed: 'bg-light-gray' };

export function MergeRequests() {
  const frame = useProject();
  const [st, setSt] = useState('opened');
  const body = useData(async () => (await gitlab.mergeRequests(frame.id, st)).data, [frame.id, st]);
  if (!frame.data) return <ProjectFrame screenId="P-20" data={frame} />;
  const list = body.data;
  return (
    <ProjectFrame screenId="P-20" tab="" tabLabel={t.P20_title} data={frame} state={list ? (list.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <RepoSubNav id={frame.id} active="mr" />
        <p className="krds-text-body-medium rb-subtle">{t.P20_help}</p>
        <StateTabs value={st} onChange={setSt} label={t.P20_title} items={[['opened', t.P20_opened], ['merged', t.P20_merged], ['closed', t.P20_closed]]} />
        {!list ? <Status {...body} /> : list.length ? (
          <ul className="rb-row-list">
            {list.map((m) => (
              <li className="rb-row" key={m.iid}>
                <div className="rb-row-main">
                  <p className="rb-row-title">
                    <span className={`krds-badge small ${TONE[m.state] || 'bg-light-gray'}`}>{LABEL[m.state] || m.state}</span>
                    <Link className="krds-link krds-text-body-large rb-ellipsis" to={`/projects/${frame.id}/merge-requests/${m.iid}`}>{m.title}</Link>
                  </p>
                  <p className="krds-text-body-small rb-row-meta"><span>{t.fn.issueNo(m.iid)}</span><span>{day(m.created_at)}</span><span className="rb-break-any">{m.source_branch} → {m.target_branch}</span></p>
                </div>
              </li>
            ))}
          </ul>
        ) : <EmptyState title={t.P20_none} />}
      </div>
    </ProjectFrame>
  );
}

export function MergeRequest() {
  const { iid } = useParams();
  const frame = useProject();
  const body = useData(async () => (await gitlab.mergeRequest(frame.id, iid)).data, [frame.id, iid]);
  const changes = useData(async () => {
    try {
      const r = await request(`/api/gitlab/projects/${encodeURIComponent(frame.id)}/merge_requests/${encodeURIComponent(iid)}/changes`);
      return r.data?.changes || [];
    } catch {
      return [];
    }
  }, [frame.id, iid]);
  if (!frame.data) return <ProjectFrame screenId="P-20" data={frame} />;
  const m = body.data;
  return (
    <ProjectFrame screenId="P-20" tab="" tabLabel={t.P20_title} data={frame} state={m ? 'Ideal' : body.state}>
      {!m ? <Status {...body} /> : (
        <div className="rb-code-area">
          <RepoSubNav id={frame.id} active="mr" />
          <Link className="krds-link" to={`/projects/${frame.id}/merge-requests`}>{t.P20_back}</Link>
          <div className="rb-detail-head">
            <h2 className="krds-text-heading-medium">{m.title} <span className="rb-subtle">{t.fn.issueNo(m.iid)}</span></h2>
            <p className="krds-text-body-small rb-row-meta">
              <span className={`krds-badge small ${TONE[m.state] || 'bg-light-gray'}`}>{LABEL[m.state] || m.state}</span>
              <span>{day(m.created_at)}</span>
              <span className="rb-break-any">{t.P20_from} {m.source_branch}</span>
              <span className="rb-break-any">{t.P20_to} {m.target_branch}</span>
            </p>
          </div>
          {m.description ? <div className="rb-detail-body"><Readme source={m.description} /></div> : null}
          {changes.data?.length ? <DiffView files={changes.data} /> : null}
        </div>
      )}
    </ProjectFrame>
  );
}
