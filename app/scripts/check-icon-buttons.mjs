// 아이콘 단독 버튼 점검(UX-007): 61개 경로(정보 패널 열린 상태 포함)에서 아이콘 단독 버튼의 가로 세로가 짝수인지, 아이콘 중심과 버튼 중심 차이가 0.5px 이하인지 잰다.
// 실행: 앱을 켠 뒤 `node scripts/check-icon-buttons.mjs` (playwright 필요). 위반이 있으면 exit 1.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setViewport } from './viewport.mjs';
import { PATHS } from './paths.mjs';
const { chromium } = await import('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5731';
const WIDTHS = (process.env.WIDTHS || '1440,360').split(',').map(Number);
const inspect = await fs.readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), 'icon-button-inspect.js'), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
let fails = 0;
for (const width of WIDTHS) {
  for (const p of PATHS) {
    await page.goto(BASE + p);
    await setViewport(page, width, 900);
    await page.waitForFunction(() => !document.querySelector('[data-state="Loading"]'), null, { timeout: 15000 }).catch(() => {});
    for (const open of [false, true]) {
      if (open) await page.evaluate(() => { const b = document.querySelector('.rb-rtab-info button'); if (b && b.getAttribute('aria-expanded') !== 'true') b.click(); });
      for (const v of await page.evaluate(inspect)) { fails += 1; console.log('위반', width, p, open ? '(패널 열림)' : '', v); }
    }
  }
}
await browser.close();
console.log(`아이콘 단독 버튼 위반 ${fails}건`);
if (fails) process.exitCode = 1;
