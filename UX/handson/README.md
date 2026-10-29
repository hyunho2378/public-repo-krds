# 저장소 화면 직접 사용 기록 (공공 GitLab, GitHub)

기록일: 2026-10-30 (KST)

- 공공 GitLab: https://gitlab.aigov.go.kr (비로그인, 보기만 함). 주 대상 저장소는 `chrisryugj/kordoc`(서울특별시 광진구 류승인, 커밋 1,482, 태그 165, 릴리스 39)다. 머지 리퀘스트 화면은 열린 MR이 있는 `jh.noh/privacy`(GPT는 거들뿐 / Watson, !21)로 확인했다.
- GitHub: hyunho2378 계정에 비공개 저장소 `hyunho2378/ux-sandbox-krds`를 새로 만들었고, 상태 변경은 이 저장소 안에서만 했다.
- 스크린샷: `gitlab/` 85장, `github/` 95장 (1920×1080 기준, 화면 배율 2배라 실제 PNG는 3840×2160). 360 폭 모바일은 파일명에 `모바일360`이 붙는다.
- 화면 문구 원본 메모: `gitlab/_notes.json`, `github/_notes.json` (페이지 제목과 본문 앞부분, 메뉴 원문)

## 0. 주의할 점 (파일명과 실제 화면이 다른 경우)

| 파일 | 실제 화면 |
|-|-|
| gitlab/47_오류_404.png | 없는 그룹 주소는 404가 아니라 **로그인 화면으로 이동**한다 (비로그인 GitLab 동작). |
| gitlab/50_파일404.png | 없는 파일 주소는 **파일 목록(tree)으로 이동**하고 알림 문구가 뜬다. |
| gitlab/69_설정_비로그인.png | 설정(`/edit`)은 로그인 화면으로 이동. |
| gitlab/05b_브랜치선택_검색_결과없음.png | 검색어 "v4.24.2zzz" 입력 직후. 결과 0건 문구는 확인하지 못했다. |
| github/66~69_Insights_*.png | 비공개 저장소 무료 요금제라 Pulse, 기여자, 커밋 그래프, 네트워크가 모두 **Dependencies 화면으로 이동**했다. 공개 저장소에서는 다시 찍어야 한다. |
| github/63_Actions_빈.png | 워크플로가 없어 `actions/new`(새 워크플로 고르기)로 이동. |
| github/71_위키_빈.png | 비공개 무료 저장소는 위키가 없어 저장소 홈으로 이동. |
| github/settings/access | 비밀번호 재확인(Confirm access) 화면이 떠서 스크린샷을 지웠다. 입력은 하지 않았다. |
| 공공 GitLab 공지 | 로그인 화면에 "[공지] 공공 GitLab 시스템 점검 안내, 점검 일정 : 2026. 10. 30.(금) 22:00 ~ 10. 31.(토) 04:00 (6시간)"이 떠 있다. |

## 1. 공공 GitLab 왼쪽 프로젝트 메뉴 (사이드바 원문, 전부 펼친 상태)

참조: `gitlab/03_사이드바_전체펼침.png`, `gitlab/03b_사이드바_펼침_요소.png`

```
프로젝트
  kordoc
고정됨: 멤버 / 작업 항목 / 브랜치 / 머지 리퀘스트 / 파이프라인
추가 기능
관리: 활동 / 멤버 / 라벨
계획: 작업 항목 / 이슈 보드 / 마일스톤 / 위키
코드: 머지 리퀘스트 / 리포지토리 / 브랜치 / 커밋 / 태그 / 리포지토리 그래프 / 리비전 비교 / 스니펫
빌드: 파이프라인 / Jobs / 파이프라인 일정 / 아티팩트
배포: 릴리스 / 패키지 레지스트리 / 모델 레지스트리
운영: 환경 / Terraform 모듈
모니터: 인시던트
분석: 가치 흐름 분석 / 기여자 분석 / CI/CD 분석 / 리포지토리 분석 / 모델 실험기능
도움말 / 사이드바 접음
```

상단 바(비로그인): `메인 콘텐츠로 건너뛰기`, `홈페이지`, `탐색`, `검색 또는 이동… /`, `등록`, `로그인`. 맨 위 띠 문구: "AI 정부 실험실 공공 GitLab 저장소 ( 프로젝트 현황판 axboard.aigov.go.kr )".
탐색 사이드바: `프로젝트 / 그룹 / CI/CD 카탈로그 / AI 카탈로그 / 주제 / 스니펫`.
메모: "이슈"는 이 버전에서 **작업 항목**(`/-/work_items`)으로 바뀌어 있다. `/-/issues`로 들어가도 작업 항목으로 이동한다.

## 2. GitHub 저장소 메뉴 (원문)

참조: `github/08_저장소홈_README커밋후.png`

