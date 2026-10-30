// 연속 폭 점검 결과 JSON(UX/fluid_check/result.json 또는 check-fluid.mjs의 OUT_JSON)을 읽어 UX/10_연속폭_점검.md 표를 쓴다.
// 사용: node scripts/fluid-report.mjs [결과.json ...]  (여러 개면 합친다)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const HERE = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(HERE, '..', '..');
const files = process.argv.slice(2).length ? process.argv.slice(2) : [path.join(ROOT, 'UX', 'fluid_check', 'result.json')];
const parts = await Promise.all(files.map(async (f) => JSON.parse(await fs.readFile(f, 'utf8'))));
const first = parts[0];
const rows = parts.flatMap((d) => d.rows || []);
const sigs = new Map(parts.flatMap((d) => d.sigs || []));
const menuViolations = parts.flatMap((d) => d.menuViolations || []);
const wsOf = (r) => (r.ws || r.w || []).map(String);
const rangeOf = (list) => {
  const nums = [...new Set(list.map((x) => parseInt(x, 10)))].sort((a, b) => a - b);
  if (!nums.length) return '';
  const out = []; let s = nums[0]; let l = nums[0];
  for (const n of nums.slice(1)) { if (n - l <= 9) l = n; else { out.push(s === l ? `${s}` : `${s}~${l}`); s = l = n; } }
  out.push(s === l ? `${s}` : `${s}~${l}`);
  return out.join(', ');
};
const bad = rows.filter((r) => r.kind !== 'K');
const info = rows.filter((r) => r.kind === 'K');
let md = `# 연속 폭 점검\n\n`;
md += `- 실행일: ${first.when || ''}, 대상: ${first.build || ''}\n`;
md += `- 도구: app/scripts/check-fluid.mjs(playwright 판)와 같은 검사 함수(fluid-inspect.js, edge-inspect.js, menu-inspect.js)를 Aside 브라우저에서 돌렸다. 이동 뒤에 setViewportSize를 하고 window.innerWidth가 기대 폭과 같은지 단언한다(scripts/viewport.mjs와 같은 규칙)\n`;
md += `- 범위: 경로 ${first.paths}개 x 폭 ${first.widths}단계(${first.widthMin}~${first.widthMax}, 8px 간격 + 중단점 앞뒤 1px: 319/320, 359/360, 479/480, 767/768, 1023/1024, 1279/1280, 1439/1440, 1919/1920, 2559/2560, 3840) x 높이 ${(first.heights || []).join('/')} = ${first.states}단계\n`;
md += `- 메뉴 열림: 대표 ${first.menuPaths?.length || 0}개 경로(${(first.menuPaths || []).join(', ')}), 폭 ${first.menuWidths}단계, 메뉴 ${first.menuOpened}번 열어 높이 32/한 줄/폭 160~320/가장자리 12 검사\n`;
md += `- 큰 폭: ${first.centered || ''}\n`;
md += `- 결과: 위반(A 넘침, B 겹침, C 한 글자 줄바꿈, D 두 줄 쪼개짐, E 왼쪽 선, F 잘림) ${bad.length}건, 메뉴 위반 ${menuViolations.length}건. 참고(K 마지막 줄 한 어절) ${info.length}종\n\n`;
if (first.dock) md += `- 정보 패널(UX-007 14장): ${first.dock.note} (${first.dock.states}단계, 위반 ${first.dock.violations}건). 대표 스크린샷: ${(first.dock.shots || []).map((s) => `fluid_check/${s}`).join(', ')}\n`;
md += `\n## 위반\n\n`;
if (!bad.length && !menuViolations.length) md += `없음.\n\n`;
else {
  md += `| 폭 구간 | 경로 | 종류 | 내용 | 스크린샷 |\n|---|---|---|---|---|\n`;
  for (const r of bad) md += `| ${rangeOf(wsOf(r))} | ${r.p} | ${r.kind} | ${r.detail.replace(/\|/g, '/')} | ${r.shot ? `fluid_check/${r.shot}` : ''} |\n`;
  for (const m of menuViolations) md += `| ${rangeOf(m.ws)} | ${m.p} | 메뉴 | ${m.label}: ${m.v} | ${m.shot ? `fluid_check/${m.shot}` : ''} |\n`;
  md += `\n`;
}
md += `## 이번 점검 전에 고친 것(같은 쓸기에서 나온 위반)\n\n`;
md += `| 폭 구간 | 경로 | 종류 | 고친 방법 |\n|---|---|---|---|\n`;
md += `| 320~480 | 저장소 화면 | A 쪽 가로 스크롤(머리글 오른쪽 넘침) | 머리글 왼쪽 묶음이 줄어들게(min-width 0, 경로 말줄임), 767 이하 머리글 검색 아이콘 숨김(하단 탭바가 찾기를 맡음) |\n`;
md += `| 320~360 | /projects/150 | A 커밋 막대 넘침 | 커밋 막대와 자식에 max-width 100%, min-width 0 |\n`;
md += `| 319~767 | /projects/150, /code, 머지 리퀘스트 상세 | A 표 상자 넘침 | 표 상자 안에서 가로 스크롤(max-width 100%, overflow-x auto) |\n`;
md += `| 319~752 | /about, /files | A 표 넘침 | 같은 규칙 |\n`;
md += `| 319~544 | /releases | D "최신" 배지 두 줄 | 배지 white-space nowrap |\n`;
md += `| 320~767 | /my 등 | E 왼쪽 메뉴 오탐 | 서랍(position fixed)은 왼쪽 선 비교에서 제외 |\n`;
md += `| 768 | /login | A 2열이 넘침 | 1023 이하 1열로 쌓음 |\n\n`;
md += `## 구성이 바뀌는 폭(G): 왼쪽 메뉴, 서랍 버튼, 탭 줄, 하단 탭바, 검색의 있음/없음\n\n`;
const byPath = new Map();
for (const [key, change] of sigs) { const [p, h, w] = key.split('|'); const k = `${p}|${change}`; if (!byPath.has(k)) byPath.set(k, []); byPath.get(k).push(`${w}`); }
md += `| 경로 | 변화(전 -> 후) | 폭 |\n|---|---|---|\n`;
for (const [k, ws] of byPath) { const [p, change] = k.split('|'); md += `| ${p} | ${change} | ${rangeOf(ws)} |\n`; }
md += `\n## 참고(K): 마지막 줄 한 어절\n\n${info.length}종이 잡혔다(폭마다 줄바꿈 위치가 달라 생기는 짧은 마지막 줄). 위반으로 세지 않는다. 목록은 UX/fluid_check/result.json의 rows(kind K)에 있다.\n\n`;
if (first.refShots?.length) {
  md += `## 대표 스크린샷(page.screenshot으로 저장)\n\n| 경로 | 360 | 768 | 1280 | 2560 |\n|---|---|---|---|---|\n`;
  const byP = new Map();
  for (const s of first.refShots) { const m = /^ref_(\d+)_(.*)\.jpg$/.exec(s); if (!m) continue; if (!byP.has(m[2])) byP.set(m[2], {}); byP.get(m[2])[m[1]] = s; }
  for (const [p, o] of byP) md += `| ${p} | ${['360', '768', '1280', '2560'].map((w) => (o[w] ? `fluid_check/${o[w]}` : '')).join(' | ')} |\n`;
}
await fs.writeFile(path.join(ROOT, 'UX', '10_연속폭_점검.md'), md);
console.log(`위반 ${bad.length}건, 메뉴 위반 ${menuViolations.length}건, 참고 ${info.length}종 -> UX/10_연속폭_점검.md`);
if (bad.length || menuViolations.length) process.exitCode = 1;
