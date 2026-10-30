// 점검 도구 공통: 화면 크기는 반드시 이동(goto) 뒤에 맞추고, 곧바로 window.innerWidth가 기대 폭과 같은지 확인한다.
// 이동하면 브라우저가 폭을 되돌리는 환경이 있어(2026. 10. 30. 발견) 이동 전에 맞춘 폭 점검이 실제로는 1440에서 돌았다. 다르면 예외를 던져 실패시킨다.
export async function setViewport(page, width, height, wait = 80) {
  await page.setViewportSize({ width, height });
  if (wait) await page.waitForTimeout(wait);
  const got = await page.evaluate(() => [window.innerWidth, window.innerHeight]);
  if (got[0] !== width) throw new Error(`폭 불일치: 기대 ${width}, 실제 ${got[0]} (이동 뒤에 setViewport를 불렀는지 확인)`);
  if (height && got[1] !== height) throw new Error(`높이 불일치: 기대 ${height}, 실제 ${got[1]}`);
  return got;
}
