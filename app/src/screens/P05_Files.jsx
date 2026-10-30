// P-05 파일과 README. 파일 목록은 표, 개발자용 정보는 접음(U4).
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { Readme } from '../components/Help/Readme';
import { EmptyState } from '../components/Feedback/Status';

const KIND = { tree: t.P05_1, blob: t.ProjectTabs_3 };

export default function Files() {
  const data = useProject(async (id) => ({ tree: (await gitlab.tree(id)).data }));
  if (!data.data) return <ProjectFrame screenId="R-02" data={data} />;
  const { project, readme, tree } = data.data;
  return (
    <ProjectFrame screenId="R-02" tab="/files" tabLabel={t.ProjectTabs_3} data={data} state={tree.length ? 'Ideal' : 'Empty'}>
      <h2 className="krds-text-body-small-bold">{t.P05_2}</h2>
      {tree.length ? (
        <div className="krds-table-wrap rb-table-scroll">
          <table className="tbl data">
            <caption className="sr-only">{t.fn.treeCaption(tree.length)}</caption>
            <thead><tr><th scope="col">{t.P05_3}</th><th scope="col">{t.P05_4}</th></tr></thead>
            <tbody>
              {tree.map((f) => (
                <tr key={f.id + f.path}>
                  <td><a className="krds-link" href={`${project.web_url}/-/${f.type === 'tree' ? 'tree' : 'blob'}/${project.default_branch || 'main'}/${f.path}`} target="_blank" rel="noreferrer">{f.name}<span className="sr-only"> {t.Footer_3}</span></a></td>
                  <td>{KIND[f.type] || f.type}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <EmptyState title={t.P05_5} />
      )}
      <h2 className="krds-text-body-small-bold">{t.P05_6}</h2>
      {readme ? <Readme source={readme} /> : <EmptyState title={t.P05_8}>{t.P05_7}</EmptyState>}
      <details className="krds-disclosure rb-dev">
        <summary className="krds-btn small text">{t.P05_9}</summary>
        <dl className="rb-stack">
          <div><dt className="krds-text-body-small-bold">{t.P05_10}</dt><dd><code>{project.http_url_to_repo}</code></dd></div>
          <div><dt className="krds-text-body-small-bold">{t.P05_11}</dt><dd>{project.default_branch || t.P05_12}</dd></div>
          <div><dt className="krds-text-body-small-bold">{t.P05_13}</dt><dd><a className="krds-link" href={project.web_url} target="_blank" rel="noreferrer">{project.web_url}<span className="sr-only"> {t.Footer_3}</span></a></dd></div>
        </dl>
      </details>
    </ProjectFrame>
  );
}
