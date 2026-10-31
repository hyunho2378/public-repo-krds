// G-08b 로그인 실패, G-08c 2단계 인증, G-08d 계정 등록, G-08e 비밀번호 찾기.
// 모두 로그인 화면과 같은 카드 틀을 쓴다. 이 시제품은 아이디와 비밀번호를 받지 않으므로
// 실제 처리는 공공 저장소 화면으로 넘긴다(D-12).
import { newWindow } from '../components/Layout/newWindow';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../copy/ko';
import { phrase } from '../components/Help/Phrase';
import { Page } from '../components/Layout/Page';
import { FormField } from '../components/Input/FormField';
import { LoginSide } from './P12_Login';

const GITLAB = 'https://gitlab.aigov.go.kr';

// Figma G-08b~e: 로그인 화면과 같은 두 열 틀(왼쪽 로고·공지, 세로선, 오른쪽 카드 440). 카드 제목 24/32
function Card({ id, title, children }) {
  return (
    <Page id={id} title={title} state="Ideal">
      <div className="rb-login3">
        <LoginSide />
        <span className="rb-login3-divider" data-figma="login-divider" aria-hidden="true" />
        <div className="rb-login3-main" data-figma="login-card">
          <h1 className="rb-login3-title">{title}</h1>
          {children}
        </div>
      </div>
    </Page>
  );
}

export function LoginFailed() {
  return (
    <Card id="G-08b" title={t.P10_2}>
      <p className="rb-login3-alert" role="alert">{t.Login_failBody}</p>
      <div className="rb-login-form">
        <FormField figma="login-field" id="fail-id" label={t.P12_idLabel} required value="" readOnly placeholder={t.P12_idLabel} />
        <FormField figma="login-field" id="fail-pw" label={t.P12_pwLabel} required type="password" value="" readOnly placeholder={t.P12_pwLabel} />
        <div className="rb-login-row" data-figma="login-options">
          <div className="krds-form-check"><input id="fail-keep" type="checkbox" /><label htmlFor="fail-keep">{t.P12_keep}</label></div>
          <a className="krds-link" href={`${GITLAB}/users/password/new`} {...newWindow(String(t.P12_5))}>{t.P12_5}</a>
        </div>
        <p className="krds-text-body-xsmall rb-subtle" data-figma="login-fact">{phrase(t.P12_noStore)}</p>
        <Link className="krds-btn large primary rb-login-submit" to="/login">{t.P12_loginButton}</Link>
      </div>
      <a className="krds-btn large tertiary rb-login-submit" href={`${GITLAB}/users/sign_in`} {...newWindow(String(t.P12_passkeyButton2))}>{t.P12_passkeyButton2}</a>
      <p className="krds-text-body-small rb-login-signup" data-figma="login-join">
        {t.P12_signupAsk}{' '}
        <a className="krds-link" href={`${GITLAB}/users/sign_up`} {...newWindow(String(t.P12_signupNow))}>{t.P12_signupNow}</a>
      </p>
    </Card>
  );
}

export function LoginOtp() {
  const [code, setCode] = useState('');
  return (
    <Card id="G-08c" title={t.Login_otpTitle}>
      <p className="krds-text-body-small rb-subtle">{phrase(t.Login_otpBody)}</p>
      <FormField
        figma="login-field"
        hint={t.Login_otpHint}
        placeholder="000000"
        id="otp-code"
        label={t.Login_otpLabel}
        required
        inputMode="numeric"
        autoComplete="one-time-code"
        value={code}
        onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
      />
      <a className="krds-btn large primary rb-login-submit" href={`${GITLAB}/users/sign_in`} {...newWindow(String(t.Login_otpSubmit))}>{t.Login_otpSubmit}</a>
      <a className="krds-btn large tertiary rb-login-submit" href={`${GITLAB}/users/sign_in`} {...newWindow(String(t.Login_otpResend))}>{t.Login_otpResend}</a>
    </Card>
  );
}

export function LoginSignup() {
  return (
    <Card id="G-08d" title={t.Login_signupTitle}>
      <FormField figma="login-field" id="su-mail" label={t.Login_suMail} required type="email" autoComplete="off" placeholder={t.Login_suMailPh} hint={t.Login_suMailHint} />
      <FormField figma="login-field" id="su-name" label={t.Login_suName} required autoComplete="off" placeholder={t.Login_suNamePh} />
      <FormField figma="login-field" id="su-pw" label={t.P12_pwLabel} required type="password" autoComplete="off" placeholder={t.P12_pwLabel} />
      <FormField figma="login-field" id="su-pw2" label={t.Login_suPw2} required type="password" autoComplete="off" placeholder={t.Login_suPw2} />
      <p className="krds-text-body-xsmall rb-subtle">{phrase(t.Login_signupBody)}</p>
      <a className="krds-btn large primary rb-login-submit" href={`${GITLAB}/users/sign_up`} {...newWindow(String(t.Login_signupGo))}>{t.Login_signupGo}</a>
    </Card>
  );
}

export function LoginReset() {
  const [mail, setMail] = useState('');
  return (
    <Card id="G-08e" title={t.Login_resetTitle}>
      <p className="krds-text-body-small rb-subtle">{phrase(t.Login_resetBody)}</p>
      <FormField figma="login-field" id="reset-mail" label={t.Login_resetLabel} required type="email" autoComplete="off" placeholder={t.Login_suMailPh} value={mail} onChange={(e) => setMail(e.target.value)} />
      <a className="krds-btn large primary rb-login-submit" href={`${GITLAB}/users/password/new`} {...newWindow(String(t.Login_resetGo))}>{t.Login_resetGo}</a>
      <Link className="krds-btn large tertiary rb-login-submit" to="/login">{t.Login_back}</Link>
    </Card>
  );
}
