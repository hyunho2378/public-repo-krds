// 정적 사이드바 검사(audit:code): layout.tokens.css의 사이드바 변수가 UX/17 실측 명세(sidebar-spec.json) px와 같은지 본다.
// KRDS number 단계(--krds-number-N)를 px로 풀어 계산한다. 다르면 exit 1
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const spec = JSON.parse(await fs.readFile(path.join(dir, 'sidebar-spec.json'), 'utf8'));
const css = await fs.readFile(path.join(dir, '../src/krds/layout.tokens.css'), 'utf8');
const NUM = { 0: 0, 1: 1, 2: 2, 3: 4, 4: 6, 5: 8, 6: 10, 7: 12, 8: 16, 9: 20, 10: 24, 11: 28, 12: 32, 13: 36, 14: 40, 15: 44, 16: 48, 17: 56, 18: 64, 19: 72, 20: 80, 21: 96 };
const vars = {}; for (const m of css.matchAll(/(--[\w-]+):\s*([^;]+);/g)) vars[m[1]] = m[2].trim();
const px = (v, depth = 0) => {
  if (depth > 8) return NaN;
  v = v.replace(/var\(--krds-number-(\d+)\)/g, (_, n) => String(NUM[n]));
  v = v.replace(/var\((--[\w-]+)\)/g, (_, n) => (vars[n] ? String(px(vars[n], depth + 1)) : 'NaN'));
  v = v.replace(/calc\(/g, '(');
  if (!/^[\d\s+\-*/().]+$/.test(v)) return NaN;
  return Function(`return (${v})`)();
};
const want = {
  '--rb-sidebar-w': spec.width, '--layout-sidebar-rail-w': spec.railWidth, '--layout-sidebar-item-h': spec.item.h,
  '--layout-sidebar-icon': spec.item.icon, '--layout-sidebar-item-gap': spec.item.pitch - spec.item.h,
  '--layout-sidebar-avatar': spec.project.avatar, '--layout-sidebar-project-gap': spec.project.pitchToNext - spec.item.h,
  '--layout-sidebar-sep-gap': spec.separator.gap, '--layout-sidebar-inset': spec.item.x, '--layout-sidebar-top': spec.header.dy,
};
let bad = 0;
for (const [k, w] of Object.entries(want)) { const got = px(vars[k] || ''); if (got !== w) { bad++; console.log(`사이드바 토큰 ${k}: ${got} (명세 ${w})`); } }
console.log(bad ? `사이드바 토큰 어긋남 ${bad}` : `PASS: 사이드바 토큰 ${Object.keys(want).length}개 명세와 같음`);
if (bad) process.exitCode = 1;
