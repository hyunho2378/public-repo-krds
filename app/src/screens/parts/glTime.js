// 공공 깃랩 상대 시간('3 개월 전', '4 일 전')
export function ago(iso) {
  if (!iso) return '';
  const s = Math.max(0, (Date.now() - new Date(iso).getTime()) / 1000);
  const units = [['년', 31536000], ['개월', 2592000], ['일', 86400], ['시간', 3600], ['분', 60]];
  for (const [n, sec] of units) if (s >= sec) return `${Math.floor(s / sec)} ${n} 전`;
  return '1 분 전';
}
