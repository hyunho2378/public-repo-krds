// 문구 간결 표기 검사(UX/07 11장). 화면 문구 파일에서 "와 ", "과 ", "및", "입니다", "합니다", "하세요", "않습니다"를 찾아 목록을 만든다.
// 사용자 원문(README, 프로젝트 설명)은 검사 대상이 아니다. 대상은 화면 문구(copy/ko.js)와 API가 화면에 돌려주는 문구(api/static.js, server/src)다.
// 남은 건수가 0이 아니면 exit 1. 사용: node scripts/check-copy.mjs [--list]
import fs from 'node:fs/promises';
import path from 'node:path';

const TARGETS = ['src/copy/ko.js', 'src/copy/ui.js', 'src/api/static.js', '../server/src'];
const PATTERNS = [
  ['와 ', /와 /g],
  ['과 ', /과 /g],
  ['및', /및/g],
  ['입니다', /입니다/g],
  ['합니다', /합니다/g],
  ['하세요', /하세요/g],
  ['않습니다', /않습니다/g],
  // D-19 1장(UX-007 13장): 공공 깃랩 말이 아닌 이름 금지. 이슈 보드는 공공 깃랩 원문이라 허용
  ['금지 용어 관심 표시', /관심 표시/g],
  ['금지 용어 써 봤어요', /써 봤어요/g],
  ['금지 용어 변경 제안', /변경 제안/g],
  ['금지 용어 작업 갈래', /작업 갈래/g],
  ['금지 용어 변경 기록', /변경 기록/g],
  ['금지 용어 이슈', /이슈(?! 보드)/g],
  ['금지 용어 가입', /가입/g],
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

// UX/07 10장: 프로젝트 설명 정리 함수를 실제 공개 자료 전체에 돌려 ' | ' 가 남는지 센다(README 본문은 대상이 아니다)
const { cleanDescription } = await import('../src/components/Layout/description.js');
const snap = JSON.parse(await fs.readFile('../server/data/gitlab-public-snapshot.json', 'utf8'));
const pipeLeft = (snap.items || []).filter((p) => cleanDescription(p.description).includes(' | '));
for (const p of pipeLeft) hits.push({ file: 'gitlab-public-snapshot.json', line: p.id, label: ' | ', ctx: cleanDescription(p.description).slice(0, 40) });

const counts = Object.fromEntries([...PATTERNS.map(([l]) => l), ' | '].map((l) => [l, hits.filter((h) => h.label === l).length]));
if (process.argv.includes('--list') || hits.length) {
  for (const h of hits) console.log(`${h.file}:${h.line}: [${h.label}] ${h.ctx}`);
}
console.log(`문구 간결 표기 남은 건수 ${hits.length} (${Object.entries(counts).map(([k, v]) => `${k.trim()} ${v}`).join(', ')})`);
if (hits.length) process.exitCode = 1;