- 저장소 탭: `Code / Issues / Pull requests / Agents / Actions / Projects / Security and quality / Insights / Settings`
- 상단 바: `Open menu`, `Homepage (g then d)`, 브레드크럼(소유자 / 저장소, `Switch repository(option shift r)`), `Type / to search`, `Chat with Copilot`, `Create new...`, `All issues`, `All pull requests`, `All repositories`, 알림(`g then n`), 사용자 메뉴
- 저장소 머리: 이름, `Private` 배지, `Watch (0)`, `Fork (0)`, `Star (0)`
- 오른쪽 About: 설명, `Readme`, `Activity`, Stars, Watchers, Forks, Releases(`No releases published` / `Create a new release`), Packages, Contributors, Languages

## 3. 기능별 비교표

| 기능 | GitLab 위치와 조작 | GitHub 위치와 조작 | 메뉴 항목 원문 | 상태(빈, 로딩, 오류) | 키보드 | 그대로 가져올 것 / 공무원용으로 덧붙일 것 |
|-|-|-|-|-|-|-|
| 프로젝트 홈 | `/그룹/프로젝트`. 제목+공개 배지, 별표, 프로젝트 ID, 오른쪽 "프로젝트 정보"(커밋·브랜치·태그·릴리스 수, README, 라이선스, 변경 로그, 생성 날짜), 브랜치 선택, 경로, `파일 찾기`, `코드`, 최근 커밋 띠, 파일 표(이름 / 최근 커밋 / 최근 업데이트), README 렌더 (gitlab/02, 02b) | `/소유자/저장소`. 브랜치 버튼, `1 Branch`, `0 Tags`, `Go to file` 입력, `Add file`, `Code`, 최근 커밋 띠, `N Commits`, 파일 표, README와 `Outline`, 오른쪽 About (github/08, 15) | GL: "프로젝트 정보", "가장 최근 커밋.", "이력", "커밋 SHA 복사" / GH: "Latest commit", "History", "Folders and files" | 빈 저장소: GH는 "Quick setup — if you've done this kind of thing before", HTTPS/SSH 주소, "creating a new file or uploading an existing file" (github/04) | GH `.` github.dev | 가져올 것: 3단(트리/목록/README) 구조, 최근 커밋 띠, 오른쪽 요약. 덧붙일 것: 상단 "이 도구는 무엇인가요" 한 줄 요약, 기관·담당자, 사용 조건(라이선스 쉬운 말 풀이) |
| 파일 트리 패널 | 파일 보기 왼쪽. `파일 트리 브라우저 숨기기`, 폴더마다 `○○ 디렉터리 펼침`, 입력창 "파일 검색 (*.vue, *.rb...)" (gitlab/08, 34) | 파일 보기 왼쪽. `Collapse file tree`, 브랜치 버튼, `Add file`, `Search this repository`, `Go to file`, 트리, 크기 조절 손잡이 `Draggable pane splitter` (github/48, 90) | 위 원문 | - | GH `⌘B` 트리 접기 | 가져올 것: 접기, 너비 조절, 트리 안 검색. 덧붙일 것: 폴더 옆 "문서/코드/설정" 같은 쉬운 분류 표시 |
| 파일 보기 | `/-/blob/브랜치/경로`. 버튼: `파일 경로 복사`, `파일 찾기`, `편집`(비로그인 비활성), `파일 작업`(비로그인 비활성), `이력`, `Blame`, `파일 내용 복사`, `raw 열기`, `다운로드` (gitlab/08, 09) | `/blob/브랜치/경로`. `Copy path`, `More file actions`, `History`, `Code`/`Blame` 전환, "15 lines (9 loc) · 232 Bytes", `Raw`, `Copy raw file`, `Download raw file`, `Edit this file`, `More edit options`, `Open symbols panel` (github/48) | GH 더보기: Download / Jump to line / Copy path / Copy permalink / Ask about this file / Show code folding buttons / Wrap lines / Center content / Open symbols on click / Delete file (github/39). GH 편집옵션: In place / github.dev / GitHub Desktop (github/89) | CSV는 GH가 표로 보여 줌 (github/38) | GH: `b` Blame, `l` 줄 이동, `y` 고정 링크, `e` 편집, `⌘⇧C` 원본 복사, `⌘⇧S` 내려받기, `⌘⇧>` 경로 복사 | 가져올 것: 코드/미리보기/Blame 전환 버튼 그룹, 줄 번호, 복사·원본·내려받기 묶음. 덧붙일 것: "Blame = 줄마다 누가 언제 고쳤는지", "Raw = 꾸밈 없는 원본 글자" 툴팁 |
| 마크다운 미리보기/코드 | README.md 열면 렌더, 제목마다 `제목 'X'으로 링크` (gitlab/09) | `Preview`/`Code` 전환, `?plain=1`로 코드 보기, `Outline` 목차 (github/12, 54) | GH "Outline" | - | - | 목차(Outline) 패널은 긴 사용 설명서에 필수 |
| Blame | `?blame=1` (gitlab/10) | `/blame/` (github/49) | GL "Blame" / GH "Blame" | - | GH `b` | 쉬운 말: "줄별 작성 기록" |
| 줄 번호와 줄 링크 | 줄 번호 클릭 → `#L5-8` (gitlab/11) | `#L8-L11`, Shift+클릭 범위 (github/50) | - | - | GH `l`, `y` | 줄 링크 복사 버튼을 눈에 띄게 |
| 원본/복사/내려받기 | `raw 열기`, `파일 내용 복사`, `다운로드` | `Raw`, `Copy raw file`, `Download raw file` (github/51) | 위 원문 | 비공개 저장소 Raw는 일회용 토큰이 붙은 주소로 열림 | GH `⌘⇧C`, `⌘⇧S` | 그대로 |
| 파일 기록 | `/-/commits/main/경로` (gitlab/12) | `/commits/main/경로` "History for app.js" (github/52) | GL "이력" / GH "History" | - | - | 쉬운 말: "이 파일의 변경 기록" |
| 폴더·경로 이동 | 브레드크럼 `그룹 / 프로젝트`, 경로 옆 `파일 경로 복사` (gitlab/07) | 브레드크럼 + `Copy path` (github/53) | - | - | GH `⌘⇧>` | 그대로 |
| 브랜치 선택 드롭다운 | `main` 버튼 → "Git 리비전 선택", 검색창 "Git 리비전으로 검색", 구획 `브랜치` / `태그`(20개) 목록, 배지 `기본값`, `보호됨`, 하단 "결과 21건" (gitlab/04, 05) | `main branch` → "Switch branches/tags", 입력 "Find or create a branch...", 탭 `Branches`/`Tags`, `View all branches`, 없는 이름 입력 시 `Create branch design/krds-tokens from main` (github/11, 11b, 11c) | 위 원문 | GH 태그 탭 빈 상태 (github/11b) | GH `w` | 가져올 것: 탭형(GH)이 이해 쉬움, 입력하면 바로 새 브랜치 제안. 덧붙일 것: "브랜치 = 원본을 건드리지 않는 작업용 사본" 설명 |
| 파일 찾기 | `파일 찾기` 버튼 또는 `t` → 대화창 "파일이름으로 검색", "검색어는 최소 3자 이상이어야 합니다.", 구획 "프로젝트 파일" (gitlab/33, 33b) | `t` → 파일 찾기, `Go to file` 입력 (github/85, 85b) | 위 원문 | GL 3자 미만 안내 | GL/GH `t` | 그대로 + 한글 파일명 초성 검색 |
| 코드(clone) 드롭다운 | `코드` → "SSH로 clone", "HTTPS으로 clone", "다음으로 열기": Visual Studio Code(SSH/HTTPS), IntelliJ IDEA(SSH/HTTPS), "소스 코드 다운로드": zip / tar.gz / tar.bz2 / tar (gitlab/06) | `Code` → 탭 `Local`/`Codespaces`, Clone `HTTPS`/`SSH`/`GitHub CLI`, 주소+`Copy URL to clipboard`, `Open in GitHub Copilot app`, `Open with GitHub Desktop`, `Download ZIP` (github/10) | 위 원문 | - | - | 가져올 것: 주소 복사, ZIP. 덧붙일 것: 공무원 PC(인터넷망 분리)용 "ZIP 받아서 쓰기" 1순위 배치와 설명 |
| 커밋 목록 | `/-/commits/main` (gitlab/13) | `/commits/main` 날짜별 묶음 (github/46) | GL "커밋" / GH "Commits" | - | - | 날짜별 묶음 |
| 커밋 상세 diff | 버튼: `커밋 SHA 복사`, `파일 찾아보기`, `옵션`(다운로드: 패치 / Plain Diff), `파일 브라우저 숨기기`, `모든 파일 펼침`, `모든 파일 접기`, `인라인`(보기 방식), `목록 보기`/`트리 보기`, 파일마다 `파일 내용 숨기기`, `이전/이후 라인 표시` (gitlab/14, 14b, 14c `?view=parallel`) | `?diff=unified` / `?diff=split` (github/47, 47b), `Split`/`Unified`, `Expand all`, `Toggle diff contents` | 위 원문 | - | - | 가져올 것: 통합/나란히 전환, 왼쪽 파일 트리. 덧붙일 것: 초록=추가, 빨강=삭제 범례 |
| 비교(compare) | 사이드바 `리비전 비교` `/-/compare` 선택 → `/-/compare/v4.24.20...v4.24.21` (gitlab/18, 19) | `/compare` → `base: main ... compare: 브랜치`, "Able to merge. These branches can be automatically merged." (github/58, 59, 22b) | 위 원문 | - | - | 쉬운 말: "두 버전 차이 보기" |
| 브랜치 목록 | `/-/branches` (gitlab/15) | `/branches` (github/55) | - | - | - | 그대로 |
| 태그 | `/-/tags` (gitlab/16) | `/tags` (github/56). 새 태그는 릴리스 작성에서 "Create new tag" 대화창, "v0.1.0 will be created on publish" (github/44) | - | - | - | 쉬운 말: "태그 = 버전 이름표" |
| 릴리스 | `/-/releases` 39개 (gitlab/17) | 작성 `/releases/new`: `Tag: Select tag`, `Target: main`, `Release title`, `Generate release notes`, `Release description`, `Attach binaries...`, `None`/`Pre-release`, `Publish release`, `Save draft` (github/42~45, 57) | 위 원문 | GH 빈 상태 "No releases published" | - | 덧붙일 것: "내려받을 완성본은 여기" 안내 |
| 이슈(작업 항목) 목록 | `/-/work_items` 사이드바 "작업 항목" (gitlab/20, 49) | `/issues`: 왼쪽 `Issues / Assigned to me / Created by me / Mentioned / Recent activity`, `Views / Projects / Milestones / Labels`, 검색 "is:issue state:open", `Open`/`Closed`, 필터 `Author / Labels / Projects / Milestones / Assignees`, 정렬 `Newest`, 밀도 전환 (github/29, 33, 34) | 위 원문 | GH 빈: "No results matched your search / Try a different search query." (색인 지연으로 만든 직후에도 잠깐 0건이 보였다) | GH `g i`, `c` 새 이슈 | 덧붙일 것: "의견 남기기"로 이름 풀이 |
| 이슈 작성 | 비로그인 불가 | `/issues/new`: `Add a title`, Write/Preview, 서식 도구(Heading, Bold ⌘B, Italic ⌘I, Quote, Code ⌘E, Link ⌘K, 목록, Task list, Mention, Reference, Slash commands, Saved replies), 오른쪽 `Assignees / Labels / Projects / Milestone`, `Create more`, `Create (⌘Enter)` (github/30, 31) | 기본 라벨: accessibility, bug, documentation, duplicate, enhancement, good first issue, help wanted, invalid, question, wontfix | - | `⌘Enter` 제출, `l` 라벨 | 덧붙일 것: 라벨 한글 풀이(버그=고장, enhancement=개선 요청 등), 질문/오류/개선 고르는 양식 |
| 이슈 상세 | 비로그인 보기만 | `/issues/2` (github/32, 83) | - | - | - | 그대로 |
| 머지/풀 리퀘스트 목록 | `/-/merge_requests` 상태 탭, 병합됨 탭 (gitlab/21, 35, 76) | `/pulls`, 닫힘 필터 (github/28, 60) | - | GL kordoc은 MR 0건 빈 상태 | GH `g p` | 쉬운 말: "변경 요청" |
| 머지/풀 리퀘스트 상세 | 탭: `개요 0` / `커밋 4` / `파이프라인 0` / `변경사항 3`, `코드`, `브랜치 이름 복사`, `가능한 승인자 펼침`, `머지 검사 펼침`, `로컬로 해결`, `모든 활동`, 정렬 (gitlab/36~39) | 탭: `Conversation` / `Commits` / `Checks` / `Files changed`, "wants to merge 1 commit into main from 브랜치", `Merge pull request` + `Select merge method`(Create a merge commit / Squash and merge / Rebase and merge), `Confirm merge`, 병합 뒤 "Pull request successfully merged and closed", `Delete branch` (github/23~27, 35, 36) | 위 원문 | - | - | 가져올 것: 4탭 구조, 병합 2단계 확인. 덧붙일 것: 병합 전 "되돌릴 수 있나요?" 안내 |
| 업로드 | 비로그인 불가 | `Add file` → `Create new file` / `Upload files`. `/upload/main`: "Drag additional files here...", `Choose your files`, 파일마다 `Remove`, `Commit summary`(기본 "Add files via upload"), 직접 커밋 / 새 브랜치+PR 선택, "Processing your files…" (github/09, 13~15, 84) | 위 원문 | 처리 중 화면 제목 "Processing your files…" | - | 덧붙일 것: 올릴 수 없는 파일(개인정보, 비밀키) 경고 |
| 새 파일·폴더 | 비로그인 불가 | `/new/main`: 파일 이름 칸에 `docs/` 입력하면 경로 조각으로 바뀌어 폴더가 생김, `Edit`/`Preview`, 들여쓰기·줄바꿈 선택, `Commit changes...` (github/05, 06, 16) | "Name your file...", "Cancel changes" | - | - | 덧붙일 것: "폴더는 이름 뒤에 / 를 쓰면 만들어집니다" 안내 |
| 편집과 커밋 | `편집`(비로그인 비활성) | `/edit/main/app.js` → `Commit changes` 대화창: `Commit message`, `Extended description`, "Commit directly to the main branch" / "Create a new branch for this commit and start a pull request", 새 브랜치 이름(기본 hyunho2378-patch-1), `Propose changes` → 비교 화면으로 이동 (github/07, 17, 19, 20, 21). Copilot이 커밋 메시지를 자동 제안함 | 위 원문 | - | `e` 편집 | 덧붙일 것: 커밋 메시지 예시 문장, "원본에 바로 반영 / 검토 받기" 쉬운 말 선택지 |
| 파일 삭제 | 비로그인 불가 | 더보기 `Delete file` → `/delete/...` → 커밋 대화창 (github/40, 41) | "Delete file" | - | - | 삭제 전 확인 문구 |
| README 편집 | 비로그인 불가 | README 오른쪽 `Edit file` (github/08) | - | - | - | 그대로 |
| 참여자/그래프 | `기여자 분석` `/-/graphs/main`, `리포지토리 그래프` `/-/network/main`, `리포지토리 분석` (gitlab/22, 23, 30) | Insights(비공개 무료는 Dependencies로 이동, github/66~69), 오른쪽 Contributors | - | GH 제한 | - | 참여 기관 표시 |
| 저장소 검색 | `/search?scope=blobs&search=parse&project_id=150` (gitlab/45) | `repo:소유자/저장소 hello` 코드 검색 (github/74) | - | - | GH `/` | 덧붙일 것: 업무 말 검색 |
| 전역 검색 | `/` → 대화창 "장소 / 탐색", "최근 이슈", "최근 머지 리퀘스트", 입력 시 "다음 위치에서 `kor` 검색... / kordoc / GitLab 전체", 오류 "검색 자동 완성 제안을 가져오는 동안 오류가 발생했습니다." (gitlab/51, 51b), 결과 `/search?search=hwp` (gitlab/44) | `Type / to search`, `/search?q=krds&type=repositories` (github/75) | 위 원문 | GL 자동 완성 오류 실측 | `/` | 자동 완성 실패 시 안내 문구 |
| 탐색 | `/explore/projects` 탭 `활성`/`비활성`, 검색 "필터링 또는 검색 (최소 3자)", 정렬 "업데이트 날짜", 카드(설명, 주제, 별점·포크·MR·이슈 수, 업데이트됨), 그룹, 주제, 스니펫, CI/CD 카탈로그, AI 카탈로그 (gitlab/01, 40~43, 72, 73) | `/explore` (github/76) | 위 원문 | - | - | 가져올 것: 카드 목록. 덧붙일 것: 분야 태그([공공행정] 등)를 필터로 |
| 그룹/조직 | `/kised` 탭 `서브 그룹과 프로젝트 / 공유된 프로젝트 / 공유된 그룹 / 비활성` (gitlab/71b) | 조직 `github.com/github` (github/82) | 위 원문 | - | - | 기관 페이지로 |
| 사용자 프로필 | `/chrisryugj` (gitlab/48, 70) | `/hyunho2378`, `?tab=repositories` (github/78, 79) | - | - | - | 담당자 프로필 |
| 로그인 | `/users/sign_in`: "ID 또는 이메일", "패스워드", "비밀번호를 잊어버리셨나요?", "계정 정보 저장", `로그인`, `패스키`, "아직 계정이 없으신가요? 지금 등록하세요", 상단 공지 (gitlab/46), 등록 화면 보기만 (gitlab/75) | 로그인 상태라 미기록 | 위 원문 | - | - | 공지 영역 그대로 |
| 알림 | 비로그인 불가 | `/notifications` (github/77) | - | - | GH `g n` | - |
| 오류(404) | 그룹 없음 → 로그인 이동, 파일 없음 → 목록 이동 (gitlab/47, 50) | "Page not found · GitHub" (github/80, 81) | - | 오류 | - | 덧붙일 것: 우리 서비스는 진짜 404 화면과 "검색으로 찾기" 버튼 |
| 기타 GitLab 메뉴 | 활동, 멤버, 라벨, 마일스톤, 위키, 이슈 보드, 스니펫, 파이프라인, Jobs, 파이프라인 일정, 아티팩트, 패키지/모델 레지스트리, 환경, Terraform 모듈, 인시던트, 가치 흐름 분석, CI/CD 분석, 모델 실험기능, 포크, 별표한 사람 (gitlab/24~29, 54~68) | Labels, Milestones, Actions, Projects, Security, Activity, Settings 일반 (github/61~65, 70, 72) | 사이드바 원문 1절 | 대부분 빈 상태 | - | 공무원용은 고급 메뉴(빌드·배포·운영·모니터) 접어 두기 |
| 모바일 360 | gitlab/52, 53 | github/87, 88 | - | - | - | 파일 보기 가로 스크롤 처리 |

