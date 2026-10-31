// 고정 예시 자료(?fixture=kordoc). Figma 화면과 코드를 같은 자료로 대조할 때 쓴다.
// 공공 깃랩 점검 시간에도 화면을 확인할 수 있다. 실제 공개 저장소에서 받아 둔 응답이며 꾸민 자료가 아니다.
// 개발 모드에서만 켜진다. 배포본에서는 항상 꺼져 있다.
const FILES = import.meta.glob('../../../sample/kordoc/api/*.json', { eager: true, import: 'default' });
// README와 파일 원문은 글이라 글자 그대로 읽는다.
const TEXTS = import.meta.glob('../../../sample/kordoc/api/*.{md,ts}', { eager: true, query: '?raw', import: 'default' });

// 프로젝트 목록(탐색 G-01, 검색 G-02·A-01): 저장된 공개 스냅숏(public/data/snapshot/index.json, 실제 응답을 받아 둔 것)으로 고정한다. Figma 표본 행과 같은 자료로 대조하기 위해서다
const SNAP = import.meta.glob('../../public/data/snapshot/index.json', { eager: true, import: 'default' });
const SNAP_PROJECTS = Object.values(SNAP)[0]?.projects || [];
function snapshotList(query) {
  const q = new URLSearchParams(query);
  const search = (q.get('search') || '').toLowerCase();
  const order = q.get('order_by') || 'last_activity_at';
  const dir = q.get('sort') === 'asc' ? 1 : -1;
  const per = Number(q.get('per_page')) || 20; const page = Number(q.get('page')) || 1;
  let rows = SNAP_PROJECTS.filter((x) => !search || `${x.name} ${x.description || ''} ${x.path_with_namespace}`.toLowerCase().includes(search));
  rows = [...rows].sort((a, b) => (a[order] > b[order] ? 1 : a[order] < b[order] ? -1 : 0) * dir);
  return { data: rows.slice((page - 1) * per, page * per), total: rows.length, next: page * per < rows.length ? page + 1 : null };
}
const pick = (name) => FILES[`../../../sample/kordoc/api/${name}.json`];
const TOTALS = pick('totals');
// 목록 파일은 첫 100개만 담겨 있다. 화면에 보이는 총계는 totals.json 값을 쓴다.
const TOTAL_KEY = { commits: 'commits', tags: 'tags', branches: 'branches', releases: 'releases', issues: 'issues', merge_requests: 'merge_requests', contributors: 'contributors' };
const pickText = (file) => TEXTS[`../../../sample/kordoc/api/${file}`];

export function fixtureName() {
  if (!import.meta.env.DEV) return null;
  const f = new URLSearchParams(window.location.search).get('fixture');
  return f === 'kordoc' ? f : null;
}

