// 반응형 검사: 8개 폭 x 주요 경로에서 가로 넘침과 잘린 글자를 찾는다.
// 실행: npm run dev(5731)와 server(5732)를 켠 뒤 `node scripts/check-responsive.mjs` (playwright 필요: npm i -D playwright)
// 기준: 가로 넘침 0, 보이는 글자가 잘림 0. 탭, 표, 코드 블록의 의도된 가로 스크롤은 제외.
const { chromium } = await import('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5731';
export const WIDTHS = [320, 360, 768, 1024, 1440, 1920, 2560, 3840];
export const PATHS = ['/', '/search?q=출장비', '/search?q=zzzzqqq', '/fields', '/projects/1069', '/projects/1622', '/projects/1069/files', '/projects/1069/changes', '/projects/1069/use', '/projects/1622/use', '/projects/1069/feedback', '/publish', '/my', '/organizations', '/login?returnTo=/projects/1069', '/error?kind=forbidden', '/nope', '/help', '/requests'];

export function inspect() {
  const vw = document.documentElement.clientWidth;
  const found = [];
  for (const el of document.querySelectorAll('#root *')) {
    if (el.closest('.rb-tabs, .rb-table-scroll, .rb-code, .sr-only, legend, .rb-clamp, .krds-step-wrap')) continue;
    const b = el.getBoundingClientRect();
    if (!b.width || !b.height) continue;
    const cs = getComputedStyle(el);
    if (b.right > vw + 1 && cs.position !== 'fixed') found.push('넘침 ' + el.tagName + '.' + String(el.className).slice(0, 30));
    if (!el.children.length && el.textContent.trim() && el.scrollWidth > el.clientWidth + 1 && /hidden|clip/.test(cs.overflowX)) found.push('잘림 ' + el.textContent.trim().slice(0, 20));
  }
  return { over: document.documentElement.scrollWidth - vw, found: found.slice(0, 5) };
}

const browser = await chromium.launch();
const page = await browser.newPage();
let fails = 0;
for (const width of WIDTHS) {
  await page.setViewportSize({ width, height: 900 });
  for (const path of PATHS) {
    await page.goto(BASE + path);
    await page.waitForFunction(() => !document.querySelector('[data-state="Loading"]'), null, { timeout: 15000 }).catch(() => {});
    const r = await page.evaluate(inspect);
    if (r.over > 0 || r.found.length) {
      fails++;
      console.log(width, path, JSON.stringify(r));
    }
  }
}
await browser.close();
console.log(fails ? `FAIL ${fails}` : `PASS ${WIDTHS.length * PATHS.length}`);
process.exitCode = fails ? 1 : 0;