### GitHub 키보드 단축키 (`?` 도움말 원문 일부, github/86)

`g c` Go to code, `g i` Go to issues, `g p` Go to pull requests, `g e` Go to agents, `g a` Go to actions, `g b` Go to projects, `g s` Go to security, `.` Open in github.dev, `⌘B` Toggle file tree, `w` Open ref selector, `t` Go to file, `l` Go to line, `b` View blame, `r` Find symbol, `⌘⇧C` Copy raw content, `⌘⇧S` Download raw file, `e` Edit file, `⌘I` Toggle symbols panel, `y` Get permalink, `⌘⇧>` Copy file path, `⌘⇧<` Copy permalink.
GitLab 실측: `/` 전역 검색, `t` 파일 찾기.

## 4. 핵심 차이 (GitLab vs GitHub)

1. 메뉴 구조: GitLab은 왼쪽 세로 사이드바에 8개 묶음(관리·계획·코드·빌드·배포·운영·모니터·분석) 40여 항목. GitHub는 위쪽 가로 탭 9개이고 브랜치·커밋·태그·릴리스는 저장소 홈 안의 링크로 들어간다.
2. 브랜치 선택: GitLab은 한 목록 안에 브랜치/태그 구획, GitHub는 Branches/Tags 탭과 "입력하면 바로 새 브랜치 만들기".
3. 이슈 이름: 공공 GitLab은 "작업 항목"으로 바뀜. GitHub는 Issues.
4. 웹 편집: GitHub는 편집 → 커밋 대화창 한 곳에서 "바로 반영 / 새 브랜치+PR"을 고르고 곧장 비교 화면으로 넘어간다. 공공 GitLab은 비로그인이라 편집·파일 작업 버튼이 비활성.
5. clone 메뉴: GitLab은 IDE(VS Code, IntelliJ)별 SSH/HTTPS와 압축 형식 4종. GitHub는 Local/Codespaces 탭과 ZIP 하나.
6. 오류 처리: 공공 GitLab은 404를 로그인/목록으로 돌려보내 오류 화면이 없다. GitHub는 404 화면이 따로 있다.
7. 언어: 공공 GitLab은 한국어(일부 영어 혼재: Jobs, Terraform, "Sign in or sign up before continuing."), GitHub는 영어.

