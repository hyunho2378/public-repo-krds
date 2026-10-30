// D-17 1장, 5장: 화면 종류. 왼쪽 메뉴와 오른쪽 정보 영역의 기본 열림 상태를 정한다.
//  home   저장소 홈(정보 열림 기본)
//  list   목록 화면(정보 닫힘 기본, 머리 줄의 정보 버튼으로 연다)
//  detail 상세 화면(파일 보기, 커밋 상세, 비교, 이슈/변경 제안 상세, 쓰기). 왼쪽 접힘, 정보 영역 없음
const DETAIL = /\/code\/.+|\/changes\/[^/]+$|\/compare|\/issues\/\d+|\/merge-requests\/\d+|\/new$|\/upload$|\/edit$/;
const HOME = /^\/projects\/[^/]+(\/code)?\/?$/;
// 소개와 공개 준비 점검 화면은 판단 정보를 본문에 이미 펼쳐 두므로 정보 영역이 없다
const OWN_INFO = /\/(about|publish-check)$/;

export function screenKind(pathname) {
  if (HOME.test(pathname)) return 'home';
  if (DETAIL.test(pathname)) return 'detail';
  return 'list';
}

export function infoMode(pathname) {
  const kind = screenKind(pathname);
  if (kind === 'detail' || OWN_INFO.test(pathname)) return 'none';
  return kind;
}

// D-18: 왼쪽 메뉴는 전역 개인 목록(내 작업, 알림)에서만 펼쳐 둔다. 그 밖의 화면은 768 미만 서랍으로만 쓴다.
const PERSONAL = /^\/(my|notifications|requests|collaborate)\/?$/;
export function sidebarMode(pathname, bare) {
  if (bare) return 'none';
  return PERSONAL.test(pathname) ? 'full' : 'drawer';
}

/** 저장소 화면의 프로젝트 번호. 저장소가 아니면 null. */
export function projectIdOf(pathname) {
  const m = /^\/projects\/(\d+)(?:\/|$)/.exec(pathname);
  return m ? m[1] : null;
}
