// P-21 참여자와 활동. 이름과 변경 횟수만(메일 비노출, U9). 코드 탭 하위 메뉴.
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { orgLabel } from '../components/Layout/orgLabel';
import { ct } from '../copy/work';
import './parts/glRepo.css';
import '../components/Code/code.css';

export default function Contributors() {
  const frame = useProject();
  const body = useData(async () => (await gitlab.contributors(frame.id)).data, [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-10" data={frame} />;
  const list = body.data ? [...body.data].sort((a, b) => b.commits - a.commits) : null;
  return (
    <ProjectFrame screenId="R-10" tab="" tabLabel={t.P21_title} data={frame} state={list ? (list.length ? (list.length === 1 ? 'Min' : 'Ideal') : 'Empty') : body.state}>
      <div className="rb-code-area">
        <h2 className="gl-page-title">{ct.title}</h2>
        <div className="gl-ct-tools">
          <span className="krds-btn small tertiary">{frame.data.project.default_branch || 'main'}</span>
          <span className="krds-btn small tertiary">{ct.history}</span>
        </div>
        <h3 className="gl-ct-sub">{ct.branchHead} {frame.data.project.default_branch || 'main'}</h3>
        <p className="gl-page-help">{ct.note}</p>
        {!list ? <Status {...body} /> : list.length ? (
          <div className="gl-ct-grid">
            {list.map((c) => (
              <section className="gl-ct-card" key={c.name}>
                <h3>{orgLabel(c.name)}</h3>
                <p>{ct.commits(c.commits)}</p>
              </section>
            ))}
          </div>
        ) : <EmptyState title={ct.none} />}
      </div>
    </ProjectFrame>
  );
}
