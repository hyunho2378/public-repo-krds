// 왼쪽 선 검사: 61개 경로에서 바닥글, 본문, 제목, 왼쪽 메뉴의 왼쪽 x가 머리글 컨테이너 왼쪽과 2px 넘게 다른 곳을 목록으로 낸다.
// 실행: 앱을 켠 뒤 `node scripts/check-left-edges.mjs` (playwright 필요). 폭은 WIDTHS 환경변수(쉼표)로 바꾼다. 위반이 있으면 exit 1.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { setViewport } from './viewport.mjs';
const { chromium } = await import('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5731';
const WIDTHS = (process.env.WIDTHS || '360,768,1024,1440,1920,2560').split(',').map(Number);
import { PATHS } from './paths.mjs';
// D-21 7장: 기준은 본문 판 안 컨테이너. 왼쪽 끝, 오른쪽 끝, 좌우 여백 대칭, 사이드바와 판 아래 끝(margin-inspect.js)
const inspect = await fs.readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), 'margin-inspect.js'), 'utf8');
const browser = await chromium.launch();
const page = await browser.newPage();
let fails = 0;
for (const width of WIDTHS) {
  for (const p of PATHS) {
    await page.goto(BASE + p);
    await setViewport(page, width, 900);
    await page.waitForFunction(() => !document.querySelector('[data-state="Loading"]'), null, { timeout: 15000 }).catch(() => {});
    await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
    const r = await page.evaluate(inspect);
    if (r.skip) continue;
    if (r.bad.length) { fails += 1; console.log('위반', width, p, r.bad.join(' / ')); }
  }
}
await browser.close();
console.log(`폭 ${WIDTHS.join(',')} x 경로 ${PATHS.length}: 위반 ${fails}건`);
if (fails) process.exitCode = 1;
