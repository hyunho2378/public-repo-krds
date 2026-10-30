// 코드 규칙 검사. 실패하면 exit 1.
// 금지: 직접 색, 고정 치수(KRDS 공식 미디어 구간 제외), 임의 Tailwind 값, 이모지, 브라우저 저장소, 네이티브 select/date,
//       hover 확대, 화면 파일 안의 문구 직접 입력(문구는 src/copy/ko.js).
import fs from 'node:fs/promises';
import path from 'node:path';

const KRDS_MEDIA = /@media ?\((?:max-width: ?(?:767|1023|1279)px|min-width: ?(?:768|1024|1280)px)\)/g;
const RULES = [
  ['브라우저 저장소', /\b(?:localStorage|sessionStorage)\b/g],
  ['직접 색', /#[0-9a-fA-F]{3,8}\b|\b(?:rgb|rgba|hsl|hsla)\(/g],
  ['임의 Tailwind 값', /\b[a-z-]+-\[[^\]]+\]/g],
  ['고정 치수', /\b(?:\d*\.)?\d+(?:px|rem)\b/g],
  ['네이티브 선택 UI', /<select\b|type=["']date["']/g],
  ['이모지', /\p{Extended_Pictographic}/gu],
  ['hover 확대', /:hover[^}]*scale\(/g],
  // UX-007 12장: 외부 링크 아이콘과 장식 화살표 글자 금지. 새 창 링크는 newWindow()만 쓴다
  ['외부 링크 아이콘', /\bico-go\b|ico-external|ico-blank|open-new-window|open_new_window|external[-_]?link|launch\.svg|[↗↘↖↙➚➜›»]|\u2192/g],
  ['새 창 링크는 newWindow() 사용', /target=["']_blank["']/g],
];
const issues = [];

async function walk(dir) {
  for (const entry of await fs.readdir(dir, { withFileTypes: true })) {
    const file = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      await walk(file);
      continue;
    }
    // .generated.css는 자동 생성, .tokens.css는 Figma 뼈대 값을 모아 둔 곳(D-13)이라 검사에서 뺀다
    if (!/\.(jsx?|css)$/.test(file) || file.endsWith('.generated.css') || file.endsWith('.tokens.css')) continue;
    const raw = await fs.readFile(file, 'utf8');
    // 주석(/* ... */, {/* ... */})은 설명일 뿐이라 금지 패턴이 적혀있어도 검사에서 빼준다
    const noComments = raw.replace(/\{?\/\*[\s\S]*?\*\/\}?/g, (m) => ' '.repeat(m.length));
    const source = noComments.replace(KRDS_MEDIA, '@media(KRDS_BREAKPOINT)');
    // UX-007 1장: 화면 모드 선택은 저장해 기억해야 하므로 ScreenMode.jsx만 localStorage 허용
    // D-17 5장: 사이드바와 정보 영역 열림 선택도 기억해야 하므로 app/prefs.js도 허용(저장은 이 파일 한 곳)
    // 로고(Logo.jsx)는 로고 고유색(#E24329 #FC6D26 #FCA326)이라 직접 색 검사에서 뺀다. 새 창 속성은 newWindow.js 한 곳
    const isLogo = file.endsWith('Logo.jsx');
    const isNewWindow = file.endsWith('newWindow.js');
    const isScreenMode = file.endsWith('ScreenMode.jsx') || file.endsWith('app/prefs.js');
    for (const [label, re] of RULES) {
      if (label === '브라우저 저장소' && isScreenMode) continue;
      if (label === '직접 색' && isLogo) continue;
      if (label === '새 창 링크는 newWindow() 사용' && isNewWindow) continue;
      const target = label === '외부 링크 아이콘' ? source.replace(/^\s*\/\/.*$/gm, '') : source;
      for (const m of target.matchAll(re)) issues.push(`${file}: ${label} ${m[0]}`);
    }
    // D-15: 연한 채움(subtler, lighter, -light)은 회색 계열 외에는 금지. KRDS secondary 버튼도 금지
    for (const m of source.matchAll(/\bbg-light-(?!gray\b)[a-z]+\b/g)) issues.push(`${file}: D-15 연한 채움 배지 ${m[0]}`);
    for (const m of source.matchAll(/krds-btn[^"'`]*\bsecondary\b/g)) issues.push(`${file}: D-15 KRDS secondary 버튼 금지 ${m[0]}`);
    if (file.endsWith('.jsx') && !file.endsWith('StructuredList.jsx')) {
      // UX/07 10장: 프로젝트 설명은 ' | ' 영어 병기를 지운 cleanDescription으로만 그린다(README 원문은 Readme 부품이 그린다)
      noComments.split('\n').forEach((line, i) => {
        if (/\{[^}]*\b(?:p|project)\.description\b[^}]*\}|\{card\.summary\}/.test(line) && !/cleanDescription\(/.test(line)) issues.push(`${file}:${i + 1}: 프로젝트 설명 직접 표시(cleanDescription 사용) ${line.trim().slice(0, 50)}`);
      });
    }
    if (file.endsWith('.jsx')) {
      noComments.split('\n').forEach((line, i) => {
        if (/^\s*(\/\/|\/?\*)/.test(line) || !line.trim()) return;
        const code = line.replace(/\/\/.*$/, '').replace(/\/(?![/*])[^/\n]*[가-힣][^/\n]*\/[gimsuy]*/g, '');
        if (/[가-힣]/.test(code)) issues.push(`${file}:${i + 1}: 문구 직접 입력(src/copy/ko.js 사용) ${raw.split('\n')[i].trim().slice(0, 40)}`);
      });
    }
  }
}

// D-07, D-15: 청록 계열(색상 170~200도) 면 금지. 호버/선택/눌림 변수(action-secondary-*)가 최종적으로 청록이면 실패한다.
// 화면에서 실제로 풀린 색은 scripts/teal-inspect.js(브라우저)로 확인한다. 여기서는 소스에서 직접 쓴 청록 16진수 색을 찾는다.
async function tealCheck() {
  const hue = (hex) => { const n = parseInt(hex.slice(1), 16); const r = (n >> 16) / 255; const g = ((n >> 8) & 255) / 255; const b = (n & 255) / 255; const mx = Math.max(r, g, b); const mn = Math.min(r, g, b); const d = mx - mn; if (!d) return null; const l = (mx + mn) / 2; const s = d / (1 - Math.abs(2 * l - 1)); if (s < 0.12) return null; const h = mx === r ? ((g - b) / d) % 6 : mx === g ? (b - r) / d + 2 : (r - g) / d + 4; return (h * 60 + 360) % 360; };
  const css = await fs.readFile('src/styles.css', 'utf8');
  const dark = await fs.readFile('src/krds/dark.generated.css', 'utf8');
  const overridden = /html\[data-krds-mode="dark"\]\s*\{[^}]*--krds-color-action-secondary-hover:/.test(css);
  for (const m of dark.matchAll(/(--krds-dark-color-action-secondary-(?:hover|selected|pressed)):\s*(#[0-9a-fA-F]{6})/g)) {
    const h = hue(m[2]);
    if (h !== null && h >= 170 && h <= 200 && !overridden) issues.push('src/krds/dark.generated.css: 청록 면 ' + m[1] + ' ' + m[2] + ' (styles.css에서 회색으로 덮어쓰지 않음)');
  }
}
await tealCheck();
await walk('src');
console.log(issues.length ? issues.join('\n') : 'PASS: source code forbidden patterns 0');
if (issues.length) process.exitCode = 1;
