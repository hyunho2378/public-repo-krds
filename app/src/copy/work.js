// 공공 깃랩 작업 항목 목록 문구(캡처 20, 49)
export const w = {
  all: '모든 항목',
  new: '새 항목',
  status: '상태',
  is: '다음과 같음',
  search: '검색하거나 필터링',
  display: '표시',
  item: '항목',
  noResult: '검색 결과가 없습니다',
  noResultHelp: '검색 범위를 넓히려면 위의 필터를 변경하거나 제거하십시오.',
};

// 공공 깃랩 머지 리퀘스트 화면 문구(캡처 21, 35~39)
export const mr = {
  tabOpen: '열기', tabMerged: '머지됨', tabClosed: '닫힘', tabAll: '전체',
  search: '검색 또는 결과 필터…', searchLabel: '결과 검색', recent: '최근 검색', sortBy: '만든 날짜',
  sortCreated: '만든 날짜', sortUpdated: '업데이트 날짜', asc: '오름차순', desc: '내림차순',
  createdBy: (who) => `${who}에 의해 생성됨`, updated: (ago) => `${ago} 업데이트 됨`,
  overview: '개요', commits: '커밋', pipelines: '파이프라인', changes: '변경사항',
  none: '표시할 머지 리퀘스트가 없습니다', noPipelines: '이 머지 리퀘스트에 파이프라인이 없습니다',
  source: '소스 브랜치', target: '대상 브랜치', author: '작성자', more: '더보기', menu: '머지 리퀘스트 작업',
};

// 공공 깃랩 프로젝트 하위 화면 문구(캡처 22~30, 55~68)
export const rp = {
  membersTitle: '프로젝트 구성원', membersHelp: '프로젝트 유지관리자 또는 소유자에서 구성원을 추가할 수 있습니다.',
  tabMembers: '멤버', tabDirect: '다이렉트 멤버', filterMembers: '멤버 필터링',
  colAccount: '계정', colSource: '소스', colRole: '역할', colExpire: '만료', colActivity: '활동',
  sortAccount: '계정', recent: '최근 검색', asc: '오름차순', desc: '내림차순', searchBtn: '검색',
  tabActive: '활성', tabArchived: '아카이빙됨', search: '검색', sortName: '이름',
  prio: '우선 순위 라벨', prioHelp: '드래그하여 우선 순위 라벨을 순서를 다시 정하여 상대적 우선 순위를 변경합니다.',
  others: '다른 라벨', toIssues: '작업 항목', toMrs: '머지 리퀘스트', joined: '참여', items: '항목',
  roles: { 10: 'Guest', 20: 'Reporter', 30: 'Developer', 40: 'Maintainer', 50: 'Owner' },
};

// 기여자 분석(캡처 23)
export const ct = {
  title: '기여자 분석', history: '이력', branchHead: '커밋할 브랜치', note: '머지 커밋 제외',
  commits: (n) => `${n}개의 커밋`, none: '표시할 기여자가 없습니다',
};
