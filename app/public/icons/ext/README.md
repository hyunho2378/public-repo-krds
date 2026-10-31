# 확장 아이콘 (KRDS에 없는 공공 깃랩 아이콘)

- 결정: D-11 6장(2026. 10. 30.), D-21. KRDS 아이콘에 같은 뜻이 없을 때 하트 등 다른 뜻 아이콘으로 대체하지 않고 공공 깃랩 모양을 KRDS 규격으로 다시 그린다
- 원본 모양: GitLab Pajamas 아이콘(gitlab-org/gitlab-svgs, sprite_icons), MIT 라이선스, Copyright (c) GitLab B.V. https://gitlab.com/gitlab-org/gitlab-svgs/-/blob/main/LICENSE
- 규격: 24 격자, 바깥 여백 2.8, 선 두께 1.6(KRDS 외곽선 아이콘과 같음), 둥근 끝과 둥근 이음, stroke="currentColor", 채움 없음(점 하나만 currentColor 채움)
- Figma 부품 이름: icon-ext/{파일 이름}

| 파일 | 뜻(공공 깃랩 화면 말) | Pajamas 원본 |
|---|---|---|
| star.svg | 별표 | star-o |
| fork.svg | 포크 | fork |
| tag.svg | 태그 | label |
| commit.svg | 커밋 | commit |
| branch.svg | 브랜치 | branch |
| merge-request.svg | 머지 리퀘스트 | merge-request |
| issues.svg | 작업 항목 | issues |
| pipeline.svg | 파이프라인 | pipeline |
| rocket.svg | 릴리스 | rocket |
| folder.svg | 폴더 | folder-o |
| file.svg | 파일 | document |
| file-text.svg | 글 파일(md, txt) | doc-text |

- KRDS에서 복사한 것(app/public/icons/krds): globe(공개), ellipsis_vertical(점 세 개), panel_open/panel_close(사이드바 접음/펼침), sys_success_mark/sys_danger_mark(파이프라인 성공/실패)

## 사이드바 묶음과 탐색 메뉴 (공공 깃랩 03, 01 캡처)
| 파일 | 쓰는 곳 | Pajamas 원본 |
|---|---|---|
| pin.svg | 고정됨 | thumbtack |
| users.svg | 관리 | users |
| code.svg | 코드 | code |
| deploy.svg | 배포 | deployments |
| cloud.svg | 운영 | cloud-pod |
| monitor.svg | 모니터 | monitor |
| project.svg | 탐색 > 프로젝트 | project |
| group.svg | 탐색 > 그룹 | group |
| catalog.svg | 탐색 > CI/CD 카탈로그 | catalog-checkmark |
| sparkle.svg | 탐색 > AI 카탈로그 | tanuki-ai의 반짝임만(GitLab 로고 상표는 쓰지 않음) |
| snippet.svg | 탐색 > 스니펫 | snippet |
- 빌드는 rocket(공공 깃랩도 같은 로켓), 계획은 KRDS calendar, 추가 기능은 KRDS view_all, 분석은 KRDS analytics, 주제는 확장 tag(같은 뜻의 KRDS 아이콘이 있으면 KRDS 우선)
| sort-asc.svg | 정렬 방향(오름차순) | sort-lowest |
| sort-desc.svg | 정렬 방향(내림차순) | sort-highest |
| history.svg | 최근 검색 | history |
| rocket-launch.svg | 프로젝트 정보 열 'n개의 릴리스'(공공 깃랩 02: 속도선 있는 로켓) | rocket-launch |
| scale.svg | 프로젝트 정보 열 라이선스(공공 깃랩 02: 저울) | scale |

## 대조 기록 (2026. 10. 30. 23시대)
- 대조 이미지: UX/gitlab_compare/icons/ (00 Pajamas 원본 대 ext 전체, 01~05 공공 깃랩 캡처 01·02·03·08 확대, 06 프로젝트 아이콘 캡처 대 우리 사이드바)
- 고친 것: project(평행사변형 → 왼쪽이 짧고 오른쪽이 긴 사다리꼴 + 오른쪽 둥근 탭, Pajamas project 좌표를 1.25배로 옮김), cloud(상자에 세 면 선 추가, Pajamas cloud-pod), 새로 rocket-launch(릴리스 개수), scale(라이선스). 빌드 묶음은 rocket(속도선 없음) 그대로
- 그대로 맞는 것: group, catalog, snippet, pin, users, code, deploy, monitor, star, fork, tag, commit, branch, merge-request, issues, pipeline, rocket, folder, file, file-text, history, sort-asc, sort-desc
- 일부러 다른 것: sparkle(AI 카탈로그)은 Pajamas tanuki-ai의 GitLab 로고(상표)를 빼고 반짝임만
- folder와 project 구분: 공공 깃랩은 folder(folder-o)를 파일 표와 파일 트리의 폴더에만 쓰고(캡처 02 파일 표, 08 파일 트리), 탐색 사이드바 '프로젝트'와 목록 행 맨 왼쪽은 project 아이콘을 쓴다(캡처 01). 우리도 같게 둔다
- KRDS를 쓰는 사이드바 묶음 아이콘(같은 뜻의 KRDS 아이콘이 있어 KRDS 우선, D-11): 추가 기능 view_all(공공 깃랩 grid), 계획 calendar(공공 깃랩 planning, 달력 + 체크), 분석 analytics(공공 깃랩 chart, 틀 없는 막대), 도움말 help(공공 깃랩 question-o), 사이드바 접음 panel_open(공공 깃랩 sidebar 접음 화살표). 모양이 똑같지 않다
| sliders.svg | 보드 표시 옵션(슬라이더) | adjust |
| expand.svg | 보드 확대(전체 화면) | expand |
