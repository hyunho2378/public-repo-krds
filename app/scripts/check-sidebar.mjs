// 사이드바 회귀 검사: 대표 경로를 1280/1440/1920(펼침), 1440(접음), 360/768(서랍)에서 열어 sidebar-inspect.js로 명세(sidebar-spec.json)와 1px 이내인지 본다.
// 실행: 앱을 켠 뒤 node scripts/check-sidebar.mjs (playwright 필요, BASE 환경변수로 주소). 정적 검사(토큰 값)는 audit-sidebar-tokens.mjs가 audit:code에서 돈다
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = await import('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const BASE = process.env.BASE || 'http://127.0.0.1:5731';
const spec = JSON.parse(await fs.readFile(path.join(dir, 'sidebar-spec.json'), 'utf8'));
const inspect = await fs.readFile(path.join(dir, 'sidebar-inspect.js'), 'utf8');
const browser = await chromium.launch();
let fails = 0;
const run = async (p, w, prep) => {
  const page = await browser.newPage({ viewport: { width: w, height: 900 } });
  await page.addInitScript((s) => { window.__SIDEBAR_SPEC = s; }, spec);
  await page.goto(BASE + p); await page.waitForTimeout(2500);
  if (prep) await prep(page);
  const r = await page.evaluate(inspect);
  if (r.bad.length) { fails++; console.log(`사이드바 어긋남 ${p} ${w}${prep ? ' ' + prep.name : ''} (${r.bad.length}/${r.n})\n  ` + r.bad.join('\n  ')); }
  else console.log(`통과 ${p} ${w}${prep ? ' ' + prep.name : ''} (${r.n}항목)`);
  await page.close();
};
const collapse = async function 접음(page) { await page.click('.rb-side-hide'); await page.waitForTimeout(600); };
const drawer = async function 서랍(page) { await page.click('.rb-gbar-navtoggle'); await page.waitForTimeout(600); };
for (const p of ['/', '/projects/150?fixture=kordoc']) {
  for (const w of [1280, 1440, 1920]) await run(p, w);
  await run(p, 1440, collapse);
  for (const w of [360, 768]) await run(p, w, w < 768 ? drawer : null);
}
await browser.close();
console.log(`사이드바 검사: 어긋난 경우 ${fails}`);
if (fails) process.exitCode = 1;
