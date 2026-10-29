# 공공 저장소 리빌딩 개발 안내

## 구조
- 화면은 React 18 + Vite + JavaScript JSX로 만든다. GitLab UI 코드 사용은 0이다.
- 저장소 엔진은 공공 GitLab REST v4를 사용한다. GitLab 원본을 수정하지 않는다.
- 우리 기능은 server의 Node + Express API로 분리한다.
- API 계약은 api/openapi.yaml이다. JSON 문법은 YAML 1.2의 부분집합이므로 YAML 도구로 읽는다.

## 실행
1. app에서 npm ci를 실행한다.
2. KRDS_KIT_PATH를 KRDS 키트 절대 경로로 지정하고 npm run sync:krds를 실행한다. 기본값은 Aside 계정의 krds-ui-kit 경로다. 팀에는 동일 버전 키트(code/resources, code/bridge, data/_dark_mode.json)를 별도로 전달한다.
3. server에서 npm ci 후 npm run dev를 실행한다. 기본 포트는 5732다.
4. app에서 npm run dev를 실행한다. 기본 포트는 5731이다.
5. http://127.0.0.1:5731 에서 본다. 개발 서버는 같은 출처 /api와 /auth를 서버로 연결한다.
6. 운영 환경도 같은 출처 프록시가 필요하다. Vercel API 라우팅은 배포 대상 결정 후 추가한다. 지금 vercel.json은 SPA 새로고침만 처리한다.

## 폴더
- app/src/components: Figma 묶음 Identity, Feedback부터 분리한다.
- app/src/routes.js: P-01~P-15 화면 계약이다.
- app/src/api: GitLab 읽기와 우리 API 클라이언트, 데이터 상태 훅이다.
- app/src/krds: D-01 생성 CSS와 출처 JSON이다. 생성 파일은 직접 고치지 않는다.
- app/public/krds: 공식 키트 사본이다. sync:krds로 재생성한다.
- server/src/endpoints.js: 초기 계약의 23개 기능·26개 경로 메타데이터이며 현재 실행 핸들러는 products.js다.
- server/src/app.js: 공개 읽기 프록시와 제품 라우트를 연결한다. products.js, analysis.js, catalog.js, auth.js, store.js로 기능을 나눈다.
- UX: 공무원 퍼소나와 과업 흐름이다.

## Figma 대응
- Figma 이름과 컴포넌트 이름을 맞춘다. Type, Size, State, Label 속성을 같은 이름의 props로 연결한다.
- 현재 Header, Footer, NoticeBanner는 공식 HTML 구조를 사용한 공통 틀이다. Figma 최종 화면과 비교 검증은 아직 하지 않았다.
- 화면 내용은 설계 전 placeholder다. Figma 기준 화면이 오면 내용을 채운다.
- public/krds의 공식 CSS를 직접 수정하지 않는다. 변경은 연결 계층과 결정 기록으로 남긴다.
- KRDS 그대로와 서비스 확장을 구분한다. D-01 dark는 공식 high-contrast와 별개다.

## 금지
- TypeScript, localStorage와 sessionStorage, 화면 코드 직접 색과 px/rem, Tailwind 임의값, 이모지를 금지한다.
- KRDS 팔레트 밖 색, 장식 테두리, 같은 카드 반복, 근거 없는 통계를 금지한다.
- 서버 토큰을 VITE_ 환경변수나 브라우저에 넣지 않는다.
- 모든 모의 응답은 mock:true와 미실행 안내를 유지한다. mock 응답을 실제 분석·보안 점검·활동으로 표시하지 않는다.

## 검사
- app: npm run sync:krds, npm run audit:code, npm run build
- server: npm test
- 브라우저 반응형, 키보드, 실제 대비와 Figma 픽셀 비교는 후속 화면 통합 때 수행한다.

## 연동 주의
- 공개 프록시는 공개 GET만 허용한다. GitLab 토큰을 전송하지 않는다. 최대 20건/페이지, 30회/분, 동시 2개, 60초 캐시다.
- GITLAB_TOKEN은 인증 어댑터용 예약 환경변수다. 현재 공개 프록시에 사용하지 않는다.
- OAuth/세션/CSRF와 관리자 전용 보안 상세 권한 검사를 구현했다. OAuth 앱 미등록 상태에서는 503이다. 실제 계정 end-to-end 인증은 미검증이다. AI 외부 추론은 미연결이다.
- F-06 /mcp는 JSON-RPC 초기화와 검색 도구 호출을 처리한다. 전체 MCP 전송 호환성은 미검증이다.
- 백엔드 개발자는 외부 연동 어댑터, 운영 세션 저장소, 기관 인증, 중복 저장 정책과 감사 기록을 보강한다. 공감은 사용자당 한 번으로 DB에서 제한한다.
- GitLab 업데이트가 우리 화면을 직접 덮어쓰지는 않는다. API 변경의 영향은 여전히 있으므로 API 버전과 계약 테스트를 유지한다.

## 출처
- 행정안전부 KRDS 공식 키트와 본 프로젝트 D-01을 사용한다. 공식 HTML/CSS 저작권 고지를 유지한다.

## 서버 실제 구현 상태(2026. 10. 30.)

