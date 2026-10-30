// 프로젝트 설명 한 줄 정리(UX/07 10장). 설명을 화면에 그리는 곳은 모두 이 함수를 거친다(audit:code가 검사).
// 1) 앞의 [분류] 표기와 둘째 줄 이후 삭제  2) ' | '로 나뉜 영어 병기(한글이 없는 조각)는 삭제.
//    한글 조각이 둘 이상이면 ' / '로 잇는다. README 같은 원문 본문에는 쓰지 않는다.
export function cleanDescription(text) {
  const first = (text || '').replace(/^\s*\[[^\]]+\]\s*/, '').split(/\r?\n/)[0];
  if (!first.includes(' | ')) return first;
  const parts = first.split(' | ').map((s) => s.trim()).filter(Boolean);
  const korean = parts.filter((s) => /[가-힣]/.test(s));
  return (korean.length ? korean : parts.slice(0, 1)).join(' / ');
}
