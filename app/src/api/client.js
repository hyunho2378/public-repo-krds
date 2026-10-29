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
  if (STATIC_MODE) {
    const { staticRequest } = await import('./static.js');
    try {
      return await staticRequest(path, options);
    } catch (e) {
      throw new ApiError(e.message || '자료를 불러오지 못했습니다.', e.status || 500);
    }
  }
  const response = await fetch(base + path, { credentials: 'same-origin', ...options, signal });
  const data = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(data?.error?.message || '자료를 불러오지 못했습니다.', response.status);
  return data;
}

const enc = encodeURIComponent;

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
