# GitLab 프런트엔드 구조와 KRDS 전환 지도

관찰일: 2026. 10. 30. / 상태: 코드 조사 완료, 구현 전 설계안

## 0. 적용 범위와 증거 수준

- **확정된 제품 방향**: GitLab 원본과 같은 Rails/HAML + Vue 구성을 유지한다. 코딩을 전혀 모르는 공무원이 주 퍼소나다. GitLab·GitHub 구조는 참고하되 개발자를 위한 용어·정보 위계를 그대로 복제하지 않는다.
- **확인**: `~/gitlab-src`의 GitLab master 커밋 `83771d4345bd2b6002d1fb0a327027233b4c2dbb`를 검사했다. 커밋 시간은 2026-10-29 13:43:01 -0700이다.
- **확인**: blobless shallow clone은 성공했다. 대규모 전체 checkout을 중단하고 `app/assets`, `app/views`, `app/helpers`, `config`를 sparse checkout했다. 루트 파일도 존재한다. 실행한 GDK·GitLab 서버는 없다.
- **확인**: `package.json:74`가 고정한 `@gitlab/ui@138.7.3`을 npm에서 받아 검사했다. 최신 138.8.0도 받았으나 이 문서와 집계는 138.7.3 기준이다.
- **미확인**: 현행 공공 GitLab의 설치 버전. 이 master의 Vue/HAML 구조가 운영 서버 버전과 일치한다고 단정할 수 없다. 구현 브랜치는 실제 설치 버전 태그와 비교 후 고정해야 한다.
- 아래 **확인**은 파일 내용·존재를 직접 검사한 사실, **제안**은 우리 구현 선택지, **추정**은 구현/빌드/사용성 검증 전 판단이다.
- 저장소 원문 링크: `https://gitlab.com/gitlab-org/gitlab/-/tree/83771d4345bd2b6002d1fb0a327027233b4c2dbb`.

## 1. 토큰 체계와 다크 모드

### 1.1 @gitlab/ui의 파일 구조 [확인]

아래 경로는 확보한 npm 패키지 루트 기준이다. 실제 디렉터리는 함께 생성한 `gitlab_frontend_inventory.json`의 `ui`에 있다.

| 역할 | 실제 파일/디렉터리 | 확인 내용 |
|---|---|---|
| 원시 값 | `src/tokens/constant/` | 색·간격 등 상수 계층 |
| 의미 값 | `src/tokens/semantic/background.tokens.json`, `text.tokens.json`, `border.tokens.json`, `action.tokens.json`, `font.tokens.json`, `shadow.tokens.json` | 업무 의미별 별칭. `$value.default`, `$value.dark`로 밝은/어두운 값 구분 |
| 부품별 값 | `src/tokens/contextual/button.tokens.json`, `table.tokens.json`, `application-chrome.tokens.json` | 버튼·표·앱 셸 같은 맥락별 값 |
| 생성 CSS | `src/tokens/build/css/tokens.css`, `tokens.dark.css` | `--gl-*` 사용자 정의 속성. 직접 수정 금지 주석이 있음 |
| 생성 SCSS | `src/tokens/build/scss/` | 컴파일 시 사용하는 변수. CSS 변수 덮어쓰기만으로는 컴파일된 값을 바꿀 수 없음 |
| Tailwind 연결 | `src/tokens/build/tailwind/tokens.cjs`, `components.cjs` | CSS 변수에 연결한 색·크기·유틸리티 |
| 선택자 원천 | `src/tokens/color_mode.js` | `gl-dark`, `gl-dark-scope`, `gl-light-scope` 상수 |
| 토큰 CSS 진입점 | `src/scss/tokens.scss` | 밝은 CSS와 어두운 CSS 모두 import |
| UI SCSS 진입점 | `src/scss/gitlab_ui_no_utils.scss` | tokens → settings → body → typography → components → themes |

