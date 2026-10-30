// G-08b 로그인 실패, G-08c 2단계 인증, G-08d 계정 등록, G-08e 비밀번호 찾기.
// 모두 로그인 화면과 같은 카드 틀을 쓴다. 이 시제품은 아이디와 비밀번호를 받지 않으므로
// 실제 처리는 공공 저장소 화면으로 넘긴다(D-12).
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../copy/ko';
import { phrase } from '../components/Help/Phrase';
import { Page } from '../components/Layout/Page';
import { FormField } from '../components/Input/FormField';

const GITLAB = 'https://gitlab.aigov.go.kr';

function Card({ id, title, children }) {
  return (
    <Page id={id} title={title} state="Ideal">
      <div className="rb-login">
        <div className="rb-login-card" data-figma="login-card">
          <h1 className="krds-text-heading-medium">{title}</h1>
          {children}
          <p className="krds-text-body-small rb-login-signup">
            <Link className="krds-link" to="/login">{t.Login_back}</Link>
          </p>
        </div>
      </div>
    </Page>
  );
}

export function LoginFailed() {
  return (
    <Card id="G-08b" title={t.P10_2}>
      <p className="krds-alert rb-login-notice" role="alert">
        <strong className="krds-text-body-medium-bold">{t.Login_failTitle}</strong>
        <span className="krds-text-body-small">{t.Login_failBody}</span>
      </p>
      <FormField id="fail-id" label={t.P12_idLabel} required value="" readOnly />
      <FormField id="fail-pw" label={t.P12_pwLabel} required type="password" value="" readOnly />
      <Link className="krds-btn medium primary rb-login-submit" to="/login">{t.P12_loginButton}</Link>
    </Card>
  );
}

export function LoginOtp() {
  const [code, setCode] = useState('');
  return (
    <Card id="G-08c" title={t.Login_otpTitle}>
      <p className="krds-text-body-medium">{phrase(t.Login_otpBody)}</p>
      <FormField
        id="otp-code"
        label={t.Login_otpLabel}
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />
      <a className="krds-btn medium primary rb-login-submit" href={`${GITLAB}/users/sign_in`} target="_blank" rel="noreferrer">
        {t.Login_otpSubmit}<span className="sr-only"> {t.Footer_3}</span>
      </a>
    </Card>
  );
}

export function LoginSignup() {
  return (
    <Card id="G-08d" title={t.Login_signupTitle}>
      <p className="krds-text-body-medium">{phrase(t.Login_signupBody)}</p>
      <a className="krds-btn medium primary rb-login-submit" href={`${GITLAB}/users/sign_up`} target="_blank" rel="noreferrer">
        {t.Login_signupGo}<span className="sr-only"> {t.Footer_3}</span>
      </a>
    </Card>
  );
}

export function LoginReset() {
  const [mail, setMail] = useState('');
  return (
    <Card id="G-08e" title={t.Login_resetTitle}>
      <p className="krds-text-body-medium">{phrase(t.Login_resetBody)}</p>
      <FormField id="reset-mail" label={t.Login_resetLabel} required type="email" autoComplete="off" value={mail} onChange={(e) => setMail(e.target.value)} />
      <a className="krds-btn medium primary rb-login-submit" href={`${GITLAB}/users/password/new`} target="_blank" rel="noreferrer">
        {t.Login_resetGo}<span className="sr-only"> {t.Footer_3}</span>
      </a>
    </Card>
  );
}
