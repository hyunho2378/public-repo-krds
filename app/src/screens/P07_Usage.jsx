// P-07 사용 방법. 내 PC 환경 선택 → 가능 여부와 근거(F-14), 제작자 실행 안내. Figma 11038:2822
import { newWindow } from '../components/Layout/newWindow';
import { t } from '../copy/ko';
import { FieldsetTitle } from '../components/Input/FieldsetTitle';
import { useState } from 'react';
import { product } from '../api/client';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { Readme, sectionLines } from '../components/Help/Readme';
import { RunSteps } from '../components/Help/RunSteps';
import { Button, LinkButton } from '../components/Action/Button';
import { Steps } from '../components/Navigation/StepIndicator';
import { EmptyState } from '../components/Feedback/Status';

const NETWORKS = [
  ['internet', t.P07_1],
  ['business', t.P07_2],
  ['unknown', t.P07_3],
];

export default function Usage() {
  const data = useProject();
  const [network, setNetwork] = useState('internet');
  const [canInstall, setCanInstall] = useState(false);
  const [result, setResult] = useState(null);
  const [checking, setChecking] = useState(false);
  if (!data.data) return <ProjectFrame screenId="R-30" data={data} />;
  const { project, readme } = data.data;
  const guide = sectionLines(readme, /사용 방법|사용법|실행|설치|시작/);
  const cloneUrl = project.http_url_to_repo;

  async function check(e) {
    e.preventDefault();
    setChecking(true);
    try {
      setResult((await product.post(`/projects/${data.id}/environment-check`, { network, canInstall })).data);
    } catch (err) {
      setResult({ reasons: [err.message] });
    }
    setChecking(false);
  }

  return (
    <ProjectFrame screenId="R-30" tab="/use" tabLabel={t.ProjectTabs_2} data={data} state={guide ? 'Ideal' : 'Empty'}>
      <Steps label={t.P07_4} labels={[t.P07_5, t.P07_6, t.P07_7]} current={result ? 1 : 0} />
      <h2 className="krds-text-body-small-bold">{t.P07_8}</h2>
      <form className="rb-stack" onSubmit={check}>
        <fieldset className="rb-stack">
          <FieldsetTitle className="krds-text-body-small-bold">{t.P07_9}</FieldsetTitle>
          <div className="rb-choices">
            {NETWORKS.map(([v, label]) => (
              <div className="krds-form-check" key={v}>
                <input id={`network-${v}`} type="radio" name="network" checked={network === v} onChange={() => setNetwork(v)} />
                <label htmlFor={`network-${v}`}>{label}</label>
              </div>
            ))}
          </div>
        </fieldset>
        <div className="krds-form-check">
          <input id="can-install" type="checkbox" checked={canInstall} onChange={(e) => setCanInstall(e.target.checked)} />
          <label htmlFor="can-install">{t.P07_10}</label>
        </div>
        <Button type="submit" disabled={checking}>{checking ? t.P07_11 : t.P07_12}</Button>
      </form>
      {result && (
        <div className="rb-status" role="status" data-state="Result">
          <h3 className="krds-text-body-small-bold">{t.P07_13}</h3>
          {(result.reasons || []).map((r, i) => <p key={i}>{r}</p>)}
          {result.evidence?.length > 0 && <p className="krds-text-body-xsmall rb-subtle">{t.fn.evidence(result.evidence.map((e) => e.file || e).join(', '))}</p>}
          <p className="krds-text-body-xsmall rb-subtle">{t.P07_14}</p>
        </div>
      )}
      <h2 className="krds-text-body-small-bold">{t.P07_15}</h2>
      <RunSteps readme={readme} cloneUrl={cloneUrl} />
      {guide ? (
        <Readme source={guide} />
      ) : (
        <EmptyState title={t.P07_17} actions={<LinkButton Type="tertiary" to={`/projects/${data.id}/feedback?type=readme`}>{t.P07_16}</LinkButton>}>
          {t.P07_19}
        </EmptyState>
      )}
      <div className="rb-actions">
        <a className="krds-btn small primary" href={project.web_url} {...newWindow(String(t.P07_18))}>{t.P07_18}</a>
        <LinkButton Type="tertiary" to={`/projects/${data.id}`}>{t.P07_7}</LinkButton>
      </div>
    </ProjectFrame>
  );
}