`tokens.css`는 `:root, .gl-light-scope`, `tokens.dark.css`는 `:root.gl-dark, .gl-dark-scope`에 값을 선언한다. 기본 배경은 밝은 모드 neutral.0, 어두운 모드 neutral.950이다. 단순한 RGB 색상명뿐 아니라 `--gl-background-color-default`, `--gl-text-color-default`, `--gl-action-confirm-background-color-hover` 같은 의미 토큰이 있다. 이전 `--gray-*`, `--blue-*`도 Tailwind 토큰에 남아 있으므로 `--gl-*`만 바꾸면 전부 바뀐다고 보장할 수 없다.

### 1.2 GitLab 앱의 다크 모드 [확인]

- `app/helpers/preferences_helper.rb:133–150`: `gl-light`, `gl-dark`, `gl-system` 구분.
- `app/views/layouts/_application_color_mode_js.html.haml`: 시스템 설정을 읽고 루트에 `gl-dark`를 추가/제거한다. 설정 변경도 구독한다.
- `app/views/layouts/_head.html.haml:36–51`: 다크 설정이면 `application_dark`, 시스템 설정이면 light/dark 미디어 조건으로 두 CSS 번들을 읽는다. 뒤에 `tailwind` CSS를 읽는다.
- `app/assets/stylesheets/application_dark.scss`: `color_modes/dark` → `application_base` → `application_dark_overrides` 순서.
- `app/assets/stylesheets/color_modes/_dark.scss`: GitLab UI의 어두운 SCSS 토큰을 먼저 읽고 body/input/tooltip 등 Sass 변수를 재지정한다.
- `app/assets/stylesheets/_application_dark_overrides.scss`: `:root.gl-dark`에서 코드 배경, 그림 밝기 등의 별도 보정도 한다.

**중요**: 다크 모드는 CSS 변수 교체와 SCSS 재컴파일 두 경로가 함께 작동한다. 우리 모드 3개(밝은/어두운/선명한 화면)도 CSS 변수 한 벌 추가만으로 완료되지 않는다. 시스템 설정과 기존 `gl-dark` 상태를 일치시키되, 선명한 화면 선택은 별도 사용자 설정·저장·초기 렌더·테스트가 필요하다 [제안].

## 2. Tailwind와 기본값 제거 지점

| 위치 | 직접 확인한 사실 | 우리 변경안 [제안] |
|---|---|---|
| `config/tailwind.config.js:2,21` | `@gitlab/ui/tailwind.defaults`를 preset으로 사용 | 우리 화면용 preset을 그 뒤에 두거나 해당 설정의 theme 키를 명시적으로 교체. `extend`만 하면 원래 값이 남음 |
| UI `tailwind.defaults.js:262–277` | `prefix: 'gl-'`, `preflight:false`; ring 계열 일부 플러그인도 끔 | `gl-` 유지. 전체 reset을 추가하지 않음 |
| 앱 `config/tailwind.config.js:38` | `container:false`만 앱에서 추가 | 색·spacing·fontSize·radius·boxShadow를 KRDS 연결로 제한. 기존 화면 전체에 적용 시 회귀가 커지므로 전환 화면 범위부터 적용 |
| UI `tailwind.defaults.js:277–381` | theme에 토큰 객체와 직접 rem/px 값이 섞임. radius의 base/small/pill, font-size-h1, 그림자 등 직접 값 존재 | 생성 토큰뿐 아니라 이 수동 값도 교체/차단해야 함 |
| `config/tailwind.config.js:22` | dark variant는 `.dark` 기반 | 실제 모드의 `.gl-dark`와 서로 다름. 토큰 사용 위주로 두고 `dark:` 클래스 사용 여부는 별도 검사. 같다고 가정하면 안 됨 |
| `app/assets/stylesheets/tailwind.css` | base/components/utilities 지시자만 있음 | 생성물 수정 금지. 설정과 입력 토큰을 수정 |
| `package.json:15` | `tailwindcss:build` 스크립트 존재 | GitLab 원래 빌드 파이프라인에서 우리 토큰 생성 및 검사를 선행 |

### 2.1 rem 기준 충돌 [확인 및 제안]

`app/assets/stylesheets/bootstrap_migration_reset.scss:4–8`은 body `0.875rem`을 14px로 설명한다. GitLab UI 토큰은 `--gl-spacing-scale-5:1rem`(16px), `--gl-font-size-300:0.875rem`(14px)이다. KRDS 코드의 전제는 html 62.5%, 1rem=10px이며 본문 1.7rem=17px이다.

