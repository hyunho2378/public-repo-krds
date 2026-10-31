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

  // 공공 깃랩 로그인 공지 방식: 제목(굵게), 날짜(13 보조색). 점이나 색 아이콘은 쓰지 않는다
  const [noticeTitle, noticeDate] = String(t.P12_notice || '').split(': ');
  // 공공 깃랩 로그인(2026. 10. 31. 실측 1440): 상단 바와 사이드바 없이 시스템 띠 아래 두 열. 왼쪽 서비스 이름(19 굵게)과 공지, 오른쪽 행정안전부 표지, 입력, 로그인(밝은 채움), 패스키(회색 채움), 등록 안내. 맨 아래 작은 링크(탐색, 도움말)
  const reason = params.get('reason');
  return (
    <Page id="G-08" title={t.P10_2} state="Ideal">
      <div className="rb-login2">
        <section className="rb-login2-side" aria-labelledby="login-service">
          <h1 id="login-service" className="rb-login2-title">{u.Login_service}</h1>
          {t.P12_notice ? (
            <div className="rb-login2-notice" role="status">
              <p>{noticeTitle}</p>
              {noticeDate ? <p>{noticeDate}</p> : null}
            </div>
          ) : null}
        </section>
        <div className="rb-login2-main">
          <MoisLogo label={u.Login_moisAlt} />
          {reason === 'auth' ? <p className="rb-login2-alert" role="alert">{u.Login_needAuth}</p> : null}
          <h2 className="sr-only">{t.P10_2}</h2>
          <form className="rb-login-form" onSubmit={submit}>
            <FormField id="login-id" label={t.P12_idLabel} required value={id} onChange={(e) => setId(e.target.value)} autoComplete="off" />
            <FormField id="login-pw" label={t.P12_pwLabel} required type="password" value={pw} onChange={(e) => setPw(e.target.value)} autoComplete="off" />
            <a className="krds-link rb-login2-forgot" href={`${GITLAB}/users/password/new`} {...newWindow(String(t.P12_5))}>{t.P12_5}</a>
            <div className="krds-form-check">
              <input id="login-keep" type="checkbox" checked={keep} onChange={(e) => setKeep(e.target.checked)} />
              <label htmlFor="login-keep">{t.P12_keep}</label>
            </div>
            <p className="krds-text-body-xsmall rb-subtle">{phrase(t.P12_noStore)}</p>
            <button type="submit" className="rb-btn-light rb-login-submit">{t.P12_loginButton}</button>
          </form>
          <a className="rb-btn-fill rb-login-submit" href={`${GITLAB}/users/sign_in`} {...newWindow(String(t.P12_passkeyButton2))}>{t.P12_passkeyButton2}</a>
          <p className="krds-text-body-small rb-login-signup">
            {t.P12_signupAsk}{' '}
            <a className="krds-link" href={`${GITLAB}/users/sign_up`} {...newWindow(String(t.P12_signupNow))}>{t.P12_signupNow}</a>
          </p>
        </div>
        <nav className="rb-login2-links" aria-label={u.Login_links}>
          <Link to="/">{u.G_explore}</Link>
          <Link to="/help">{t.Header_5}</Link>
        </nav>
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
