// A-03 공개 준비 점검. 프로젝트 안 화면. 서버의 점검 결과(F-21)를 이 프로젝트의 파일 목록과 설명서로 받아 항목별로 보인다.
// 공개 승인이 아님을 화면에서 분명히 한다.
import { Link, useParams } from 'react-router-dom';
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { product } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { Status } from '../components/Feedback/Status';
import '../components/Code/code.css';

const CHECK_LABEL = {
  gitignore: t.P09_3,
  readme: t.P09_4,
  purpose: t.P09_5,
  usage: t.P09_6,
  environment: t.P09_7,
  license: t.P09_8,
  tests: t.P09_9,
  ci: t.P09_10,
};

export default function PublishCheck() {
  const { id } = useParams();
  const frame = useProject();
  const body = useData(async () => (await product.post('/publication-checks', { projectId: Number(id) })).data, [id]);
  if (!frame.data) return <ProjectFrame screenId="A-03" data={frame} />;
  const check = body.data;
  const passed = check ? check.checks.filter((c) => c.pass).length : 0;
  const allPass = check && passed === check.checks.length;
  return (
    <ProjectFrame screenId="A-03" tab="" tabLabel={t.PubCheck_title} data={frame} state={check ? (allPass ? 'Pass' : 'NeedsWork') : body.state}>
      <div className="rb-code-area">
        <div className="rb-detail-head">
          <h2 className="krds-text-body-small-bold" data-figma="section-title">{t.PubCheck_title}</h2>
          <p className="krds-text-body-xsmall rb-subtle">{t.PubCheck_hint}</p>
        </div>
        {!check ? (
          <Status {...body} />
        ) : (
          <section className="rb-stack" aria-live="polite" data-figma="checks">
            <h3 className="krds-text-body-small-bold">{allPass ? t.P09_24 : t.fn.checkCount(check.checks.length, passed)}</h3>
            <p className="krds-text-body-small">{phrase(t.P09_25)}</p>
            <ul className="rb-checklist">
              {check.checks.map((c) => (
                <li key={c.id} className={c.pass ? 'is-pass' : 'is-fail'}>
                  <span className={`rb-status-text ${c.pass ? 'is-success' : 'is-warning'}`}>{c.pass ? t.P09_26 : t.P09_27}</span> {CHECK_LABEL[c.id] || c.id}
                </li>
              ))}
            </ul>
            <p className="krds-text-body-xsmall rb-subtle">{phrase(t.PubCheck_scope)}</p>
            {check.security?.notice && <p className="krds-text-body-xsmall rb-subtle">{check.security.notice}</p>}
          </section>
        )}
        <p className="krds-text-body-xsmall rb-subtle">
          <Link className="krds-link" to={`/projects/${id}`}>{t.PubCheck_back}</Link>
        </p>
      </div>
    </ProjectFrame>
  );
}
