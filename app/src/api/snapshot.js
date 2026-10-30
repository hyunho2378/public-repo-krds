// 공공 깃랩이 응답하지 않을 때(점검, 5xx, 네트워크 오류, 6초 초과) 저장된 자료(app/public/data/snapshot)로 같은 응답 모양을 만든다.
// 목록은 index.json 한 파일, 프로젝트 상세는 요청할 때만 projects/{id}.json을 받는다. 저장된 자료에 없는 것은 SNAPSHOT_MISSING 오류로 알린다.
const SNAP = (import.meta.env.BASE_URL || '/') + 'data/snapshot/';
export const SNAPSHOT_MISSING = 'SNAPSHOT_MISSING';

export class SnapshotMissing extends Error {
  constructor() {
    super('저장된 자료에 없습니다');
    this.status = 200;
    this.code = SNAPSHOT_MISSING;
  }
}

let indexP = null;
const details = new Map();
const getJson = (u) => fetch(u).then((r) => (r.ok ? r.json() : null)).catch(() => null);
export function snapshotIndex() {
  if (!indexP) indexP = getJson(SNAP + 'index.json');
  return indexP;
}
function detail(id) {
  if (!details.has(id)) details.set(id, getJson(`${SNAP}projects/${id}.json`));
  return details.get(id);
}

// 띠 표시: 대체 중인지와 조회 날짜를 앱에 알린다
export const snapshotState = { on: false, date: null };
export function setSnapshotOn(on, date = snapshotState.date) {
  if (snapshotState.on === on && snapshotState.date === date) return;
  snapshotState.on = on;
  snapshotState.date = date;
  window.dispatchEvent(new CustomEvent('rb-snapshot', { detail: { ...snapshotState } }));
}

const ok = (data, total = null, nextPage = null) => ({
  mock: false, source: 'snapshot', snapshot: true,
  state: Array.isArray(data) && !data.length ? 'Empty' : 'Ideal',
  data, pagination: { total, nextPage },
});
function page(list, q, totalOverride) {
  const per = Math.min(100, Math.max(1, Number(q.get('per_page')) || 20));
  const pg = Math.max(1, Number(q.get('page')) || 1);
  const items = list.slice((pg - 1) * per, pg * per);
  return ok(items, totalOverride ?? list.length, pg * per < list.length ? String(pg + 1) : null);
}
const has = (s, q) => String(s || '').toLowerCase().includes(q);