**금지**: GitLab 전체 html을 62.5%로 바꾸어 KRDS CSS만 맞추기. GitLab의 모든 기존 rem 레이아웃·아이콘·편집기가 축소된다. 요소나 shadow root만 나눈다고 rem 기준이 분리되는 것도 아니다.

**제안**: GitLab 루트의 사용자 브라우저 글자 크기 기준을 유지한다. KRDS 배포 CSS는 원본 그대로 보관하고 빌드 어댑터에서 rem을 10/16배로 변환한다. 예: KRDS 1.7rem → 통합 CSS 1.0625rem, 2.4rem → 1.5rem. 같은 17/24px 결과를 내면서 사용자 확대를 따른다. 글자/간격의 디자인 값 변경이 아닌 단위 변환이며 Figma 값은 그대로다. 변환기는 calc·미디어쿼리·음수 값·SVG·서드파티 CSS 범위를 테스트해야 한다. 아직 구현/승인/시각 비교 전이다.

## 3. SCSS 진입점과 페이지 번들

- `app/assets/stylesheets/application.scss` → `_application_base.scss`.
- `_application_base.scss` → `root`, `framework`, `page_specific_files`, `components/index`, `layouts/index`, `vendors/index`, `behaviors`, EE/JH, print.
- `framework.scss` → `framework/variables`, `variables_overrides`, `mixins`, GitLab UI `gitlab_ui_no_utils`와 개별 버튼/표/탭/본문 레이아웃.
- `framework/variables.scss:1–2`에서 UI 생성 SCSS 토큰과 UI variables를 읽는다. 같은 파일 93행의 `$gl-font-size:14px`처럼 고정 값도 있다.
- HAML은 `add_page_specific_style`로 필요한 페이지 번들을 넣는다. 구현은 `app/helpers/application_helper.rb:432`에 있다.
- 존재 확인한 주요 번들: `app/assets/stylesheets/page_bundles/project.scss`, `projects.scss`, `tree.scss`, `commits.scss`, `login.scss`, `work_items.scss`, `issues_show.scss`, `dashboard_projects.scss`, `group.scss`, `new_namespace.scss`.
- **제안**: 우리 공통 KRDS 연결 CSS는 최종 레이어로 삽입하되 page bundle과 Tailwind보다 우선순위가 낮아지지 않는지 확인. 구조 변화는 HAML/Vue 안에서 한다. 모든 페이지를 고특이도 CSS로 누르는 방식은 피한다.

## 4. P-01~P-15 대응: 실제 존재하는 파일

이 목록은 **교체/검토 후보의 하한선**이다. 아래 모든 경로의 존재와 줄 수를 파일시스템으로 확인했다. 기존 파일 전체를 반드시 지운다는 뜻도, 전체 줄 수가 수정량이라는 뜻도 아니다. 하위 의존 부품·controller·service·GraphQL·테스트·다국어·새 기능 백엔드는 별도다.

- AI 소개 카드·업무 문장 검색·환경 점검·공개 점검·기관별 사용 현황은 원본 파일에 이미 구현되어 있는 기능이 아니다. 데이터 모델/서비스/API 및 화면을 새로 구현해야 한다.
- 이 커밋에는 `projects/issues/index.html.haml`, `new.html.haml`이 없다. 구버전 경로를 추측해 수정하지 않는다. Work Items 목록/작성과 legacy issue 상세가 병존한다. `app/assets/javascripts/pages/projects/issues/show/index.js`가 두 경로로 분기한다.

### P-01 탐색 시작

- `app/views/explore/projects/index.html.haml` (4행)
- `app/views/explore/projects/_head.html.haml` (11행)
- `app/assets/javascripts/pages/explore/projects/index.js` (3행)
- `app/assets/javascripts/explore/projects/index.js` (54행)
- `app/assets/javascripts/explore/projects/components/app.vue` (79행)

### P-02 검색 결과

