// P-06 변경 기록(F-36). 작성자 메일은 보여 주지 않는다(U9).
import { t } from '../copy/ko';
import { product } from '../api/client';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState } from '../components/Feedback/Status';

export default function Changes() {
  const data = useProject(async (id) => ({ versions: (await product.get(`/projects/${id}/version-guide`)).data }));
  if (!data.data) return <ProjectFrame screenId="P-06" data={data} />;
  const items = data.data.versions.items || [];
  return (
    <ProjectFrame screenId="P-06" tab="/changes" tabLabel={t.ProjectTabs_4} data={data} state={items.length ? 'Ideal' : 'Empty'}>
      <h2 className="krds-text-heading-medium">{t.P06_1}</h2>
      <p className="rb-subtle">{t.P06_2}</p>
      {items.length ? (
        <ol className="krds-structured-list rb-list">
          {items.map((c) => (
            <li className="structured-item rb-list-link" key={c.id}>
              <span className="krds-text-body-large">{c.title}</span>
              <span className="krds-text-body-small rb-subtle">
                {new Date(c.committedAt).toLocaleDateString('ko-KR')}{' '}
                <a className="krds-link" href={c.url} target="_blank" rel="noreferrer">{t.P06_3}<span className="sr-only"> {t.Footer_3}</span></a>
              </span>
            </li>
          ))}
        </ol>
      ) : (
        <EmptyState title={t.P06_4} />
      )}
    </ProjectFrame>
  );
}