## 5. 시험용 저장소 상태 (hyunho2378/ux-sandbox-krds, 비공개)

- 커밋(main): README 추가 → app.js·data.csv 업로드 → docs/guide.md(폴더) → PR #1 병합 커밋까지 5개
- 브랜치: `main`, `feature/official-greeting`(병합됨, 삭제 안 함), `design/krds-tokens`(data.csv 삭제 커밋 1개, PR 없음)
- PR #1 "feat: 공무원용 인사말 함수 추가" 병합 완료 (Create a merge commit)
- 이슈 #2 "파일 보기 화면에 쉬운 말 설명 추가", 라벨 documentation, enhancement
- 태그 `v0.1.0`, 릴리스 "v0.1.0 첫 시험 릴리스" 발행

## 6. 우리 화면 목록 제안 (저장소 영역 전부)

| 화면 이름 | 참조 화면 파일 | 필수 요소 |
|-|-|-|
| 프로젝트 홈 | gitlab/02, github/08 | 이름·공개 배지·별표, 한 줄 요약(쉬운 말), 브랜치 선택, 파일 찾기, 코드(받기) 버튼, 최근 커밋 띠, 파일 표, README와 목차, 오른쪽 요약(기관, 라이선스 풀이, 커밋·브랜치·태그·릴리스 수) |
| 빈 저장소 | github/04 | 주소 복사, 새 파일/업로드 링크, 명령어 안내 |
| 파일 목록(폴더) | gitlab/07, github/53 | 브레드크럼+경로 복사, 파일 표, 위로 가기 |
| 파일 보기 | gitlab/08, github/48 | 왼쪽 트리(접기, 검색), 코드/미리보기/Blame 전환, 줄 번호·줄 링크, 원본·복사·내려받기, 기록, 편집, 쉬운 말 툴팁 |
| 마크다운 미리보기와 목차 | gitlab/09, github/12 | 렌더, 제목 링크, Outline |
| 줄별 작성 기록(Blame) | gitlab/10, github/49 | 줄마다 커밋·작성자·날짜 |
| 파일 찾기 대화창 | gitlab/33, github/85 | `t`, 최소 글자 안내, 결과 강조 |
| 브랜치·태그 선택 | gitlab/04, github/11, 11c | 검색, 브랜치/태그 탭, 기본값·보호됨 배지, 새 브랜치 만들기 |
| 코드 받기 메뉴 | gitlab/06, github/10 | HTTPS/SSH 복사, ZIP(1순위), IDE로 열기 |
| 변경 기록(커밋 목록) | gitlab/13, github/46 | 날짜 묶음, SHA 복사, 파일별 기록 |
| 커밋 상세 | gitlab/14, 14c, github/47, 47b | 통합/나란히, 파일 트리, 펼치기·접기, 패치 받기, 색 범례 |
| 두 버전 비교 | gitlab/18, 19, github/58, 59 | 기준/비교 선택, 병합 가능 여부, 커밋·파일 요약 |
| 브랜치 목록 | gitlab/15, github/55 | 기본·보호 배지, 앞섬/뒤처짐 |
| 태그 목록 | gitlab/16, github/56 | 이름, 커밋, 날짜 |
| 릴리스 목록·상세·작성 | gitlab/17, github/42~45, 57 | 태그 선택/새 태그, 제목, 설명, 첨부, 미리 공개 표시, 발행/임시 저장 |
| 의견(이슈) 목록 | gitlab/20, github/33, 34 | 열림/닫힘, 필터(작성자·라벨·마일스톤·담당자), 정렬, 빈 상태 |
| 의견 작성 | github/30, 31 | 제목, 본문(서식 도구, 미리보기), 라벨(한글 풀이), 담당자, 제출 단축키 |
| 의견 상세 | github/32 | 본문, 라벨, 활동 |
| 변경 요청(MR/PR) 목록 | gitlab/35, 76, github/28, 60 | 상태 탭, 필터 |
| 변경 요청 상세 | gitlab/36~39, github/23~27, 35, 36 | 대화·커밋·검사·변경 파일 탭, 병합 방식, 2단계 확인, 병합 완료와 브랜치 삭제 |
| 변경 요청 만들기 | github/21, 22b | 기준/비교 브랜치, 제목, 설명, 검토자·라벨 |
| 파일 올리기 | github/13, 14, 15 | 끌어 놓기, 파일 빼기, 커밋 메시지, 바로 반영/검토 받기, 처리 중 상태, 금지 파일 경고 |
| 새 파일·폴더 만들기 | github/05, 16 | 경로 입력(/로 폴더), 편집/미리보기, 커밋 대화창 |
| 파일 편집 | github/19, 20 | 웹 편집기, 커밋 메시지, 대상 브랜치 선택 |
| 파일 삭제 확인 | github/40 | 삭제 대상 표시, 커밋 대화창 |
| 참여자·그래프 | gitlab/22, 23, 30 | 기여자 그래프, 저장소 그래프, 언어 비율 |
| 저장소 검색 결과 | gitlab/45, github/74 | 코드·이슈·커밋 범위 탭 |
| 전역 검색 대화창·결과 | gitlab/44, 51, 51b, github/75 | `/`, 최근 항목, 범위 선택, 자동 완성 오류 문구 |
| 탐색 | gitlab/01, 40~43, github/76 | 프로젝트·그룹·주제 탭, 카드, 분야 필터 |
| 기관(그룹) 페이지 | gitlab/71b, github/82 | 서브 그룹, 프로젝트 목록 |
| 사용자 프로필 | gitlab/70, github/78 | 소속, 프로젝트 |
| 로그인 | gitlab/46 | 공지 영역, ID/비밀번호, 패스키, 등록 |
| 알림 | github/77 | 읽음/안 읽음 |
| 404 오류 | github/80, 81 | 이유 설명, 검색·홈 버튼 |
| 모바일 프로젝트 홈·파일 보기 | gitlab/52, 53, github/87, 88 | 접힌 메뉴, 가로 스크롤 |

