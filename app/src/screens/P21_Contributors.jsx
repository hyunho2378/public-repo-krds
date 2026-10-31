// P-21 참여자와 활동. 이름과 변경 횟수만(메일 비노출, U9). 코드 탭 하위 메뉴.
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { orgLabel } from '../components/Layout/orgLabel';
import { ct, au } from '../copy/work';
import { Icon } from '../components/Code/Icon';
import { request } from '../api/client';
import { CommitChart, dailyCounts } from './parts/CommitChart';
import './parts/glRepo.css';
import '../components/Code/code.css';

export default function Contributors() {
  const frame = useProject();
  const body = useData(async () => (await gitlab.contributors(frame.id)).data, [frame.id]);
  const MAX_PAGES = 15;
  const commits = useData(async () => {
    const out = [];
    for (let page = 1; page <= MAX_PAGES; page++) {
      try {
        const r = await request(`/api/gitlab/projects/${encodeURIComponent(frame.id)}/repository/commits?per_page=100&page=${page}&ref_name=${encodeURIComponent(frame.data?.project?.default_branch || 'main')}`);
        out.push(...(r.data || []));
        if (!r.pagination?.nextPage || !(r.data || []).length) break;
      } catch { break; }
    }
    return out;
  }, [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-10" data={frame} />;
  const list = body.data ? [...body.data].sort((a, b) => b.commits - a.commits) : null;
  return (
    <ProjectFrame screenId="R-10" tab="" tabLabel={ct.title} data={frame} state={list ? (list.length ? (list.length === 1 ? 'Min' : 'Ideal') : 'Empty') : body.state}>
      <div className="rb-code-area">
        <div data-figma="page-head" className="gl-ph">
        <h2 className="gl-page-title">{ct.title}</h2>
        <div className="gl-ct-tools">
          <span className="krds-btn small tertiary"><Icon name="ext/branch" />{frame.data.project.default_branch || 'main'}<Icon name="arrow-down" /></span>
          <span className="krds-btn small tertiary">{ct.history}</span>
        </div>
        </div>
        <h3 className="gl-ct-sub">{ct.branchHead} {frame.data.project.default_branch || 'main'}</h3>
        <p className="gl-page-help">{ct.note}</p>
        {commits.data ? <CommitChart series={dailyCounts(commits.data)} label={ct.title} /> : <Status {...commits} />}
        {commits.data?.length ? <p className="gl-page-help">{au.limited(commits.data.length)}</p> : null}
        {!list ? <Status {...body} /> : list.length ? (
          <div className="gl-ct-grid">
            {list.map((c) => (
              <section className="gl-ct-card" key={c.name}>
                <h3>{orgLabel(c.name)}</h3>
                <p>{ct.commits(c.commits)}</p>
                {commits.data ? <CommitChart series={dailyCounts(commits.data.filter((k) => k.author_name === c.name))} label={c.name} /> : null}
              </section>
            ))}
          </div>
        ) : <EmptyState title={ct.none} />}
      </div>
    </ProjectFrame>
  );
}
