// P-08 의견과 개선 요청(F-31). 양식을 먼저 고르고(오류 신고, 기능 요청, 도입 문의), 로그인 필요 시 이유 안내 후 복귀.
import { t } from '../copy/ko';
import { FieldsetTitle } from '../components/Input/FieldsetTitle';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auth, product } from '../api/client';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { LoginRequiredModal } from '../components/Feedback/LoginRequiredModal';
import { FormField, requireFields } from '../components/Input/FormField';
import { Button } from '../components/Action/Button';

const TYPES = [
  ['bug', t.P08_1, t.P08_2],
  ['feature', t.P08_3, t.P08_4],
  ['adoption', t.P08_5, t.P08_6],
];
const PRESET = { readme: 'feature', inquiry: 'adoption', feature: 'feature' };

export default function Feedback() {
  const data = useProject();
  const [params] = useSearchParams();
  const [type, setType] = useState(PRESET[params.get('type')] || '');
  const [title, setTitle] = useState(params.get('type') === 'readme' ? t.P08_7 : '');
  const [body, setBody] = useState('');
  const [session, setSession] = useState(null);
  const [needLogin, setNeedLogin] = useState(false);
  const [done, setDone] = useState(null);
  const [error, setError] = useState('');
  const [errors, setErrors] = useState({});

  useEffect(() => {
    auth.session().then(setSession).catch(() => setSession({ authenticated: false }));
  }, []);
  if (!data.data) return <ProjectFrame screenId="P-08" data={data} />;

  async function submit(e) {
    e.preventDefault();
    setError('');
    const found = requireFields({ title, body }, { title: 'fb-title', body: 'fb-body' });
    setErrors(found);
    if (Object.keys(found).length) return;
    if (!session?.authenticated) return setNeedLogin(true);
    try {
      setDone((await product.post(`/projects/${data.id}/feedback`, { type, title, body })).data);
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <ProjectFrame screenId="P-08" tab="/feedback" tabLabel={t.ProjectTabs_5} data={data} state={done ? 'Done' : type ? 'Write' : 'Ideal'}>
      {done ? (
        <div className="krds-alert rb-status" role="status" data-state="Done">
          <h2 className="krds-text-heading-medium">{t.P08_8}</h2>
          <p>{done.notice}</p>
          <Button Type="secondary" onClick={() => { setDone(null); setBody(''); setTitle(''); }}>{t.P08_9}</Button>
        </div>
      ) : (
        <form className="rb-stack rb-form" onSubmit={submit} noValidate>
          <fieldset className="rb-stack">
            <FieldsetTitle className="krds-text-heading-medium">{t.P08_10}</FieldsetTitle>
            {TYPES.map(([v, label, hint]) => (
              <div className="krds-form-check" key={v}>
                <input id={`type-${v}`} type="radio" name="type" checked={type === v} onChange={() => setType(v)} aria-describedby={`type-${v}-hint`} />
                <label htmlFor={`type-${v}`}>{label}</label>
                <p id={`type-${v}-hint`} className="krds-text-body-small rb-subtle">{hint}</p>
              </div>
            ))}
          </fieldset>
          {type && (
            <>
              <FormField id="fb-title" label={t.P08_11} required value={title} maxLength={200} error={errors.title} onChange={(e) => setTitle(e.target.value)} />
              <FormField id="fb-body" label={t.P08_12} required multiline value={body} maxLength={10000} hint={t.P08_13} error={errors.body} onChange={(e) => setBody(e.target.value)} />
              {error && <p role="alert" className="rb-error">{error}</p>}
              <Button type="submit">{t.P08_14}</Button>
            </>
          )}
        </form>
      )}
      {needLogin && <LoginRequiredModal action={t.P08_15} onClose={() => setNeedLogin(false)} />}
    </ProjectFrame>
  );
}
