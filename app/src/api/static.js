// 정적 모드(GitHub Pages). 서버 없이 같은 응답 모양을 만든다.
// 검색과 분석은 서버와 같은 코드(server/src/catalog-core.js, analysis.js, repository.js)를 브라우저에서 실행한다.
// 저장(의견, 써 봤어요, 요청)과 로그인은 서버가 없으므로 하지 않고 사실대로 알린다.
import { createCatalog } from '@server/catalog-core.js';
import { classify, referenceDates, execution, publication, card, taxonomy } from '@server/analysis.js';
import { repository } from '@server/repository.js';
import { setSnapshotOn, snapshotGet } from './snapshot.js';

const UPSTREAM = 'https://gitlab.aigov.go.kr';
const DATA = import.meta.env.BASE_URL + 'data/';
export const STATIC_NOTICE = '시험판 조회 전용';

export class StaticError extends Error {
  constructor(message, status, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

let catalogPromise;
function catalog() {
  if (!catalogPromise) {
    catalogPromise = Promise.all([
      fetch(DATA + 'projects.csv').then((r) => r.text()),
      fetch(DATA + 'gitlab-public-snapshot.json').then((r) => r.json()),
    ]).then(([csvText, snapshot]) => createCatalog({ csvText, snapshot }));
  }
  return catalogPromise;
}

// 분석 기능(카드, 공개 준비 점검 등)이 쓰는 원문 읽기도 같은 방식으로 저장된 자료로 바꾼다
async function fetchOrSnapshot(url, init) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, { ...init, signal: ctl.signal });
    if (r.ok || (r.status < 500 && r.status !== 429)) return r;
  } catch { /* 저장된 자료로 */ } finally { clearTimeout(timer); }
  const u = new URL(url);
  try {
    const res = await snapshotGet(u.pathname.replace(/^\/api\/v4\//, ''), u.search.slice(1));
    const body = typeof res.data === 'string' ? res.data : JSON.stringify(res.data);
    return new Response(body, { status: 200, headers: { 'content-type': typeof res.data === 'string' ? 'text/plain' : 'application/json', ...(res.pagination?.total != null ? { 'x-total': String(res.pagination.total) } : {}) } });
  } catch {
    return new Response('{}', { status: 404 });
  }
}
const repo = repository({ upstream: UPSTREAM, fetchImpl: fetchOrSnapshot });

// 서버 app.js와 같은 허용 경로
const allowed = /^(?:groups(?:\/[^/]+(?:\/(?:subgroups|projects|members(?:\/all)?))?)?|topics|projects(?:\/[^/]+(?:\/(?:repository\/(?:tree|compare|commits(?:\/[0-9a-f]{7,40}(?:\/diff)?)?|files\/[^/]+(?:\/(?:raw|blame))?|branches|tags|contributors)|languages|releases|events|wikis|pipelines|jobs|packages|labels|milestones|members(?:\/all)?|boards|snippets|issues(?:\/\d+(?:\/notes)?)?|merge_requests(?:\/\d+(?:\/(?:changes|notes|commits))?)?))?)?)$/;

// 공공 깃랩이 6초 안에 답하지 않거나 5xx, 네트워크 오류면 다시 부르지 않고 저장된 자료(snapshot.js)로 바꾼다
const FETCH_TIMEOUT_MS = 6000;

async function gitlabGet(rest) {
  const [sub, query = ''] = rest.split('?');
  if (!allowed.test(sub)) throw new StaticError('허용 안 된 경로', 400, 'NOT_ALLOWED');
  const raw = sub.endsWith('/raw');
  let got;
  try {
    got = await fetchOnce(`${UPSTREAM}/api/v4/${sub}${query ? '?' + query : ''}`, raw);
  } catch (e) {
    // 점검, 5xx, 네트워크 오류, 시간 초과, 속도 제한: 저장된 자료로
    if (!e.status || e.status === 408 || e.status === 429 || e.status >= 500) return snapshotGet(sub, query);
    throw e;
  }
  const { r, data } = got;
  setSnapshotOn(false);
  if (data?.visibility && data.visibility !== 'public') throw new StaticError('공개 자료만 볼 수 있습니다.', 403, 'NOT_PUBLIC');
  return {
    mock: false,
    source: 'GitLab public REST v4',
    state: Array.isArray(data) && !data.length ? 'Empty' : 'Ideal',
    data,
    pagination: {
      nextPage: r.headers.get('x-next-page') || null,
      total: r.headers.get('x-total') ? Number(r.headers.get('x-total')) : null,
    },
  };
}

/** 한 번만 부른다(6초). 실패하면 상태 코드를 담은 오류 */
async function fetchOnce(url, raw) {
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), FETCH_TIMEOUT_MS);
  try {
    const r = await fetch(url, { headers: { Accept: 'application/json' }, signal: ctl.signal });
    if (r.ok) return { r, data: raw ? await r.text() : await r.json() };
    throw new StaticError(r.status === 404 ? '자료를 찾을 수 없습니다.' : '공개 저장소 조회 실패', r.status);
  } catch (e) {
    if (e instanceof StaticError) throw e;
    throw new StaticError(e.name === 'AbortError' ? '응답 시간 초과' : '네트워크 오류', e.name === 'AbortError' ? 408 : 0);
  } finally {
    clearTimeout(timer);
  }
}