## 7. 기능 전수 목록 (체크리스트)

로그인 필요 여부는 "보기" 기준. 쓰기(작성·편집·병합)는 두 곳 모두 로그인 필요.
이번에 직접 열지 않은 경로(스크린샷 없음): GitHub /topics, /marketplace, gist, /stargazers, /deployments, /actions/metrics, /find, /login, /signup, GitLab 쓰기 경로(/-/new, /-/edit, /-/merge_requests/new, /-/releases/new, /projects/new, /dashboard/todos). 일반적인 경로 형식으로 적었으니 구현 전에 확인할 것.

| 번호 | 기능 | GitLab 경로 | GitHub 경로 | 보기에 로그인 필요 |
|-|-|-|-|-|
| 1 | 탐색: 프로젝트(활성/비활성) | /explore/projects, /explore/projects/inactive | /explore | 아니오 |
| 2 | 탐색: 그룹 | /explore/groups | (조직 검색) | 아니오 |
| 3 | 탐색: 주제 | /explore/projects/topics | /topics | 아니오 |
| 4 | 탐색: 스니펫 | /explore/snippets | gist.github.com | 아니오 |
| 5 | 탐색: CI/CD 카탈로그 | /explore/catalog | /marketplace | 아니오 |
| 6 | 탐색: AI 카탈로그 | /explore/ai-catalog | - | 아니오 |
| 7 | 프로젝트 홈 | /{그룹}/{프로젝트} | /{소유자}/{저장소} | 공개면 아니오 |
| 8 | 빈 저장소 안내 | - | /{소유자}/{저장소} (빈) | 예(비공개) |
| 9 | 파일 목록(폴더) | /-/tree/{ref}/{경로} | /tree/{ref}/{경로} | 아니오 |
| 10 | 파일 보기 | /-/blob/{ref}/{경로} | /blob/{ref}/{경로} | 아니오 |
| 11 | Blame | /-/blob/{ref}/{경로}?blame=1 | /blame/{ref}/{경로} | 아니오 |
| 12 | 원본(raw) | /-/raw/{ref}/{경로} | /raw/{ref}/{경로} | 아니오 |
| 13 | 줄 링크 | #L5-8 | #L8-L11 | 아니오 |
| 14 | 파일 기록 | /-/commits/{ref}/{경로} | /commits/{ref}/{경로} | 아니오 |
| 15 | 파일 찾기(t) | 단축키 t, 파일 찾기 버튼 | 단축키 t, /find/{ref} | 아니오 |
| 16 | 브랜치·태그 선택 드롭다운 | 프로젝트 홈 ref 버튼 | 프로젝트 홈 branch 버튼 | 아니오(새 브랜치는 예) |
| 17 | 코드(clone/ZIP/IDE) | 코드 버튼 | Code 버튼 | 아니오 |
| 18 | 커밋 목록 | /-/commits/{ref} | /commits/{ref} | 아니오 |
| 19 | 커밋 상세(통합/나란히) | /-/commit/{sha}, ?view=parallel | /commit/{sha}?diff=unified/split | 아니오 |
| 20 | 비교 | /-/compare, /-/compare/a...b | /compare, /compare/a...b | 아니오 |
| 21 | 브랜치 목록 | /-/branches | /branches | 아니오 |
| 22 | 태그 목록 | /-/tags | /tags | 아니오 |
| 23 | 릴리스 목록 | /-/releases | /releases | 아니오 |
| 24 | 릴리스 작성 | /-/releases/new | /releases/new | 예 |
| 25 | 이슈(작업 항목) 목록 | /-/work_items (/-/issues) | /issues | 아니오 |
| 26 | 이슈 작성 | /-/work_items/new | /issues/new | 예 |
| 27 | 이슈 상세 | /-/work_items/{n} | /issues/{n} | 아니오 |
| 28 | 이슈 보드 | /-/boards | Projects | 아니오 |
| 29 | 라벨 | /-/labels | /labels | 아니오 |
| 30 | 마일스톤 | /-/milestones | /milestones | 아니오 |
| 31 | MR/PR 목록 | /-/merge_requests | /pulls | 아니오 |
| 32 | MR/PR 상세: 개요/대화 | /-/merge_requests/{n} | /pull/{n} | 아니오 |
| 33 | MR/PR 상세: 커밋 | /-/merge_requests/{n}/commits | /pull/{n}/commits | 아니오 |
| 34 | MR/PR 상세: 파이프라인/검사 | /-/merge_requests/{n}/pipelines | /pull/{n}/checks | 아니오 |
| 35 | MR/PR 상세: 변경 파일 | /-/merge_requests/{n}/diffs | /pull/{n}/files | 아니오 |
| 36 | MR/PR 만들기 | /-/merge_requests/new | /compare/a...b?expand=1 | 예 |
| 37 | 병합(방식 선택, 확인) | MR 상세 | PR 상세 Merge pull request | 예 |
| 38 | 업로드 | 파일 작업 메뉴(로그인) | /upload/{ref}/{경로} | 예 |
| 39 | 새 파일·폴더 | /-/new/{ref}/{경로} | /new/{ref}/{경로} | 예 |
| 40 | 파일 편집과 커밋 | /-/edit/{ref}/{경로}, Web IDE | /edit/{ref}/{경로} | 예 |
| 41 | 파일 삭제 | 파일 작업 메뉴 | /delete/{ref}/{경로} | 예 |
| 42 | 리포지토리 그래프 | /-/network/{ref} | /network | 아니오 |
| 43 | 기여자 분석 | /-/graphs/{ref} | /graphs/contributors | 아니오 |
| 44 | 리포지토리 분석 | /-/graphs/{ref}/charts | /pulse, /graphs/commit-activity | 아니오 |
| 45 | 가치 흐름 분석 | /-/value_stream_analytics | - | 아니오 |
| 46 | CI/CD 분석 | /-/pipelines/charts | /actions/metrics | 아니오 |
| 47 | 활동 | /activity | /activity | 아니오 |
| 48 | 멤버 | /-/project_members | /settings/access | GL 아니오 / GH 예 |
| 49 | 위키 | /-/wikis/home | /wiki | 아니오 |
| 50 | 스니펫(프로젝트) | /-/snippets | - | 아니오 |
| 51 | 파이프라인 | /-/pipelines | /actions | 아니오 |
| 52 | Jobs | /-/jobs | /actions (실행 상세) | 아니오 |
| 53 | 파이프라인 일정 | /-/pipeline_schedules | (워크플로 schedule) | 아니오 |
| 54 | 아티팩트 | /-/artifacts | 실행 상세 Artifacts | 아니오 |
| 55 | 패키지 레지스트리 | /-/packages | /packages | 아니오 |
| 56 | 모델 레지스트리 | /-/ml/models | - | 아니오 |
| 57 | 환경 | /-/environments | /deployments | 아니오 |
| 58 | Terraform 모듈 | /-/terraform_module_registry | - | 아니오 |
| 59 | 인시던트 | /-/incidents | - | 아니오 |
| 60 | 모델 실험기능 | /-/ml/experiments | - | 아니오 |
| 61 | 보안 | - | /security | 예(비공개) |
| 62 | 포크 목록 | /-/forks | /forks | 아니오 |
| 63 | 별표한 사람 | /-/starrers | /stargazers | 아니오 |
| 64 | 설정 | /edit | /settings | 예 |
| 65 | 저장소 검색 | /search?project_id={id}&scope=blobs | /search?q=repo:… | 아니오 |
| 66 | 전역 검색(대화창 /) | / 단축키, /search | / 단축키, /search | 아니오 |
| 67 | 그룹/조직 페이지 | /{그룹} | /{조직} | 아니오 |
| 68 | 사용자 프로필 | /{사용자} | /{사용자} | 아니오 |
| 69 | 로그인 | /users/sign_in | /login | - |
| 70 | 등록 | /users/sign_up | /signup | - |
| 71 | 알림 | /dashboard/todos(로그인) | /notifications | 예 |
| 72 | 404 오류 | (로그인/목록으로 이동) | Page not found | 아니오 |
| 73 | 도움말 | /help | docs.github.com | 아니오 |
| 74 | 키보드 단축키 도움말 | ? | ? | 아니오 |
| 75 | 새 저장소 만들기 | /projects/new | /new | 예 |
