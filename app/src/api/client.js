import sampleTotals from '../../../sample/kordoc/api/totals.json';
import sampleProject from '../../../sample/kordoc/api/project.json';

// 화면이 부르는 자료 창구. GitLab 원본 자료는 /api/gitlab, 우리 기능은 /api/v1 (api/openapi.yaml)
const base = import.meta.env.VITE_API_BASE || '';

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

// 정적 모드(GitHub Pages 배포)에서는 서버 대신 static.js가 같은 응답을 만든다.
export const STATIC_MODE = import.meta.env.VITE_STATIC === '1';

export async function request(path, { signal, ...options } = {}) {
  // 개발 모드에서 ?fixture=kordoc 이면 받아 둔 실제 응답을 쓴다(Figma 대조와 점검 시간 대비).
  if (import.meta.env.DEV) {
    const { fixtureFor } = await import('./fixture.js');
    const hit = fixtureFor(path);
    if (hit) return hit;
  }
  if (STATIC_MODE) {
    const { staticRequest } = await import('./static.js');
    try {
      return await staticRequest(path, options);
    } catch (e) {
      throw new ApiError(e.message || '자료를 불러오지 못했습니다.', e.status || 500);
    }
  }
  const ctl = new AbortController();
  const timer = setTimeout(() => ctl.abort(), 20000);
  signal?.addEventListener('abort', () => ctl.abort());
  let response;
  try {
    response = await fetch(base + path, { credentials: 'same-origin', ...options, signal: ctl.signal });
  } catch (e) {
    throw new ApiError(e.name === 'AbortError' ? '응답 시간 초과' : '네트워크 오류', e.name === 'AbortError' ? 408 : 0);
  } finally {
    clearTimeout(timer);
  }
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.error?.message || '자료를 불러오지 못했습니다.', response.status);
  return data;
}

const enc = encodeURIComponent;

// 커밋 전체 수: 공공 깃랩 커밋 목록 응답에는 X-Total 헤더가 없다(태그/브랜치와 달리 legacy 쪽 나누기).
// 그래서 100개씩 쪽을 두 배씩 건너뛰어 끝을 찾고, 이분 탐색으로 마지막 쪽을 정해 (마지막 쪽 번호 - 1) x 100 + 마지막 쪽 개수로 센다.
// 그래도 못 세면 받아 둔 예시 자료(sample/kordoc/api/totals.json)의 값을 쓰고 sample 표시를 단다.
const commitCounts = new Map();
async function countCommits(id, ref) {
  const pages = new Map();
  const size = (n) => {
    if (!pages.has(n)) pages.set(n, gitlabCommitsPage(id, ref, n).then((r) => (Array.isArray(r.data) ? r.data.length : 0)));
    return pages.get(n);
  };
  if ((await size(1)) < 100) return size(1);
  let lo = 1;
  let hi = 2;
  while ((await size(hi)) > 0) {
    lo = hi;
    hi *= 2;
    if (hi > 2048) throw new ApiError('커밋 수 확인 실패', 500);
  }
  while (hi - lo > 1) {
    const mid = (lo + hi) >> 1;
    if ((await size(mid)) > 0) lo = mid;
    else hi = mid;
  }
  return (lo - 1) * 100 + (await size(lo));
}
const gitlabCommitsPage = (id, ref, page) =>
  request(`/api/gitlab/projects/${enc(id)}/repository/commits?per_page=100&page=${page}${ref ? `&ref_name=${enc(ref)}` : ''}`);