const wrap = (feature, data) => ({ mock: false, feature, state: Array.isArray(data.items) && data.items.length === 0 ? 'Empty' : 'Ideal', data });
const readOnly = () => {
  throw new StaticError(STATIC_NOTICE, 503, 'STATIC_MODE');
};
const template = '# 도구 이름\n\n## 하는 일\n\n## 대상 업무\n\n## 사용 방법\n\n## 실행 환경\n\n## 기준 날짜\n\n## 이용 조건\n\n## 문의\n';

// [방법, 경로 패턴, 기능, 처리] 서버 products.js와 같은 순서와 응답
const routes = [
  ['POST', /^\/search$/, 'F-01', async ({ body }) => (await catalog()).search(body.query || '', body.filters || {}, body.limit, body.page)],
  ['GET', /^\/catalog$/, 'F-03', async ({ query }) => (await catalog()).search(query.query || '', query, query.limit, query.page)],
  ['POST', /^\/classify$/, 'F-02', async ({ body }) => {
    const p = (await catalog()).projects.find((x) => x.id === Number(body.projectId));
    return classify((p?.name || '') + ' ' + (p?.description || '') + ' ' + (body.readme || ''));
  }],
  ['POST', /^\/duplicates$/, 'F-04', async ({ body }) => ({ ...(await catalog()).search((body.name || '') + ' ' + (body.description || ''), {}, 5), notice: '유사도 후보, 중복 확정 아님' })],
  ['GET', /^\/projects\/(\d+)\/connections$/, 'F-05', async ({ m }) => {
    const c = await catalog();
    const p = c.projects.find((x) => x.id === Number(m[1]));
    return { items: p ? c.search(p.name, {}, 6).items.filter((x) => x.id !== p.id) : [], notice: '공개 프로젝트 유사 후보, 알림 미전송' };
  }],
  ['GET', /^\/projects\/(\d+)\/card$/, 'F-11', async ({ m }) => {
    const d = await repo.detail(m[1]);
    const org = (await catalog()).projects.find((p) => p.id === Number(m[1]))?.organization;
    return { ...card({ ...d.project, organization: org }, d.readme, d.files), source: d.source };
  }],
  ['GET', /^\/projects\/(\d+)\/reference-dates$/, 'F-12', async ({ m }) => referenceDates((await repo.detail(m[1])).readme)],
  ['POST', /^\/projects\/(\d+)\/environment-check$/, 'F-14', async ({ m, body }) => {
    const d = await repo.detail(m[1]);
    return execution(d.files, d.readme, body);
  }],
  ['POST', /^\/publication-checks$/, 'F-21', async ({ body }) => {
    const d = await repo.detail(body.projectId, body.ref || 'HEAD');
    return publication(d.files, d.readme, d.complete).publicResult;
  }],
  ['GET', /^\/projects\/(\d+)\/security-alerts$/, 'F-22', readOnly],
  ['GET', /^\/templates\/readme$/, 'F-24', async () => ({ markdown: template, status: 'service-draft', notice: '서비스 제안 양식, 행안부 승인 양식 아님' })],
  ['POST', /^\/projects\/(\d+)\/readme-proposals$/, 'F-23', async ({ m }) => {
    const d = await repo.detail(m[1]);
    const c = card(d.project, d.readme, d.files);
    return { status: 'draft', method: '자동 추출', markdown: template.replace('## 하는 일\n', '## 하는 일\n' + (c.summary || '제작자 작성 필요') + '\n'), notice: '초안만 생성했습니다. GitLab 작업 항목로 발송하지 않았습니다.' };
  }],
  ['POST', /^\/projects\/(\d+)\/feedback$/, 'F-31', readOnly],
  ['GET', /^\/projects\/(\d+)\/reuses$/, 'F-32', async () => ({ items: [], total: 0, staticMode: true, notice: STATIC_NOTICE })],
  ['POST', /^\/projects\/(\d+)\/reuses$/, 'F-32', readOnly],
  ['GET', /^\/organizations$/, 'F-33', async () => {
    const groups = new Map();
    for (const p of (await catalog()).projects) {
      const name = p.organization || '기관 확인 필요';
      groups.set(name, (groups.get(name) || 0) + 1);
    }
    return { items: [...groups].map(([name, projectCount]) => ({ name, projectCount })), notice: '기관명 추정 집계, 인증 통계 아님' };
  }],
  ['GET', /^\/requests$/, 'F-35', async () => ({ items: [], total: 0, staticMode: true, notice: STATIC_NOTICE })],
  ['POST', /^\/requests$/, 'F-35', readOnly],
  ['POST', /^\/requests\/[^/]+\/votes$/, 'F-35', readOnly],
  ['GET', /^\/projects\/(\d+)\/law-alerts$/, 'F-13', async () => ({ status: 'not-connected', items: [], checkedAt: null, notice: '법제처 연동 키/변경 추적 설정 필요' })],
  ['GET', /^\/projects\/(\d+)\/related-resources$/, 'F-34', async () => ({ status: 'not-connected', items: [], notice: '공공데이터 연결 검증 전, 임의 추천 없음' })],
  ['GET', /^\/projects\/(\d+)\/version-guide$/, 'F-36', async ({ m }) => {
    const d = await repo.detail(m[1]);
    const items = await repo.get(`projects/${d.project.id}/repository/commits?per_page=10`);
    return { items: items.map((c) => ({ id: c.id, title: c.title, committedAt: c.committed_date, url: c.web_url })), method: '원문 커밋', notice: '오류 원인 진단/자연어 변환 미연결' };
  }],
  ['POST', /^\/projects\/(\d+)\/handover$/, 'F-37', async ({ m }) => {
    const d = await repo.detail(m[1]);
    const c = card(d.project, d.readme, d.files);
    return { markdown: '# ' + c.title + ' 인수인계 초안\n\n## 하는 일\n' + (c.summary || '작성 필요') + '\n\n## 실행 환경\n제작자 확인 필요\n\n## 원문 설명\n' + d.readme, status: 'draft', method: '원문 조립', needsReview: true };
  }],
  ['GET', /^\/development-guide$/, 'F-38', async () => ({ status: 'service-draft', steps: [{ id: 1, title: '비슷한 도구부터 찾기' }, { id: 2, title: '사용 자료/개인정보 확인' }, { id: 3, title: '작은 기능부터 만들고 시험' }, { id: 4, title: '공개 준비 점검/제작자 확인' }, { id: 5, title: '설명/인수인계 기록' }], notice: '서비스 제안 점검표, 기관 승인 절차 대체 불가' })],
  ['GET', /^\/coverage-map$/, 'F-39', async () => {
    const { projects } = await catalog();
    return { fields: taxonomy.map(([name]) => ({ name, count: projects.filter((p) => p.classification.fields.some((f) => f.name === name)).length })), source: '공개 목록 스냅샷 규칙 분류', needsReview: true };
  }],
];