/** 경로를 고정 자료에 맞춘다. 없으면 null을 돌려주고 실제 요청으로 넘어간다. */
export function fixtureFor(path) {
  if (!fixtureName()) return null;
  const p = path.replace(/^\/api\/gitlab\//, '').split('?')[0];
  const ok = (data) => ({ mock: false, source: 'sample/kordoc', fixture: 'kordoc', state: 'Ideal', data, pagination: { nextPage: null, total: null } });
  if (p === 'projects') { const r = snapshotList(path.split('?')[1] || ''); return { mock: false, source: 'snapshot', fixture: 'kordoc', state: r.data.length ? 'Ideal' : 'Empty', data: r.data, pagination: { nextPage: r.next, total: r.total } }; }
  if (/^projects\/[^/]+\/repository\/commits\/[0-9a-f]{7,40}\/refs$/.test(p)) return ok([{ type: 'branch', name: 'main' }, { type: 'tag', name: 'v4.24.21' }]);
  if (/^projects\/[^/]+\/repository\/commits\/[0-9a-f]{7,40}\/merge_requests$/.test(p)) return ok([]);
  const map = [
    [/^projects\/[^/]+$/, 'project'],
    [/^projects\/[^/]+\/repository\/branches$/, 'branches'],
    [/^projects\/[^/]+\/repository\/tags$/, 'tags'],
    [/^projects\/[^/]+\/repository\/commits$/, 'commits'],
    [/^projects\/[^/]+\/repository\/contributors$/, 'contributors'],
    [/^projects\/[^/]+\/repository\/tree$/, 'tree_1'],
    [/^projects\/[^/]+\/releases$/, 'releases'],
    [/^projects\/[^/]+\/issues$/, 'issues'],
    [/^projects\/[^/]+\/issues\/\d+$/, 'issue_55'],
    [/^projects\/[^/]+\/merge_requests$/, 'merge_requests'],
    [/^projects\/[^/]+\/merge_requests\/\d+$/, 'mr_56'],
    [/^projects\/[^/]+\/merge_requests\/\d+\/changes$/, 'mr_56_changes'],
    [/^projects\/[^/]+\/languages$/, 'languages'],
    // C2 요청(2026. 10. 31.): 실제 공개 API 응답(events의 이메일 키 제거)
    [/^projects\/[^/]+\/pipelines$/, 'pipelines'],
    [/^projects\/[^/]+\/events$/, 'events'],
    [/^projects\/[^/]+\/wikis$/, 'wikis'],
    [/^projects\/[^/]+\/packages$/, 'packages'],
    // 커밋 상세(R-05): 받아 둔 최신 커밋과 diff. 커밋이 들어간 브랜치·태그와 관련 MR(실제 응답 기준: main, v4.24.21, 없음)
    [/^projects\/[^/]+\/repository\/commits\/[0-9a-f]{7,40}$/, 'commit_latest'],
    [/^projects\/[^/]+\/repository\/commits\/[0-9a-f]{7,40}\/diff$/, 'commit_latest_diff'],
  ];
  // 파일 원문과 정보: 받아 둔 파일만 돌려주고, 그 밖의 파일은 실제 요청으로 넘긴다(다른 파일에 README를 돌려주지 않는다)
  const fm = p.match(/^projects\/[^/]+\/repository\/files\/([^/]+?)(\/raw)?$/);
  if (fm) {
    const FILE = { 'README.md': ['readme_raw.md', 'file_meta_readme'], 'src/shared/numbering.ts': ['file_src_shared_numbering.ts', 'file_meta_numbering'] }[decodeURIComponent(fm[1])];
    const data = FILE ? (fm[2] ? pickText(FILE[0]) : pick(FILE[1])) : null;
    if (data) return { mock: false, source: 'sample/kordoc', fixture: 'kordoc', state: 'Ideal', data, pagination: { nextPage: null, total: null } };
  }
  for (const [re, name] of map) {
    if (re.test(p)) {
      let data = name.includes('.') ? pickText(name) : pick(name);
      // 트리 자료는 하위 폴더까지 들어 있다. 요청한 경로의 바로 아래 것만 돌려준다(공공 깃랩과 같다).
      if (name === 'tree_1' && Array.isArray(data)) {
        const want = new URLSearchParams(path.split('?')[1] || '').get('path') || '';
        const prefix = want ? `${want}/` : '';
        // 맨 위 폴더와 src는 실제 응답(바로 아래 항목 전부)을 받아 둔 것을 쓴다
        const direct = want === '' ? pick('tree_root') : want === 'src' ? pick('tree_src') : null;
        if (direct) return { mock: false, source: 'sample/kordoc', fixture: 'kordoc', state: 'Ideal', data: direct, pagination: { nextPage: null, total: null } };
        data = data.filter((x) => x.path.startsWith(prefix) && !x.path.slice(prefix.length).includes('/'));
      }
      if (data) {
        const key = Object.keys(TOTAL_KEY).find((k) => p.endsWith(k));
        const total = key ? TOTALS?.[TOTAL_KEY[key]] ?? null : null;
        return { mock: false, source: 'sample/kordoc', fixture: 'kordoc', state: 'Ideal', data, pagination: { nextPage: null, total } };
      }
    }
  }
  return null;
}
