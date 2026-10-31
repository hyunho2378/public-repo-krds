// 코드 전수 측정(브라우저 안에서 실행). data-figma 이름표 요소마다 대조 항목을 모은다.
// 결과: { screen, frame:{w,h}, elements: { 이름(같은 이름 둘째부터 이름#2): {...} }, order: [이름...] }
// 항목: x y w h(문서 좌표, 판 안 스크롤 더함), text(200자까지, 공백 하나로)·textLen, fs fw lh, color bg border(색은 #rrggbb, KRDS 원시 이름 함께),
//       radius, pad(위 오른 아래 왼), gap(행 열), icons(안쪽 data-icon 순서), kids(직계 이름표 자식 순서)
// 쓰는 곳: compare-parity.mjs(대조), 측정 실행은 Aside 브라우저 탭 또는 export-code-boxes.mjs(playwright 있을 때)
(() => {
  const hex = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); if (p.length > 3 && p[3] === 0) return null; const h = '#' + p.slice(0, 3).map((n) => Math.round(n).toString(16).padStart(2, '0')).join(''); return p.length > 3 && p[3] < 1 ? `${h}/${Math.round(p[3] * 100)}` : h; };
  // KRDS 원시 색 이름표(#값 → gray-90 등). 불러온 시트(@import 포함)의 --krds-color-light-* 에서 만든다
  const names = {};
  const walk = (list) => { for (const r of list) { if (r.styleSheet) { try { walk(r.styleSheet.cssRules); } catch { /* */ } } if (r.cssRules) walk(r.cssRules); if (!r.style) continue; for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; const m = p.match(/^--krds-color-light-([a-z]+-\d+)$/); if (!m) continue; const v = r.style.getPropertyValue(p).trim().toLowerCase(); if (/^#[0-9a-f]{6}$/.test(v) && !names[v]) names[v] = m[1]; } } };
  for (const s of document.styleSheets) { try { walk(s.cssRules); } catch { /* */ } }
  const tok = (h) => (h && names[h.slice(0, 7)] ? names[h.slice(0, 7)] + (h.length > 7 ? h.slice(7) : '') : null);
  const sc = document.getElementById('rb-scroll');
  const panelScroll = sc && getComputedStyle(sc).overflowY === 'auto' ? sc : null;
  const px = (v) => Math.round(parseFloat(v) || 0);
  // 보이지 않는 요소(숨김, 화면 밖으로 밀린 서랍 등)는 뺀다
  const shown = (e) => { const b = e.getBoundingClientRect(); if (!b.width && !b.height) return false; const c = getComputedStyle(e); if (c.visibility === 'hidden' || c.display === 'none' || Number(c.opacity) === 0) return false; if (b.right <= 0 || b.left >= innerWidth) return false; if (e.closest('[hidden]')) return false;
    // 자식이 있는데 보이는 자식이 하나도 없으면(닫힌 서랍을 감싼 틀 등) 뺀다
    if (e.children.length && ![...e.querySelectorAll('*')].some((k) => { const r = k.getBoundingClientRect(); const kc = getComputedStyle(k); return r.width && r.height && kc.visibility !== 'hidden' && r.right > 0 && r.left < innerWidth; })) return false;
    return true; };
  const els = [...document.querySelectorAll('[data-figma]')].filter(shown);
  const seen = {}; const out = {}; const order = [];
  const keyOf = new Map();
  for (const e of els) {
    const n = e.getAttribute('data-figma'); seen[n] = (seen[n] || 0) + 1; const key = seen[n] > 1 ? `${n}#${seen[n]}` : n; keyOf.set(e, key); order.push(key);
  }
  for (const e of els) {
    const key = keyOf.get(e); const b = e.getBoundingClientRect(); const c = getComputedStyle(e);
    const dy = panelScroll && panelScroll.contains(e) && e !== panelScroll ? panelScroll.scrollTop : scrollY;
    // 글: 화면 낭독 전용(.sr-only)은 뺀다(Figma에 없는 보이지 않는 글)
    const clone = e.cloneNode(true); clone.querySelectorAll('.sr-only, [aria-hidden="true"] .sr-only').forEach((x) => x.remove());
    const srs = [...e.querySelectorAll('.sr-only')].map((x) => (x.innerText || x.textContent || '').trim()).filter(Boolean);
    let t = (e.innerText || '').replace(/\s+/g, ' ').trim(); for (const x of srs) t = t.replace(x.replace(/\s+/g, ' '), ' ');
    // 입력칸 자리표시(placeholder)는 Figma에서 글로 보이므로 글에 더한다
    const phs = [...e.querySelectorAll('input[placeholder], textarea[placeholder]')].filter(shown).map((x) => x.value ? x.value : x.placeholder);
    if (phs.length) t = `${t} ${phs.join(' ')}`;
    t = t.replace(/\s+/g, ' ').trim();
    const textEl = [e, ...e.querySelectorAll('*')].find((k) => [...k.childNodes].some((x) => x.nodeType === 3 && x.textContent.trim())) || e;
    const tc = getComputedStyle(textEl);
    const bw = px(c.borderTopWidth) || px(c.borderBottomWidth) || px(c.borderLeftWidth);
    const bcol = bw ? hex(c.borderTopWidth !== '0px' ? c.borderTopColor : c.borderBottomWidth !== '0px' ? c.borderBottomColor : c.borderLeftColor) : null;
    const kids = [...e.querySelectorAll('[data-figma]')].filter((k) => k.parentElement.closest('[data-figma]') === e && keyOf.has(k)).map((k) => keyOf.get(k));
    out[key] = {
      x: Math.round(b.x + scrollX), y: Math.round(b.y + dy), w: Math.round(b.width), h: Math.round(b.height),
      text: t.length <= 200 ? t : t.slice(0, 200), textLen: t.length,
      fs: px(tc.fontSize), fw: Number(tc.fontWeight), lh: tc.lineHeight === 'normal' ? null : px(tc.lineHeight),
      color: hex(tc.color), colorTok: tok(hex(tc.color)), bg: hex(c.backgroundColor), bgTok: tok(hex(c.backgroundColor)),
      border: bw || 0, borderColor: bcol, borderTok: tok(bcol), radius: px(c.borderTopLeftRadius),
      pad: [px(c.paddingTop), px(c.paddingRight), px(c.paddingBottom), px(c.paddingLeft)], gap: [px(c.rowGap), px(c.columnGap)],
      icons: [...e.querySelectorAll('[data-icon]')].filter(shown).slice(0, 20).map((i) => (i.tagName === 'IMG' ? 'file/' : '') + i.getAttribute('data-icon')),
      kids, nchild: [...e.children].filter((k) => { const r = k.getBoundingClientRect(); return r.width && r.height && getComputedStyle(k).display !== 'none' && !k.classList.contains('sr-only'); }).length,
    };
  }
  return { screen: document.querySelector('[data-screen-id]')?.getAttribute('data-screen-id') || null, url: location.pathname + location.search, frame: { w: innerWidth, h: Math.max(document.documentElement.scrollHeight, panelScroll ? panelScroll.scrollHeight + (panelScroll.getBoundingClientRect().top) : 0) }, elements: out, order };
})();