export const gitlab = {
  project: (id) => request(`/api/gitlab/projects/${enc(id)}`),
  readme: (id, ref = 'HEAD') => request(`/api/gitlab/projects/${enc(id)}/repository/files/README.md/raw?ref=${enc(ref)}`),
  tree: (id, path = '', ref = '') =>
    request(`/api/gitlab/projects/${enc(id)}/repository/tree?per_page=100${path ? `&path=${enc(path)}` : ''}${ref ? `&ref=${enc(ref)}` : ''}`),
  fileMeta: (id, path, ref = 'HEAD') => request(`/api/gitlab/projects/${enc(id)}/repository/files/${enc(path)}?ref=${enc(ref)}`),
  blame: (id, path, ref = 'HEAD') => request(`/api/gitlab/projects/${enc(id)}/repository/files/${enc(path)}/blame?ref=${enc(ref)}`),
  fileRaw: (id, path, ref = 'HEAD') => request(`/api/gitlab/projects/${enc(id)}/repository/files/${enc(path)}/raw?ref=${enc(ref)}`),
  commits: (id, { ref = '', path = '', page = 1 } = {}) =>
    request(`/api/gitlab/projects/${enc(id)}/repository/commits?per_page=20&page=${page}${ref ? `&ref_name=${enc(ref)}` : ''}${path ? `&path=${enc(path)}` : ''}`),
  /** { count, sample }. count가 null이면 알 수 없음. sample이 true면 예시 자료 값. */
  commitCount: (id, ref = '') => {
    const key = `${id}@${ref}`;
    if (!commitCounts.has(key)) {
      commitCounts.set(
        key,
        countCommits(id, ref).then(
          (count) => ({ count, sample: false }),
          () => (String(id) === String(sampleProject.id) ? { count: sampleTotals.commits, sample: true } : { count: null, sample: false }),
        ),
      );
    }
    return commitCounts.get(key);
  },
  commit: (id, sha) => request(`/api/gitlab/projects/${enc(id)}/repository/commits/${enc(sha)}`),
  diff: (id, sha) => request(`/api/gitlab/projects/${enc(id)}/repository/commits/${enc(sha)}/diff`),
  branches: (id) => request(`/api/gitlab/projects/${enc(id)}/repository/branches`),
  tags: (id) => request(`/api/gitlab/projects/${enc(id)}/repository/tags`),
  releases: (id) => request(`/api/gitlab/projects/${enc(id)}/releases`),
  contributors: (id) => request(`/api/gitlab/projects/${enc(id)}/repository/contributors`),
  // 공공 깃랩 프로젝트 메뉴 전체(활동, 위키, 파이프라인, 패키지, 비교, 라벨, 마일스톤, 멤버, 보드, 스니펫)
  events: (id) => request(`/api/gitlab/projects/${enc(id)}/events`),
  wikis: (id) => request(`/api/gitlab/projects/${enc(id)}/wikis`),
  pipelines: (id) => request(`/api/gitlab/projects/${enc(id)}/pipelines`),
  packages: (id) => request(`/api/gitlab/projects/${enc(id)}/packages`),
  labels: (id) => request(`/api/gitlab/projects/${enc(id)}/labels`),
  milestones: (id) => request(`/api/gitlab/projects/${enc(id)}/milestones`),
  members: (id) => request(`/api/gitlab/projects/${enc(id)}/members/all`),
  snippets: (id) => request(`/api/gitlab/projects/${enc(id)}/snippets`),
  boards: (id) => request(`/api/gitlab/projects/${enc(id)}/boards`),
  compare: (id, from, to) => request(`/api/gitlab/projects/${enc(id)}/repository/compare?from=${enc(from)}&to=${enc(to)}`),
  issues: (id, state = 'opened') => request(`/api/gitlab/projects/${enc(id)}/issues?state=${enc(state)}`),
  issue: (id, iid) => request(`/api/gitlab/projects/${enc(id)}/issues/${enc(iid)}`),
  mergeRequests: (id, state = 'opened') => request(`/api/gitlab/projects/${enc(id)}/merge_requests?state=${enc(state)}`),
  mergeRequest: (id, iid) => request(`/api/gitlab/projects/${enc(id)}/merge_requests/${enc(iid)}`),
};

let csrfToken = null;

export const auth = {
  async session() {
    const s = await request('/auth/session');
    csrfToken = s.csrf || null;
    return s;
  },
  // 정적 모드는 서버가 없어 로그인 화면(P-12)으로 보내고 그 화면이 시험판 안내를 한다.
  loginUrl: (returnTo) =>
    STATIC_MODE ? `${import.meta.env.BASE_URL}login?returnTo=${enc(returnTo)}` : `/auth/gitlab/login?returnTo=${enc(returnTo)}`,
};

export const product = {
  get: (path) => request('/api/v1' + path),
  post: (path, body) =>
    request('/api/v1' + path, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'X-CSRF-Token': csrfToken || '' },
      body: JSON.stringify(body),
    }),
};

/** README 첫 시도 실패(없음)는 빈 문자열로 돌려준다. Min 상태 판단에 쓴다. */
export async function readmeOrEmpty(id) {
  try {
    return (await gitlab.readme(id)).data || '';
  } catch {
    return '';
  }
}
