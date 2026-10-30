// 팔레트 밖 색 검사: 대표 경로를 열어 palette-inspect.js를 실행하고 KRDS 팔레트 밖 색이 있으면 exit 1.
// 실행: 앱을 켠 뒤 node scripts/check-palette.mjs (playwright 필요, BASE 환경변수로 주소). audit:code와 함께 돌린다
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = await import('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5731';
const PATHS = ['/', '/projects/150?fixture=kordoc', '/projects/150/code/README.md?fixture=kordoc', '/projects/150/branches?fixture=kordoc', '/organizations', '/explore/topics', '/search?q=hwp', '/login'];
const inspect = await fs.readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), 'palette-inspect.js'), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
let fails = 0;
for (const p of PATHS) {
  await page.goto(BASE + p);
  await page.waitForTimeout(3000);
  const r = await page.evaluate(inspect);
  if (r.bad.length) { fails++; console.log('팔레트 밖', p, '\n  ' + r.bad.join('\n  ')); }
}
await browser.close();
console.log(`경로 ${PATHS.length}: 위반 ${fails}건`);
if (fails) process.exitCode = 1;
