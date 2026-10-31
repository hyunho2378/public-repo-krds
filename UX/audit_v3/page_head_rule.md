# 화면 머리(page-head) 이름표 규칙 표 (2026. 10. 31.)

Figma 이름표 `page-head` = 화면 제목 한 줄(h1, 32/40, 모바일 24/32, D-16). 경로 줄 아래 첫 요소.

| 규칙 | 내용 |
|---|---|
| 1 | 화면 제목은 `<h1 data-figma="page-head">`. h1에 `section-title`을 달지 않는다(section-title은 h2 소제목, 19/28) |
| 2 | Page.jsx가 이름표 없는 첫 h1에 page-head를 자동으로 단다. 문서 본문 h1(.rb-md-h1, .rb-md 안)과 로그인 제목은 제외 |
| 3 | 프로젝트 하위 화면(ProjectFrame)은 Figma에 page-head가 있으면 경로 아래 h1을 둔다. ProjectFrame `PAGE_HEAD` 목록에 화면 번호를 넣으면 tabLabel로 h1을 그린다(A-03, A-08, A-10, R-30 적용) |
| 4 | Figma에 page-head가 없는 화면(R-01 프로젝트 홈: 프로젝트 이름 줄 RepoHeader, G-01 탐색, G-02 검색, R-17 MR 상세)은 코드 h1에 `data-figma="project-title"` 등 Figma 이름을 단다. 자동 page-head가 붙으면 Figma 쪽에 page-head를 추가해 달라고 Figma 작업자에게 요청 |
| 5 | 같은 제목을 h1과 h2로 두 번 쓰지 않는다 |

## 화면별 할 일(원장 10. 31. 22:25 기준)

| 화면 | 경로 | 차이 | 담당 | 할 일 |
|---|---|---|---|---|
| A-03, A-08, A-10, R-30 | 프로젝트 하위 | Figma에만 | D21 | 규칙 3 적용 완료(125d6da 뒤) |
| A-05 요청 보드, G-06 내 작업, G-07 알림, G-09 오류, A-06 운영 현황판 | /requests 등 | Figma에만(h1에 section-title) | D21(P15는 C2) | 규칙 1: h1 section-title → page-head. P03, P09, P10, P13, P26 완료. P15_Requests(C2), P27_Account 알림(C1) 남음 |
| R-20 패키지 | /projects/150/packages | Figma에만 | C2 | 규칙 3(PAGE_HEAD에 R-20) 또는 화면 h1 |
| R-25 그래프, R-27 새 파일, R-28 올리기, R-29 새 브랜치 | 프로젝트 하위 | Figma에만 | C1 | 규칙 3 |
| R-04~R-10, R-23 | 프로젝트 하위 | 상자 h·모양·아이콘(제목 줄 단추 포함 여부) | C1 / C2(R-10, R-23) | Figma page-head 상자(제목 줄 40)와 코드 제목 줄 높이 맞춤 |
| G-01, G-02, R-01, R-17 | | 코드에만 | D21 / C2(R-17) | 규칙 4 |
