// 연속 폭 점검(UX-007, 사용자 지시): 창을 조금씩 줄이고 늘려도 어떤 폭에서도 맞는지 쓸어 가며 잰다.
// 폭 STEP(기본 8)px 간격으로 320~2560, 중단점 앞뒤 1px(767/768, 1023/1024, 1279/1280)과 3840 포함, 높이 600과 900.
// 각 단계에서 fluid-inspect.js(A 넘침, B 겹침, C 한 글자 줄바꿈, K 마지막 줄 한 어절, D 두 줄 쪼개짐, F 잘림, G 구성 변화)와
// edge-inspect.js(E 왼쪽 선)를 돌려, 같은 위반이 이어지는 폭을 구간으로 묶어 UX/10_연속폭_점검.md 표로 쓴다.
// 실행: 앱을 켠 뒤 `node scripts/check-fluid.mjs` (playwright 필요). 환경변수 STEP, PATHS(쉼표), HEIGHTS(쉼표), LIGHT=1(폭 15개 가벼운 판).
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { PATHS as ALL } from './paths.mjs';
const { chromium } = await import('playwright');
const HERE = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:5731';
const STEP = Number(process.env.STEP || 8);
const BOUNDARY = [319, 320, 359, 360, 479, 480, 767, 768, 1023, 1024, 1279, 1280, 1439, 1440, 1919, 1920, 2559, 2560, 3840];
const LIGHT_WIDTHS = [320, 360, 479, 480, 767, 768, 1023, 1024, 1279, 1280, 1440, 1920, 2560, 3000, 3840];
const widths = process.env.LIGHT ? LIGHT_WIDTHS : [...new Set([...Array.from({ length: Math.floor((2560 - 320) / STEP) + 1 }, (_, i) => 320 + i * STEP), ...BOUNDARY])].sort((a, b) => a - b);
const heights = (process.env.HEIGHTS || '600,900').split(',').map(Number);
const paths = process.env.PATHS ? process.env.PATHS.split(',') : ALL;
const fluid = await fs.readFile(path.join(HERE, 'fluid-inspect.js'), 'utf8');
const edge = await fs.readFile(path.join(HERE, 'edge-inspect.js'), 'utf8');
const SHOTS = path.resolve(HERE, '..', '..', 'UX', 'fluid_check');
await fs.mkdir(SHOTS, { recursive: true });

const browser = await chromium.launch();
const page = await browser.newPage();
const found = new Map(); // 키(경로|종류|요약) -> {w:[...], shot}
let sigs = new Map();
for (const p of paths) {
  await page.goto(BASE + p);
  await page.waitForFunction(() => !document.querySelector('[data-state="Loading"]'), null, { timeout: 15000 }).catch(() => {});
  for (const h of heights) {
    let prevSig = null;
    for (const w of widths) {
      await page.setViewportSize({ width: w, height: h });
      await page.waitForTimeout(60);
      const r = await page.evaluate(fluid);
      const e = await page.evaluate(edge);
      const list = [...r.out, ...e.bad.map((b) => ['E', b])];
      for (const [kind, detail] of list) {
        const key = `${p}|${kind}|${detail.replace(/\d+/g, 'N')}`;
        if (!found.has(key)) found.set(key, { p, kind, detail, h, w: [], shot: null });
        const f = found.get(key);
        f.w.push(w);
        if (!f.shot && kind !== 'K') { f.shot = `${w}_${h}_${p.replace(/[^a-z0-9]+/gi, '_')}_${kind}.png`; await page.screenshot({ path: path.join(SHOTS, f.shot) }); }
      }
      if (prevSig !== null && prevSig !== r.sig) sigs.set(`${p}|${h}|${w}`, `${prevSig} -> ${r.sig}`);
      prevSig = r.sig;
    }
  }
}
await browser.close();

const range = (ws) => { const out = []; let s = ws[0], l = ws[0]; for (const w of ws.slice(1)) { if (w - l <= STEP + 1) l = w; else { out.push(s === l ? `${s}` : `${s}~${l}`); s = l = w; } } out.push(s === l ? `${s}` : `${s}~${l}`); return out.join(', '); };
const rows = [...found.values()].sort((a, b) => a.p.localeCompare(b.p) || a.kind.localeCompare(b.kind));
const bad = rows.filter((r) => r.kind !== 'K');
let md = `# 연속 폭 점검\n\n- 폭 ${widths.length}단계(${widths[0]}~${widths[widths.length - 1]}, ${STEP}px 간격과 중단점 앞뒤 1px), 높이 ${heights.join('/')}, 경로 ${paths.length}개\n- 위반(참고 K 제외) ${bad.length}건, 참고(K 마지막 줄 한 어절) ${rows.length - bad.length}건\n\n| 폭 구간 | 경로 | 종류 | 내용 | 스크린샷 |\n|---|---|---|---|---|\n`;
for (const r of rows) md += `| ${range(r.w)} | ${r.p} | ${r.kind} | ${r.detail.replace(/\|/g, '/')} | ${r.shot ? `fluid_check/${r.shot}` : ''} |\n`;
md += `\n## 폭에 따른 구성 변화(G)\n\n| 경로 | 높이 | 폭 | 변화 |\n|---|---|---|---|\n`;
for (const [k, v] of sigs) { const [p, h, w] = k.split('|'); md += `| ${p} | ${h} | ${w} | ${v} |\n`; }
await fs.writeFile(path.resolve(HERE, '..', '..', 'UX', '10_연속폭_점검.md'), md);
console.log(`위반 ${bad.length}건, 참고 ${rows.length - bad.length}건. UX/10_연속폭_점검.md에 기록`);
if (bad.length) process.exitCode = 1;
