// P-04 프로젝트 홈. 하는 일 먼저(U2), 오른쪽 판단 정보 영역(U3). 칸마다 이유와 다음 행동(U6). Figma 11038:1945
import { t } from '../copy/ko';
import { Link } from 'react-router-dom';
import { product } from '../api/client';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { Readme } from '../components/Help/Readme';
import { cleanDescription } from '../components/Layout/StructuredList';
import { Button, LinkButton } from '../components/Action/Button';
import { EmptyState } from '../components/Feedback/Status';

async function loadDecision(id) {
  // 서버 동시 요청 제한(상세 2개)에 맞춰 순서대로 부른다.
  const card = await product.get(`/projects/${id}/card`);
  const dates = await product.get(`/projects/${id}/reference-dates`);
  const check = await product.post('/publication-checks', { projectId: Number(id) });
  const reuses = await product.get(`/projects/${id}/reuses`);
  return { card: card.data, dates: dates.data, check: check.data, reuses: reuses.data };
}

function findLine(readme, pattern) {
  return readme.split('\n').find((l) => pattern.test(l))?.replace(/^\s*[-*]\s*/, '').replace(/\*\*/g, '');
}

export default function Project() {
  const data = useProject(loadDecision);
  if (!data.data) return <ProjectFrame screenId="A-02" data={data} />;
  const { project, readme, card, dates, check, reuses } = data.data;
  const id = data.id;
  const passed = check.checks.filter((c) => c.pass).length;
  const summary = cleanDescription(card.summary) || cleanDescription(project.description);

  return (
    <ProjectFrame screenId="A-02" tab="/about" tabLabel={t.ProjectTabs_1} data={data} state={readme ? 'Ideal' : 'Min'}>
      <div className="rb-one-col">
        <article className="rb-stack rb-grow">
          <h2 className="krds-text-body-small-bold">{t.P04_18}</h2>
          <p className="krds-text-body-small">{summary || t.StructuredList_5}</p>
          {card.summary && (
            <p className="krds-text-body-xsmall rb-subtle">
              {t.P04_autoSummary} <a className="krds-link" href={`${project.web_url}/-/blob/${project.default_branch || 'main'}/README.md`} target="_blank" rel="noreferrer">{t.P04_19}<span className="sr-only"> {t.Footer_3}</span></a>
            </p>
          )}
          <div className="rb-actions">
            <LinkButton to={`/projects/${id}/use`}>{t.P04_20}</LinkButton>
          </div>
          <h2 className="krds-text-body-small-bold">{t.P04_22}</h2>
          {readme ? (
            <Readme source={readme} base={{ id, rawBase: `${project.web_url}/-/raw/${project.default_branch || 'main'}/` }} />
          ) : (
            <EmptyState
              title={t.P04_23}
              actions={<LinkButton Type="tertiary" to={`/projects/${id}/feedback?type=readme`}>{t.P04_24}</LinkButton>}
            >
              {t.P04_noReadme}
            </EmptyState>
          )}
          <a className="krds-link" href={project.web_url} target="_blank" rel="noreferrer">
            {t.P04_openOrigin}<span className="sr-only"> {t.Footer_3}</span>
          </a>
        </article>
      </div>
    </ProjectFrame>
  );
}
