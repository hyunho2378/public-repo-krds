// 렌더된 색이 KRDS 팔레트 안인지 검사(페이지 안에서 실행). check-palette.mjs가 읽어 쓴다.
// 팔레트: 불러온 CSS의 KRDS 원시 색 변수(--krds-color-light-*, --krds-color-high-contrast-*, --krds-dark-color-*, 그 밖 --krds-color-* 중 #hex 값)
// 수집: 보이는 모든 요소의 color, background-color, border-*-color, outline-color, fill, stroke(+ ::before, ::after). 투명은 뺀다
// 예외: 파일 종류 아이콘(img.rb-file-icon, app/public/icons/file), 공공 깃랩 로고(.rb-logo), 사용자 이미지(img), 행정안전부 로고(.rb-mois-logo)
(() => {
  const hex = new Set();
  const toRgb = (h) => { h = h.replace('#', ''); if (h.length === 3) h = h.split('').map((c) => c + c).join(''); const n = parseInt(h.slice(0, 6), 16); return `${(n >> 16) & 255},${(n >> 8) & 255},${n & 255}`; };
  for (const sheet of document.styleSheets) {
    let rules; try { rules = sheet.cssRules; } catch { continue; }
    const walk = (list) => { for (const r of list) { if (r.styleSheet) { try { walk(r.styleSheet.cssRules); } catch { /* 다른 출처 */ } } if (r.cssRules) walk(r.cssRules); if (!r.style) continue; for (let i = 0; i < r.style.length; i++) { const p = r.style[i]; if (!p.startsWith('--krds')) continue; const v = r.style.getPropertyValue(p).trim(); if (/^#[0-9a-f]{3,8}$/i.test(v)) hex.add(toRgb(v)); } } };
    walk(rules);
  }
  hex.add('0,0,0'); hex.add('255,255,255');
  const parse = (c) => { const m = c && c.match(/rgba?\(([^)]+)\)/); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); if (p.length > 3 && p[3] === 0) return null; return p.slice(0, 3).map(Math.round).join(','); };
  const skip = (el) => el.closest('img, .rb-logo, .rb-mois-logo, .rb-mois-logo-h, svg.rb-logo, [data-logo]') || el.tagName === 'IMG';
  // D-07: KRDS 팔레트 안이라도 청록(색상 170~200도, 채도 있음)은 쓰지 않는다
  const teal = (v) => { const [r, g, b] = v.split(',').map((x) => x / 255); const mx = Math.max(r, g, b), mn = Math.min(r, g, b), d = mx - mn; if (d < 0.08) return false; let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; h = (h * 60 + 360) % 360; return h >= 170 && h <= 200; };
  const bad = new Map();
  const props = ['color', 'backgroundColor', 'borderTopColor', 'borderRightColor', 'borderBottomColor', 'borderLeftColor', 'outlineColor', 'fill', 'stroke'];
  for (const el of document.querySelectorAll('body *')) {
    const r = el.getBoundingClientRect(); if (!r.width || !r.height || skip(el)) continue;
    for (const ps of [null, '::before', '::after']) {
      const cs = getComputedStyle(el, ps);
      if (ps && (cs.content === 'none' || cs.content === 'normal' || cs.width === '0px' || cs.height === '0px')) continue;
      for (const k of props) {
        if (k.startsWith('border') && cs[k.replace('Color', 'Width')] === '0px') continue;
        if (k === 'outlineColor' && cs.outlineStyle === 'none') continue;
        if ((k === 'fill' || k === 'stroke') && !(el instanceof SVGElement)) continue;
        const v = parse(cs[k]); if (!v || (hex.has(v) && !teal(v))) continue;
        const key = `${v} ${k}`; if (!bad.has(key)) bad.set(key, `${el.tagName.toLowerCase()}.${String(el.className?.baseVal ?? el.className).split(' ').slice(0, 2).join('.')}${ps || ''}`);
      }
    }
  }
  return { palette: hex.size, bad: [...bad].map(([k, where]) => `rgb(${k.split(' ')[0]}) ${k.split(' ')[1]} @ ${where}`) };
})();
