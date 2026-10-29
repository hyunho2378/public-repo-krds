// P-12 로그인. 공공 저장소(GitLab) 계정으로 위임 로그인, 끝나면 returnTo로 복귀.
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { Link, useSearchParams } from 'react-router-dom';
import { auth, STATIC_MODE } from '../api/client';
import { Page } from '../components/Layout/Page';

function safe(path) {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

export default function Login() {
  const [params] = useSearchParams();
  const returnTo = safe(params.get('returnTo'));
  return (
    <Page id="P-12" title={t.P10_2}>
      <div className="rb-narrow rb-stack">
        <h1 className="krds-text-heading-xlarge">{phrase(t.P10_2)}</h1>
        <p>{phrase(t.P12_1)}</p>
        {STATIC_MODE ? (
          <div className="krds-alert rb-status" role="status" data-state="Static">
            <p className="krds-text-body-medium-bold">{phrase(t.P12_static)}</p>
          </div>
        ) : (
          <ul className="rb-login-methods">
            <li className="rb-login-method">
              <div className="rb-stack-tight">
                <h2 className="krds-text-heading-small">{phrase(t.P12_methodTitle)}</h2>
                <p className="krds-text-body-medium rb-subtle">{phrase(t.P12_methodDesc)}</p>
              </div>
              <a className="krds-btn medium primary" href={auth.loginUrl(returnTo)}>{t.P12_loginButton}</a>
            </li>
          </ul>
  
        )}
        <p className="krds-text-body-small rb-subtle">{phrase(t.P12_3)}</p>
        <h2 className="krds-text-heading-small">{phrase(t.P12_signupTitle)}</h2>
        <ul className="rb-links">
          <li><a className="krds-link" href="https://gitlab.aigov.go.kr/users/sign_up" target="_blank" rel="noreferrer">{t.P12_4}<span className="sr-only"> {t.Footer_3}</span></a></li>
          <li><a className="krds-link" href="https://gitlab.aigov.go.kr/users/password/new" target="_blank" rel="noreferrer">{t.P12_5}<span className="sr-only"> {t.Footer_3}</span></a></li>
          <li><Link className="krds-link" to={returnTo}>{t.P12_6}</Link></li>
        </ul>
      </div>
    </Page>
  );
}
