// 코드 전수 측정 실행기(playwright가 있는 곳). code_plan/figma_name_map.json의 screens[].code(경로, query, 폭, auth)를 돌며
// export-code-boxes.js를 실행해 code_plan/measured_full.json을 만든다. 샌드박스처럼 playwright가 없으면 Aside 브라우저 탭에서
// 같은 순서로 export-code-boxes.js를 evaluate한다(UX/audit_v3/parity_ledger.md 1절 '측정 방법').
// 실행: 개발 서버(npm run dev, ?auth=Signed-in 스위치는 개발 모드만)를 켠 뒤 node scripts/export-code-boxes.mjs [--screen R-01]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = await import('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(dir, '..', '..');
const BASE = process.env.BASE || 'http://127.0.0.1:5731';
const map = JSON.parse(await fs.readFile(path.join(ROOT, 'code_plan', 'figma_name_map.json'), 'utf8'));
const js = await fs.readFile(path.join(dir, 'export-code-boxes.js'), 'utf8');
// 창 높이 = Figma 기본 변형 프레임 높이(최대 1400). 짧은 화면(로그인 등)이 Figma와 같은 높이에서 놓이게
const figma = JSON.parse(await fs.readFile(path.join(ROOT, 'code_plan', 'figma_full.json'), 'utf8')).data;
const DEF = { Drawer: 'Closed', Sidebar: 'Expanded', Info: 'Short', Dialog: 'Closed', Kind: 'NotFound', State: 'List', Panel: 'Closed' };
const frameH = (screen, bp, auth) => { const v = figma.find((x) => x.screen === screen && x.breakpoint === String(bp) && (x.props.Auth || 'Guest') === auth && Object.entries(x.props).every(([k, val]) => ['Breakpoint', 'Auth', 'Role'].includes(k) || DEF[k] === val)); return v ? Math.min(v.frame.h, 1400) : 1080; };
const only = process.argv.includes('--screen') ? process.argv[process.argv.indexOf('--screen') + 1] : null;
const browser = await chromium.launch();
const page = await browser.newPage();
// --screen이면 기존 measured_full.json에 그 화면만 바꿔 넣는다
const prev = await fs.readFile(path.join(ROOT, 'code_plan', 'measured_full.json'), 'utf8').then(JSON.parse).catch(() => null);
const out = only && prev ? { ...prev, measuredAt: new Date().toISOString() } : { measuredAt: new Date().toISOString(), base: BASE, screens: {} };
for (const s of map.screens) {
  if (only && s.screen !== only) continue;
  for (const auth of s.code.auth) {
    const q = new URLSearchParams({ ...s.code.query, ...(auth === 'Signed-in' ? { auth } : {}) }).toString();
    const url = BASE + s.code.path + (q ? (s.code.path.includes('?') ? '&' : '?') + q : '');
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto(url); await page.waitForTimeout(2500);
    await page.addStyleTag({ content: 'html{scrollbar-width:none} #rb-scroll{scrollbar-width:none!important;scrollbar-gutter:auto!important}' });
    for (const w of s.code.breakpoints) {
      await page.setViewportSize({ width: w, height: frameH(s.screen, w, auth) }); await page.waitForTimeout(400);
      out.screens[`${s.screen}_${w}_${auth}`] = await page.evaluate(js);
    }
  }
}
await browser.close();
await fs.writeFile(path.join(ROOT, 'code_plan', 'measured_full.json'), JSON.stringify(out));
console.log('측정', Object.keys(out.screens).length);
