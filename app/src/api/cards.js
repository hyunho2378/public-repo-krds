// UX/14 소개 카드 자료(카드 작업자가 만드는 app/public/data/cards.min.json)를 읽는다. 서버(server/src/cards/index.js)와 같은 점수 방식.
// 파일이 없거나 읽지 못하면 null을 돌려주고, 화면은 덧붙임 묶음을 그리지 않는다(빈 틀, '준비 중' 문구 금지).
const BASE = import.meta.env.BASE_URL || '/';
let loading = null;

const val = (f) => (f && f.v != null && !(Array.isArray(f.v) && !f.v.length) ? f.v : null);

export function ngramSet(s, n = 2) {
  const t = String(s ?? '').toLowerCase().replace(/[^\p{L}\p{N}]+/gu, ' ').trim();
  const out = new Set();
  for (const w of t.split(' ')) {
    if (!w) continue;
    if (w.length < n) { out.add(w); continue; }
    for (let i = 0; i <= w.length - n; i++) out.add(w.slice(i, i + n));
  }
  return out;
}

const WEIGHTS = { fields: 3, oneLine: 3, task: 2, name: 2 };
function parts(c) {
  return { fields: [].concat(val(c.fields) ?? []).join(' '), oneLine: val(c.oneLine) ?? '', task: val(c.task) ?? '', name: c.name ?? '' };
}
function score(q, c) {
  if (!q.size) return 0;
  const p = parts(c);
  let s = 0;
  for (const [k, w] of Object.entries(WEIGHTS)) {
    const g = ngramSet(p[k]);
    if (!g.size) continue;
    let hit = 0;
    for (const x of q) if (g.has(x)) hit++;
    s += (w * hit) / q.size;
  }
  return s;
}

function store(data) {
  const cards = data.cards || [];
  const byId = new Map(cards.map((c) => [c.id, c]));
  return {
    meta: data.meta || {},
    get: (id) => byId.get(Number(id)) || null,
    fields: () => (data.fields || []).filter((f) => f.count > 0),
    idsInField: (name) => cards.filter((c) => [].concat(val(c.fields) ?? []).includes(name)).map((c) => c.id),
    search: (q, limit = 3) => {
      const g = ngramSet(q);
      return cards.map((c) => ({ c, s: score(g, c) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s || a.c.id - b.c.id).slice(0, limit).map((x) => x.c);
    },
    /** 새 프로젝트 이름과 비슷한 프로젝트(이름, 하는 일, 업무 n-gram) */
    similarToName: (name, limit = 3) => {
      const g = ngramSet(name);
      return cards.map((c) => ({ c, s: score(g, c) })).filter((x) => x.s > 0).sort((a, b) => b.s - a.s).slice(0, limit).map((x) => x.c);
    },
  };
}

/** 카드 자료. 없으면 null */
export function loadCards() {
  if (!loading) {
    loading = fetch(`${BASE}data/cards.min.json`, { cache: 'no-cache' })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => (d && Array.isArray(d.cards) && d.cards.length ? store(d) : null))
      .catch(() => null);
  }
  return loading;
}

export { val as cardValue };

/** 문장형 질의(업무 말)인지: 낱말 2개 이상이거나 한글 6자 이상 */
export function isSentence(q) {
  const s = String(q || '').trim();
  return s.split(/\s+/).length >= 2 || (/[가-힣]/.test(s) && s.length >= 6);
}

/** 업무 문장 검색(UX/14 3): 저장된 공개 목록(이름, 설명, 주제, 만든 곳)과 소개 카드(하는 일, 업무, 분야)를 같이 점수 매긴다.
 *  공공 깃랩 검색 API를 쓰지 않으므로 점검 중에도 동작한다. [{ id, name, sub }] */
export async function taskSearch(q, limit = 3) {
  const { snapshotIndex } = await import('./snapshot.js');
  const [idx, cards] = await Promise.all([snapshotIndex(), loadCards()]);
  const g = ngramSet(q);
  if (!g.size) return [];
  const hit = (text) => { const s = ngramSet(text); let n = 0; for (const x of g) if (s.has(x)) n++; return n / g.size; };
  const scored = (idx?.projects || []).map((p) => {
    const c = cards?.get(p.id);
    const s = 2 * hit(p.name) + 3 * hit(p.description) + 1 * hit((p.topics || []).join(' ')) + (c ? score(g, c) : 0);
    return { p, c, s };
  }).filter((x) => x.s > 0.5).sort((a, b) => b.s - a.s).slice(0, limit);
  return scored.map(({ p, c }) => ({ id: p.id, name: p.name, sub: [val(c?.oneLine) || (p.description || '').slice(0, 80), p.namespace?.name].filter(Boolean).join(' · ') }));
}
