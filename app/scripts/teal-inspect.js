// 청록 계열(색상 170~200도) 면 채움 찾기(D-07, D-15). 페이지 안에서 실행한다. 보이는 요소의 배경색과, 호버/선택에 쓰는 색 변수를 함께 본다.
(() => {
  const toHsl = (r, g, b) => {
    r /= 255; g /= 255; b /= 255;
    const mx = Math.max(r, g, b); const mn = Math.min(r, g, b); const l = (mx + mn) / 2; const d = mx - mn;
    if (!d) return { h: 0, s: 0, l };
    const s = d / (1 - Math.abs(2 * l - 1));
    let h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4;
    h = (h * 60 + 360) % 360;
    return { h, s, l };
  };
  const parse = (str) => { const m = /rgba?\(([^)]+)\)/.exec(str); if (!m) return null; const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number); return { r: p[0], g: p[1], b: p[2], a: p[3] ?? 1 }; };
  const isTeal = (c) => { if (!c || c.a < 0.3) return false; const x = toHsl(c.r, c.g, c.b); return x.h >= 170 && x.h <= 200 && x.s >= 0.12; };
  const out = [];
  const name = (e) => `${e.tagName.toLowerCase()}.${String(e.className?.baseVal ?? e.className).split(' ')[0]}`.slice(0, 50);
  for (const e of document.querySelectorAll('#root *')) {
    const r = e.getBoundingClientRect();
    if (!r.width || !r.height) continue;
    const bg = parse(getComputedStyle(e).backgroundColor);
    if (isTeal(bg)) out.push(`면 ${name(e)} rgb(${bg.r},${bg.g},${bg.b}) "${e.textContent.trim().slice(0, 10)}"`);
  }
  // 호버/선택/눌림 색 변수를 실제 색으로 풀어 본다
  const probe = document.createElement('div');
  probe.style.cssText = 'position:absolute;visibility:hidden';
  document.body.appendChild(probe);
  for (const v of ['--krds-color-action-secondary-hover', '--krds-color-action-secondary-selected', '--krds-color-action-secondary-pressed', '--krds-color-surface-information-subtler', '--krds-color-surface-primary-subtler']) {
    probe.style.backgroundColor = `var(${v}, transparent)`;
    const c = parse(getComputedStyle(probe).backgroundColor);
    if (isTeal(c)) out.push(`변수 ${v} rgb(${c.r},${c.g},${c.b})`);
  }
  probe.remove();
  return out;
})()
