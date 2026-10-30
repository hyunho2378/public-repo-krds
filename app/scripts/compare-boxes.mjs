// Figma 요소 상자와 코드 요소 상자를 1px 기준으로 비교한다.
// Figma 쪽: code_plan/figma_boxes/<화면>_<폭>_<로그인>.json
//   { screen, breakpoint, auth, frame:{w,h}, boxes: { 이름: {x,y,w,h} } }
// 코드 쪽: data-figma="<이름>" 을 단 요소의 getBoundingClientRect를 모은 파일
//   모양: { "R-01": { "header": {x,y,w,h}, ... }, ... }
//   재는 법: [...document.querySelectorAll('[data-figma]')] 로 모아 저장
// 쓰기: node scripts/compare-boxes.mjs --measured ../code_plan/measured.json [--screen R-01]
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

// 저장소 뿌리는 이 파일 기준으로 찾는다(어디서 실행해도 같게)
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const BOXES = path.join(ROOT, 'code_plan', 'figma_boxes');
const TOLERANCE = 1;

const arg = (name, fallback = null) => {
  const i = process.argv.indexOf(`--${name}`);
  return i >= 0 ? process.argv[i + 1] : fallback;
};

function compare(expected, actual) {
  const rows = [];
  for (const want of expected) {
    const got = actual?.[want.name];
    if (!got) {
      rows.push({ name: want.name, result: '코드에 없음' });
      continue;
    }
    const diff = ['x', 'y', 'w', 'h']
      .map((k) => [k, Math.round(got[k] - want[k])])
      .filter(([, v]) => Math.abs(v) > TOLERANCE);
    if (diff.length) rows.push({ name: want.name, result: diff.map(([k, v]) => `${k} ${v > 0 ? '+' : ''}${v}`).join(' ') });
  }
  const extra = Object.keys(actual || {}).filter((n) => !expected.some((e) => e.name === n));
  return { rows, extra };
}

async function main() {
  let files = [];
  try {
    files = (await fs.readdir(BOXES)).filter((f) => f.endsWith('.json'));
  } catch {
    files = [];
  }
  if (!files.length) {
    console.log(`Figma 상자 자료가 아직 없습니다: ${BOXES}`);
    console.log('Figma 갈래가 화면별 JSON(요소 이름, x, y, w, h)을 넣으면 비교합니다.');
    return;
  }
  const measuredFile = arg('measured');
  if (!measuredFile) {
    console.log('잰 결과 파일이 필요합니다: --measured ../code_plan/measured.json');
    process.exitCode = 2;
    return;
  }
  const measured = JSON.parse(await fs.readFile(measuredFile, 'utf8'));
  const only = arg('screen');
  const report = [];
  let over = 0;
  for (const file of files) {
    const screen = file.replace('.json', '');
    if (file === 'README.md') continue;
    if (only && screen !== only) continue;
    const raw = JSON.parse(await fs.readFile(path.join(BOXES, file), 'utf8'));
    const expected = Object.entries(raw.boxes || {}).map(([name, b]) => ({ name, ...b }));
    const { rows, extra } = compare(expected, measured[screen]);
    over += rows.length;
    report.push(`\n[${screen}] 폭 ${raw.breakpoint} ${raw.auth} | 요소 ${expected.length}개 중 1px 초과 ${rows.length}개`);
    rows.forEach((x) => report.push(`  ${x.name}: ${x.result}`));
    if (extra.length) report.push(`  Figma 자료에 없는 코드 요소: ${extra.join(', ')}`);
  }
  console.log(report.join('\n'));
  console.log(`\n1px 초과 합계 ${over}개`);
  process.exitCode = over === 0 ? 0 : 1;
}

main().catch((e) => {
  console.error(e.message);
  process.exitCode = 2;
});
