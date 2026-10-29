// 목록과 머리에 보이는 기관 이름(U9 개인정보 비노출). 공개 목록의 그룹 이름이 기관이 아니거나
// 끝에 담당자 이름, 이니셜이 붙은 경우를 걸러 낸다. 판단할 수 없으면 "기관 정보 없음".
import { t } from '../../copy/ko';

const AGENCY = /(특별자치시|특별자치도|광역시|특별시|시|군|구|도|청|부|처|원|공단|공사|센터|교육청|학교|과|팀|본부|소방서|경찰서|위원회|재단|진흥원|연구원|사무소|관리소|청사|국|실)$/;

export function orgLabel(raw) {
  if (!raw) return t.orgUnknown;
  const words = String(raw).trim().split(/\s+/);
  // 끝 단어가 한글 2~4자 사람 이름처럼 보이거나 영문 대문자 이니셜이면 뗀다
  while (words.length > 1) {
    const last = words[words.length - 1];
    if (/^[A-Z]{2,4}$/.test(last) || (/^[가-힣]{2,4}$/.test(last) && !AGENCY.test(last))) words.pop();
    else break;
  }
  const name = words.join(' ');
  return words.some((w) => AGENCY.test(w)) ? name : t.orgUnknown;
}
