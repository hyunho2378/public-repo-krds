// Figma 대 코드 전수 대조. 입력: code_plan/figma_full.json(Figma 작업자 export_full.js), code_plan/measured_full.json(export-code-boxes.js),
// code_plan/parity_allow.json(의도한 차이). 출력: UX/audit_v3/parity_ledger.md, audits/parity_ledger.json.
// 대조 단위: 화면_폭_Auth. Figma 변형은 Breakpoint와 Auth가 같고 나머지 속성이 기본값(Drawer=Closed, Sidebar=Expanded, Info=Short,
// Dialog=Closed, Kind=NotFound, State=List, Role=none(Guest)/viewer→developer(Signed-in))인 것. 기본값이 아닌 변형은 '코드 재현 대기' 목록.
// 분류: 위치/크기(1px 초과), 문구(Figma 글자가 코드 글에 없음), 글자 속성(크기·굵기·줄 높이), 색(면·글자·테두리 hex), 모서리·안쪽·간격,
// 아이콘(이름 집합), Figma에만, 코드에만, 순서(같은 이름들의 문서 순서). 해소 규칙은 원장 머리에 적는다.
// 실행: node scripts/compare-parity.mjs [--screen G-08] [--bp 1920]   (npm run check:parity)
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
const rd = async (p) => JSON.parse(await fs.readFile(path.join(ROOT, p), 'utf8'));
const arg = (n) => (process.argv.includes(`--${n}`) ? process.argv[process.argv.indexOf(`--${n}`) + 1] : null);
const figma = await rd('code_plan/figma_full.json');
const code = await rd('code_plan/measured_full.json');
const allow = (await rd('code_plan/parity_allow.json')).rules;
const map = await rd('code_plan/figma_name_map.json');
const causes = (await rd('code_plan/parity_causes.json').catch(() => ({ causes: [] }))).causes;
const TOL = 1;
const W = { Thin: 100, Light: 300, Regular: 400, Medium: 500, SemiBold: 600, 'Semi Bold': 600, Bold: 700, ExtraBold: 800 };
const DEF = { Drawer: 'Closed', Sidebar: 'Expanded', Info: 'Short', Dialog: 'Closed', Kind: 'NotFound', State: 'List', Panel: 'Closed' };
const norm = (s) => String(s || '').replace(/\s+/g, ' ').trim();
// 경로 줄 구분자('/', '>')는 코드에서 CSS로 그려 글에 없으므로 문구 비교에서 뺀다
const normCrumb = (s) => norm(String(s || '').replace(/\s[/>›]\s/g, ' '));
const hex6 = (h) => (h ? String(h).toLowerCase().slice(0, 7) : null);
const iconName = (s) => String(s).replace(/^icon(-ext)?\//, '').replace(/^ext\//, '').replace(/^file\//, 'file:').replace(/[_\s]/g, '-').toLowerCase();
const allowed = (screen, bp, name, kind, field, fy) => allow.find((r) => (r.screen === '*' || r.screen === screen) && (r.bp === '*' || String(r.bp) === String(bp)) && (r.name === '*' || r.name === name.replace(/#\d+$/, '')) && r.kind === kind && (!r.field || r.field === field) && (r.minY == null || (fy ?? 0) >= r.minY));
const onlyScreen = arg('screen'); const onlyBp = arg('bp');

function pickVariants() {
  const base = {}; const waiting = [];
  for (const v of figma.data) {
    const p = v.props || {}; const auth = p.Auth || 'Guest';
    const extra = Object.entries(p).filter(([k]) => k !== 'Breakpoint' && k !== 'Auth');
    const isDefault = extra.every(([k, val]) => (k === 'Role' ? (auth === 'Guest' ? val === 'none' : true) : DEF[k] ? DEF[k] === val : false));
    const key = `${v.screen}_${v.breakpoint}_${auth}`;
    if (!isDefault) { waiting.push(`${v.screen}_${v.breakpoint}_${Object.entries(p).filter(([k]) => k !== 'Breakpoint').map(([k, x]) => `${k}-${x}`).join('_')}`); continue; }
    // Signed-in에 Role이 여럿이면 developer → viewer → owner 순으로 하나만(코드 기본 역할은 개발 스위치로 바꿈)
    const rank = { viewer: 1, developer: 0, owner: 2, none: 3 };
    if (!base[key] || (p.Role && rank[p.Role] < rank[base[key].props.Role])) base[key] = v;
  }
  return { base, waiting };
}

function cmp(screen, bp, auth, fv, cv) {
  const rows = []; const add = (kind, name, detail, fy) => { const a = allowed(screen, bp, name, kind, detail.field, fy); rows.push({ kind, name, ...detail, allowed: a ? a.reason : null }); };
  const fEls = {}; for (const e of fv.elements) { if (e.visible === false) continue; const k = e.index ? `${e.name}#${e.index + 1}` : e.name; fEls[k] = e; }
  const cEls = cv.elements || {};
  for (const [k, fe] of Object.entries(fEls)) {
    const ce = cEls[k];
    if (!ce) { add('only-figma', k, { want: fe.box }); continue; }
    for (const f of ['x', 'y', 'w', 'h']) { const d = Math.round(ce[f] - fe.box[f]); if (Math.abs(d) > TOL) add('box', k, { field: f, figma: fe.box[f], code: ce[f], diff: d }, fe.box.y); }
    const nt = k.startsWith('breadcrumb') ? normCrumb : norm;
    const ftexts = (fe.type === 'TEXT' ? [fe] : fe.texts || []).map((t) => nt(t.text)).filter(Boolean);
    const ctext = nt(ce.text);
    const missing = ftexts.filter((t) => !ctext.includes(t.replace(/…$/, '')));
    if (missing.length && ce.textLen <= 200) add('text', k, { figma: missing.slice(0, 4), code: ctext.slice(0, 120) });
    // 글자 속성과 글자색은 글자 하나짜리 요소(TEXT 또는 글자 1개를 가진 틀)에서만 비교(큰 틀의 '첫 글자'는 뜻이 없다)
    const ft = fe.type === 'TEXT' ? fe : (fe.texts || []).length === 1 ? fe.texts[0] : null;
    if (ft) {
      const fw = W[ft.weight] || Number(ft.weight) || null;
      const diffs = [];
      if (ft.size && ce.fs && ft.size !== ce.fs) diffs.push(`크기 ${ft.size}→${ce.fs}`);
      if (fw && ce.fw && fw !== ce.fw) diffs.push(`굵기 ${fw}→${ce.fw}`);
      if (ft.lineHeight && ce.lh && Math.round(ft.lineHeight) !== ce.lh) diffs.push(`줄 높이 ${ft.lineHeight}→${ce.lh}`);
      if (diffs.length) add('font', k, { detail: diffs.join(', ') });
      const fc = hex6(ft.color?.hex); if (fc && ce.color && fc !== hex6(ce.color)) add('color', k, { field: 'text', figma: `${fc} ${ft.color.var || ''}`, code: `${ce.color} ${ce.colorTok || ''}` });
    }
    const ff = fe.type === 'TEXT' ? null : hex6(fe.fill?.hex); if (ff && fe.fill?.opacity !== 0 && ff !== hex6(ce.bg)) add('color', k, { field: 'fill', figma: `${ff} ${fe.fill.var || ''}`, code: `${ce.bg || '없음'} ${ce.bgTok || ''}` });
    const fs_ = hex6(fe.stroke?.hex); if (fs_ && ce.border && fs_ !== hex6(ce.borderColor)) add('color', k, { field: 'stroke', figma: `${fs_} ${fe.stroke.var || ''}`, code: `${ce.borderColor} ${ce.borderTok || ''}` });
    const fr = Array.isArray(fe.radius) ? fe.radius[0] : fe.radius; if (fr != null && Math.abs(fr - ce.radius) > TOL) add('shape', k, { detail: `모서리 ${fr}→${ce.radius}` });
    if (Array.isArray(fe.padding) && fe.padding.some((v, i) => Math.abs(v - ce.pad[i]) > TOL)) add('shape', k, { detail: `안쪽 ${fe.padding.join(' ')}→${ce.pad.join(' ')}` });
    if (fe.gap != null && fe.layout && fe.layout !== 'NONE' && (ce.nchild ?? 2) >= 2) { const cg = fe.layout === 'HORIZONTAL' ? ce.gap[1] : ce.gap[0]; if (Math.abs(fe.gap - cg) > TOL) add('shape', k, { detail: `간격 ${fe.gap}→${cg}` }); }
    const fi = [...new Set((fe.icons || []).map(iconName))].sort(); const ci = [...new Set((ce.icons || []).map(iconName))].sort();
    if (fi.length && fi.join() !== ci.join()) add('icon', k, { figma: fi, code: ci });
  }
  for (const k of Object.keys(cEls)) if (!fEls[k]) add('only-code', k, {});
  // 순서: 두 쪽 모두 화면에 보이는 위치(y, 같은 줄이면 x) 순으로 늘어놓고 같은 이름들의 순서를 비교(Figma 레이어 순서는 쌓임 순서라 쓰지 않음)
  const common = Object.keys(fEls).filter((k) => cEls[k]);
  const byPos = (get) => [...common].sort((a, b) => { const A = get(a), B = get(b); return Math.abs(A.y - B.y) > 4 ? A.y - B.y : A.x - B.x; });
  const fo = byPos((k) => fEls[k].box); const co = byPos((k) => cEls[k]);
  if (fo.join() !== co.join()) add('order', '(화면)', { figma: fo.join(' > ').slice(0, 300), code: co.join(' > ').slice(0, 300) });
  return rows;
}

const { base, waiting } = pickVariants();
const KINDS = ['box', 'text', 'font', 'color', 'shape', 'icon', 'only-figma', 'only-code', 'order'];
const LABEL = { box: '위치/크기', text: '문구', font: '글자 속성', color: '색', shape: '모서리·안쪽·간격', icon: '아이콘', 'only-figma': 'Figma에만', 'only-code': '코드에만', order: '순서' };
const owner = (s) => { const n = Number(s.slice(2)); if (/^R-/.test(s) && [2, 3, 4, 5, 6, 7, 8, 9, 25, 27, 28, 29].includes(n)) return 'C1'; if (/^R-/.test(s) && [10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21, 22, 23, 24, 26].includes(n)) return 'C2'; return 'D21'; };
const result = { generated: new Date().toISOString(), rules: 'UX/audit_v3/parity_ledger.md 0절', screens: {}, missingCode: [], waiting };
for (const [key, fv] of Object.entries(base).sort()) {
  const [screen, bp, auth] = key.split('_');
  if (onlyScreen && screen !== onlyScreen) continue; if (onlyBp && bp !== onlyBp) continue;
  const cv = code.screens[key];
  if (!cv) { result.missingCode.push(key); continue; }
  const rows = cmp(screen, bp, auth, fv, cv);
  const counts = Object.fromEntries(KINDS.map((k) => [k, rows.filter((r) => r.kind === k && !r.allowed).length]));
  result.screens[key] = { owner: owner(screen), counts, allowed: rows.filter((r) => r.allowed).length, rows };
}
await fs.mkdir(path.join(ROOT, 'audits'), { recursive: true });
// --screen/--bp로 일부만 돌리면 기존 원장에 그 부분만 바꿔 넣는다(다른 작업자 화면 결과를 지우지 않게)
if (onlyScreen || onlyBp) {
  const prev = await fs.readFile(path.join(ROOT, 'audits', 'parity_ledger.json'), 'utf8').then(JSON.parse).catch(() => null);
  if (prev?.screens) { for (const [k, v] of Object.entries(result.screens)) prev.screens[k] = v; result.screens = Object.fromEntries(Object.entries(prev.screens).sort()); }
}
await fs.writeFile(path.join(ROOT, 'audits', 'parity_ledger.json'), JSON.stringify(result, null, 1));
// 원장(md): 0절 해소 규칙, 1절 화면별 건수 표, 2절 화면별 세부(허용 아님만)
const L = [];
L.push('# Figma 대 코드 전수 대조 원장(parity ledger)', '', `- 생성: ${result.generated}. 입력: code_plan/figma_full.json, code_plan/measured_full.json, code_plan/parity_allow.json`, '- 다시 만들기: 개발 서버에서 측정(app/scripts/export-code-boxes.mjs 또는 Aside 탭에서 export-code-boxes.js) 뒤 `npm run check:parity`', '');
L.push('## 0. 해소 규칙', '', '1. 값이 실제 공공 깃랩 실측과 같으면 그 값이 정답이다. 다른 쪽(코드 또는 Figma)을 맞춘다', '2. 실제 실측이 없는 덧붙임(A 화면, 소개 카드, 업무 분야 등)은 Figma가 정답이다. 코드가 따른다', '3. 코드와 Figma가 둘 다 실제와 다르면 실제를 따라 둘 다 고친다', '4. 사용자 결정 기록(D-xx)이 있으면 그 결정이 앞선다(예: 판 안 여백 48/32/24/16, KRDS 글자 단계, 4의 배수)', '5. 의도한 차이는 code_plan/parity_allow.json에 근거와 함께 올린다. 원장 건수는 허용을 뺀 값', '4-1. 적용 중인 사용자 결정: 판 안 바닥글 = 판과 같은 면 + 위 구분선만, 채움 없음(D-20 개정 10. 31.) · 로그인 바닥글 = 바깥색 위 전체 폭 gray-90(G-08) · A-01 = G-02 실제 검색 구조 + 덧붙임 업무로 찾기 한 묶음(맨 위 3개 + 더보기, UX/14 3장) · 상단 바와 아이콘 단추 1024 미만 44(터치) · 판 안 여백 48/32/24/16, 바깥 8(D-21) · 4의 배수(D-16). 바닥글 면 색 차이는 이 결정에 맞춰 양쪽을 고쳐 해소한다(허용 목록에 올리지 않음)', '6. 담당: 코드 C1(R-02~09, 25, 27~29) · C2(R-10~24, 26) · D21(전역 틀, R-01, R-30, G, A, 로그인), Figma는 Figma 작업자', '');
// 0-1. 원인 상위 20: 같은 분류 + 요소 이름(+ 항목) 묶음
{
  const g = new Map();
  for (const [key, sc] of Object.entries(result.screens)) for (const r of sc.rows) { if (r.allowed) continue; const n = r.name.replace(/#\d+$/, ''); const sig = [r.kind, n, r.kind === 'box' ? r.field : r.kind === 'color' ? r.field : ''].join('|'); const o = g.get(sig) || { kind: r.kind, name: n, field: r.kind === 'box' || r.kind === 'color' ? r.field : '', n: 0, owners: {}, ex: key }; o.n++; o.owners[sc.owner] = (o.owners[sc.owner] || 0) + 1; g.set(sig, o); }
  const top = [...g.values()].sort((a, b) => b.n - a.n).slice(0, 20);
  L.push('## 0-1. 원인 상위 20(같은 원인 반복 묶음)', '', '| 순위 | 원인(분류 · 요소 · 항목) | 건수 | 담당 화면 분포 | 해소 쪽 | 비고 | 예 |', '|---:|---|---:|---|---|---|---|');
  top.forEach((o, i) => { const c = causes.find((x) => x.kind === o.kind && x.name === o.name && (!x.field || x.field === o.field)); L.push(`| ${i + 1} | ${LABEL[o.kind]} · ${o.name}${o.field ? ' · ' + o.field : ''} | ${o.n} | ${Object.entries(o.owners).map(([k, v]) => `${k} ${v}`).join(', ')} | ${c ? c.side : '미정'} | ${c ? c.note : ''} | ${o.ex} |`); });
  L.push('');
}
L.push('## 0-2. 로그인 상태(Signed-in) 대조', '', '- 정적 배포본(GitHub Pages)에는 로그인 상태를 만들 수 없어(개발용 ?auth 스위치는 배포본에서 꺼짐) Signed-in 변형은 개발 서버(http://127.0.0.1:5731, ?auth=Signed-in)에서만 잰다. 배포본 검증은 Guest만', '', '| 화면 | Signed-in 변형 수(폭) | 개발 서버 대조 | 역할 변형(Figma Role) |', '|---|---:|---|---|');
for (const s of map.screens) { const n = Object.keys(result.screens).filter((k) => k.startsWith(s.screen + '_') && k.endsWith('_Signed-in')).length; L.push(`| ${s.screen} ${s.figmaSet.replace(/^\S+ /, '')} | ${n} | ${n ? '함' : '없음'} | ${s.code?.roles?.length ? s.code.roles.join(', ') + '(코드 ?role= 재현 대기)' : '-'} |`); }
L.push('');
L.push('## 1. 화면별 차이 건수(허용 뺀 값)', '', `| 화면_폭_auth | 담당 | ${KINDS.map((k) => LABEL[k]).join(' | ')} | 합 | 허용 |`, `|---|---|${KINDS.map(() => '---:').join('|')}|---:|---:|`);
const tot = Object.fromEntries(KINDS.map((k) => [k, 0])); let all = 0;
for (const [key, s] of Object.entries(result.screens)) { const sum = KINDS.reduce((a, k) => a + s.counts[k], 0); all += sum; KINDS.forEach((k) => (tot[k] += s.counts[k])); L.push(`| ${key} | ${s.owner} | ${KINDS.map((k) => s.counts[k]).join(' | ')} | ${sum} | ${s.allowed} |`); }
L.push(`| **합** |  | ${KINDS.map((k) => tot[k]).join(' | ')} | ${all} |  |`, '');
if (result.missingCode.length) L.push(`- 코드 측정 없음: ${result.missingCode.join(', ')}`, '');
L.push(`- 기본값이 아닌 Figma 변형(코드 재현 대기, ${waiting.length}개): ${waiting.slice(0, 60).join(', ')}${waiting.length > 60 ? ' …' : ''}`, '');
L.push('## 2. 화면별 세부(허용 아님)', '');
for (const [key, s] of Object.entries(result.screens)) {
  const rows = s.rows.filter((r) => !r.allowed); if (!rows.length) continue;
  L.push(`### ${key} (${s.owner}, ${rows.length}건)`, '', '| 분류 | 요소 | 내용 |', '|---|---|---|');
  for (const r of rows.slice(0, 80)) {
    const d = r.kind === 'box' ? `${r.field} Figma ${r.figma} / 코드 ${r.code} (${r.diff > 0 ? '+' : ''}${r.diff})` : r.kind === 'text' ? `Figma 글 '${r.figma.join("', '")}' 없음. 코드: '${r.code}'` : r.kind === 'color' ? `${r.field} Figma ${r.figma} / 코드 ${r.code}` : r.kind === 'icon' ? `Figma ${r.figma.join(',')} / 코드 ${r.code.join(',') || '없음'}` : r.kind === 'only-figma' ? `코드에 이름표 없음(Figma ${r.want.x},${r.want.y} ${r.want.w}x${r.want.h})` : r.kind === 'only-code' ? 'Figma에 없음' : r.kind === 'order' ? `Figma ${r.figma} / 코드 ${r.code}` : r.detail;
    L.push(`| ${LABEL[r.kind]} | ${r.name} | ${String(d).replace(/\|/g, '/')} |`);
  }
  if (rows.length > 80) L.push(`| … | | ${rows.length - 80}건 더(audits/parity_ledger.json) |`);
  L.push('');
}
await fs.writeFile(path.join(ROOT, 'UX', 'audit_v3', 'parity_ledger.md'), L.join('\n'));
console.log(`대조 ${Object.keys(result.screens).length}개, 차이 ${all}건(허용 뺀 값). ${KINDS.map((k) => `${LABEL[k]} ${tot[k]}`).join(', ')}`);
if (process.argv.includes('--strict') && all) process.exitCode = 1;
