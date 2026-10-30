// P-10 내 프로젝트. 로그인 필요. 받은 의견, 점검, 설명서 제안으로 이어진다.
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { auth } from '../api/client';
import { Page } from '../components/Layout/Page';
import { Breadcrumb } from '../components/Navigation/Breadcrumb';
import { LinkButton } from '../components/Action/Button';
import { EmptyState } from '../components/Feedback/Status';

export default function MyProjects() {
  const [session, setSession] = useState(null);
  const location = useLocation();
  useEffect(() => {
    auth.session().then(setSession).catch(() => setSession({ authenticated: false }));
  }, []);
  return (
    <Page id="P-10" title={t.P09_34} state={session?.authenticated ? 'Empty' : 'Login'}>
      <h1 className="krds-text-heading-xlarge" data-figma="section-title">{phrase(t.P09_34)}</h1>
      {!session && <p role="status">{t.P10_1}</p>}
      {session && !session.authenticated && (
        <EmptyState title={t.P10_3} actions={<a className="krds-btn medium primary" href={auth.loginUrl(location.pathname)}>{t.P10_2}</a>} />
      )}
      {session?.authenticated && (
        <EmptyState title={t.P10_4} actions={<LinkButton to="/publish">{t.Header_4}</LinkButton>}>
          {t.P10_linked}
        </EmptyState>
      )}
    </Page>
  );
}
