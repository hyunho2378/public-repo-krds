// 로그인 로고 위치 회귀 검사(audit:code): Figma G-08과 D-12(2026. 10. 31. 사용자 지적)대로 행정안전부 로고(MoisLogo)는
// 로그인 화면 왼쪽 열(.rb-login3-side, data-figma="login-notice") 안에만 있고 오른쪽 폼 열(.rb-login3-main, data-figma="login-card")에는 없어야 한다.
import fs from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
const dir = path.dirname(fileURLToPath(import.meta.url));
const src = await fs.readFile(path.join(dir, '../src/screens/P12_Login.jsx'), 'utf8');
const block = (cls) => {
  const i = src.indexOf(`className="${cls}"`);
  if (i < 0) return null;
  const tag = src.lastIndexOf('<', i);
  const name = src.slice(tag + 1).match(/^\w+/)[0];
  let depth = 0; const re = new RegExp(`<${name}[\\s>]|</${name}>`, 'g'); re.lastIndex = tag;
  for (let m; (m = re.exec(src));) { depth += m[0].startsWith('</') ? -1 : 1; if (depth === 0) return src.slice(tag, m.index); }
  return null;
};
const side = block('rb-login3-side');
const main = block('rb-login3-main');
const bad = [];
if (!side) bad.push('왼쪽 열(.rb-login3-side)이 없다');
else if (!/<MoisLogo\b/.test(side)) bad.push('행정안전부 로고가 왼쪽 열에 없다');
if (!main) bad.push('오른쪽 폼 열(.rb-login3-main)이 없다');
else if (/<MoisLogo\b/.test(main)) bad.push('행정안전부 로고가 오른쪽 폼 열에 있다');
if ((src.match(/<MoisLogo\b/g) || []).length !== 1) bad.push('로그인 화면 행정안전부 로고는 하나만');
console.log(bad.length ? `로그인 로고 위치 어긋남: ${bad.join(', ')}` : 'PASS: 로그인 로고는 왼쪽 열에만');
if (bad.length) process.exitCode = 1;
