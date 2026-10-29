// 저장소 화면 공통 도구. 날짜 표시와 페이지 묶음 불러오기.
export const day = (iso) => (iso ? new Date(iso).toLocaleDateString('ko-KR') : '');
export const enc = encodeURIComponent;

export function groupByDay(items, key) {
  const out = [];
  for (const it of items) {
    const d = day(it[key]);
    const last = out[out.length - 1];
    if (last && last.day === d) last.items.push(it);
    else out.push({ day: d, items: [it] });
  }
  return out;
}
