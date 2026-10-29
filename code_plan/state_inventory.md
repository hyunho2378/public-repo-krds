# 화면과 상태 목록 (화면 x State x Auth)

- 기준: 결정 D-10. 상태는 Figma 컴포넌트 속성 `State`, 로그인 여부는 `Auth`와 같은 이름을 쓴다.
- 개발 모드에서 주소로 조합을 띄워 Figma 변형과 1대1로 대조한다.
  - `?state=Ideal|Min|Max|Empty|Loading|Error`
  - `?auth=Guest|Signed-in`
  - `?mode=light|dark|high-contrast`
  - `?fixture=kordoc` 받아 둔 실제 응답으로 고정(점검 시간과 Figma 대조용)
- 배포본에서는 모두 꺼진다. 화면 하나는 `data-screen-id`, 상태는 `data-state`로 표시한다.
- Figma 프레임 이름 규칙: `번호 / State / 폭 / 모드`. 보기: `R-01 / Ideal / 1920 / light`
- 이전 목록은 `state_inventory_old.md`에 남겨 두었다.

## 1. 저장소 화면 (R)

| 번호 | 화면 | 주소 | State | Auth |
|---|---|---|---|---|
| R-01 | 저장소 첫 화면 | /projects/:id | Ideal, Min(파일 1개, 설명 없음), Max(긴 이름과 설명), Empty(빈 저장소), Loading, Error | Guest, Signed-in(파일 추가) |
| R-02 | 파일 목록(폴더) | /projects/:id/code/* | Ideal, Min, Max(파일 많음, 깊은 경로), Empty, Loading, Error | Guest, Signed-in |
| R-03 | 파일 보기 | /projects/:id/code/* | Ideal, Max(1,000줄 넘음), Empty(빈 파일), Error, 이진 파일 | Guest, Signed-in(편집) |
| R-05 | 변경 기록 | /projects/:id/changes | Ideal, Min, Empty, Loading, Error | Guest |
| R-06 | 변경 상세 | /projects/:id/changes/:sha | Ideal, Max(파일 많음), Error | Guest |
| R-07 | 비교 | /projects/:id/compare | Ideal, Empty(같은 갈래), Loading, Error | Guest |
| R-08 | 브랜치와 태그 | /projects/:id/branches | Ideal, Min(1개), Empty, Error | Guest, Signed-in(새 갈래) |
| R-10 | 릴리스 | /projects/:id/releases | Ideal, Empty, Error | Guest |
| R-11 | 저장소 그래프 | /projects/:id/graph | Ideal, Empty, Error | Guest |
| R-12 | 이슈 목록 | /projects/:id/issues | Ideal, Empty, Error | Guest, Signed-in(새 이슈) |
| R-12 | 새 이슈 | /projects/:id/issues/new | Ideal, 저장 불가 안내 | Guest, Signed-in |
| R-13 | 이슈 상세 | /projects/:id/issues/:iid | Ideal, Error | Guest |
| R-14 | 이슈 보드 | /projects/:id/boards | 로그인 필요 | Guest, Signed-in |
| R-15 | 라벨 | /projects/:id/labels | 로그인 필요 | Guest, Signed-in |
| R-16 | 마일스톤 | /projects/:id/milestones | 로그인 필요 | Guest, Signed-in |
| R-17 | 변경 제안 목록 | /projects/:id/merge-requests | Ideal, Empty, Error | Guest |
| R-17 | 새 변경 제안 | /projects/:id/merge-requests/new | Ideal, Empty(같은 갈래), 저장 불가 안내 | Guest, Signed-in |
| R-18 | 변경 제안 상세 | /projects/:id/merge-requests/:iid | Ideal, Error | Guest |
| R-19 | 파이프라인 | /projects/:id/pipelines | Ideal, Empty, Error | Guest |
| R-20 | 패키지 | /projects/:id/packages | Ideal, Empty, Error | Guest |
| R-22 | 위키 | /projects/:id/wiki | Ideal, Empty, Error | Guest |
| R-23 | 스니펫 | /projects/:id/snippets | 로그인 필요 | Guest, Signed-in |
| R-24 | 멤버 | /projects/:id/members | 로그인 필요 | Guest, Signed-in |
| R-25 | 참여자 | /projects/:id/contributors | Ideal, Min(1명), Empty, Error | Guest |
| R-25 | 활동 | /projects/:id/activity | Ideal, Empty, Error | Guest |
| R-26 | 프로젝트 설정 | /projects/:id/settings | Ideal(읽기), 권한 안내 | Guest, Signed-in |
| R-27 | 새 파일 | /projects/:id/new | Ideal, 커밋 대화창, 저장 불가 안내 | Guest, Signed-in |
| R-27 | 파일 고치기 | /projects/:id/edit/* | Ideal, Loading, 저장 불가 안내 | Guest, Signed-in |
| R-28 | 파일 올리기 | /projects/:id/upload | Empty(고르기 전), Ideal(고른 뒤), 저장 불가 안내 | Guest, Signed-in |
| R-29 | 새 작업 갈래 | /projects/:id/branches/new | Ideal, 저장 불가 안내 | Guest, Signed-in |
| R-30 | 사용 방법 | /projects/:id/use | Ideal, Empty(안내 없음), 단계별 | Guest |

## 2. 전역 화면 (G)

| 번호 | 화면 | 주소 | State | Auth |
|---|---|---|---|---|
| G-01 | 탐색 | / | Ideal, Min, Max, Empty, Loading, Error | Guest, Signed-in |
| G-02 | 검색 결과 | /search | Ideal, Max(결과 많음), Empty(0건), Loading, Error | Guest |
| G-03 | 기관 | /organizations | Ideal, Empty, Error | Guest |
| G-05 | 내 프로젝트 | /my | Empty(로그인 전), Ideal(로그인 후) | Guest, Signed-in |
| G-06 | 알림 | /notifications | Empty(로그인 전), Ideal, Empty(받은 알림 없음) | Guest, Signed-in |
| G-08 | 로그인 | /login | Ideal, 시험판 안내 | Guest |
| G-09 | 오류 | /error | 찾을 수 없음, 권한 없음, 점검 | Guest |
| G-10 | 도움말 | /help | Ideal | Guest |
| G-11 | 설정 | /settings | Ideal, 계정은 로그인 필요 | Guest, Signed-in |

## 3. 더하는 기능 (A)

| 번호 | 화면 | 주소 | State | Auth |
|---|---|---|---|---|
| A-01 | 업무 분야 | /fields | Ideal, Empty, Error | Guest |
| A-02 | 요청 보드 | /requests | Ideal, Empty, Error | Guest, Signed-in(작성, 공감) |
| A-03 | 협업과 팀원 모집 | /collaborate | Empty | Guest, Signed-in |
| A-04 | 운영 현황판 | /insights | Ideal, Loading, Error | Guest |
| A-05 | 법령과 기준 알림 | /projects/:id/law-alerts | Empty(연결 안 됨), Ideal, Error | Guest |
| A-06 | AI 코딩 도구 연결 | /mcp | Ideal, Error | Guest |
| A-07 | 인수인계 문서 | /projects/:id/handover | Empty(만들기 전), Ideal, Error | Guest, Signed-in |
| A-08 | 단계별 점검표 | /checklist | Ideal, Error | Guest |
| A-09 | 도구 올리기 | /publish | 단계 1~3, 점검 결과(통과, 보완 필요), 로그인 필요 | Guest, Signed-in |
| A-10 | 소개 카드 | /projects/:id/about | Ideal, Min(README 없음), Error | Guest |
| A-11 | 의견 | /projects/:id/feedback | Ideal, Empty, 양식 선택, 로그인 필요 | Guest, Signed-in |

## 4. 대조 방법

1. Figma에서 같은 번호와 상태의 프레임을 PNG로 내보낸다.
2. 코드에서 같은 조합으로 화면을 띄운다. 보기: `/projects/1069?state=Max&mode=dark&fixture=kordoc`
3. 두 그림을 견주고, 차이가 남으면 원인을 `code_plan/screens_verification.md`에 적는다.
