// 로그인 화면(G-08) 화면 안 검사: 로고가 왼쪽 열에만 있는지, 1024 이상에서 두 열의 세로 가운데 차이가 2px 이하인지. 결과 { bad, cyDiff }
(() => {
  const bad = [];
  const side = document.querySelector('.rb-login3-side');
  const main = document.querySelector('.rb-login3-main');
  if (!side || !main) return { bad: ['로그인 두 열 없음'] };
  if (!side.querySelector('.rb-mois-logo')) bad.push('왼쪽 열에 로고 없음');
  if (main.querySelector('.rb-mois-logo')) bad.push('오른쪽 열에 로고 있음');
  let top = Infinity, bot = -Infinity;
  for (const k of side.children) { const b = k.getBoundingClientRect(); top = Math.min(top, b.top); bot = Math.max(bot, b.bottom); }
  const m = main.getBoundingClientRect();
  const cyDiff = Math.round(((m.top + m.bottom) / 2 - (top + bot) / 2) * 10) / 10;
  if (innerWidth >= 1024 && Math.abs(cyDiff) > 2) bad.push(`두 열 세로 가운데 차이 ${cyDiff}`);
  return { bad, cyDiff };
})();