- `app/views/search/show.html.haml` (37행)
- `app/assets/javascripts/search/index.js` (98행)
- `app/assets/javascripts/search/results/components/app.vue` (122행)
- `app/assets/javascripts/groups_projects/components/tabs_with_list.vue` (699행)

### P-03 분야 탐색

- `app/views/explore/projects/topics.html.haml` (13행)
- `app/views/explore/projects/topic.html.haml` (36행)
- `app/views/shared/topics/_list.html.haml` (15행)

[제안] topics를 업무 분야 단일 체계로 연결. 자유 태그와 행정 분야를 같은 것으로 처리하지 않음.

### P-04 프로젝트 홈

- `app/views/projects/show.html.haml` (33행)
- `app/views/projects/_home_panel.html.haml` (14행)
- `app/assets/javascripts/pages/projects/show/index.js` (145행)
- `app/assets/javascripts/repository/components/header_area.vue` (435행)

### P-05 파일·README

- `app/views/projects/tree/show.html.haml` (24행)
- `app/views/projects/_files.html.haml` (18행)
- `app/views/projects/blob/show.html.haml` (27행)
- `app/views/projects/blob/viewers/_readme.html.haml` (4행)
- `app/assets/javascripts/repository/components/app.vue` (9행)
- `app/assets/javascripts/repository/components/tree_content.vue` (222행)
- `app/assets/javascripts/blob/components/blob_content.vue` (152행)

### P-06 변경 이력·버전

- `app/views/projects/commits/show.html.haml` (16행)
- `app/views/projects/commit/show.html.haml` (31행)
- `app/views/projects/releases/index.html.haml` (9행)
- `app/assets/javascripts/projects/commits/components/commit_list_app.vue` (447행)
- `app/assets/javascripts/releases/components/app_index.vue` (383행)

### P-07 가져오기·실행

- `app/assets/javascripts/repository/components/code_dropdown/compact_code_dropdown.vue` (422행)
- `app/assets/javascripts/repository/components/code_dropdown/code_dropdown_clone_item.vue` (104행)
- `app/assets/javascripts/repository/components/code_dropdown/code_dropdown_download_items.vue` (34행)

[제안] 명령어 복사 메뉴에만 의존하지 않고 바로 열기/설치 필요/설치 없이 파일 사용 등을 조건에 따라 구분. 원본 clone 항목은 고급 정보로 보존.

### P-08 의견·개선 요청

- `app/views/projects/work_items/index.html.haml` (21행)
- `app/views/projects/work_items/show.html.haml` (13행)
- `app/views/projects/issues/show.html.haml` (16행)
- `app/assets/javascripts/work_items/components/app.vue` (33행)
- `app/assets/javascripts/work_items/list/list_view.vue` (644행)
- `app/assets/javascripts/work_items/components/create_work_item.vue` (1600행)
- `app/assets/javascripts/pages/projects/issues/show/index.js` (19행)

### P-09 새 프로젝트·공개 점검

- `app/views/projects/new.html.haml` (42행)
- `app/views/projects/_new_project_fields.html.haml` (121행)
- `app/assets/javascripts/pages/projects/new/index.js` (13행)
- `app/assets/javascripts/projects/new/index.js` (96행)

### P-10 내 프로젝트

- `app/views/dashboard/projects/index.html.haml` (16행)
- `app/assets/javascripts/projects/your_work/index.js` (51행)
- `app/assets/javascripts/projects/your_work/components/app.vue` (119행)

### P-11 기관 탐색

- `app/views/explore/groups/index.html.haml` (18행)
- `app/assets/javascripts/explore/groups/components/app.vue` (61행)
- `app/views/groups/show.html.haml` (18행)
- `app/assets/javascripts/groups/show/components/app.vue` (73행)

[주의] GitLab Group이 실제 행정기관과 1:1이라는 보장은 없음. 기관 정규화·소속 확인 설계가 별도로 필요.

### P-12 로그인·가입

