// F-32 써 봤어요. 로그인 안 되어 있으면 이유 안내 모달(U5), 되어 있으면 기록 양식. 저장 후 완료 알림.
import { t } from '../../copy/ko';
import { useEffect, useState } from 'react';
import { auth, product } from '../../api/client';
import { LoginRequiredModal } from '../../components/Feedback/LoginRequiredModal';
import { FormField, requireFields } from '../../components/Input/FormField';
import { Button } from '../../components/Action/Button';

export function ReuseAction({ id, onClose }) {
  const [session, setSession] = useState(null);
  const [org, setOrg] = useState('');
  const [date, setDate] = useState('');
  const [message, setMessage] = useState('');
  const [errors, setErrors] = useState({});
  useEffect(() => {
    auth.session().then(setSession).catch(() => setSession({ authenticated: false }));
  }, []);
  if (!session) return <p role="status">{t.P10_1}</p>;
  if (!session.authenticated) return <LoginRequiredModal action={t.P07_7} onClose={onClose} />;
  async function submit(e) {
    e.preventDefault();
    const found = requireFields({ org, date }, { org: 'reuse-org', date: 'reuse-date' });
    if (!found.date && !/^\d{4}-\d{2}-\d{2}$/.test(date)) found.date = t.err_date;
    setErrors(found);
    if (Object.keys(found).length) return;
    try {
      await product.post(`/projects/${id}/reuses`, { organizationId: org, usedAt: date });
      setMessage(session.user?.dev ? t.ReuseAction_1 : t.ReuseAction_2);
    } catch (err) {
      setMessage(err.message);
    }
  }
  return (
    <form className="rb-stack rb-form" onSubmit={submit} noValidate>
      <h3 className="krds-text-body-small-bold">{t.P07_7}</h3>
      <FormField id="reuse-org" label={t.ReuseAction_3} required value={org} error={errors.org} onChange={(e) => setOrg(e.target.value)} />
      <FormField id="reuse-date" label={t.ReuseAction_4} required placeholder={t.ReuseAction_5} value={date} error={errors.date} onChange={(e) => setDate(e.target.value)} />
      <div className="rb-actions">
        <Button type="submit">{t.ReuseAction_6}</Button>
        <Button Type="text" onClick={onClose}>{t.ReuseAction_7}</Button>
      </div>
      <p role="status" className={message ? 'krds-text-body-small' : 'sr-only'}>{message}</p>
    </form>
  );
}
