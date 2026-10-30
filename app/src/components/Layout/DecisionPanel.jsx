// Figma: Repo/Decision. 공무원 판단 정보(U3): 칸마다 값, 비었으면 이유와 다음 행동(U6). 저장소 첫 화면 오른쪽과 소개 탭에서 같이 쓴다.
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';
import { product } from '../../api/client';
import { useData } from '../../api/useData';

export async function loadDecision(id) {
  // 서버 동시 요청 제한(상세 2개)에 맞춰 순서대로 부른다.
  const card = await product.get(`/projects/${id}/card`);
  const dates = await product.get(`/projects/${id}/reference-dates`);
  const check = await product.post('/publication-checks', { projectId: Number(id) });
  const reuses = await product.get(`/projects/${id}/reuses`);
  return { card: card.data, dates: dates.data, check: check.data, reuses: reuses.data };
}

function findLine(readme, pattern) {
  return (readme || '').split('\n').find((l) => pattern.test(l))?.replace(/^\s*[-*]\s*/, '').replace(/\*\*/g, '');
}

export function decisionRows(id, readme, d) {
  const passed = d.check.checks.filter((c) => c.pass).length;
  return [
    [t.P04_1, findLine(readme, /실행 환경|별도 설치|브라우저/) || t.P04_2, [t.P04_3, `/projects/${id}/use`]],
    [t.P04_4, findLine(readme, /기준 확인일|시행일|고시/) || d.dates.references?.flatMap((r) => r.dates).join(', ') || t.P04_5, [t.P04_6, `/projects/${id}/use`]],
    [t.P04_7, d.reuses.total ? t.fn.reuseCount(d.reuses.total) : t.P04_8, [t.P04_9, '?reuse=1']],
    [t.P04_10, t.fn.checkSummary(d.check.checks.length, passed), [t.P04_11, `/projects/${id}/code`]],
    [t.P04_12, d.card.license && d.card.license !== 'unknown' ? d.card.license : t.P04_13, [t.P04_14, `/projects/${id}/feedback?type=inquiry`]],
    [t.P04_15, t.P04_16, [t.P04_17, `/projects/${id}/feedback?type=feature`]],
  ];
}

export function DecisionList({ rows }) {
  return (
    <dl className="rb-stack rb-decision-list">
      {rows.map(([title, value, [action, to]]) => (
        <div className="rb-decision-item" key={title}>
          <dt className="krds-text-body-small-bold">{title}</dt>
          <dd className="krds-text-body-small rb-subtle">{value}</dd>
          <dd><Link className="krds-link krds-text-body-small" to={to}>{action}</Link></dd>
        </div>
      ))}
    </dl>
  );
}

/** 자료를 스스로 불러오는 판단 정보 묶음. */
export function DecisionPanel({ id, readme, headingId = 'decision-title' }) {
  const d = useData(() => loadDecision(id), [id]);
  return (
    <section data-figma="decision-panel" className="rb-about-block" aria-labelledby={headingId}>
      <h2 id={headingId} className="krds-text-body-small-bold">{t.P04_25}</h2>
      {d.data ? <DecisionList rows={decisionRows(id, readme, d.data)} /> : <p className="krds-text-body-small rb-subtle" role="status">{d.state === 'Error' ? d.error : t.P10_1}</p>}
    </section>
  );
}