- `app/views/devise/sessions/new.html.haml` (39행)
- `app/views/devise/sessions/_new_base.html.haml` (16행)
- `app/views/devise/registrations/new.html.haml` (35행)
- `app/views/devise/registrations/_signup_box_form.html.haml` (86행)
- `app/views/devise/passwords/new.html.haml` (17행)
- `app/views/devise/passwords/edit.html.haml` (20행)

### P-13 오류

- `app/views/errors/not_found.html.haml` (15행)
- `app/views/errors/access_denied.html.haml` (16행)
- `app/views/errors/service_unavailable.html.haml` (14행)
- `app/assets/stylesheets/errors.scss` (95행)

### P-14 도움말·공지

- `app/views/help/index.html.haml` (41행)
- `app/views/help/show.html.haml` (5행)

### P-15 개발 수요 보드(직접 대응 없음)

- `app/assets/javascripts/work_items/list/list_view.vue` (644행)

[제안] 직접 대응하는 전용 화면 없음. 위 파일은 재사용 검토 후보일 뿐이다. work item 유형/label 기반 구현과 별도 수요 데이터 모델을 비교해야 함.

**중복 제외 합계: 61개 파일 / 7,073행.** P-15 참조 중복은 한 번만 세었다.

## 5. 고정 스타일과 rem: 실제 집계

정규식으로 **출현 횟수/해당 파일 수**를 셌다. 주석·토큰 선언·CSS fallback 값도 포함하고, 색이 실제 어느 화면에 표시되는지 판정하지 않았다. 따라서 이 숫자는 위험 지점의 크기이며 변경해야 할 CSS 선언 수가 아니다. hex는 SCSS 보간 `#{...}`을 제외한다. 같은 값의 중복도 센다.

| 범위 | CSS/SCSS 파일 | 소스 행 | hex | rgb/hsl | rem | px-to-rem 호출 | `var(--gl-...)` |
|---|---:|---:|---:|---:|---:|---:|---:|
| GitLab app/assets/stylesheets | 232 | 35806 | 949 / 20 | 114 / 22 | 153 / 48 | 15 / 8 | 585 / 77 |
| UI src/scss(진입점·변수) | 18 | 1346 | 89 / 2 | 2 / 1 | 5 / 3 | 56 / 2 | 52 / 4 |
| UI src 전체(생성 토큰 포함) | 207 | 23878 | 1123 / 7 | 243 / 14 | 413 / 20 | 64 / 4 | 3601 / 59 |
| UI dist 배포 CSS 2개 | 2 | 7 | 1340 / 2 | 214 / 1 | 1713 / 2 | 0 / 0 | 3874 / 2 |

- **확인**: UI 배포 CSS에는 hex 1,340회, rgb/hsl 214회, rem 1,713회가 실제 남아 있다. `--gl-*` 덮어쓰기만으로 모든 색·치수 변경이 가능하다고 할 수 없다.
- **미확인**: GitLab application/application_dark의 최종 컴파일 CSS 내 고정색 정확한 수. GDK가 미설치이고 모든 빌드 의존성을 설치하지 않았으므로 소스 SCSS 집계를 컴파일 CSS 개수로 바꿔 말하지 않는다.
- 재현: 이 문서 옆 `inspect_gitlab_frontend.cjs`를 Node로 실행한다. 파일별 목록/행 수/통계는 `gitlab_frontend_inventory.json`. npm 패키지 경로가 scratch이므로 재현 때 동일 버전 재확보가 필요할 수 있다.

## 6. 구현 방식 비교와 유지보수