export async function snapshotGet(sub, query) {
  const q = new URLSearchParams(query);
  const idx = await snapshotIndex();
  if (!idx) throw new SnapshotMissing();
  setSnapshotOn(true, idx.meta?.fetchedDate || null);
  const all = idx.projects || [];
  let m;

  if (sub === 'projects') {
    let list = all;
    const arch = q.get('archived');
    if (arch === 'true') list = list.filter((p) => p.archived);
    else if (arch === 'false') list = list.filter((p) => !p.archived);
    const s = (q.get('search') || '').toLowerCase();
    if (s) list = list.filter((p) => has(p.name, s) || has(p.path_with_namespace, s) || has(p.description, s) || has(p.namespace?.name, s));
    const topic = q.get('topic');
    if (topic) list = list.filter((p) => (p.topics || []).includes(topic));
    const key = q.get('order_by') || 'created_at';
    const dir = q.get('sort') === 'asc' ? 1 : -1;
    list = [...list].sort((a, b) => (typeof a[key] === 'number' ? (a[key] - b[key]) : String(a[key] ?? '').localeCompare(String(b[key] ?? ''), 'ko')) * dir);
    return page(list, q);
  }
  if (sub === 'topics') {
    const counts = new Map();
    for (const p of all) for (const tp of p.topics || []) counts.set(tp, (counts.get(tp) || 0) + 1);
    const s = (q.get('search') || '').toLowerCase();
    const list = [...counts].filter(([n]) => !s || has(n, s)).sort((a, b) => b[1] - a[1]).map(([name, n], i) => ({ id: i + 1, name, title: name, total_projects_count: n, avatar_url: null }));
    return page(list, q);
  }
  if (sub === 'groups') {
    if (q.get('archived') === 'true') return page([], q);
    const g = new Map();
    for (const p of all) { const n = p.namespace; if (!n?.id) continue; if (!g.has(n.id)) g.set(n.id, { id: n.id, name: n.name, full_name: n.name, path: n.path, full_path: n.full_path, avatar_url: n.avatar_url, web_url: `https://gitlab.aigov.go.kr/${n.full_path || n.path}`, created_at: p.created_at, description: '' }); }
    const s = (q.get('search') || '').toLowerCase();
    const list = [...g.values()].filter((x) => !s || has(x.name, s)).sort((a, b) => String(b.created_at).localeCompare(String(a.created_at)) * (q.get('sort') === 'asc' ? -1 : 1));
    return page(list, q);
  }
  if ((m = sub.match(/^groups\/(\d+)\/projects$/))) return page(all.filter((p) => p.namespace?.id === Number(m[1])), q);
  if (sub.startsWith('groups/')) throw new SnapshotMissing();

  m = sub.match(/^projects\/(\d+)(?:\/(.*))?$/);
  if (!m) throw new SnapshotMissing();
  const id = Number(m[1]);
  const rest = m[2] || '';
  const base = all.find((p) => p.id === id);
  const d = await detail(id);
  if (!rest) {
    if (!base && !d) throw Object.assign(new Error('자료를 찾을 수 없습니다.'), { status: 404 });
    return ok({ ...(base || {}), ...(d?.project || {}) });
  }
  if (rest === 'languages') return ok(d?.languages || {});
  if (!d) throw new SnapshotMissing();
  const tot = d.totals || {};
  if (rest === 'repository/tree') {
    const p = q.get('path') || '';
    const t = d.trees ? d.trees[p] : p === '' ? d.tree : null;
    if (!t) throw new SnapshotMissing();
    return ok(t, t.length);
  }
  if ((m = rest.match(/^repository\/files\/([^/]+?)(\/raw)?$/))) {
    const f = decodeURIComponent(m[1]);
    const file = d.files?.[f] || (f === d.readmePath && d.readme != null ? { raw: d.readme, meta: null } : null);
    if (!file || file.raw == null) throw new SnapshotMissing();
    if (m[2]) return ok(file.raw);
    return ok(file.meta || { file_name: f.split('/').pop(), file_path: f, size: new Blob([file.raw]).size, ref: q.get('ref') || 'HEAD' });
  }
  const listOf = (arr, totalKey, filter) => {
    if (!Array.isArray(arr)) throw new SnapshotMissing();
    const st = q.get('state');
    const l = filter && st && st !== 'all' ? arr.filter((x) => x.state === st) : arr;
    return page(l, q, !st || st === 'all' ? tot[totalKey] ?? null : null);
  };
  if (rest === 'repository/commits') return listOf(d.commits, 'commits');
  if (/^repository\/commits\/[0-9a-f]+$/.test(rest)) { if (!d.commit) throw new SnapshotMissing(); return ok(d.commit); }
  if (/^repository\/commits\/[0-9a-f]+\/diff$/.test(rest)) { if (!d.commitDiff) throw new SnapshotMissing(); return ok(d.commitDiff); }
  if (rest === 'repository/branches') return listOf(d.branches, 'branches');
  if (rest === 'repository/tags') return listOf(d.tags, 'tags');
  if (rest === 'repository/contributors') return listOf(d.contributors, 'contributors');
  if (rest === 'releases') return listOf(d.releases, 'releases');
  if (rest === 'issues') return listOf(d.issues, 'issues', true);
  if (rest === 'merge_requests') return listOf(d.merge_requests, 'merge_requests', true);
  if ((m = rest.match(/^issues\/(\d+)$/))) { const it = (d.issues || []).find((x) => x.iid === Number(m[1])) || (d.issue55?.iid === Number(m[1]) ? d.issue55 : null); if (!it) throw new SnapshotMissing(); return ok(it); }
  if ((m = rest.match(/^merge_requests\/(\d+)$/))) { const it = d.mr56?.iid === Number(m[1]) ? d.mr56 : (d.merge_requests || []).find((x) => x.iid === Number(m[1])); if (!it) throw new SnapshotMissing(); return ok(it); }
  if ((m = rest.match(/^merge_requests\/(\d+)\/changes$/)) && d.mr56Changes && d.mr56?.iid === Number(m[1])) return ok(d.mr56Changes);
  throw new SnapshotMissing();
}
