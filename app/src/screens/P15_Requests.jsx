// P-15 요청 보드(F-35). 목록, 공감, 작성. 쓰기는 로그인 필요.
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { auth, product } from '../api/client';
import { useData } from '../api/useData';
import { hasData } from '../api/devState';
import { Page } from '../components/Layout/Page';
import { Breadcrumb } from '../components/Navigation/Breadcrumb';
import { Status, EmptyState } from '../components/Feedback/Status';
import { LoginRequiredModal } from '../components/Feedback/LoginRequiredModal';
import { FormField, requireFields } from '../components/Input/FormField';
import { Button } from '../components/Action/Button';
import { rq } from '../copy/work';
import './parts/glRepo.css';

const FIELDS = [
  ['task', t.P15_1, t.P15_2],
  ['currentProcess', t.P15_3, t.P15_4],
  ['expectedOutcome', t.P15_5, t.P15_6],
];

export default function Requests() {
  const [params, setParams] = useSearchParams();
  const list = useData(() => product.get('/requests'), [], (d) => !d.data.items.length);
  const [session, setSession] = useState(null);
  const [needLogin, setNeedLogin] = useState('');
  const [form, setForm] = useState({ task: params.get('q') || '', currentProcess: '', expectedOutcome: '' });
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  const writing = params.get('new') === '1';
  const [order, setOrder] = useState('votes');

  useEffect(() => {
    auth.session().then(setSession).catch(() => setSession({ authenticated: false }));
  }, []);

  function startWrite() {
    if (!session?.authenticated) return setNeedLogin(t.P15_7);
    setParams({ new: '1' });
  }
  async function vote(id) {
    if (!session?.authenticated) return setNeedLogin(t.P15_8);
    await product.post(`/requests/${id}/votes`, {});
    list.retry();
  }
  async function submit(e) {
    e.preventDefault();
    const found = requireFields(form, Object.fromEntries(FIELDS.map(([k]) => [k, `req-${k}`])));
    setErrors(found);
    if (Object.keys(found).length) return;
    if (!session?.authenticated) return setNeedLogin(t.P15_7);
    try {
      await product.post('/requests', form);
      setMessage(t.P15_9);
      setParams({});
      list.retry();
    } catch (err) {
      setMessage(err.message);
    }
  }

  return (
    <Page id="A-05" title={t.Header_3} state={writing ? 'Write' : list.state}>
      <h1 className="krds-text-heading-small" data-figma="page-head">{phrase(t.Header_3)}</h1>
      <p className="rb-subtle">{phrase(t.P15_10)}</p>
      {message && <p role="status" className="krds-text-body-small">{message}</p>}
      {writing ? (
        <form className="rb-stack rb-form" onSubmit={submit} noValidate>
          {FIELDS.map(([k, label, ph]) => (
            <FormField key={k} id={`req-${k}`} label={label} required multiline placeholder={ph} value={form[k]} maxLength={3000} error={errors[k]} onChange={(e) => setForm({ ...form, [k]: e.target.value })} />
          ))}
          <div className="rb-actions">
            <Button type="submit" >{t.P15_11}</Button>
            <Button Type="text" onClick={() => setParams({})}>{t.P15_12}</Button>
          </div>
        </form>
      ) : (
        <>
          <div className="gl-tabs gl-tabs-req" data-figma="tabs" role="tablist">
            {[['votes', rq.byVotes], ['recent', rq.recent], ['mine', rq.mine(session?.authenticated ? (list.data?.data?.items || []).filter((r) => r.mine).length : 0)]].map(([k, n]) => (
              <button key={k} type="button" role="tab" aria-selected={order === k} className={'gl-tab' + (order === k ? ' active' : '')} onClick={() => setOrder(k)}>{n}</button>
            ))}
          </div>
          <div className="rb-actions"><Button onClick={startWrite}>{t.P02_12}</Button></div>
          <Status {...list} />
          {list.state === 'Empty' && <EmptyState title={t.P15_14}>{t.P15_13}</EmptyState>}
          {hasData(list.state) && (
            <ul className="krds-structured-list rb-list">
              {[...list.data.data.items].filter((r) => order !== 'mine' || r.mine).sort((a, b) => (order === 'votes' ? (b.votes || 0) - (a.votes || 0) : new Date(b.createdAt || 0) - new Date(a.createdAt || 0))).map((r) => (
                <li className="structured-item rb-list-link" key={r.id}>
                  <span className="krds-text-body-small-bold">{r.task}</span>
                  <span className="krds-text-body-xsmall rb-subtle">{r.currentProcess}</span>
                  <Button Type="tertiary" Size="small" onClick={() => vote(r.id)}>{t.fn.votes(r.votes)}</Button>
                </li>
              ))}
            </ul>
          )}
        </>
      )}
      {needLogin && <LoginRequiredModal action={needLogin} onClose={() => setNeedLogin('')} />}
    </Page>
  );
}