| 방식 | 가능한 범위 [확인/추정] | 원본 접점과 업데이트 | 작업량/비용 판단 [추정] |
|---|---|---|---|
| 설정에 CSS 삽입 + 토큰 덮어쓰기 | `config/gitlab.yml.example:152–159`, `app/views/layouts/_head.html.haml:137–139`의 custom_html_header_tags는 실제 지원. 외부 CSS link 삽입 가능. CSP 허용 필요 | GitLab source 수정 없이 가능. DOM과 토큰 변경에 회귀 발생 | 색 시범에 가장 작음. 정보 구조·쉬운 용어·새 기능·컴파일된 고정 스타일은 해결 불가. 제품 전체 구현안으로는 부족 |
| GitLab 포크 + 분리된 KRDS 토큰/SCSS + HAML/Vue 수정 | 기존 인증·권한·파일·이슈 동작을 유지하며 업무형 정보 구조를 구현 [제안] | 최소 검토 후보 61파일/7,073행 + 전역 빌드/레이아웃/설정 접점. 새 모듈과 어댑터는 분리 보관 가능 | 사용자 확정 주안. 초기 UI/회귀 검증 부담이 크나 기존 backend 재구현은 적음. 업스트림 변경 시 파일 단위 diff·충돌 및 기능 테스트가 필요 |
| 커스텀 테마만 | 기존 UI themes와 SCSS 변수는 존재. 임의 레이아웃 교체용 공식 플러그인 테마 API는 이번 조사에서 확인하지 못함 | theme 체계 바깥의 뷰·부품은 그대로 남음 | 색과 셸 시범용. KRDS 부품의 높이/문구/사용 여정을 전부 바꾸기에는 부족 |
| Rails view override 디렉터리 | Rails view path 삽입은 기술 후보. 이번에 확인한 config/helpers에는 프로젝트용 공식 prepend_view_path 확장점을 찾지 못함 | 별도 initializer/engine 등을 연결하는 앱 접점이 필요. HAML override만으로 Vue 내부는 바뀌지 않음 | HAML 복제본이 원본 helper/locals 변화에 뒤처질 수 있음. 단지 파일을 별도 폴더에 뒀다고 충돌 비용이 없어지지 않음 |
| 별도 Rails engine/플러그인 | 기술적 설계 후보. GitLab 공식 UI 교체 플러그인 API라고 확인한 바 없음 | loader/route/asset 연결과 권한·내비게이션 경계 필요 | 핵심 앱과 분리 장점은 있으나 별도 실행·업그레이드 검증이 추가됨. 현재는 작은 spike 이후 판단 |
| 별도 React KRDS 화면 + GitLab API | PRD 초기 기술안과 일치했던 비교안. 원본 UI는 보존 | GitLab 코드 merge 충돌 적음. API·권한·인증·신규 backend·서로 다른 화면 이동 관리 필요 | 공무원용 여정을 자유롭게 설계하기 쉽지만 GitLab UI 기능을 많이 노출할수록 재구현 비용 증가. 사용자의 같은 코드 구성 결정으로 주안에서 제외 |

### 6.1 주안 구체화 [제안, 아직 미구현]

1. 실제 공공 GitLab 버전에 맞춘 포크 브랜치를 고정한다. 현재 master 조사본은 기준 비교용이다.
2. KRDS 원본 자산은 별도 패키지/생성 입력으로 보관한다. 생성 토큰 파일을 직접 편집하지 않는다. GitLab UI도 설치된 node_modules를 손으로 고치지 않는다.
3. 기존 공통 HAML 레이아웃과 15개 화면의 마운트 지점은 그대로 연결한다. 업무 탐색·소개 카드·공개 점검용 Vue 모듈을 분리하고, 인증/권한/저장소 작업은 원본 서비스/API를 사용한다.
4. 의미 `--gl-*` 토큰 → KRDS 연결 레이어, 컴파일된 Sass 변수 → 빌드 전 override, 부품의 고정 치수 → KRDS Vue 부품 교체로 세 범위를 나눈다. 색만 바꾼 GitLab UI를 KRDS 준수 완료로 부르지 않는다.
5. 같은 앱에 개발자용 원본 기능이 남아 있으면, 전역 Tailwind spacing을 한 번에 뒤집지 않는다. 전환된 업무 화면을 격리하고 사용 중인 클래스·토큰만 단계적으로 치환한다. 최종 전체 교체 범위는 별도 인벤토리로 추적한다.
6. P-01→P-02→P-04→P-07의 한 사용자 과업을 먼저 설계/구현/테스트한다. 이어 파일·의견·공개 점검·계정·오류로 확장한다. P2 기능도 누락하지 않되 이 문서는 기능 완료를 주장하지 않는다.

### 6.2 업데이트 충돌 면적

