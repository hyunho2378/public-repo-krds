# 화면과 상태 목록(코드 기준)

- 작성: 2026. 10. 30. 코드 갈래
- 용도: Figma Screens 페이지의 프레임 이름과 코드 상태 이름을 같게 맞춘다
- 프레임 이름 규칙: `P-04 / Ideal / 1920 / light`처럼 `화면 / 상태 / 폭 / 모드`
- 폭: 320은 검사용, 설계 프레임은 1920, 1440, 1024, 768, 360
- 모드: light, dark(D-01), high-contrast(KRDS 그대로)
- 상태 값은 화면 최상위 요소의 `data-state`에 그대로 들어간다(검사 스크립트가 읽음)
- 문구: `app/src/copy/ko.js`. 키 접두는 화면 번호. Figma 텍스트 레이어 이름에 키를 넣으면 대조할 수 있다(예: 레이어 이름 `P01_1`)

## 공통 부품(Figma 묶음 = 코드 폴더)
| Figma 묶음 | 코드 파일 | KRDS 부품 |
|---|---|---|
| Identity | components/Identity/Header.jsx, Footer.jsx, ScreenMode.jsx | masthead, header, footer |
| Navigation | components/Navigation/Breadcrumb.jsx, ProjectTabs.jsx, Pagination.jsx, StepIndicator.jsx | breadcrumb, tab(line), pagination, step_indicator |
| Action | components/Action/Button.jsx | button(Type, Size) |
| Feedback | components/Feedback/Status.jsx, NoticeBanner.jsx, LoginRequiredModal.jsx | spinner, critical_alerts, modal |
| Layout | components/Layout/Page.jsx, ProjectFrame.jsx, StructuredList.jsx | structured_list |
| Input | components/Input/TaskSearch.jsx, FieldsetTitle.jsx | search, checkbox, radio |
| Help | components/Help/Readme.jsx | disclosure |

## 공통 상태(모든 화면)
| 상태 | 언제 | 코드 | 화면에 보이는 것 |
|---|---|---|---|
| Loading | 자료를 받는 중 | Feedback/Status | 스피너와 "자료를 불러오고 있습니다." |
| Error | 서버 오류 | Feedback/Status | 제목, 이유, 다시 불러오기, 도구 찾기로 가기 |
| Error(404) | 없는 프로젝트 번호 | Feedback/Status | "찾는 자료가 없습니다." |
| Menu open | 1023 이하에서 메뉴 버튼 | Identity/Header | 주 메뉴 세로, 로그인, 내 프로젝트, 화면 설정 |
| Mode menu | 1024 이상 유틸리티 "화면 설정" | Identity/ScreenMode | 4개 선택(시스템, 밝은, 어두운, 선명한) |
| Login required | 로그인 필요한 행동을 비로그인으로 누름 | Feedback/LoginRequiredModal | KRDS 모달. 취소, 로그인. 로그인 후 같은 주소로 복귀(returnTo) |

## 화면별
| 화면 | 주소 | 코드 | 상태(data-state) | 사이 상태와 이동 |
|---|---|---|---|---|
| P-01 첫 화면 | / | screens/P01_Home.jsx | Loading, Ideal, Empty, Error | 검색 → P-02, 분야 → P-02?field=, 분야 전체 → P-03, 기관별 → P-11 |
| P-02 검색 결과 | /search?q=&field=&environment=&page= | screens/P02_Search.jsx | Loading, Ideal, Empty, Error | 조건은 주소에 남음. 1023 이하 필터는 바텀시트(Filter sheet). Empty → 조건 해제, 요청하기(P-15 작성) |
| P-03 분야별 | /fields | screens/P03_Fields.jsx | Loading, Ideal, Error | 분야 → P-02 |
| P-04 프로젝트 홈 | /projects/:id | screens/P04_Project.jsx | Loading, Ideal, Min(README 없음), Error | 써 봤어요 → Login required 또는 Reuse form → 저장 알림. 판단 정보 칸마다 다음 행동 링크 |
| P-05 파일 | /projects/:id/files | screens/P05_Files.jsx | Loading, Ideal, Empty, Error | 개발자용 정보 접힘(Dev open) |
| P-06 변경 기록 | /projects/:id/changes | screens/P06_Changes.jsx | Loading, Ideal, Empty, Error | 작성자 이름, 메일 표시 안 함 |
| P-07 사용 방법 | /projects/:id/use | screens/P07_Usage.jsx | Loading, Ideal, Empty(실행 안내 없음), Result(판정 후), Error | 단계 표시기 1→2, 판정 근거 파일 표시. 360에서는 "1/3단계 내 PC 환경 확인" 글자 표시 |
| P-08 의견 | /projects/:id/feedback?type=readme,inquiry,feature | screens/P08_Feedback.jsx | Ideal(양식 선택), Write(양식 고른 뒤), Done(저장), Error | 비로그인 제출 → Login required |
| P-09 도구 올리기 | /publish | screens/P09_Publish.jsx | Ideal(1단계), Similar(비슷한 도구 표시), Login required(2단계 진입), NeedsWork, Pass("자동 점검 항목 모두 통과", 공개 승인 아님), 3단계 | 단계 표시기 3단계 |
| P-10 내 프로젝트 | /my | screens/P10_MyProjects.jsx | Login(비로그인 안내), Empty | |
| P-11 기관 | /organizations | screens/P11_Organizations.jsx | Loading, Ideal, Empty(이름 검색 결과 없음), Error | 기관 → P-02?q= |
| P-12 로그인 | /login?returnTo= | screens/P12_Login.jsx | Ideal | 공공 저장소 계정 위임 로그인 → returnTo |
| P-13 오류 | /error?kind=not-found,forbidden,maintenance, 없는 주소 | screens/P13_Error.jsx | not-found, forbidden, maintenance | not-found에 검색창 |
| P-14 도움말 | /help, /help#readme | screens/P14_Help.jsx | Ideal | 아코디언 열림/닫힘 |
| P-15 요청 보드 | /requests, /requests?new=1&q= | screens/P15_Requests.jsx | Loading, Ideal, Empty, Write, Error | 공감, 작성은 Login required |
