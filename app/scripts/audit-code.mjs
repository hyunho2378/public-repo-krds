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
    if (!/\.(jsx?|css)$/.test(file) || file.endsWith('.generated.css')) continue;
    const raw = await fs.readFile(file, 'utf8');
    const source = raw.replace(KRDS_MEDIA, '@media(KRDS_BREAKPOINT)');
    for (const [label, re] of RULES) for (const m of source.matchAll(re)) issues.push(`${file}: ${label} ${m[0]}`);
    if (file.endsWith('.jsx')) {
      raw.split('\n').forEach((line, i) => {
        if (/^\s*(\/\/|\/?\*)/.test(line)) return;
        const code = line.replace(/\/\/.*$/, '').replace(/\/(?![/*])[^/\n]*[가-힣][^/\n]*\/[gimsuy]*/g, '');
        if (/[가-힣]/.test(code)) issues.push(`${file}:${i + 1}: 문구 직접 입력(src/copy/ko.js 사용) ${line.trim().slice(0, 40)}`);
      });
    }
  }
}

await walk('src');
console.log(issues.length ? issues.join('\n') : 'PASS: source code forbidden patterns 0');
if (issues.length) process.exitCode = 1;