- **실측 하한선**: 61개 화면/진입 파일. 이들이 전부 변경되는지·몇 줄 변경되는지는 아직 미확정.
- **확인된 전역 접점**: `config/tailwind.config.js`, `app/views/layouts/_head.html.haml`, `app/views/layouts/_application_color_mode_js.html.haml`, `app/helpers/preferences_helper.rb`, `app/assets/stylesheets/application.scss`, `application_dark.scss`, `_application_base.scss`, `framework/variables.scss`, `framework.scss`, `tailwind.css`, `package.json`. 실제 수정은 선택에 따라 줄일 수 있다.
- **추정**: 텍스트 merge 충돌보다 런타임 충돌(부품 props·GraphQL 필드·권한·HAML locals 변경)이 더 늦게 발견될 수 있다. 매 업그레이드마다 원본 대비 패치 목록, 마운트 ID, CSS 변수, 사용 API 스키마와 과업 회귀 테스트를 자동 검사해야 한다.
- 작업 시간이나 비용 금액은 견적 근거가 없어 제시하지 않았다. 두 구현안 모두 동일한 화면·동작 spike를 만든 뒤 변경 파일/테스트 통과/작업 기록으로 비교해야 한다.

## 7. KRDS ↔ GitLab 토큰 대응 초안

**상태: 의미 기준 초안. 검증·Figma 결정 기록 전 코드 반영 금지.** 오른쪽은 `references/tokens.md`, `references/figma_code_map.md`, `code/bridge/krds-bridge.css`, `data/_dark_mode.json`을 확인했다. 어두운 화면 값은 계산 결과일 뿐 모든 버튼·배경·상태 조합을 검증한 확정표가 아니다.

| 실제 GitLab UI 토큰 | KRDS 피그마 변수 / 연결 CSS | 적용 의도·조건 |
|---|---|---|
| `--gl-background-color-default` | `color/background/white` / `--krds-color-background-white` | 기본 바탕. 어두운 화면 #131416 |
| `--gl-background-color-subtle` | `color/surface/gray-subtler` / `--krds-color-surface-gray-subtler` | 면 1단계. 어두운 화면 #1E2124 |
| `--gl-background-color-strong` | `color/surface/gray-subtle` / `--krds-color-surface-gray-subtle` | 면 2단계. 어두운 화면 #33363D |
| `--gl-background-color-overlap` | 문맥별 면 단계 선택 필요 | 떠 있는 메뉴/모달이 어느 면 위에 올라오는지에 따라 정함. 기본 바탕 토큰에 일괄 대응 금지 |
| `--gl-text-color-default` | `color/text/basic` / `--krds-color-text-basic` | 일반 본문 |
| `--gl-text-color-subtle` | `color/text/subtle` / `--krds-color-text-subtle` | 보조 정보. 본문 용도로 쓰면 본문 대비 기준 적용 |
| `--gl-text-color-heading`, `--gl-text-color-strong` | `color/text/bolder` / `--krds-color-text-bolder` | 제목/강조. 크기·굵기는 따로 연결 |
| `--gl-text-color-link` | `color/link/default` / `--krds-color-link-default` | 링크. 방문/hover는 별도 상태 대응 |
| `--gl-text-color-danger`, `warning`, `success` | 각각 `color/text/danger`, `warning`, `success` | 오류/주의/성공. 색만으로 뜻 전달 금지 |
| `--gl-text-color-disabled` | `color/text/disabled` | 동작 불가 상태에만. 읽어야 할 도움말에 사용 금지 |
| `--gl-border-color-default`, `strong` | 기능에 따라 `color/border/gray-light`, `gray` | 장식 카드 테두리 생성용 아님. 컨트롤 경계와 구조 구분을 구별 |
| `--gl-focus-ring-outer-color` | `color/border/primary` 후보 | 실제 배경·인접색 대비와 안/밖 링 두께를 함께 검증 |
| `--gl-action-confirm-*` | KRDS 버튼의 Type/State별 대응 필요 | GitLab confirm이 KRDS primary와 같은 형태라고 단정하지 않음. outlined/text/filled 문맥 구분 |
| `--gl-spacing-scale-3`(8px) | `gap/3`, `padding/3` | 동일 픽셀이라도 gap/padding 의미를 분리 |
| `--gl-spacing-scale-5`(16px) | `gap/5`, `padding/6` | 숫자 suffix가 다름. 일괄 치환 금지 |
| `--gl-spacing-scale-6`(24px) | `gap/7`, `padding/8` | 16px root 유지 시 rem 어댑터 필요 |
| `--gl-font-family-regular` | Pretendard GOV / KRDS 텍스트 스타일 | 코드 편집기의 monospace까지 일괄 변경하지 않음 |
| `--gl-font-size-base`, `--gl-font-size-md`(기존14px) | `font-size/body/medium` / `--krds-pc-font-size-body-medium`(17px) | 값 변경 결정 필요. 본문 증가로 열 높이·탭·표 회귀 확인 |
| `--gl-line-height-heading`(기존1.25) | KRDS `--krds-line-height-base`(1.5) | 숫자 단위 없는 비율. 줄바꿈·세로 공간 검증 |
| `--gl-border-radius-md`, `default`(기존4px) | 부품별 `radius/small`(4), `medium1`(6) 등 | 전역 md를6으로 바꾸기보다 KRDS 부품 속성에 맞춤 |
| `--gl-shadow-sm`, `md`, `lg` | `--krds-shadow-1`, `2`, `3` 후보 | 깊이의 의미·부품 종류를 먼저 확인. 그림자 색만 바꾸지 않고 전체 조합을 연결 |

