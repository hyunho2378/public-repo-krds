// 열린 메뉴 하나를 재는 함수 본문(페이지 안에서 실행). check-menus.mjs가 읽어 쓴다.
// UX-007 12장 기준: 항목 높이 32, 항목 줄 수 1, 항목 간격 0, 폭 160~320, 화면 가장자리 12 안, 항목 글자 잘림 없음
(() => {
  const panel = document.querySelector('.rb-menu');
  if (!panel) return { none: true };
  // CSS 변수 값을 실제 픽셀로 바꾸려고 보이지 않는 상자에 적용해 잰다
  const probe = (prop, v) => {
    const d = document.createElement('div');
    d.style.cssText = `position:absolute;visibility:hidden;${prop}:var(${v})`;
    document.body.appendChild(d);
    const n = parseFloat(getComputedStyle(d)[prop]);
    d.remove();
    return n;
  };
  const itemH = probe('height', '--rb-menu-item-h');
  const min = probe('width', '--rb-menu-min-w');
  const max = probe('width', '--rb-menu-max-w');
  const edge = parseFloat(getComputedStyle(panel).scrollMarginTop);
  const vw = document.documentElement.clientWidth;
  const vh = window.innerHeight;
  const out = [];
  const pr = panel.getBoundingClientRect();
  if (pr.width < Math.min(min, vw - edge * 2) - 1 || pr.width > max + 1) out.push(`폭 ${Math.round(pr.width)} (${min}~${max})`);
  if (pr.left < edge - 1 || pr.right > vw - edge + 1) out.push(`가로 가장자리 ${Math.round(pr.left)}~${Math.round(pr.right)} / ${vw}`);
  if ((pr.top < 0 || pr.bottom > vh - edge + 1) && !(panel.scrollHeight > panel.clientHeight)) out.push(`세로 가장자리 ${Math.round(pr.bottom)} / ${vh}`);
  const rows = [...panel.querySelectorAll('.item-link, .rb-menu-item, .rb-side-link, .rb-menu-title')];
  let last = null;
  for (const el of rows) {
    const r = el.getBoundingClientRect();
    const name = el.textContent.trim().slice(0, 14);
    if (Math.abs(r.height - itemH) > 0.6) out.push(`높이 ${r.height.toFixed(1)} ${name}`);
    // 글자 줄 수: 글자 노드의 상자 위치를 줄 높이 절반 단위로 묶는다
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const lh = parseFloat(getComputedStyle(el).lineHeight) || itemH;
    const lines = new Set();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      if (!n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      for (const q of rg.getClientRects()) if (q.width > 0) lines.add(Math.round(q.top / (lh / 2)));
    }
    if (lines.size > 1) out.push(`줄 ${lines.size} ${name}`);
    const holder = [...el.querySelectorAll('span')].find((s) => s.children.length === 0 && s.textContent.trim()) || el;
    if (holder.scrollWidth > holder.clientWidth + 1 && pr.width < max - 1) out.push(`잘림 ${name}`);
    if (last && r.top - last.bottom > 2) out.push(`간격 ${(r.top - last.bottom).toFixed(1)} ${name}`);
    last = r;
  }
  return { count: rows.length, width: Math.round(pr.width), height: Math.round(pr.height), violations: out };
})()
