// P-21 참여자와 활동. 이름과 변경 횟수만(메일 비노출, U9). 코드 탭 하위 메뉴.
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { RepoSubNav } from '../components/Code/RepoSubNav';
import { orgLabel } from '../components/Layout/orgLabel';
import '../components/Code/code.css';

export default function Contributors() {
  const frame = useProject();
  const body = useData(async () => (await gitlab.contributors(frame.id)).data, [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-10" data={frame} />;
  const list = body.data ? [...body.data].sort((a, b) => b.commits - a.commits) : null;
  return (
    <ProjectFrame screenId="R-10" tab="" tabLabel={t.P21_title} data={frame} state={list ? (list.length ? (list.length === 1 ? 'Min' : 'Ideal') : 'Empty') : body.state}>
      <div className="rb-code-area">
        <RepoSubNav id={frame.id} active="people" />
        <div className="rb-detail-head">
          <h2 className="krds-text-body-small-bold">{list ? t.fn.countLabel(t.P21_title, t.fn.peopleCount(list.length)) : t.P21_title}</h2>
          <p className="krds-text-body-xsmall rb-subtle">{t.P21_help}</p>
        </div>
        {!list ? <Status {...body} /> : list.length ? (
          <div className="krds-table-wrap rb-table-scroll">
            <table className="tbl data">
              <caption className="sr-only">{t.P21_title}</caption>
              <thead><tr><th scope="col">{t.P21_name}</th><th scope="col" className="rb-num">{t.P21_commits}</th></tr></thead>
              <tbody>
                {list.map((c) => (
                  <tr key={c.name}><td>{orgLabel(c.name)}</td><td className="rb-num">{t.fn.times(c.commits)}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : <EmptyState title={t.P21_none} />}
      </div>
    </ProjectFrame>
  );
}
