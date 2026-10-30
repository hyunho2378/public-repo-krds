// G-08 로그인. Figma G-08 구성 그대로(점검 공지, 아이디 또는 이메일, 비밀번호, 로그인 상태 유지,
// 비밀번호 찾기, 로그인, 패스키로 로그인, 등록 안내).
// 중요: 이 시제품은 아이디와 비밀번호를 받지 않는다. 적은 값은 어디에도 보내지 않고,
// 로그인은 공공 저장소(GitLab) 계정 위임으로만 처리한다(D-12).
import { newWindow } from '../components/Layout/newWindow';
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { u } from '../copy/ui';
import { phrase } from '../components/Help/Phrase';
import { auth, STATIC_MODE } from '../api/client';
import { Page } from '../components/Layout/Page';
import { FormField } from '../components/Input/FormField';

const GITLAB = 'https://gitlab.aigov.go.kr';

function safe(path) {
  return path && path.startsWith('/') && !path.startsWith('//') ? path : '/';
}

export default function Login() {
  const [params] = useSearchParams();
  const returnTo = safe(params.get('returnTo'));
  const [id, setId] = useState('');
  const [pw, setPw] = useState('');
  const [keep, setKeep] = useState(false);
  const [showStatic, setShowStatic] = useState(false);

  // 적은 값은 보내지 않는다. 공공 저장소 로그인 화면으로 넘긴다.
  const submit = (e) => {
    e.preventDefault();
    setPw('');
    if (STATIC_MODE) {
      setShowStatic(true);
      return;
    }
    window.location.href = auth.loginUrl(returnTo);
  };

  return (
    <Page id="G-08" title={t.P10_2} state="Ideal">
      <div className="rb-login">
        {t.P12_notice ? (
          <section className="rb-login-notice" aria-labelledby="login-notice-title">
            <h2 id="login-notice-title" className="krds-text-body-small-bold">{u.Login_noticeTitle}</h2>
            <p role="status">
              <span className="rb-status-text is-warning"><i className="rb-status-dot" aria-hidden="true" />{t.P12_notice}</span>
            </p>
            <Link className="krds-link" to="/register">{u.Login_noticeLink}</Link>
          </section>
        ) : null}
        <h1 className="krds-text-heading-medium">{t.P10_2}</h1>
        <form className="rb-login-form" onSubmit={submit}>
          <FormField
            id="login-id"
            label={t.P12_idLabel}
            required
            value={id}
            onChange={(e) => setId(e.target.value)}
            autoComplete="off"
            placeholder={t.P12_idLabel}
          />
          <FormField
            id="login-pw"
            label={t.P12_pwLabel}
            required
            type="password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            autoComplete="off"
            placeholder={t.P12_pwLabel}
          />
          <div className="rb-login-row">
            <div className="krds-form-check">
              <input id="login-keep" type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
              <label htmlFor="login-keep">{t.P12_keep}</label>
            </div>
            <a className="krds-link" href={`${GITLAB}/users/password/new`} {...newWindow(String(t.P12_5))}>{t.P12_5}
            </a>
          </div>
          <p className="krds-text-body-xsmall rb-subtle">{phrase(t.P12_noStore)}</p>
          <button type="submit" className="krds-btn medium primary rb-login-submit">{t.P12_loginButton}</button>
        </form>
        <a className="krds-btn medium tertiary rb-login-submit" href={`${GITLAB}/users/sign_in`} {...newWindow(String(t.P12_passkeyButton2))}>{t.P12_passkeyButton2}
        </a>
        <p className="krds-text-body-xsmall rb-login-signup">
          {t.P12_signupAsk}{' '}
          <a className="krds-link" href={`${GITLAB}/users/sign_up`} {...newWindow(String(t.P12_signupNow))}>{t.P12_signupNow}
          </a>
        </p>
        {showStatic ? (
          <div className="rb-modal-dim" role="presentation">
            <div className="rb-modal" role="dialog" aria-modal="true" aria-labelledby="login-static">
              <h2 id="login-static" className="krds-text-heading-small">{t.Write_cannotTitle}</h2>
              <p className="krds-text-body-small">{phrase(t.P12_static)}</p>
              <div className="rb-modal-actions">
                <button type="button" className="krds-btn medium tertiary" onClick={() => setShowStatic(false)}>{t.Commit_cancel}</button>
                <Link className="krds-btn medium primary" to={returnTo}>{t.P12_6}</Link>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    </Page>
  );
}
