// 로그인 상태와 권한을 한곳에서 정한다(D-10). Figma 속성 auth, role과 같은 이름을 쓴다.
// 개발 모드에서는 ?auth=, ?role= 로 바꿔 Figma 변형과 대조한다. 배포본에서는 실제 세션만 본다.
import { useEffect, useState } from 'react';
import { auth as authApi } from '../../api/client';
import { devAuth, devRole } from '../../api/devState';

export function useAuth() {
  const forcedAuth = devAuth();
  const forcedRole = devRole();
  const [session, setSession] = useState(null);
  useEffect(() => {
    if (forcedAuth) return undefined;
    let live = true;
    authApi.session().then((s) => live && setSession(s)).catch(() => live && setSession({}));
    return () => { live = false; };
  }, [forcedAuth]);
  const signedIn = forcedAuth ? forcedAuth === 'Signed-in' : !!session?.user;
  return {
    auth: signedIn ? 'Signed-in' : 'Guest',
    signedIn,
    role: signedIn ? forcedRole || session?.role || 'viewer' : null,
    user: session?.user || null,
    // 세션 확인이 끝났는지(없는 주소를 로그인으로 보낼 때 깜빡임 방지)
    ready: !!forcedAuth || session !== null,
  };
}

/** 권한이 기준 이상인지. viewer < developer < owner */
export function atLeast(role, need) {
  const order = ['viewer', 'developer', 'owner'];
  return order.indexOf(role) >= order.indexOf(need);
}
