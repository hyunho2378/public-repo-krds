// D-09 만든 사람 표시. GitLab과 GitHub처럼 공개된 이름을 그대로 보여 준다.
// 공개 목록의 그룹 이름은 "기관 + 담당자 이름"으로 적힌 경우가 많아 기관과 사람을 나눠 둘 다 쓴다.
// 연락처와 이메일은 쓰지 않는다.
import { t } from '../../copy/ko';

const AGENCY = /(특별자치시|특별자치도|광역시|특별시|시|군|구|도|청|부|처|원|공단|공사|센터|교육청|학교|과|팀|본부|소방서|경찰서|위원회|재단|진흥원|연구원|사무소|관리소|청사|국|실)$/;

/** 그룹 이름을 기관과 사람으로 나눈다. { org, person, full } */
export function splitOwner(raw) {
  const full = String(raw || '').trim();
  if (!full) return { org: '', person: '', full: '' };
  const words = full.split(/\s+/);
  const person = [];
  // 끝에서부터 사람 이름(한글 2~4자)이나 영문 이니셜이면 사람 쪽으로 옮긴다
  while (words.length > 1) {
    const last = words[words.length - 1];
    if (/^[A-Z]{2,4}$/.test(last) || (/^[가-힣]{2,4}$/.test(last) && !AGENCY.test(last))) person.unshift(words.pop());
    else break;
  }
  const org = words.join(' ');
  return { org: words.some((w) => AGENCY.test(w)) ? org : '', person: person.join(' '), full };
}

/** 기관 이름. 기관으로 보이지 않으면 전체 이름을 그대로 쓴다(지우지 않는다). */
export function orgLabel(raw) {
  if (!raw) return t.orgUnknown;
  const { org, full } = splitOwner(raw);
  return org || full;
}

/** 만든 사람 이름. 없으면 빈 문자열. */
export function personLabel(raw) {
  return splitOwner(raw).person;
}
