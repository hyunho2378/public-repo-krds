// 연속 폭 점검: 한 화면을 한 폭에서 재는 함수 본문(페이지 안에서 실행). check-fluid.mjs와 REPL 점검이 함께 읽는다.
// 종류: A 가로 넘침, B 요소 겹침, C 한 글자 줄바꿈, K 마지막 줄 한 어절(참고), D 버튼/메뉴/탭 두 줄, F 잘림, G 구성 변화(sig)
(() => {
  const out = [];
  const root = document.querySelector('#root');
  const vw = document.documentElement.clientWidth;
  const shown = (e) => { const r = e.getBoundingClientRect(); const cs = getComputedStyle(e); return r.width > 0 && r.height > 0 && cs.visibility !== 'hidden' && cs.display !== 'none' && r.right > 0 && r.left < window.innerWidth; };
  if (document.documentElement.scrollWidth > vw + 1) out.push(['A', `쪽 가로 스크롤 ${document.documentElement.scrollWidth - vw}`]);
  const els = [...root.querySelectorAll('*')].filter(shown).filter((e) => !e.closest('.sr-only, [aria-hidden="true"], .rb-code, .rb-table-scroll, .rb-tabs, svg'));
  const name = (e) => `${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className).split(' ')[0]}`.slice(0, 40);
  // 글자 노드의 줄 상자만 모은다(아이콘 같은 자식 상자가 줄 수를 부풀리지 않게)
  const lineTops = (node) => {
    const out2 = [];
    const w = document.createTreeWalker(node, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      out2.push(...[...rg.getClientRects()].filter((q) => q.width > 0));
    }
    return out2;
  };
  // A 요소 넘침: 화면 오른쪽 밖으로 나간 요소
  for (const e of els) {
    const r = e.getBoundingClientRect();
    const cs = getComputedStyle(e);
    if (r.right > vw + 1 && cs.position !== 'fixed' && !e.closest('.rb-menu, .rb-rtabs-in, .rb-code-scroll, pre, .rb-tabs')) { out.push(['A', `${name(e)} 오른쪽 ${Math.round(r.right - vw)} 넘침`]); break; }
  }
  // C, D, F: 글자 요소
  for (const e of els) {
    if (!e.firstChild || ![...e.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim())) continue;
    const cs = getComputedStyle(e);
    const fs = parseFloat(cs.fontSize);
    const rects = lineTops(e);
    const rows = new Set(rects.map((q) => Math.round(q.top / (fs * 0.6))));
    const text = e.textContent.trim();
    if (rows.size > 1 && e.clientWidth > 0 && e.clientWidth <= fs * 2 && text.length > 3) out.push(['C', `${name(e)} 폭 ${Math.round(e.clientWidth)}에서 ${rows.size}줄 "${text.slice(0, 8)}"`]);
    if (rows.size > 1 && e.closest('button, .krds-btn, [role="tab"], [role="menuitem"], .item-link, .rb-rtab, .rb-side-link, .rb-statetab, .rb-pill')) out.push(['D', `${name(e)} ${rows.size}줄 "${text.slice(0, 10)}"`]);
    if ((cs.overflowX === 'hidden' || cs.overflowX === 'clip') && cs.textOverflow !== 'ellipsis' && !/-webkit-box|flex/.test(cs.display) && e.scrollWidth > e.clientWidth + 1 && !cs.webkitLineClamp) out.push(['F', `${name(e)} 잘림 "${text.slice(0, 10)}"`]);
    if (rows.size > 1 && e.children.length === 0) {
      const last = [...rows].pop();
      const lastChars = rects.filter((q) => Math.round(q.top / (fs * 0.6)) === last);
      const lastW = lastChars.reduce((a, q) => a + q.width, 0);
      const lastWord = text.split(/\s+/).pop();
      if (lastW <= fs * 4 && lastWord.length <= 4 && text.includes(' ')) out.push(['K', `${name(e)} 마지막 줄 "${lastWord}"`]);
    }
  }
  // B 겹침: 형제 상자가 서로 겹침(둘 다 글자 포함, 흐름 안 요소)
  const flow = (e) => { const cs = getComputedStyle(e); return (cs.position === 'static' || cs.position === 'relative') && cs.display !== 'inline'; };
  let pairs = 0;
  for (const p of els) {
    const kids = [...p.children].filter((c) => shown(c) && flow(c) && c.textContent.trim());
    if (kids.length < 2 || kids.length > 40) continue;
    for (let i = 0; i < kids.length && pairs < 4000; i += 1) {
      const a = kids[i].getBoundingClientRect();
      for (let j = i + 1; j < kids.length; j += 1) {
        const b = kids[j].getBoundingClientRect();
        pairs += 1;
        const w = Math.min(a.right, b.right) - Math.max(a.left, b.left);
        const h = Math.min(a.bottom, b.bottom) - Math.max(a.top, b.top);
        if (w > 3 && h > 3) { out.push(['B', `${name(kids[i])} x ${name(kids[j])} ${Math.round(w)}x${Math.round(h)}`]); break; }
      }
    }
  }
  // G 구성: 왼쪽 메뉴, 서랍 버튼, 탭 줄, 하단 탭바, 정보 패널, 머리글 검색이 보이는지 한 줄 표지
  const on = (sel) => { const e = document.querySelector(sel); return e && shown(e) && e.getBoundingClientRect().right > 0 ? 1 : 0; };
  const sig = `메뉴${on('.rb-side')} 서랍버튼${on('.rb-gbar-navtoggle')} 탭줄${on('.rb-rtabs')} 탭바${on('.rb-tabbar')} 검색${on('.rb-gbar [data-figma="global-search"], .rb-gbar-search')}`;
  return { out, sig };
})()
