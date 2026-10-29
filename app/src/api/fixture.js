// 고정 예시 자료(?fixture=kordoc). Figma 화면과 코드를 같은 자료로 대조할 때 쓴다.
// 공공 깃랩 점검 시간에도 화면을 확인할 수 있다. 실제 공개 저장소에서 받아 둔 응답이며 꾸민 자료가 아니다.
// 개발 모드에서만 켜진다. 배포본에서는 항상 꺼져 있다.
const FILES = import.meta.glob('../../../sample/kordoc/api/*.json', { eager: true, import: 'default' });

const pick = (name) => FILES[`../../../sample/kordoc/api/${name}.json`];

export function fixtureName() {
  if (!import.meta.env.DEV) return null;
  const f = new URLSearchParams(window.location.search).get('fixture');
  return f === 'kordoc' ? f : null;
}

/** 경로를 고정 자료에 맞춘다. 없으면 null을 돌려주고 실제 요청으로 넘어간다. */
export function fixtureFor(path) {
  if (!fixtureName()) return null;
  const p = path.replace(/^\/api\/gitlab\//, '').split('?')[0];
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
  ];
  for (const [re, name] of map) {
    if (re.test(p)) {
      const data = pick(name);
      if (data) return { mock: false, source: 'sample/kordoc', fixture: 'kordoc', state: 'Ideal', data };
    }
  }
  return null;
}
