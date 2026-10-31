// R-19 작업과 결과물. 파이프라인 하위 화면으로, 자동 검사 작업과 그 결과물을 본다.
// 공공 깃랩 공개 API로 읽고, 로그인해야 보이는 자료는 그대로 안내한다(없는 값을 만들지 않는다).
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { useState } from 'react';
import { gql, Q } from './parts/glGraphql';
import { au } from '../copy/work';
import { ago } from './parts/glTime';
import { u } from '../copy/ui';
import { FilterSearch } from './parts/FilterSearch';
import { Icon } from '../components/Code/Icon';
import './parts/glRepo.css';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';

export default function Jobs() {
  const { id } = useParams();
  const frame = useProject();
  const [tab, setTab] = useState('all');
  const [q, setQ] = useState('');
  const path = frame.data?.project?.path_with_namespace;
  const body = useData(async () => (path ? (await gql(Q.jobs, { p: path })).project.jobs.nodes : null), [id, path]);
  if (!frame.data) return <ProjectFrame screenId="R-19" data={frame} />;
  const all = Array.isArray(body.data) ? body.data : null;
  const rows0 = all ? (tab === 'done' ? all.filter((j) => ['SUCCESS', 'FAILED', 'CANCELED', 'SKIPPED'].includes(j.status)) : all) : null;
  const rows = rows0 ? rows0.filter((j) => j.name.toLowerCase().includes(q.trim().toLowerCase())) : null;
  return (
    <ProjectFrame screenId="R-19" tab="" tabLabel={t.Jobs_title} data={frame} state={rows ? (rows.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <div className="gl-tabs" data-figma="gl-tabs" role="tablist">
          {[['all', au.tabAll], ['done', au.tabDone]].map(([k, n]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className={'gl-tab' + (tab === k ? ' active' : '')} onClick={() => setTab(k)}>
              {n} {all ? <span className="gl-mr-count">{k === 'all' ? all.length : all.filter((j) => ['SUCCESS', 'FAILED', 'CANCELED', 'SKIPPED'].includes(j.status)).length}</span> : null}
            </button>
          ))}
        </div>
        <div className="gl-work-filter" data-figma="gl-filter">
          <div className="gl-work-bar" role="search">
            <span className="gl-work-token">{au.jobKind} = {au.jobBuild}</span>
            <input type="search" value={q} placeholder={au.jobSearch} aria-label={au.jobSearch} onChange={(e) => setQ(e.target.value)} />
            <FilterSearch label={u.List_searchLabel} />
          </div>
        </div>
        {!rows ? <Status {...body} /> : rows.length ? (
          <div className="gl-table-wrap">
            <table className="gl-table">
              <thead><tr><th scope="col">{au.jobStatus}</th><th scope="col">{au.jobName}</th><th scope="col">{au.jobPipeline}</th><th scope="col">{au.jobStage}</th><th scope="col">{au.jobCommit}</th><th scope="col">{au.jobCreated}</th></tr></thead>
              <tbody>
                {rows.map((j) => (
                  <tr key={j.id}>
                    <td>{au.statusName[j.status] || j.status}</td>
                    <td><strong>#{j.id.split('/').pop()} {j.name}</strong><small className="gl-source"> {j.refName}{j.allowFailure ? `, ${au.allowFailed}` : ''}</small></td>
                    <td>#{j.pipeline?.iid}</td>
                    <td>{j.stage?.name}</td>
                    <td><code>{j.shortSha}</code></td>
                    <td>{ago(j.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title={t.Jobs_none} />}
        <p className="krds-text-body-xsmall rb-subtle">
          <Link className="krds-link" to={`/projects/${id}/pipelines`}>{t.Jobs_toPipelines}</Link>
        </p>
      </div>
    </ProjectFrame>
  );
}
