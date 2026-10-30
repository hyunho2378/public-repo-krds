// 아이콘 단독 버튼 검사(페이지 안에서 실행): 보이는 글자 없이 아이콘만 있는 button/a의 가로 세로가 짝수인지, 아이콘 상자 중심과 버튼 중심 차이가 0.5px 이하인지 잰다.
// 아이콘: .rb-icon(KRDS 아이콘 마스크 span), svg, i.svg-icon. 글자는 .sr-only 빼고 센다.
(() => {
  const out = [];
  const seen = [];
  const vis = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.right > 0 && r.left < innerWidth; };
  const textOf = (b) => { const c = b.cloneNode(true); c.querySelectorAll('.sr-only').forEach((x) => x.remove()); return c.textContent.replace(/\s+/g, ''); };
  const name = (e) => `${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className).split(' ').filter(Boolean).slice(0, 2).join('.')}`.slice(0, 60);
  for (const b of document.querySelectorAll('button, a.krds-btn, a.rb-gbar-btn, summary')) {
    if (!vis(b)) continue;
    const icons = [...b.querySelectorAll('.rb-icon, svg, i.svg-icon')].filter(vis);
    if (!icons.length || textOf(b)) continue;
    // 한 아이콘만 있는 경우만(꺾쇠가 붙은 메뉴 단추 등은 글자 단추로 본다)
    if (icons.length > 1) continue;
    const r = b.getBoundingClientRect();
    const ir = icons[0].getBoundingClientRect();
    const dw = Math.abs((r.left + r.width / 2) - (ir.left + ir.width / 2));
    const dh = Math.abs((r.top + r.height / 2) - (ir.top + ir.height / 2));
    const w = Math.round(r.width * 100) / 100; const h = Math.round(r.height * 100) / 100;
    const probs = [];
    if (Math.abs(w - Math.round(w)) > 0.01 || Math.round(w) % 2) probs.push(`가로 ${w}`);
    if (Math.abs(h - Math.round(h)) > 0.01 || Math.round(h) % 2) probs.push(`세로 ${h}`);
    if (dw > 0.5) probs.push(`가로 중심차 ${dw.toFixed(1)}`);
    if (dh > 0.5) probs.push(`세로 중심차 ${dh.toFixed(1)}`);
    const key = name(b) + probs.join();
    if (probs.length && !seen.includes(key)) { seen.push(key); out.push(`${name(b)} ${w}x${h} ${probs.join(', ')} "${(b.getAttribute('aria-label') || b.title || b.textContent || '').trim().slice(0, 12)}"`); }
  }
  return out;
})()
