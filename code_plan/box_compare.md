# Figma 요소 상자 1px 대조 결과

- 측정일: 2026. 10. 30.
- 대상: figma_boxes 224개(화면 56 × 폭 1920, 360 × 로그인 전, 후). Figma가 두 번째로 내보낸 자료 기준
- 코드 쪽: 개발 서버에서 `?fixture=kordoc&auth=…&role=developer&mode=light`로 연 화면의 `data-figma` 요소 상자(스크롤바는 숨기고 쟀다)
- 합격 기준: x, y, w, h가 모두 1px 이내. 사이드바(sidebar) 높이는 고정 패널이라 제외. 경로(breadcrumb) 폭만 글자 폭 차이 8px까지 허용

## 1. 요약
| 폭 | 변형 | 요소 상자 | 맞음 | 비율 | 완전 통과 변형 |
|---|---:|---:|---:|---:|---:|
| 1920 | 112 | 1109 | 514 | 46.3% | 0 |
| 360 | 112 | 1053 | 0 | 0.0% | 0 |

첫 대조(1920 37.9%, 360 0.0%)보다 올랐지만 합격 기준에는 닿지 못했다.

## 2. 원인별 집계
### 1920 폭: 어긋난 요소 수(변형 112개 중)
| 요소 | 건수 |
|---|---:|
| footer | 112 |
| body | 112 |
| main | 100 |
| sidebar-nav | 100 |
| section-title | 71 |
| breadcrumb | 26 |
| tabs (코드에 없음) | 13 |
| section-title (코드에 없음) | 8 |
| login-card | 8 |
| toolbar | 6 |
| commit-bar | 4 |
| file-table | 4 |
| info-panel | 2 |
| readme | 2 |

### 360 폭: 어긋난 요소 수(변형 112개 중)
| 요소 | 건수 |
|---|---:|
| masthead | 112 |
| header | 112 |
| footer | 112 |
| body | 112 |
| tabbar | 112 |
| global-search | 112 |
| main | 100 |
| section-title | 71 |
| breadcrumb | 68 |
| repo-title | 68 |
| tabs (코드에 없음) | 13 |
| section-title (코드에 없음) | 8 |
| login-card | 8 |
| toolbar | 6 |

## 3. Figma 쪽 원인
| 번호 | 내용 | 근거 |
|---|---|---|
| F-1 | 바닥글 높이 | Figma 1920 492, 360 746. 코드 281, 312. 코드가 숨긴 영역은 관련 사이트, 기관 로고, 예시 연락처, 예시 SNS 아이콘. Figma가 같은 영역을 숨기면 맞는다 |
| F-2 | 360 공식 배너 | Figma 32. 코드는 문구가 두 줄로 접혀 46. Figma가 한 줄로 그린 방법을 알려 줘야 한다 |
| F-3 | 사이드바 메뉴 높이 | 로그인 전 Figma 1340, 코드 1197. 로그인 후 1483 대 1322. 항목 높이와 묶음 간격 값이 필요하다 |
| F-4 | 파일 표 항목 수 | Figma 29개. 공공 깃랩 실제 루트는 35개, src는 44개. 코드 고정 자료는 실제 목록으로 바꿨다 |
| F-5 | 360 하단 탭바 | Figma 높이 93, 화면 맨 아래에 놓음. 코드는 높이 65로 화면 아래에 고정. 둘 중 어느 쪽이 맞는지 결정 필요 |
| F-6 | 360 저장소 머리 | Figma `repo-title` 높이 72(제목 한 덩어리, 버튼 상자 없음). 코드 126(제목과 설명, 버튼 묶음 따로 한 줄) |
| F-7 | 이름 없는 요소 | `tabs`, `detail-area`는 어느 요소의 상자인지 정의 필요 |

## 4. 코드 쪽 한 일과 남은 일
- 한 일: 360 좌우 여백 12, 탭바와 섹션 제목과 모바일 검색 버튼 이름표, 모바일 경로 전체 표시, 고정 자료의 맨 위 폴더와 src를 실제 응답으로 교체, 머리 검색칸 640(확정값)
- 남은 일: 360 배너 한 줄 처리, 360 저장소 머리 배치, 사이드바 항목 높이, 360 커밋 막대와 파일 표 폭(코드 328, Figma 336)

## 5. 360 폭 추정과 구조 차이
- 배너가 두 줄(46)이라 그 아래 모든 요소의 y가 14px씩 밀린다. 배너를 32로 맞춘다고 가정하고 y를 보정해 다시 대조한 **추정치는 360에서 224/1053(21.3%)** 이다(실제로 고친 값이 아니라 계산)
- 보정해도 남는 구조 차이(R-01 360 로그인 전 기준, 코드/Figma)
  - 머리글 아래 간격: 코드는 본문이 머리글 바로 아래 12px, Figma는 24px(`main` y 110 대 121)
  - 정보 영역 위치: 코드는 "이 도구가 하는 일"(`about`)이 제목 아래(y 392)에 있고 Figma는 맨 끝(y 12645)에 있다. 360에서 읽는 순서를 어느 쪽으로 할지 결정이 필요하다
  - 검색 아이콘 위치: 코드는 서비스명 옆 왼쪽(x 62), Figma는 오른쪽(x 244)
  - 저장소 머리: 코드 `repo-title` 126(`repo-actions` 별도 한 줄 40), Figma 72(버튼 상자 없음)
  - 커밋 막대: 코드 146, Figma 71. 파일 표 폭: 코드 328, Figma 336
  - 하단 탭바: 코드는 화면 아래에 고정(높이 65), Figma는 화면 맨 끝에 놓음(높이 93)