### 7.1 어두운 화면 검사 기록에서 발견한 주의점

`data/_dark_mode.json`의 기본 바탕은 #131416, 면1은 #1E2124, 면2는 #33363D이다. 앞선 기록의 “면2 #1E2124”는 실제 생성 값과 다르므로 정정해야 한다. 모든 대비는 **실제 전경/배경 짝**으로 재검사한다. 전체 배경 목록과 일부 전경만 비교하고 “전부 통과”로 발표하면 안 된다.

현재 생성기에서 secondary 버튼 hover와 pressed가 모두 #052561이 되는 것도 확인했다. 원래 hover의 90→80 이동과 이미80인 pressed 유지가 겹친 결과다. hover/pressed가 색만 같다는 것이 즉시 접근성 위반이라는 뜻은 아니나, 상태 피드백이 충분한지 추가 지표·행동 검증이 필요하다. tertiary hover #1E2124는 **면1**과 같다. 배경과 상태색이 같아지는 조합도 명시적으로 관리한다.

## 8. UX·기능 완료 판정 [제안]

- 주 퍼소나는 비개발 공무원이다. 첫 화면에서 clone/fork/branch/commit을 알아야 다음 단계로 갈 수 없게 한다.
- 소개 카드는 “무슨 업무에 쓰는가 → 내 환경에서 쓸 수 있는가 → 어떻게 실행하는가 → 막히면 누구에게 묻는가”를 판단하게 해야 한다.
- 보안 점검 결과를 배포 승인·안전 보증처럼 보이게 하지 않는다. 법령 기준 날짜·AI 요약 근거·검증 상태를 분리한다.
- 각 P 화면마다 PRD 기능 ID, 실제 API/서비스, 권한, 빈/오류/로딩, 모드별 대비, 키보드/스크린리더 테스트, Figma 결정 ID를 연결한다.
- 사용자 과업 성공은 실제 비개발 공무원 테스트 전에는 가설이다. “좋아 보인다”, 자동 대비 수치, 시연 데이터만으로 사용성 검증 완료를 주장하지 않는다.

## 9. 이번 갈래 산출물과 남은 작업

완료: GitLab sparse clone, 같은 버전 UI 패키지 분석, 실제 소스 경로 61개 확인, 소스/배포 CSS 집계, 구조·전환 후보·토큰 대응 초안 작성.

미실행: GDK 설치와 서버 실행, GitLab 포크 수정, 신규 기능 백엔드, KRDS 브리지 구현, 전 화면 디자인, Figma 반영, 빌드 CSS 전체 집계, 실제 사용성/접근성/회귀 테스트. 이 문서는 구현 완료 보고가 아니다.
