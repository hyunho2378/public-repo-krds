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
  none: '표시할 머지 리퀘스트가 없습니다', noneOpen: '열려 있는 머지 리퀘스트 없음', noPipelines: '이 머지 리퀘스트에 파이프라인이 없습니다',
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

// 감사 v3 04: 공공 깃랩 실측 문구
export const au = {
  loginReply: '회신하려면', register: '등록', login: '로그인', orWord: '또는', pleaseDo: '하십시오',
  assignee: '담당자', reviewer: '리뷰어', labels: '라벨', milestone: '마일스톤', workItems: '작업 항목', timeTrack: '시간 추적', participants: '참가자',
  none: '없음', noTime: '추정 시간이나 소비된 시간이 없습니다.',
  approvalOptional: '승인은 옵션입니다.', approvedBy: '승인함', closedBy: '닫음:', mergedBy: '머지됨:', openState: '열림',
  mergeDetail: '머지 세부정보', notMerged: (t) => `변경사항들이 ${t}에 머지되지 않았습니다.`, mergedInto: (t) => `변경사항들이 ${t}에 머지되었습니다.`,
  activity: '활동', allActivity: '모든 활동', code: '코드', requested: (when) => `${when}의 머지를 요청함`, requestedTo: '를', fromTo: '가',
  copy: '복사', pipelineNone: '이 머지 리퀘스트에 파이프라인이 없습니다', rejected: '가져옴',
  likes: '좋아요', dislikes: '싫어요', closedEvent: 'closed', systemMerged: 'merged', count: (n, w) => `${n}명의 ${w}`, noteOf: '댓글',
  // 빈 상태
  wsEmptyTitle: '버그를 추적하고, 기능을 계획하며, 작업을 이슈로 정리하세요',
  wsEmptyBody: '작업 항목으로 업무를 나누고 담당자, 마일스톤, 라벨로 진행을 관리합니다.',
  boardTitle: '이슈 보드', colOpen: '열기', colClosed: 'Closed', cardCount: (n) => `${n} 항목`,
  milestoneEmpty: '마일스톤을 사용하여 일정 기간 동안 이슈와 머지 리퀘스트를 추적합니다.', snippetEmpty: '표시할 스니펫이 없습니다.',
  tabOpen: '열림', tabClosed: '닫힘', tabAll: '전체', tabDone: '완료',
  jobStatus: '상태', jobName: '작업', jobPipeline: '파이프라인', jobStage: '스테이지', jobCreated: '생성', jobCommit: '커밋',
  allowFailed: '실패 허용됨', statusName: { SUCCESS: '성공', FAILED: '실패', SKIPPED: '건너뜀', RUNNING: '실행 중', CANCELED: '취소됨', PENDING: '대기 중', MANUAL: '수동', CREATED: '생성됨' },
  jobsTitle: '작업', jobsHelp: '파이프라인에서 실행된 작업 목록',
  ownerRole: 'Owner', sourceDirect: (n) => `${n}가 생성한 직접 멤버`, expireHint: '만료일',
  contribTitle: '기여자 분석', commitsChart: '커밋 수', avg: '평균', max: '최대', limited: (n) => `최근 ${n}개 커밋 기준`, chartNone: '표시할 커밋이 없습니다',
};

export const w2 = { viewAdd: '뷰 추가', clearFilter: '필터 지우기', removeToken: '필터 제거', more: '더보기', newItem: '새 항목', openOrig: '공공 깃랩에서 열기' };

// 감사 v3 04 P1 #24~#27 실제 문구(캡처 24, 28, 29, 59)
export const p1 = {
  wikiTitle: '이 위키에는 아직 콘텐츠가 없습니다.',
  wikiBody: 'GitLab Wiki를 사용하여 프로젝트 또는 그룹의 문서에서 공동 작업을 할 수 있습니다. Markdown 또는 AsciiDoc과 같은 마크업 형식으로 작성된 Wiki 페이지를 별도의 Git 리포지토리에 저장하고 Git, GitLab 웹 인터페이스 또는 API를 통해 Wiki에 액세스할 수 있습니다.',
  pkgTitle: '패키지 레지스트리', pkgCount: (n) => `${n} 패키지`, pkgFilter: '필터 결과', pkgSort: '게시됨',
  pkgEmpty: '아직 패키지가 없습니다.', pkgEmptyBody: 'GitLab에서 패키지를 게시하고 공유하는 방법을 알아보세요.',
  plFilter: '파이프라인 필터링', plShowId: '파이프라인 ID 보기', plStatus: '상태', plPipeline: '파이프라인', plBy: '다음에 의해 생성됨', plStages: '스테이지', plAction: '동작',
  plStatusName: { success: '성공함', failed: '실패함', running: '실행 중', pending: '대기 중', canceled: '취소됨', skipped: '건너뜀', manual: '수동', created: '생성됨' },
  actTabs: [['all', '전체'], ['push', '푸시 이벤트'], ['merge', '머지 이벤트'], ['issue', '이슈 이벤트'], ['note', '댓글'], ['wiki', '위키'], ['design', '디자인'], ['team', '팀']],
  actFeed: '피드', actNone: '표시할 활동이 없습니다.',
  pushedBranch: (b) => `Pushed to branch ${b}`, pushedTag: (b) => `Pushed new tag ${b}`, moreCommits: (n) => `... and ${n} more commits.`, compare: 'Compare',
  sortActivity: '활동 정렬', oldest: '오래된 순', newest: '최신순', dotMenu: '더보기', openOrig: '공공 깃랩에서 열기',
  mrChecklist: (d, t) => `${t}개 중 ${d}개의 체크 리스트 아이템 완료`, assigneeLabel: '담당자',
  tokenKey: { author: '작성자', assignee: '담당자', reviewer: '리뷰어', label: '라벨', milestone: '마일스톤', source: '소스 브랜치', target: '대상 브랜치' },
  tokenSuggest: ['작성자', '담당자', '리뷰어', '라벨', '마일스톤', '대상 브랜치', '소스 브랜치', '이 텍스트 검색'],
};