## 6. 변형별 결과(224개)
| 변형 | 맞음/전체 | 어긋난 요소(앞 5개, 코드/Figma) |
|---|---:|---|
| R-01_360_Guest | 0/16 | masthead(h 46/32) header(y 46/32) footer(y 11439/13265, h 312/746) body(y 112/97, h 11327/13168) tabbar(y 1015/14011, h 65/93) |
| R-01_1920_Signed-in | 6/17 | footer(y 6059/6456, h 281/492) body(h 5961/6359) main(h 5913/6311) info-panel(h 938/668) sidebar-nav(h 1322/1483) |
| R-01_1920_Guest | 6/17 | footer(y 6059/6456, h 281/492) body(h 5961/6359) main(h 5913/6311) info-panel(h 938/668) sidebar-nav(h 1197/1340) |
| R-02_1920_Guest | 6/13 | footer(y 2846/1530, h 281/492) body(h 2748/1433) main(h 2700/1343) sidebar-nav(h 1197/1340) toolbar(x 640/352, y 318/224, w 1256/1544) |
| R-02_1920_Signed-in | 6/13 | footer(y 2846/1540, h 281/492) body(h 2748/1443) main(h 2700/1343) sidebar-nav(h 1322/1483) toolbar(x 640/352, y 318/224, w 1256/1544) |
| R-01_360_Signed-in | 0/16 | masthead(h 46/32) header(y 46/32) footer(y 11495/13265, h 312/746) body(y 112/97, h 11383/13168) tabbar(y 1015/14011, h 65/93) |
| R-02_360_Signed-in | 0/12 | masthead(h 46/32) header(y 46/32) footer(y 4175/2626, h 312/746) body(y 112/97, h 4063/2529) tabbar(y 1015/3372, h 65/93) |
| R-03_1920_Guest | 5/12 | footer(y 1382/2502, h 281/492) body(h 1284/2405) main(h 1236/2357) sidebar-nav(h 1197/1340) breadcrumb(w 256/314) 없음:code-view |
| R-02_360_Guest | 0/12 | masthead(h 46/32) header(y 46/32) footer(y 4119/2626, h 312/746) body(y 112/97, h 4007/2529) tabbar(y 1015/3372, h 65/93) |
| R-03_360_Guest | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 768/4486, h 312/746) body(y 112/97, h 656/4389) tabbar(y 1015/5232, h 65/93) 없음:code-view |
| R-03_1920_Signed-in | 5/12 | footer(y 1382/2502, h 281/492) body(h 1284/2405) main(h 1236/2357) sidebar-nav(h 1322/1483) breadcrumb(w 256/314) 없음:code-view |
| R-03_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 824/4486, h 312/746) body(y 112/97, h 712/4389) tabbar(y 1015/5232, h 65/93) 없음:code-view |
| R-04_1920_Guest | 6/11 | footer(y 8706/2182, h 281/492) body(h 8608/2085) main(h 8560/2037) sidebar-nav(h 1197/1340) 없음:toolbar |
| R-04_1920_Signed-in | 6/11 | footer(y 8706/2182, h 281/492) body(h 8608/2085) main(h 8560/2037) sidebar-nav(h 1322/1483) 없음:toolbar |
| R-04_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 13647/2254, h 312/746) body(y 112/97, h 13535/2157) tabbar(y 1015/3000, h 65/93) 없음:toolbar |
| R-05_1920_Guest | 5/13 | footer(y 1081/1660, h 281/492) body(h 983/1563) main(h 378/1515) sidebar-nav(h 1197/1340) breadcrumb(w 286/330) 없음:diff-area,tabs,diff-file |
| R-04_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 13647/2254, h 312/746) body(y 112/97, h 13535/2157) tabbar(y 1015/3000, h 65/93) 없음:toolbar |
| R-05_1920_Signed-in | 5/13 | footer(y 1081/1660, h 281/492) body(h 983/1563) main(h 378/1515) sidebar-nav(h 1322/1483) breadcrumb(w 286/330) 없음:diff-area,tabs,diff-file |
| R-05_360_Guest | 0/12 | masthead(h 46/32) header(y 46/32) footer(y 704/1559, h 312/746) body(y 112/97, h 592/1462) tabbar(y 1015/2305, h 65/93) 없음:diff-area,tabs,diff-file |
| R-05_360_Signed-in | 0/12 | masthead(h 46/32) header(y 46/32) footer(y 704/1559, h 312/746) body(y 112/97, h 592/1462) tabbar(y 1015/2305, h 65/93) 없음:diff-area,tabs,diff-file |
| R-06_1920_Guest | 5/11 | footer(y 1081/754, h 281/492) body(h 983/657) main(h 903/538) sidebar-nav(h 1197/1340) breadcrumb(w 256/295) |
| R-06_1920_Signed-in | 5/11 | footer(y 1081/754, h 281/492) body(h 983/657) main(h 903/538) sidebar-nav(h 1322/1483) breadcrumb(w 256/295) |
| R-06_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 3235/1024, h 312/746) body(y 112/97, h 3123/927) tabbar(y 1015/1770, h 65/93) |
| R-06_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 3235/1024, h 312/746) body(y 112/97, h 3123/927) tabbar(y 1015/1770, h 65/93) |
| R-07_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 10840/476, h 312/746) body(y 112/97, h 10728/379) tabbar(y 1015/1222, h 65/93) |
| R-07_1920_Signed-in | 5/11 | footer(y 8671/625, h 281/492) body(h 8573/528) main(h 8525/237) sidebar-nav(h 1322/1483) breadcrumb(w 312/264) |
| R-07_1920_Guest | 5/11 | footer(y 8671/625, h 281/492) body(h 8573/528) main(h 8525/226) sidebar-nav(h 1197/1340) breadcrumb(w 312/264) |
| R-07_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 10840/476, h 312/746) body(y 112/97, h 10728/379) tabbar(y 1015/1222, h 65/93) |
| R-08_1920_Guest | 5/11 | footer(y 8671/1739, h 281/492) body(h 8573/1642) main(h 8525/1594) sidebar-nav(h 1197/1340) breadcrumb(w 312/251) |
| R-08_1920_Signed-in | 5/11 | footer(y 8671/1750, h 281/492) body(h 8573/1653) main(h 8525/1605) sidebar-nav(h 1322/1483) breadcrumb(w 312/251) |
| R-08_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 10840/3231, h 312/746) body(y 112/97, h 10728/3134) tabbar(y 1015/3977, h 65/93) |
| R-09_1920_Guest | 6/11 | footer(y 19007/3277, h 281/492) body(h 18909/3180) main(h 18861/3132) sidebar-nav(h 1197/1340) 없음:section-title |
| R-08_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 10840/3231, h 312/746) body(y 112/97, h 10728/3134) tabbar(y 1015/3977, h 65/93) |
| R-09_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 35455/3309, h 312/746) body(y 112/97, h 35343/3212) tabbar(y 1015/4055, h 65/93) 없음:section-title |
| R-09_1920_Signed-in | 6/11 | footer(y 19007/3288, h 281/492) body(h 18909/3191) main(h 18861/3143) sidebar-nav(h 1322/1483) 없음:section-title |
| R-09_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 35455/3309, h 312/746) body(y 112/97, h 35343/3212) tabbar(y 1015/4055, h 65/93) 없음:section-title |
| R-10_1920_Guest | 6/11 | footer(y 1858/1510, h 281/492) body(h 1760/1413) main(h 1712/1294) sidebar-nav(h 1197/1340) section-title(y 382/224, h 36/29) |
| R-10_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1999/3391, h 312/746) body(y 112/97, h 1887/3294) tabbar(y 1015/4137, h 65/93) |
| R-10_1920_Signed-in | 6/11 | footer(y 1858/1510, h 281/492) body(h 1760/1413) main(h 1712/1294) sidebar-nav(h 1322/1483) section-title(y 382/224, h 36/29) |
| R-11_1920_Guest | 5/12 | footer(y 2437/1799, h 281/492) body(h 2339/1702) main(h 2291/1654) sidebar-nav(h 1197/1340) breadcrumb(w 330/251) 없음:tabs |
| R-11_1920_Signed-in | 5/12 | footer(y 2437/1810, h 281/492) body(h 2339/1713) main(h 2291/1665) sidebar-nav(h 1322/1483) breadcrumb(w 330/251) 없음:tabs |
| R-10_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1999/3391, h 312/746) body(y 112/97, h 1887/3294) tabbar(y 1015/4137, h 65/93) |
| R-11_360_Guest | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 3348/3291, h 312/746) body(y 112/97, h 3236/3194) tabbar(y 1015/4037, h 65/93) 없음:tabs |
| R-12_1920_Guest | 5/10 | footer(y 1191/934, h 281/492) body(h 1093/837) main(h 1045/789) sidebar-nav(h 1197/1340) breadcrumb(w 330/291) |
| R-11_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 3348/3291, h 312/746) body(y 112/97, h 3236/3194) tabbar(y 1015/4037, h 65/93) 없음:tabs |
| R-12_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 2348/1385, h 312/746) body(y 112/97, h 2236/1288) tabbar(y 1015/2131, h 65/93) |
| R-12_1920_Signed-in | 5/11 | footer(y 1191/1104, h 281/492) body(h 1093/1007) main(h 1045/847) sidebar-nav(h 1322/1483) breadcrumb(w 330/291) 없음:comment-editor |
| R-12_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 2348/1443, h 312/746) body(y 112/97, h 2236/1346) tabbar(y 1015/2189, h 65/93) 없음:comment-editor |
| R-13_1920_Guest | 6/11 | footer(y 1081/714, h 281/492) body(h 983/617) main(h 464/498) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-13_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/861, h 312/746) body(y 112/97, h 636/764) tabbar(y 1015/1607, h 65/93) |
| R-13_1920_Signed-in | 6/11 | footer(y 1081/714, h 281/492) body(h 983/617) main(h 464/498) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/29) |
| R-14_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/342) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-14_1920_Signed-in | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/409) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/40) |
| R-13_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/861, h 312/746) body(y 112/97, h 636/764) tabbar(y 1015/1607, h 65/93) |
| R-14_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/739, h 312/746) body(y 112/97, h 636/642) tabbar(y 1015/1485, h 65/93) |
| R-14_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/739, h 312/746) body(y 112/97, h 636/642) tabbar(y 1015/1485, h 65/93) |
| R-15_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/327) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-15_1920_Signed-in | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/364) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/40) |
| R-15_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/504, h 312/746) body(y 112/97, h 636/407) tabbar(y 1015/1250, h 65/93) |
| R-15_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/530, h 312/746) body(y 112/97, h 636/433) tabbar(y 1015/1276, h 65/93) |
| R-16_1920_Signed-in | 6/11 | footer(y 3024/1948, h 281/492) body(h 2926/1851) main(h 2878/1803) sidebar-nav(h 1322/1483) 없음:section-title |
| R-16_1920_Guest | 6/11 | footer(y 3024/1937, h 281/492) body(h 2926/1840) main(h 2878/1792) sidebar-nav(h 1197/1340) 없음:section-title |
| R-16_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 4410/3291, h 312/746) body(y 112/97, h 4298/3194) tabbar(y 1015/4037, h 65/93) 없음:section-title |
| R-17_1920_Guest | 5/11 | footer(y 1081/904, h 281/492) body(h 983/807) main(h 766/759) sidebar-nav(h 1197/1340) breadcrumb(w 286/317) 없음:tabs |
| R-17_1920_Signed-in | 5/11 | footer(y 1081/1026, h 281/492) body(h 983/929) main(h 830/877) sidebar-nav(h 1322/1483) breadcrumb(w 286/317) 없음:tabs |
| R-16_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 4410/3291, h 312/746) body(y 112/97, h 4298/3194) tabbar(y 1015/4037, h 65/93) 없음:section-title |
| R-18_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/363) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-17_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1397/1138, h 312/746) body(y 112/97, h 1285/1041) tabbar(y 1015/1884, h 65/93) 없음:tabs |
| R-17_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1461/1256, h 312/746) body(y 112/97, h 1349/1159) tabbar(y 1015/2002, h 65/93) 없음:tabs |
| R-18_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 774/586, h 312/746) body(y 112/97, h 662/489) tabbar(y 1015/1332, h 65/93) |
| R-18_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 774/646, h 312/746) body(y 112/97, h 662/549) tabbar(y 1015/1392, h 65/93) |
| R-18_1920_Signed-in | 6/11 | footer(y 1081/639, h 281/492) body(h 983/542) main(h 464/434) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/40) |
| R-20_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/363) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-20_1920_Signed-in | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/363) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/29) |
| R-20_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/563, h 312/746) body(y 112/97, h 636/466) tabbar(y 1015/1309, h 65/93) |
| R-21_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/327) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-20_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/563, h 312/746) body(y 112/97, h 636/466) tabbar(y 1015/1309, h 65/93) |
| R-21_1920_Signed-in | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/364) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/40) |
| R-21_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/504, h 312/746) body(y 112/97, h 636/407) tabbar(y 1015/1250, h 65/93) |
| R-22_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/293) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-21_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/530, h 312/746) body(y 112/97, h 636/433) tabbar(y 1015/1276, h 65/93) |
| R-22_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/470, h 312/746) body(y 112/97, h 636/373) tabbar(y 1015/1216, h 65/93) |
| R-22_1920_Signed-in | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/364) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/40) |
| R-22_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/530, h 312/746) body(y 112/97, h 636/433) tabbar(y 1015/1276, h 65/93) |
| R-23_1920_Signed-in | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/381) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/40) |
| R-23_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/790, h 312/746) body(y 112/97, h 636/693) tabbar(y 1015/1536, h 65/93) |
| R-23_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 464/370) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-24_1920_Guest | 6/11 | footer(y 1081/1739, h 281/492) body(h 983/1642) main(h 464/1594) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-24_1920_Signed-in | 6/11 | footer(y 1081/1739, h 281/492) body(h 983/1642) main(h 464/1594) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/29) |
| R-23_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/790, h 312/746) body(y 112/97, h 636/693) tabbar(y 1015/1536, h 65/93) |
| R-24_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 774/3311, h 312/746) body(y 112/97, h 662/3214) tabbar(y 1015/4057, h 65/93) |
| R-25_1920_Guest | 5/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 308/329) sidebar-nav(h 1197/1340) breadcrumb(w 312/295) |
| R-24_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 774/3311, h 312/746) body(y 112/97, h 662/3214) tabbar(y 1015/4057, h 65/93) |
| R-25_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 704/805, h 312/746) body(y 112/97, h 592/708) tabbar(y 1015/1551, h 65/93) |
| R-25_1920_Signed-in | 5/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 308/329) sidebar-nav(h 1322/1483) breadcrumb(w 312/295) |
| R-25_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 704/805, h 312/746) body(y 112/97, h 592/708) tabbar(y 1015/1551, h 65/93) |
| R-26_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 1003/510, h 312/746) body(y 112/97, h 891/413) tabbar(y 1015/1256, h 65/93) |
| R-26_1920_Guest | 5/10 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 661/333) sidebar-nav(h 1197/1340) breadcrumb(w 312/251) |
| R-26_1920_Signed-in | 5/11 | footer(y 1081/862, h 281/492) body(h 983/765) main(h 661/646) sidebar-nav(h 1322/1483) breadcrumb(w 312/251) |
| R-27_1920_Signed-in | 5/12 | footer(y 1081/1102, h 281/492) body(h 983/1005) main(h 910/886) sidebar-nav(h 1322/1483) breadcrumb(w 317/269) 없음:tabs |
| R-27_1920_Guest | 5/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 910/356) sidebar-nav(h 1197/1340) breadcrumb(w 317/269) |
| R-26_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1003/823, h 312/746) body(y 112/97, h 891/726) tabbar(y 1015/1569, h 65/93) |
| R-27_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 1217/1063, h 312/746) body(y 112/97, h 1105/966) tabbar(y 1015/1809, h 65/93) 없음:tabs |
| R-27_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1217/533, h 312/746) body(y 112/97, h 1105/436) tabbar(y 1015/1279, h 65/93) |
| R-28_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 528/356) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-28_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 838/533, h 312/746) body(y 112/97, h 726/436) tabbar(y 1015/1279, h 65/93) |
| R-28_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 838/983, h 312/746) body(y 112/97, h 726/886) tabbar(y 1015/1729, h 65/93) |
| R-28_1920_Signed-in | 6/11 | footer(y 1081/999, h 281/492) body(h 983/902) main(h 528/783) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/29) |
| R-29_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 821/533, h 312/746) body(y 112/97, h 709/436) tabbar(y 1015/1279, h 65/93) |
| R-29_1920_Guest | 5/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 511/356) sidebar-nav(h 1197/1340) breadcrumb(w 347/282) |
| R-29_1920_Signed-in | 5/11 | footer(y 1081/706, h 281/492) body(h 983/609) main(h 511/490) sidebar-nav(h 1322/1483) breadcrumb(w 347/282) |
| R-30_1920_Guest | 6/12 | footer(y 2120/1067, h 281/492) body(h 2022/970) main(h 1974/851) sidebar-nav(h 1197/1340) section-title(y 549/224, h 36/29) 없음:steps |
| R-30_1920_Signed-in | 6/12 | footer(y 2120/1067, h 281/492) body(h 2022/970) main(h 1974/851) sidebar-nav(h 1322/1483) section-title(y 549/224, h 36/29) 없음:steps |
| R-29_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 821/690, h 312/746) body(y 112/97, h 709/593) tabbar(y 1015/1436, h 65/93) |
| G-02_1920_Guest | 3/9 | footer(y 1213/857, h 281/492) body(h 1115/760) main(h 1067/712) sidebar-nav(h 492/504) 없음:filters,results |
| R-30_360_Guest | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 2467/1097, h 312/746) body(y 112/97, h 2355/1000) tabbar(y 1015/1843, h 65/93) 없음:steps |
| R-30_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 2467/1097, h 312/746) body(y 112/97, h 2355/1000) tabbar(y 1015/1843, h 65/93) 없음:steps |
| G-02_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 1297/662, h 312/746) body(y 112/97, h 1185/565) tabbar(y 1015/1408, h 65/93) 없음:filters,results |
| G-02_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 1297/662, h 312/746) body(y 112/97, h 1185/565) tabbar(y 1015/1408, h 65/93) 없음:filters,results |
| G-02_1920_Signed-in | 3/9 | footer(y 1213/857, h 281/492) body(h 1115/760) main(h 1067/712) sidebar-nav(h 492/669) 없음:filters,results |
| G-03_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1150/458, h 312/746) body(y 112/97, h 1038/361) tabbar(y 1015/1204, h 65/93) |
| G-03_1920_Guest | 3/8 | footer(y 799/545, h 281/492) body(h 701/448) main(h 563/93) sidebar-nav(h 492/504) section-title(h 60/29) |
| G-03_1920_Signed-in | 3/8 | footer(y 799/545, h 281/492) body(h 701/448) main(h 563/93) sidebar-nav(h 492/669) section-title(h 60/29) |
| G-04_1920_Signed-in | 3/8 | footer(y 13573/814, h 281/492) body(h 13475/717) main(h 13427/627) sidebar-nav(h 492/669) section-title(h 60/29) |
| G-04_1920_Guest | 3/8 | footer(y 13573/772, h 281/492) body(h 13475/675) main(h 13427/627) sidebar-nav(h 492/504) section-title(h 60/29) |
| G-03_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1150/458, h 312/746) body(y 112/97, h 1038/361) tabbar(y 1015/1204, h 65/93) |
| G-04_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 37393/1420, h 312/746) body(y 112/97, h 37281/1323) tabbar(y 1015/2166, h 65/93) |
| G-04_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 37393/1420, h 312/746) body(y 112/97, h 37281/1323) tabbar(y 1015/2166, h 65/93) |
| G-05_1920_Guest | 3/8 | footer(y 1110/545, h 281/492) body(h 1012/448) main(h 964/253) sidebar-nav(h 492/504) section-title(w 640/1576, h 48/29) |
| G-05_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1206/951, h 312/746) body(y 112/97, h 1094/854) tabbar(y 1015/1697, h 65/93) |
| G-05_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1206/398, h 312/746) body(y 112/97, h 1094/301) tabbar(y 1015/1144, h 65/93) |
| G-05_1920_Signed-in | 3/8 | footer(y 1110/939, h 281/492) body(h 1012/842) main(h 964/794) sidebar-nav(h 492/669) section-title(w 640/1576, h 48/29) |
| G-06_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/398, h 312/746) body(y 112/97, h 592/301) tabbar(y 1015/1144, h 65/93) |
| G-06_1920_Guest | 3/8 | footer(y 799/545, h 281/492) body(h 701/448) main(h 217/253) sidebar-nav(h 492/504) section-title(h 60/29) |
| G-06_1920_Signed-in | 3/9 | footer(y 799/545, h 281/492) body(h 701/448) main(h 217/320) sidebar-nav(h 492/669) section-title(h 60/40) 없음:tabs |
| G-07_1920_Signed-in | 3/9 | footer(y 799/545, h 281/492) body(h 701/448) main(h 175/264) sidebar-nav(h 492/669) section-title(h 48/29) 없음:tabs |
| G-07_1920_Guest | 3/8 | footer(y 799/545, h 281/492) body(h 701/448) main(h 175/253) sidebar-nav(h 492/504) section-title(h 48/29) |
| G-06_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/753, h 312/746) body(y 112/97, h 592/656) tabbar(y 1015/1499, h 65/93) 없음:tabs |
| G-07_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/487, h 312/746) body(y 112/97, h 592/390) tabbar(y 1015/1233, h 65/93) 없음:tabs |
| G-07_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/398, h 312/746) body(y 112/97, h 592/301) tabbar(y 1015/1144, h 65/93) |
| G-08_1920_Guest | 3/6 | footer(y 799/708, h 281/492) body(h 701/611) 없음:login-card |
| G-08_1920_Signed-in | 3/6 | footer(y 799/708, h 281/492) body(h 701/611) 없음:login-card |
| G-08_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 750/731, h 312/746) body(y 112/97, h 638/634) tabbar(y 1015/1477, h 65/93) 없음:login-card |
| G-08_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 750/731, h 312/746) body(y 112/97, h 638/634) tabbar(y 1015/1477, h 65/93) 없음:login-card |
| G-09_1920_Guest | 3/5 | footer(y 799/489, h 281/492) body(h 701/392) |
| G-09_1920_Signed-in | 3/5 | footer(y 799/489, h 281/492) body(h 701/392) |
| G-09_360_Guest | 0/6 | masthead(h 46/32) header(y 46/32) footer(y 704/512, h 312/746) body(y 112/97, h 592/415) tabbar(y 1015/1258, h 65/93) |
| G-10_1920_Guest | 3/8 | footer(y 1715/749, h 281/492) body(h 1617/652) main(h 1569/604) sidebar-nav(h 492/504) section-title(h 60/29) |
| G-10_1920_Signed-in | 3/8 | footer(y 1715/814, h 281/492) body(h 1617/717) main(h 1569/604) sidebar-nav(h 492/669) section-title(h 60/29) |
| G-09_360_Signed-in | 0/6 | masthead(h 46/32) header(y 46/32) footer(y 704/512, h 312/746) body(y 112/97, h 592/415) tabbar(y 1015/1258, h 65/93) |
| G-11_1920_Guest | 3/8 | footer(y 799/545, h 281/492) body(h 701/448) main(h 381/253) sidebar-nav(h 492/504) section-title(y 397/121) |
| G-10_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1718/568, h 312/746) body(y 112/97, h 1606/471) tabbar(y 1015/1314, h 65/93) |
| G-10_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1718/568, h 312/746) body(y 112/97, h 1606/471) tabbar(y 1015/1314, h 65/93) |
| G-11_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/398, h 312/746) body(y 112/97, h 592/301) tabbar(y 1015/1144, h 65/93) |
| G-11_1920_Signed-in | 3/8 | footer(y 799/693, h 281/492) body(h 701/596) main(h 381/477) sidebar-nav(h 492/669) section-title(y 397/121) |
| G-11_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/622, h 312/746) body(y 112/97, h 592/525) tabbar(y 1015/1368, h 65/93) |
| A-01_1920_Guest | 3/7 | footer(y 1856/869, h 281/492) body(h 1758/772) main(h 1710/724) sidebar-nav(h 492/504) |
| A-01_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 2123/1143, h 312/746) body(y 112/97, h 2011/1046) tabbar(y 1015/1889, h 65/93) |
| A-01_1920_Signed-in | 3/7 | footer(y 1856/869, h 281/492) body(h 1758/772) main(h 1710/724) sidebar-nav(h 492/669) |
| A-01_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 2123/1143, h 312/746) body(y 112/97, h 2011/1046) tabbar(y 1015/1889, h 65/93) |
| A-02_1920_Signed-in | 6/11 | footer(y 4199/4447, h 281/492) body(h 4101/4350) main(h 4053/4302) sidebar-nav(h 1322/1483) 없음:readme |
| A-02_1920_Guest | 6/11 | footer(y 4199/4447, h 281/492) body(h 4101/4350) main(h 4053/4302) sidebar-nav(h 1197/1340) 없음:readme |
| A-02_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 6671/8810, h 312/746) body(y 112/97, h 6559/8713) tabbar(y 1015/9556, h 65/93) 없음:readme |
| A-03_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 910/356) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| A-02_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 6671/8810, h 312/746) body(y 112/97, h 6559/8713) tabbar(y 1015/9556, h 65/93) 없음:readme |
| A-03_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1240/533, h 312/746) body(y 112/97, h 1128/436) tabbar(y 1015/1279, h 65/93) |
| A-03_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 1240/1704, h 312/746) body(y 112/97, h 1128/1607) tabbar(y 1015/2450, h 65/93) |
| A-03_1920_Signed-in | 6/12 | footer(y 1081/1137, h 281/492) body(h 983/1040) main(h 910/921) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/29) |
| A-04_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 711/848, h 312/746) body(y 112/97, h 599/751) tabbar(y 1015/1594, h 65/93) 없음:section-title |
| A-04_1920_Guest | 6/11 | footer(y 1081/638, h 281/492) body(h 983/541) main(h 448/422) sidebar-nav(h 1197/1340) 없음:section-title |
| A-04_1920_Signed-in | 6/12 | footer(y 1081/892, h 281/492) body(h 983/795) main(h 448/575) sidebar-nav(h 1322/1483) 없음:section-title,comment-editor |
| A-04_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 711/990, h 312/746) body(y 112/97, h 599/893) tabbar(y 1015/1736, h 65/93) 없음:section-title,comment-editor |
| A-05_1920_Guest | 3/9 | footer(y 799/649, h 281/492) body(h 701/552) main(h 297/433) sidebar-nav(h 492/504) section-title(h 60/29) 없음:tabs |
| A-05_1920_Signed-in | 3/9 | footer(y 799/649, h 281/492) body(h 701/552) main(h 297/444) sidebar-nav(h 492/669) section-title(h 60/40) 없음:tabs |
| A-06_1920_Guest | 3/8 | footer(y 1985/706, h 281/492) body(h 1887/609) main(h 1839/561) sidebar-nav(h 492/504) section-title(h 48/29) |
| A-05_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/848, h 312/746) body(y 112/97, h 592/751) tabbar(y 1015/1594, h 65/93) 없음:tabs |
| A-05_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/848, h 312/746) body(y 112/97, h 592/751) tabbar(y 1015/1594, h 65/93) 없음:tabs |
| A-06_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 2046/1886, h 312/746) body(y 112/97, h 1934/1789) tabbar(y 1015/2632, h 65/93) |
| A-06_1920_Signed-in | 3/8 | footer(y 1985/777, h 281/492) body(h 1887/680) main(h 1839/561) sidebar-nav(h 492/669) section-title(h 48/29) |
| A-06_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 2046/1886, h 312/746) body(y 112/97, h 1934/1789) tabbar(y 1015/2632, h 65/93) |
| A-07_1920_Guest | 3/8 | footer(y 799/618, h 281/492) body(h 701/521) main(h 435/402) sidebar-nav(h 492/504) section-title(y 220/121) |
| A-07_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/616, h 312/746) body(y 112/97, h 592/519) tabbar(y 1015/1362, h 65/93) |
| A-07_1920_Signed-in | 3/8 | footer(y 799/618, h 281/492) body(h 701/521) main(h 435/402) sidebar-nav(h 492/669) section-title(y 220/121) |
| A-08_1920_Guest | 5/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 330/356) sidebar-nav(h 1197/1340) breadcrumb(w 355/308) |
| A-07_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/616, h 312/746) body(y 112/97, h 592/519) tabbar(y 1015/1362, h 65/93) |
| A-08_1920_Signed-in | 5/11 | footer(y 1081/913, h 281/492) body(h 983/816) main(h 330/697) sidebar-nav(h 1322/1483) breadcrumb(w 355/308) |
| A-08_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 704/533, h 312/746) body(y 112/97, h 592/436) tabbar(y 1015/1279, h 65/93) |
| A-09_1920_Guest | 3/9 | footer(y 799/567, h 281/492) body(h 701/470) main(h 218/351) sidebar-nav(h 492/504) section-title(x 344/320, y 244/121, w 1528/1576) 없음:tabs |
| A-08_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 704/1335, h 312/746) body(y 112/97, h 592/1238) tabbar(y 1015/2081, h 65/93) |
| A-09_1920_Signed-in | 3/9 | footer(y 799/567, h 281/492) body(h 701/470) main(h 218/362) sidebar-nav(h 492/669) section-title(x 344/320, y 244/121, w 1528/1576, h 29/40) 없음:tabs |
| A-09_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/542, h 312/746) body(y 112/97, h 592/445) tabbar(y 1015/1288, h 65/93) 없음:tabs |
| A-09_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/542, h 312/746) body(y 112/97, h 592/445) tabbar(y 1015/1288, h 65/93) 없음:tabs |
| A-10_1920_Guest | 3/8 | footer(y 1081/545, h 281/492) body(h 983/448) main(x 352/320, w 1544/1576, h 402/320) sidebar-nav(y 166/121, w 296/264, h 1197/504) section-title(x 352/320, y 318/121, w 1544/1576, h 36/29) |
| A-10_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 741/511, h 312/746) body(y 112/97, h 629/414) tabbar(y 1015/1257, h 65/93) |
| A-10_1920_Signed-in | 3/8 | footer(y 1081/545, h 281/492) body(h 983/448) main(x 352/320, w 1544/1576, h 402/262) sidebar-nav(y 166/121, w 296/264, h 1322/669) section-title(x 352/320, y 318/121, w 1544/1576, h 36/29) |
| A-11_1920_Guest | 3/8 | footer(y 799/545, h 281/492) body(h 701/448) main(h 415/253) sidebar-nav(h 492/504) 없음:section-title |
| A-11_1920_Signed-in | 3/8 | footer(y 799/1087, h 281/492) body(h 701/990) main(h 415/942) sidebar-nav(h 492/669) 없음:section-title |
| A-10_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 741/551, h 312/746) body(y 112/97, h 629/454) tabbar(y 1015/1297, h 65/93) |
| G-01_1920_Guest | 3/9 | footer(y 5099/1068, h 281/492) body(h 5001/971) main(h 4953/923) sidebar-nav(h 492/504) section-title(h 48/29) |
| A-11_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/398, h 312/746) body(y 112/97, h 592/301) tabbar(y 1015/1144, h 65/93) 없음:section-title |
| A-11_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/2138, h 312/746) body(y 112/97, h 592/2041) tabbar(y 1015/2884, h 65/93) 없음:section-title |
| G-01_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 5409/1224, h 312/746) body(y 112/97, h 5297/1127) tabbar(y 1015/1970, h 65/93) |
| G-01_1920_Signed-in | 3/9 | footer(y 5099/1079, h 281/492) body(h 5001/982) main(h 4953/934) sidebar-nav(h 492/669) section-title(h 48/40) |
| G-01_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 5409/1224, h 312/746) body(y 112/97, h 5297/1127) tabbar(y 1015/1970, h 65/93) |
| R-19_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 813/530, h 312/746) body(y 112/97, h 701/433) tabbar(y 1015/1276, h 65/93) |
| R-19_1920_Signed-in | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 503/353) sidebar-nav(h 1322/1483) section-title(y 318/224, h 36/29) |
| R-19_1920_Guest | 6/11 | footer(y 1081/625, h 281/492) body(h 983/528) main(h 503/353) sidebar-nav(h 1197/1340) section-title(y 318/224, h 36/29) |
| R-19_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 813/530, h 312/746) body(y 112/97, h 701/433) tabbar(y 1015/1276, h 65/93) |
| G-08b_1920_Signed-in | 3/6 | footer(y 799/767, h 281/492) body(h 701/670) login-card(x 735/740, y 122/129, w 451/440, h 419/606) |
| G-08b_1920_Guest | 3/6 | footer(y 799/767, h 281/492) body(h 701/670) login-card(x 735/740, y 122/129, w 451/440, h 419/606) |
| G-08c_1920_Guest | 3/6 | footer(y 799/543, h 281/492) body(h 701/446) login-card(x 735/740, y 122/129, w 451/440, h 271/382) |
| G-08b_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/813, h 312/746) body(y 112/97, h 592/716) tabbar(y 1015/1559, h 65/93) |
| G-08b_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/813, h 312/746) body(y 112/97, h 592/716) tabbar(y 1015/1559, h 65/93) |
| G-08c_1920_Signed-in | 3/6 | footer(y 799/543, h 281/492) body(h 701/446) login-card(x 735/740, y 122/129, w 451/440, h 271/382) |
| G-08c_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/566, h 312/746) body(y 112/97, h 592/469) tabbar(y 1015/1312, h 65/93) |
| G-08c_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/566, h 312/746) body(y 112/97, h 592/469) tabbar(y 1015/1312, h 65/93) |
| G-08d_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/792, h 312/746) body(y 112/97, h 592/695) tabbar(y 1015/1538, h 65/93) |
| G-08d_1920_Guest | 3/6 | footer(y 799/792, h 281/492) body(h 701/695) login-card(x 735/740, y 122/129, w 451/440, h 195/631) |
| G-08d_1920_Signed-in | 3/6 | footer(y 799/792, h 281/492) body(h 701/695) login-card(x 735/740, y 122/129, w 451/440, h 195/631) |
| G-08d_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/792, h 312/746) body(y 112/97, h 592/695) tabbar(y 1015/1538, h 65/93) |
| G-08e_1920_Signed-in | 3/6 | footer(y 799/516, h 281/492) body(h 701/419) login-card(x 735/740, y 122/129, w 451/440, h 271/355) |
| G-08e_1920_Guest | 3/6 | footer(y 799/516, h 281/492) body(h 701/419) login-card(x 735/740, y 122/129, w 451/440, h 271/355) |
| G-08e_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/539, h 312/746) body(y 112/97, h 592/442) tabbar(y 1015/1285, h 65/93) |
| G-08e_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/539, h 312/746) body(y 112/97, h 592/442) tabbar(y 1015/1285, h 65/93) |