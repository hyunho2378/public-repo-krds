// P-09 새 도구 올리기. 단계: 비슷한 도구 확인(F-04, F-05) → 공개 준비 점검(F-21, F-22) → 설명 확인. 공개 승인이 아님을 분명히.
import { CHECK_LABEL } from './parts/checkLabels';
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { auth, product } from '../api/client';
import { Page } from '../components/Layout/Page';
import { Breadcrumb } from '../components/Navigation/Breadcrumb';
import { ProjectList } from '../components/Layout/StructuredList';
import { LoginRequiredModal } from '../components/Feedback/LoginRequiredModal';
import { FormField, requireFields } from '../components/Input/FormField';
import { Button, LinkButton } from '../components/Action/Button';
import { Steps } from '../components/Navigation/StepIndicator';
import { EmptyState } from '../components/Feedback/Status';

const STEPS = [t.P09_1, t.P04_10, t.P09_2];

export default function Publish() {
  const [step, setStep] = useState(0);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [similar, setSimilar] = useState(null);
  const [projectId, setProjectId] = useState('');
  const [check, setCheck] = useState(null);
  const [session, setSession] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    auth.session().then(setSession).catch(() => setSession({ authenticated: false }));
  }, []);

  async function findSimilar(e) {
    e.preventDefault();
    const found = requireFields({ name }, { name: 'pub-name' });
    setErrors(found);
    if (found.name) return;
    setBusy(true);
    try {
      setSimilar((await product.post('/duplicates', { name, description })).data);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }
  async function runCheck(e) {
    e.preventDefault();
    const found = requireFields({ projectId }, { projectId: 'pub-project' });
    setErrors(found);
    if (found.projectId) return;
    setBusy(true);
    setError('');
    try {
      setCheck((await product.post('/publication-checks', { projectId: Number(projectId) })).data);
    } catch (err) {
      setError(err.message);
    }
    setBusy(false);
  }
  const passed = check?.checks.filter((c) => c.pass).length;
  const allPass = check && passed === check.checks.length;

  return (
    <Page id="G-05c" title={t.Header_4} state={check ? (allPass ? 'Pass' : 'NeedsWork') : step === 0 && similar ? 'Similar' : 'Ideal'}>
      <h1 className="krds-text-heading-small" data-figma="page-head">{phrase(t.Header_4)}</h1>
      <p className="rb-subtle">{phrase(t.P09_11)}</p>
      <Steps label={t.P09_12} labels={STEPS} current={step} />

      {step === 0 && (
        <form className="rb-stack rb-form" onSubmit={findSimilar} noValidate>
          <FormField id="pub-name" label={t.P09_13} required value={name} placeholder={t.P09_14} error={errors.name} onChange={(e) => setName(e.target.value)} />
          <FormField id="pub-desc" label={t.P09_15} multiline value={description} placeholder={t.P09_16} onChange={(e) => setDescription(e.target.value)} />
          <Button type="submit" disabled={busy}>{busy ? t.P09_17 : t.P09_18}</Button>
          {similar && (
            <section className="rb-stack" aria-live="polite">
              {similar.items.length ? (
                <>
                  <h2 className="krds-text-body-small-bold">{phrase(t.fn.similar(similar.items.length))}</h2>
                  <p className="rb-subtle">{t.P09_similarHint} {similar.notice}</p>
                  <ProjectList items={similar.items} />
                </>
              ) : (
                <EmptyState title={t.P09_19} />
              )}
              <Button onClick={() => setStep(1)}>{t.Pagination_3}</Button>
            </section>
          )}
        </form>
      )}

      {step === 1 && (
        <section className="rb-stack">
          {!session?.authenticated && session && <LoginRequiredModal action={t.Header_4} onClose={() => setStep(0)} />}
          <form className="rb-stack rb-form" onSubmit={runCheck} noValidate>
            <FormField id="pub-project" label={t.P09_20} required inputMode="numeric" value={projectId} hint={t.P09_21} error={errors.projectId} onChange={(e) => setProjectId(e.target.value.replace(/\D/g, ''))} />
            <Button type="submit" disabled={busy}>{busy ? t.P09_22 : t.P09_23}</Button>
          </form>
          {error && <p role="alert" className="rb-error">{error}</p>}
          {check && (
            <section className="rb-stack" aria-live="polite">
              <h2 className="krds-text-body-small-bold">{allPass ? t.P09_24 : t.fn.checkCount(check.checks.length, passed)}</h2>
              <p className="krds-text-body-small">{phrase(t.P09_25)}</p>
              <ul className="rb-checklist">
                {check.checks.map((c) => (
                  <li key={c.id} className={c.pass ? 'is-pass' : 'is-fail'}>
                    <span className={`rb-status-text ${c.pass ? 'is-success' : 'is-warning'}`}>{c.pass ? t.P09_26 : t.P09_27}</span> {CHECK_LABEL[c.id] || c.id}
                  </li>
                ))}
              </ul>
              <p className="krds-text-body-xsmall rb-subtle">{check.security?.notice}</p>
              <div className="rb-actions">
                <Button onClick={() => setStep(2)}>{t.Pagination_3}</Button>
                <Button Type="text" onClick={() => setStep(0)}>{t.P09_28}</Button>
              </div>
            </section>
          )}
        </section>
      )}

      {step === 2 && (
        <section className="rb-stack">
          <h2 className="krds-text-body-small-bold">{phrase(t.P09_29)}</h2>
          <p>{phrase(t.P09_30)}</p>
          <div className="rb-actions">
            <LinkButton to="/help#readme">{t.P09_31}</LinkButton>
            {projectId && <LinkButton Type="tertiary" to={`/projects/${projectId}`}>{t.P09_32}</LinkButton>}
            <Button Type="text" onClick={() => setStep(1)}>{t.P09_28}</Button>
          </div>
          <p className="krds-text-body-xsmall rb-subtle">{t.P09_33} <Link to="/my">{t.P09_34}</Link>{t.P09_35}</p>
        </section>
      )}
    </Page>
  );
}
