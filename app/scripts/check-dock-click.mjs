// 정보 버튼 '첫 클릭 열림' 시험(2026. 10. 30. 사용자 지적: 처음 눌렀을 때 안 열리고 두 번째에 열린 듯함).
// 시험 세 가지: (1) 저장값 없음 -> 한 번 눌러 열림, aria-expanded true, 패널이 보임 (2) 저장값 0 -> 열림 (3) 저장값 1(이미 열린 채 로드) -> 로드 직후 aria-expanded true이고 한 번 누르면 닫힘.
// 실행: 앱을 켠 뒤 `node scripts/check-dock-click.mjs` (playwright 필요). 실패하면 exit 1.
import { setViewport } from './viewport.mjs';
const { chromium } = await import('playwright');
const BASE = process.env.BASE || 'http://127.0.0.1:5731';
const PATH = '/projects/150';
const browser = await chromium.launch();
const page = await browser.newPage();
let fails = 0;
const state = () => page.evaluate(() => ({ exp: document.querySelector('.rb-rtab-info button')?.getAttribute('aria-expanded'), dock: !!document.querySelector('.rb-dock'), ls: localStorage.getItem('rb-dock-open') }));
async function load(saved) {
  await page.goto(BASE + '/help');
  await page.evaluate((v) => { if (v === null) localStorage.removeItem('rb-dock-open'); else localStorage.setItem('rb-dock-open', v); }, saved);
  await page.goto(BASE + PATH);
  await setViewport(page, 1440, 900, 0);
  await page.waitForSelector('.rb-rtab-info button');
}
for (const [saved, expectOpenAfterLoad] of [[null, false], ['0', false], ['1', true]]) {
  await load(saved);
  const s0 = await state();
  if ((s0.exp === 'true') !== expectOpenAfterLoad) { fails += 1; console.log('실패 로드 직후 상태', saved, s0); }
  await page.locator('.rb-rtab-info button').click();
  await page.waitForTimeout(400);
  const s1 = await state();
  const wantOpen = !expectOpenAfterLoad;
  if ((s1.exp === 'true') !== wantOpen || s1.dock !== wantOpen) { fails += 1; console.log('실패 한 번 누른 뒤', saved, s1); } else console.log('통과', saved, JSON.stringify(s1));
}
await browser.close();
if (fails) process.exitCode = 1;
