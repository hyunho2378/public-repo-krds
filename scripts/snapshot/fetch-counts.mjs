// 공공 깃랩이 돌아오면 모든 공개 프로젝트의 커밋, 브랜치, 태그 개수를 모아 data/raw/{id}/counts.json에 둔다. 그 뒤 build.mjs가 스냅샷에 싣는다.
// - 브랜치, 태그: per_page=1 요청의 x-total 헤더
// - 커밋: 공공 깃랩 커밋 목록에는 x-total이 없어 100개씩 쪽을 두 배로 건너뛰고 이분 탐색(앱 client.js countCommits와 같은 방식)
// - 요청 사이 1초 이상, 이미 있는 값은 건너뛴다(중단 후 다시 실행하면 이어서). 공공 깃랩이 200이 아니면 시작하지 않는다
// 실행: node scripts/snapshot/fetch-counts.mjs [--limit N]   (끝나면 node scripts/snapshot/build.mjs)
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RAW = path.join(ROOT, 'data/raw');
const API = 'https://gitlab.aigov.go.kr/api/v4';
const GAP_MS = 1100;
const limitArg = process.argv.indexOf('--limit');
const LIMIT = limitArg > 0 ? Number(process.argv[limitArg + 1]) : Infinity;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let last = 0;
async function get(url) {
  const wait = last + GAP_MS - Date.now();
  if (wait > 0) await sleep(wait);
  last = Date.now();
  const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: AbortSignal.timeout(15000) });
  if (r.status === 429) { await sleep(Number(r.headers.get('retry-after') || 30) * 1000); return get(url); }
  return r;
}
async function total(url) {
  const r = await get(url);
  if (!r.ok) return null;
  const t = r.headers.get('x-total');
  if (t != null) return Number(t);
  const d = await r.json().catch(() => []);
  return Array.isArray(d) ? d.length : null;
}
async function commitCount(id) {
  const size = async (n) => { const r = await get(`${API}/projects/${id}/repository/commits?per_page=100&page=${n}`); if (!r.ok) throw new Error(String(r.status)); const d = await r.json(); return Array.isArray(d) ? d.length : 0; };
  const first = await size(1);
  if (first < 100) return first;
  let lo = 1, hi = 2;
  while ((await size(hi)) > 0) { lo = hi; hi *= 2; if (hi > 4096) return null; }
  while (hi - lo > 1) { const mid = (lo + hi) >> 1; if ((await size(mid)) > 0) lo = mid; else hi = mid; }
  return (lo - 1) * 100 + (await size(lo));
}

const ping = await fetch(`${API}/projects?per_page=1`).catch(() => null);
if (!ping || ping.status !== 200) { console.log(`공공 깃랩 응답 ${ping?.status ?? '없음'}: 시작하지 않음`); process.exit(0); }
const list = JSON.parse(fs.readFileSync(path.join(RAW, '_list.json'), 'utf8')).filter((p) => p.visibility === 'public');
let done = 0;
for (const p of list) {
  if (done >= LIMIT) break;
  const file = path.join(RAW, String(p.id), 'counts.json');
  const prev = fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {};
  if (prev.commits != null && prev.branches != null && prev.tags != null) continue;
  fs.mkdirSync(path.dirname(file), { recursive: true });
  const out = { ...prev };
  try {
    if (out.branches == null) out.branches = await total(`${API}/projects/${p.id}/repository/branches?per_page=1`);
    if (out.tags == null) out.tags = await total(`${API}/projects/${p.id}/repository/tags?per_page=1`);
    if (out.commits == null) out.commits = await commitCount(p.id);
  } catch (e) {
    console.log(p.id, '건너뜀', e.message);
  }
  out.fetchedAt = new Date().toISOString();
  fs.writeFileSync(file, JSON.stringify(out));
  done++;
  console.log(p.id, out.commits, out.branches, out.tags);
}
console.log(`끝: ${done}개`);
