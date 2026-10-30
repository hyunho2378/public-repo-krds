// R-19 작업과 결과물. 파이프라인 하위 화면으로, 자동 검사 작업과 그 결과물을 본다.
// 공공 깃랩 공개 API로 읽고, 로그인해야 보이는 자료는 그대로 안내한다(없는 값을 만들지 않는다).
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { request } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';

export default function Jobs() {
  const { id } = useParams();
  const frame = useProject();
  const body = useData(async () => {
    const res = await request(`/api/gitlab/projects/${encodeURIComponent(id)}/jobs`);
    return res.data || [];
  }, [id]);
  if (!frame.data) return <ProjectFrame screenId="R-19" data={frame} />;
  const list = Array.isArray(body.data) ? body.data : null;
  const needsLogin = body.state === 'Error' && body.status === 401;
  return (
    <ProjectFrame screenId="R-19" tab="" tabLabel={t.Jobs_title} data={frame} state={list ? (list.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <div className="rb-detail-head">
          <h2 className="krds-text-body-small-bold" data-figma="section-title">{t.Jobs_title}</h2>
          <p className="krds-text-body-xsmall rb-subtle">{t.Jobs_hint}</p>
        </div>
        {needsLogin ? (
          <EmptyState
            title={t.P22_loginNeeded}
            action={<Link className="krds-btn medium primary" to={`/login?returnTo=${encodeURIComponent(`/projects/${id}/jobs`)}`}>{t.Header_login}</Link>}
          />
        ) : !list ? (
          <Status {...body} />
        ) : list.length ? (
          <ul className="rb-plain-list">
            {list.map((j) => (
              <li className="rb-plain-row" key={j.id}>
                <span className="rb-plain-main">{j.name}</span>
                <span className="rb-plain-sub rb-subtle">{j.stage} {j.status}</span>
                <span className="rb-plain-meta rb-subtle">{day(j.created_at)}</span>
              </li>
            ))}
          </ul>
        ) : (
          <EmptyState title={t.Jobs_none} />
        )}
        <p className="krds-text-body-xsmall rb-subtle">
          <Link className="krds-link" to={`/projects/${id}/pipelines`}>{t.Jobs_toPipelines}</Link>
        </p>
      </div>
    </ProjectFrame>
  );
}
