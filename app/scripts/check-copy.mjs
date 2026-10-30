// 문구 간결 표기 검사(UX/07 11장). 화면 문구 파일에서 "와 ", "과 ", "및", "입니다", "합니다", "하세요", "않습니다"를 찾아 목록을 만든다.
// 사용자 원문(README, 프로젝트 설명)은 검사 대상이 아니다. 대상은 화면 문구(copy/ko.js)와 API가 화면에 돌려주는 문구(api/static.js, server/src)다.
// 남은 건수가 0이 아니면 exit 1. 사용: node scripts/check-copy.mjs [--list]
import fs from 'node:fs/promises';
import path from 'node:path';

const TARGETS = ['src/copy/ko.js', 'src/api/static.js', '../server/src'];
const PATTERNS = [
  ['와 ', /와 /g],
  ['과 ', /과 /g],
  ['및', /및/g],
  ['입니다', /입니다/g],
  ['합니다', /합니다/g],
  ['하세요', /하세요/g],
  ['않습니다', /않습니다/g],
];
// 조사 "와/과"가 아닌 낱말(결과, 통과 같은 명사, 도와 같은 동사 활용)은 건수에서 뺀다
const NOT_PARTICLE = /(?:결과|성과|효과|경과|부과|교과|인과|학과|통과|과|도와|고와|나와|와)\s/;
const NOT_PARTICLE_WORDS = ['결과 ', '성과 ', '효과 ', '경과 ', '부과 ', '교과 ', '인과 ', '학과 ', '통과 ', '도와 ', '나와 '];

async function files(target) {
  const st = await fs.stat(target);
  if (!st.isDirectory()) return [target];
  const out = [];
  for (const e of await fs.readdir(target, { withFileTypes: true })) {
    if (e.isDirectory()) continue;
    if (/\.(js|mjs)$/.test(e.name)) out.push(path.join(target, e.name));
  }
  return out;
}

const hits = [];
for (const target of TARGETS) {
  for (const file of await files(target)) {
    const lines = (await fs.readFile(file, 'utf8')).split('\n');
    lines.forEach((raw, i) => {
      if (/^\s*(\/\/|\/?\*)/.test(raw)) return;
      const line = raw.replace(/\/\*.*?\*\//g, '').replace(/\s\/\/.*$/, '');
      if (!/[가-힣]/.test(line)) return;
      for (const [label, re] of PATTERNS) {
        for (const m of line.matchAll(re)) {
          if (label === '와 ' || label === '과 ') {
            const head = line.slice(0, m.index + m[0].length);
            if (NOT_PARTICLE_WORDS.some((w) => head.endsWith(w))) continue;
          }
          const ctx = line.slice(Math.max(0, m.index - 12), m.index + 14).trim();
          hits.push({ file, line: i + 1, label, ctx });
        }
      }
    });
  }
}

const counts = Object.fromEntries(PATTERNS.map(([l]) => [l, hits.filter((h) => h.label === l).length]));
if (process.argv.includes('--list') || hits.length) {
  for (const h of hits) console.log(`${h.file}:${h.line}: [${h.label}] ${h.ctx}`);
}
console.log(`문구 간결 표기 남은 건수 ${hits.length} (${Object.entries(counts).map(([k, v]) => `${k.trim()} ${v}`).join(', ')})`);
if (hits.length) process.exitCode = 1;