const gitCache = new Map();

/** client.request와 같은 인자를 받아 서버와 같은 응답 모양을 돌려준다. */
export async function staticRequest(path, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  if (path === '/auth/session') return { authenticated: false, staticMode: true, notice: STATIC_NOTICE };
  if (path.startsWith('/api/gitlab/')) {
    // 같은 공개 자료는 2분 동안 한 번만 받는다(다시 열 때 로딩 없이 바로, 실패한 요청은 기억하지 않는다)
    const hit = gitCache.get(path);
    if (hit && Date.now() - hit.at < 120000) return hit.p;
    const p = gitlabGet(path.slice('/api/gitlab/'.length));
    gitCache.set(path, { at: Date.now(), p });
    p.catch(() => gitCache.delete(path));
    return p;
  }
  if (path.startsWith('/api/v1/')) {
    const [p, qs = ''] = path.slice('/api/v1'.length).split('?');
    const query = Object.fromEntries(new URLSearchParams(qs));
    const body = options.body ? JSON.parse(options.body) : {};
    for (const [mth, re, feature, fn] of routes) {
      const m = p.match(re);
      if (m && mth === method) {
        try {
          return wrap(feature, await fn({ m, body, query }));
        } catch (e) {
          throw e instanceof StaticError ? e : new StaticError(e.message || '자료를 불러오지 못했습니다.', e.status || 500);
        }
      }
    }
  }
  throw new StaticError('요청 없음', 404);
}
