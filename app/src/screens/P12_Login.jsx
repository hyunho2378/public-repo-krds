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
import { MoisLogo } from '../components/Identity/MoisLogo';
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

  // Figma G-08(사용자 기준, D-12): 시스템 띠 아래 두 열과 바닥글. 왼쪽 열은 행정안전부 로고(판 없음)를 가운데 두고 그 아래 공지 블록,
  // 열 전체가 위아래 가운데. 두 열 사이 가는 세로선. 오른쪽 열은 로그인 제목, 입력, 상태 유지와 비밀번호 찾기 한 줄, 로그인(채움), 패스키(윤곽), 등록 안내.
  // 공지 문구는 공공 깃랩 로그인 공지(2026. 10. 31. 19:50 다시 읽음, 지난 점검 공지가 아직 남아 있음)를 따른다
  const reason = params.get('reason');
  return (
    <Page id="G-08" title={t.P10_2} state="Ideal">
      <div className="rb-login3">
        <LoginSide />
        <span className="rb-login3-divider" data-figma="login-divider" aria-hidden="true" />
        <div className="rb-login3-main" data-figma="login-card">
          <h1 className="rb-login3-title">{t.P10_2}</h1>
          {reason === 'auth' ? <p className="rb-login2-alert" role="alert">{u.Login_needAuth}</p> : null}
          <form className="rb-login-form" onSubmit={submit}>
            <FormField figma="login-field" id="login-id" label={t.P12_idLabel} required value={id} onChange={(e) => setId(e.target.value)} autoComplete="off" placeholder={t.P12_idLabel} />
            <FormField figma="login-field" id="login-pw" label={t.P12_pwLabel} required type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" placeholder={t.P12_pwLabel} />
            <div className="rb-login-row" data-figma="login-options">
              <div className="krds-form-check">
                <input id="login-keep" type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
                <label htmlFor="login-keep">{t.P12_keep}</label>
              </div>
              <a className="krds-link" href={`${GITLAB}/users/password/new`} {...newWindow(String(t.P12_5))}>{t.P12_5}</a>
            </div>
            <p className="krds-text-body-xsmall rb-subtle" data-figma="login-fact">{phrase(t.P12_noStore)}</p>
            <button type="submit" className="krds-btn large primary rb-login-submit">{t.P12_loginButton}</button>
          </form>
          <a className="krds-btn large tertiary rb-login-submit" href={`${GITLAB}/users/sign_in`} {...newWindow(String(t.P12_passkeyButton2))}>{t.P12_passkeyButton2}</a>
          <p className="krds-text-body-small rb-login-signup" data-figma="login-join">
            {t.P12_signupAsk}{' '}
            <a className="krds-link" href={`${GITLAB}/users/sign_up`} {...newWindow(String(t.P12_signupNow))}>{t.P12_signupNow}</a>
          </p>
        </div>
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

/** Figma G-08 왼쪽 열(행정안전부 로고 + 공지)과 세로선. 로그인 변형(G-08b~e)도 같은 틀을 쓴다 */
export function LoginSide() {
  return (
    <>
          <section className="rb-login3-side" aria-labelledby="login-notice-head">
            <div className="rb-login3-side-in" data-figma="login-notice">
            <MoisLogo label={u.Login_moisAlt} figma="login-logo" />
            {u.Login_notice.length ? (
              <div className="rb-login3-notice" role="status" data-figma="notice-block">
                <h2 id="login-notice-head" className="rb-login3-notice-head">{u.Login_noticeHead}</h2>
                <p className="rb-login3-notice-title">{u.Login_notice[0]}</p>
                <p className="rb-login3-notice-date">{u.Login_notice[1]}</p>
                {u.Login_notice.slice(2).map((line, i) => <p key={line} className={i === 1 ? 'is-subtle' : undefined}>{line}</p>)}
              </div>
            ) : null}
            </div>
          </section>
    </>
  );
}
