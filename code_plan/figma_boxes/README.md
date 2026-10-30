# Figma 요소 상자 내보내기

- 만든 날: 2026. 10. 30.
- 용도: Figma 화면과 코드 화면을 픽셀 단위로 맞출 때 쓰는 기준값이다. 그림 비교 대신 요소의 위치와 크기를 숫자로 비교한다
- 파일: `화면ID_폭_auth.json` (예: `R-01_1920_Guest.json`). 212개

## 1. 파일 내용
```
{
 "screen": "R-01",
 "title": "R-01 프로젝트 홈",
 "breakpoint": 1920,
 "auth": "Guest",
 "variant": "breakpoint=1920, auth=Guest",
 "frame": { "w": 1920, "h": 1492 },
 "boxes": {
  "masthead": { "x": 0, "y": 0, "w": 1920, "h": 32 },
  "header":   { "x": 0, "y": 32, "w": 1920, "h": 65 }
 }
}
```
- 좌표는 화면 프레임 왼쪽 위를 0, 0으로 한 상대값이다. 단위는 px, 모두 정수로 반올림했다
- 보이지 않는 요소는 넣지 않는다
- 같은 이름이 여러 번 나오면 맨 처음 것만 넣는다

## 2. 요소 이름 규칙
| 이름 | 뜻 |
|---|---|
| masthead | 맨 위 시제품 안내 띠 |
| header | 앱 머리글(서비스명, 탐색, 검색, 계정) |
| sidebar | 왼쪽 메뉴 패널 전체 |
| sidebar-nav | 사이드바 안 메뉴 목록 |
| body | 머리글과 바닥글 사이 전체 영역 |
| main | 본문 열 |
| breadcrumb | 경로 표시 줄 |
| repo-title | 저장소 제목 줄(기관, 이름, 공개 배지) |
| repo-actions | 제목 줄 오른쪽 동작 묶음 |
| toolbar | 브랜치 선택과 파일 찾기, 코드 버튼 줄 |
| commit-bar | 마지막 변경 막대 또는 커밋 머리 |
| file-table | 파일 표 |
| code-view | 코드 보기 블록 |
| readme | README 상자 |
| info-panel | 오른쪽 정보 영역 |
| decision-panel | 사용 전 확인 묶음 |
| meta-panel | 이슈와 변경 제안 오른쪽 정보 |
| detail-area | 상세 화면 본문과 오른쪽 정보를 감싼 영역 |
| diff-area | 변경 비교 영역 전체 |
| diff-tree | 변경된 파일 목록 |
| diff-file | 파일 하나의 변경 상자 |
| tabs | 탭 줄 |
| section-title | 화면 제목 줄 |
| filters | 검색 조건 영역 |
| search | 검색 입력 줄 |
| results | 결과 목록 영역 |
| login-card | 로그인 묶음 상자 |
| comment-editor | 의견 편집기 |
| steps | 따라 하기 단계 묶음 |
| checks | 점검 항목 목록 |
| footer | 바닥글 |
| tabbar | 모바일 하단 탭바 |

## 3. 대상 변형
- 폭 1920과 360만 내보낸다
- `auth`는 Guest와 Signed-in
- 권한 속성이 있는 화면은 `role=none`(로그인 전)과 `role=developer`(로그인 후)를 쓴다

## 4. 쓰는 방법
1. 코드 화면을 같은 폭과 상태로 띄운다(`?fixture=kordoc&mode=light&auth=Guest`)
2. 같은 이름의 요소에 `data-box="header"`처럼 표시를 달고 `getBoundingClientRect()`로 위치와 크기를 읽는다
3. 이 파일의 값과 비교해 x, y, w, h 차이를 낸다. 판정 기준은 ±2px
4. 차이가 큰 항목만 목록으로 남기고 고친다

## 5. 다시 만드는 방법
- Figma 화면을 고친 뒤 이 폴더를 다시 내보낸다. 화면 세트가 늘면 파일도 늘어난다

## 6. 높이 비교 규칙 (2026. 10. 30. 결정)
- `heightFromContent: true`가 붙은 상자는 **높이를 비교하지 않는다**. x, y, w만 본다
  - 대상: frame, body, main, readme, file-table, footer, info-panel, results, code-view, diff-area, diff-file, detail-area, sidebar-nav, checks, steps
  - 이유: Figma는 README와 목록을 대표 길이로 줄여 그린다. 코드는 실제 자료를 모두 그린다. 높이 차이는 자료 길이 차이이지 배치 차이가 아니다
- 높이까지 비교하는 상자: masthead, header, global-search, breadcrumb, repo-title, repo-actions, toolbar, commit-bar, about, decision-panel, tabs, section-title, filters, search, login-card, comment-editor, meta-panel, tabbar, sidebar
- `clipped: true`가 붙은 상자(sidebar)는 화면 높이에 맞춰 잘린 패널이다. 안쪽 `sidebar-nav`는 잘리기 전 전체 높이라서 sidebar보다 클 수 있다. 코드에서는 사이드바에 자체 스크롤을 두고 sidebar의 x, y, w와 높이만 맞춘다

## 7. 요소 이름 추가
| 이름 | 뜻 |
|---|---|
| global-search | 머리글 안 검색 입력칸 |
| about | 정보 영역 안 "이 도구가 하는 일" 묶음 |

## 8. 확인된 기준값 (R-01 1920 Guest)
- repo-title은 제목 줄 전체다(x 352, w 1192). 제목 글자만이 아니다. 오른쪽 버튼 묶음은 repo-actions(x 1256, w 288)로 따로 있다
- toolbar는 한 줄이다(h 48). 1024 이상에서는 줄바꿈하지 않는다