| 기능 | 상태 | 한계 |
|---|---|---|
| F-01, F-03, F-04 | 실제 BM25+2글자 n-gram·업무용 편집 동의어 검색/필터/유사 후보 | 임베딩 미연결, 스냅샷 자료 |
| F-02 | 실제 규칙 분류·근거 단어 | 통합 체계는 검토 초안. 실측 topics 136개이며 기존 39종과 동일 집합 아님 |
| F-05 | 실제 유사 프로젝트 연결 후보 | 만든 사람 알림 미전송 |
| F-06 | JSON-RPC 검색 도구 실제 실행 | 완전한 MCP HTTP/SSE 호환 미검증 |
| F-11, F-23 | 실제 README 자동 추출/초안 | AI 추론·GitLab 제안 발송 미연결 |
| F-12 | 실제 예규·고시·시행일 후보 추출 | 현행 법령 확인 아님 |
| F-13 | 미연결 | 법제처 키·변경 추적 필요 |
| F-14 | 실제 파일 구성 근거 판정 | 망 허용·실제 실행 확정 안 함 |
| F-21, F-22 | 실제 파일명/README 패턴 점검 | 파일 목록 최대100개, 전체 본문 보안검사 아님. 공개 승인 항상 false. 상세는 실제 관리자만 |
| F-24 | 실제 양식 제공 | 정부 승인 표준 아님 |
| F-31 | 실제 인증 후 로컬 SQLite 저장 | GitLab 이슈·제작자 알림 미전송 |
| F-32, F-35 | 실제 SQLite 기록/요청/중복 방지 공감 | 기관·사용일은 사용자 자기신고 |
| F-33 | 실제 스냅샷 기관 집계 | 기관 인증·공식 통계 아님 |
| F-34 | 미연결 | 데이터 연결 근거 미확보 |
| F-36 | 실제 커밋 원문 조회 | 오류 자동 진단·쉬운 말 변환 미연결 |
| F-37 | 실제 원문 조립 인수인계 초안 | 제작자 검토 필수 |
| F-38 | 실제 단계별 제안 점검표 | 공식 승인 절차 대체 안 함 |
| F-39 | 실제 분류별 건수 | 미개발·수요 확정 아님 |

### 서버 데이터와 인증
- 공개 목록은 공식 API를 1초 이상 간격으로 8회 조회해 719개를 저장했다. README 일괄 수집 없음. 정확한 관찰일은 server/data/gitlab-public-snapshot.json observedAt이다.
- CSV 695행과 새 공개 목록을 합친 검색색인은 726개다. 새 목록에 없는 7개는 snapshotStatus=older-team-observation으로 표시한다.
- 설명과 주제는 공식 공개 목록 실제 문자열만 색인한다. CSV 0/1 지표를 본문으로 쓰지 않는다.
- server/data/topic-mapping.json은 실제 주제 136개와 규칙 분류·근거 단어·검토필요 대응표다.
- Node 22.13 이상 내장 SQLite를 사용한다. DB_PATH로 저장 위치를 바꾼다. SQLite 파일은 커밋하지 않는다.
- GITLAB_CLIENT_ID, GITLAB_CLIENT_SECRET, GITLAB_REDIRECT_URI로 OAuth 앱을 연결한다. httpOnly SameSite 쿠키와 서버 메모리 토큰을 사용한다. 서버 재시작 시 로그인 세션이 만료된다. 운영 분산 세션/키 관리 별도 필요.
- NODE_ENV=development와 DEV_AUTH=true일 때만 개발 로그인 가능. is_dev 기록은 실제 기록과 분리하며 실제 보안 상세를 조회할 수 없다.
- 로그인 후 /auth/session의 csrf를 X-CSRF-Token 헤더에 보내야 쓰기가 된다.
- 외부 AI/임베딩/법령 어댑터는 상태 조회 /api/v1/integrations에서 미연결을 표시한다. 키를 넣어도 자동 외부 전송하지 않는다.

## 배포 (GitHub Pages, 정적 모드)
- 주소: https://hyunho2378.github.io/public-repo-krds/
- 방법: `main`에 push하면 `.github/workflows/pages.yml`이 `app`을 정적 모드로 빌드해 Pages에 올린다. 따로 할 일은 없다
- 로컬에서 같은 빌드: `cd app && npm run build:pages` (결과 `app/dist`)
- Vercel은 연결하지 않는다(2026. 11. 9. 이후 결정)

### 정적 모드
- 켜는 법: 빌드 환경변수 `VITE_STATIC=1`, `VITE_BASE=/public-repo-krds/`
- `app/src/api/static.js`가 서버 대신 같은 응답을 만든다
  - 공공 깃랩 자료: 브라우저에서 `https://gitlab.aigov.go.kr/api/v4`를 직접 호출한다(공개 API, CORS 허용). 서버와 같은 허용 경로만 부른다
  - 검색, 분류, 실행 환경 판정, 공개 준비 점검, 소개 카드: 서버와 같은 코드(`server/src/catalog-core.js`, `analysis.js`, `repository.js`)를 브라우저에서 실행한다. 색인 원본(`server/data/projects.csv`, `gitlab-public-snapshot.json`)은 빌드 때 `dist/data/`로 복사된다
  - 로그인과 저장(의견, 써 봤어요, 요청, 공감, 보안 상세)은 하지 않는다. 오류 메시지로 "시험판에서는 로그인과 저장을 할 수 없습니다"를 돌려준다. 가짜 저장은 하지 않는다
- 새로고침: Pages는 서버 경로 설정이 없어서 빌드 때 `index.html`을 `404.html`로 복사한다. 주소 모양을 서버판과 같게 유지하려고 HashRouter 대신 이 방식을 골랐다. 이 경우 Pages는 하위 주소에 HTTP 404 상태를 함께 보낸다
- 서버판(로그인, 저장 포함)은 `server`를 별도 호스팅에 올려야 한다(미정)
