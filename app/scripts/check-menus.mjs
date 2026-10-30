// 메뉴 검사(UX-007 12장): 화면마다 열 수 있는 메뉴를 모두 열어 항목 높이 32, 줄 수 1, 간격 0, 폭 160~320, 가장자리 12를 잰다.
// 실행: 앱을 켠 뒤 `node scripts/check-menus.mjs` (playwright 필요). 스크린샷은 SHOTS 폴더에 저장한다. 위반이 있으면 exit 1.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const { chromium } = await import('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5731';
const SHOTS = process.env.SHOTS || path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..', 'UX', 'menu_check');
export const WIDTHS = [360, 768, 1440];
export const PATHS = ['/', '/search?q=kordoc', '/fields', '/projects/150', '/projects/150/code/README.md', '/projects/1115/issues', '/projects/1115/merge-requests', '/projects/150/changes'];
const inspect = await fs.readFile(path.join(path.dirname(fileURLToPath(import.meta.url)), 'menu-inspect.js'), 'utf8');

await fs.mkdir(SHOTS, { recursive: true });
const browser = await chromium.launch();
const page = await browser.newPage();
let opened = 0;
let fails = 0;
for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 });
  for (const p of PATHS) {
    await page.goto(BASE + p);
    await page.waitForFunction(() => !document.querySelector('[data-state="Loading"]'), null, { timeout: 15000 }).catch(() => {});
    const n = await page.locator('[aria-haspopup="menu"]').count();
    for (let i = 0; i < n; i += 1) {
      const trigger = page.locator('[aria-haspopup="menu"]').nth(i);
      if (!(await trigger.isVisible())) continue;
      await trigger.click();
      const r = await page.evaluate(inspect);
      if (r.none) continue;
      opened += 1;
      const label = (await trigger.getAttribute('aria-label')) || String(i);
      const tag = `${width} ${p} [${label}]`;
      if (r.violations.length) { fails += 1; console.log('위반', tag, r.violations.slice(0, 4).join(' / ')); }
      else console.log('통과', tag, `항목 ${r.count}, ${r.width}x${r.height}`);
      await page.screenshot({ path: path.join(SHOTS, `${width}_${p.replace(/[^a-z0-9]+/gi, '_')}_${i}.png`) });
      await page.keyboard.press('Escape');
    }
  }
}
await browser.close();
console.log(`열어 본 메뉴 ${opened}개, 위반 ${fails}건`);
if (fails || !opened) process.exitCode = 1;
