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
    const isScreenMode = file.endsWith('ScreenMode.jsx') || file.endsWith('app/prefs.js');
    for (const [label, re] of RULES) {
      if (label === '브라우저 저장소' && isScreenMode) continue;
      for (const m of source.matchAll(re)) issues.push(`${file}: ${label} ${m[0]}`);
    }
    // D-15: 연한 채움(subtler, lighter, -light)은 회색 계열 외에는 금지. KRDS secondary 버튼도 금지
    for (const m of source.matchAll(/\bbg-light-(?!gray\b)[a-z]+\b/g)) issues.push(`${file}: D-15 연한 채움 배지 ${m[0]}`);
    for (const m of source.matchAll(/krds-btn[^"'`]*\bsecondary\b/g)) issues.push(`${file}: D-15 KRDS secondary 버튼 금지 ${m[0]}`);
    if (file.endsWith('.jsx')) {
      noComments.split('\n').forEach((line, i) => {
        if (/^\s*(\/\/|\/?\*)/.test(line) || !line.trim()) return;
        const code = line.replace(/\/\/.*$/, '').replace(/\/(?![/*])[^/\n]*[가-힣][^/\n]*\/[gimsuy]*/g, '');
        if (/[가-힣]/.test(code)) issues.push(`${file}:${i + 1}: 문구 직접 입력(src/copy/ko.js 사용) ${raw.split('\n')[i].trim().slice(0, 40)}`);
      });
    }
  }
}

await walk('src');
console.log(issues.length ? issues.join('\n') : 'PASS: source code forbidden patterns 0');
if (issues.length) process.exitCode = 1;
