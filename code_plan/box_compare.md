# Figma 요소 상자 1px 대조 결과

- 측정일: 2026. 10. 30.
- 대상: figma_boxes 224개(화면 56 × 폭 1920, 360 × 로그인 전, 후)
- 코드 쪽: 개발 서버에서 `?fixture=kordoc&auth=…&role=developer&mode=light`로 연 화면의 `data-figma` 요소 상자(스크롤바는 숨기고 쟀다)
- 합격 기준: x, y, w, h가 모두 1px 이내. 사이드바(sidebar) 높이는 고정 패널이라 제외. 경로(breadcrumb) 폭만 글자 폭 차이 8px까지 허용

## 1. 요약
| 폭 | 변형 | 요소 상자 | 맞음 | 비율 | 완전 통과 화면 |
|---|---:|---:|---:|---:|---:|
| 1920 | 112 | 1229 | 466 | 37.9% | 0 |
| 360 | 112 | 1067 | 0 | 0.0% | 0 |

합격 기준에는 닿지 못했다. 아래 원인을 없애야 올라간다.

## 2. 원인별 집계
### 1920 폭: 어긋난 요소 수(변형 112개 중)
| 요소 | 건수 |
|---|---:|
| global-search | 112 |
| footer | 112 |
| body | 112 |
| sidebar-nav | 100 |
| main | 100 |
| section-title | 71 |
| repo-actions | 34 |
| breadcrumb | 26 |
| tabs (코드에 없음) | 17 |
| section-title (코드에 없음) | 8 |
| login-card | 8 |
| toolbar | 6 |
| commit-bar | 4 |
| file-table | 4 |

### 360 폭: 어긋난 요소 수(변형 112개 중)
| 요소 | 건수 |
|---|---:|
| masthead | 112 |
| header | 112 |
| footer | 112 |
| body | 112 |
| tabbar | 112 |
| global-search (코드에 없음) | 112 |
| main | 100 |
| section-title | 71 |
| breadcrumb | 68 |
| repo-title | 68 |
| tabs (코드에 없음) | 17 |
| section-title (코드에 없음) | 8 |
| login-card | 8 |
| toolbar | 6 |

## 3. Figma 쪽 원인 (Figma 갈래에 전달할 목록)
| 번호 | 내용 | 근거 |
|---|---|---|
| F-1 | 머리 검색칸 `global-search`가 확정값(x 640, w 640)이 아님 | 1920 변형 112개 중 x 328/w 1264가 90건, x 277이 22건. 640/640은 0건. 코드는 확정값대로 x 640, w 640 |
| F-2 | 360의 `global-search`가 x 265, w 1 | 112건 모두. 폭 1짜리 자리 표시로 보임. 360에서는 검색칸 대신 검색 아이콘 버튼이므로 상자를 아이콘 버튼 크기로 |
| F-3 | 360 공식 배너 `masthead` 높이 32 | 코드는 문구가 두 줄로 접혀 46. 한 줄로 그렸다면 글자를 줄이거나 말줄임을 쓴 것인지 알려 줘야 함 |
| F-4 | `sidebar-nav` 높이 | 1920 로그인 전 Figma 1340, 코드 1197(차이 143). 로그인 후 1483 대 1322(차이 161). 항목 높이나 묶음 간격 값이 Figma 노드에서 읽혀야 함 |
| F-5 | `footer` 높이 | Figma 113 또는 224(1920), 코드 281(1920), 312(360). 바닥글에서 숨긴 영역 목록 필요 |
| F-6 | 파일 표 항목 수 | Figma는 루트 29개. 공공 깃랩 실제 루트는 35개이고 `src`는 44개(받아 둔 재귀 목록이 일부만 담아 29로 보였음). 코드 고정 자료는 실제 목록으로 바꿨다 |
| F-7 | 화면 높이(`body`, `main`, `footer` 위치) | 내용 길이 차이가 쌓인 결과. README, 파일 표, 목록 항목 수를 위 실제 자료로 다시 그리면 줄어든다 |
| F-8 | 이름이 없는 요소 | 코드는 `tabs`, `detail-area`를 일부 화면에만 달았다. Figma 규칙 문서의 정의(어느 요소의 상자인지)가 필요 |

## 4. 코드 쪽 원인과 한 일
- 360 좌우 여백을 16에서 12(KRDS `padding-5`)로 바꿨다
- 하단 탭바에 `tabbar`, 본문 첫 소제목에 `section-title` 표식을 달았다(보이는 것은 같다)
- 고정 자료의 맨 위 폴더와 `src`를 실제 응답으로 바꿨다
- 남은 코드 쪽 일: 360 머리 높이와 경로 구조, 저장소 머리(`repo-title`)의 360 배치, 사이드바 항목 높이

## 5. 변형별 결과 (224개)
| 변형 | 맞음/전체 | 어긋난 요소(앞 5개, 코드/Figma) |
|---|---:|---|
| R-01_360_Guest | 0/16 | masthead(h 46/32) header(y 46/32) footer(y 11439/13317, h 312/224) body(y 112/97, h 11327/13220) main(y 124/121, h 10699/13172) 없음:global-search |
| R-01_1920_Signed-in | 5/18 | global-search(x 640/328, w 640/1264) footer(y 6059/6508, h 281/113) body(h 5961/6411) sidebar-nav(h 1322/1483) main(h 5913/6363) |
| R-01_1920_Guest | 6/18 | global-search(x 640/328, w 640/1264) footer(y 6059/6508, h 281/113) body(h 5961/6411) sidebar-nav(h 1197/1340) main(h 5913/6363) |
| R-02_1920_Guest | 6/14 | global-search(x 640/328, w 640/1264) footer(y 2846/1540, h 281/113) body(h 2748/1443) sidebar-nav(h 1197/1340) main(h 2700/1395) |
| R-02_1920_Signed-in | 5/14 | global-search(x 640/328, w 640/1264) footer(y 2846/1540, h 281/113) body(h 2748/1443) sidebar-nav(h 1322/1483) main(h 2700/1395) |
| R-01_360_Signed-in | 0/16 | masthead(h 46/32) header(y 46/32) footer(y 11495/13317, h 312/224) body(y 112/97, h 11383/13220) main(y 124/121, h 10755/13172) 없음:global-search |
| R-02_360_Signed-in | 0/12 | masthead(h 46/32) header(y 46/32) footer(y 4175/2686, h 312/224) body(y 112/97, h 4063/2589) main(y 124/121, h 4039/2541) 없음:global-search |
| R-03_1920_Guest | 5/14 | global-search(x 640/328, w 640/1264) footer(y 1382/2614, h 281/113) body(h 1284/2517) sidebar-nav(h 1197/1340) main(h 1236/2469) 없음:tabs,code-view |
| R-02_360_Guest | 0/12 | masthead(h 46/32) header(y 46/32) footer(y 4119/2686, h 312/224) body(y 112/97, h 4007/2589) main(y 124/121, h 3983/2541) 없음:global-search |
| R-03_360_Guest | 0/12 | masthead(h 46/32) header(y 46/32) footer(y 768/4615, h 312/224) body(y 112/97, h 656/4518) main(y 124/121, h 632/4470) 없음:global-search,tabs,code-view |
| R-03_1920_Signed-in | 4/14 | global-search(x 640/328, w 640/1264) footer(y 1382/2614, h 281/113) body(h 1284/2517) sidebar-nav(h 1322/1483) main(h 1236/2469) 없음:tabs,code-view |
| R-03_360_Signed-in | 0/12 | masthead(h 46/32) header(y 46/32) footer(y 824/4615, h 312/224) body(y 112/97, h 712/4518) main(y 124/121, h 688/4470) 없음:global-search,tabs,code-view |
| R-04_1920_Guest | 6/12 | global-search(x 640/328, w 640/1264) footer(y 8706/2234, h 281/113) body(h 8608/2137) sidebar-nav(h 1197/1340) main(h 8560/2089) 없음:toolbar |
| R-04_1920_Signed-in | 5/12 | global-search(x 640/328, w 640/1264) footer(y 8706/2234, h 281/113) body(h 8608/2137) sidebar-nav(h 1322/1483) main(h 8560/2089) 없음:toolbar |
| R-04_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 13647/2306, h 312/224) body(y 112/97, h 13535/2209) main(y 124/121, h 13511/2161) 없음:global-search,toolbar |
| R-05_1920_Guest | 5/16 | global-search(x 640/328, w 640/1264) footer(y 1081/1660, h 281/113) body(h 983/1563) sidebar-nav(h 1197/1340) main(h 378/1515) 없음:commit-bar,tabs,diff-area,diff-tree,diff-file |
| R-04_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 13647/2306, h 312/224) body(y 112/97, h 13535/2209) main(y 124/121, h 13511/2161) 없음:global-search,toolbar |
| R-05_1920_Signed-in | 4/16 | global-search(x 640/328, w 640/1264) footer(y 1081/1660, h 281/113) body(h 983/1563) sidebar-nav(h 1322/1483) main(h 378/1515) 없음:commit-bar,tabs,diff-area,diff-tree,diff-file |
| R-05_360_Guest | 0/13 | masthead(h 46/32) header(y 46/32) footer(y 704/1559, h 312/224) body(y 112/97, h 592/1462) main(y 144/121, h 529/1414) 없음:global-search,commit-bar,tabs,diff-area,diff-file |
| R-05_360_Signed-in | 0/13 | masthead(h 46/32) header(y 46/32) footer(y 704/1559, h 312/224) body(y 112/97, h 592/1462) main(y 144/121, h 529/1414) 없음:global-search,commit-bar,tabs,diff-area,diff-file |
| R-06_1920_Guest | 5/12 | global-search(x 640/277, w 640/1367) footer(y 1081/754, h 281/492) body(h 983/657) sidebar-nav(h 1197/1340) main(h 903/538) |
| R-06_1920_Signed-in | 4/12 | global-search(x 640/277, w 640/1273) footer(y 1081/754, h 281/492) body(h 983/657) sidebar-nav(h 1322/1483) main(h 903/538) |
| R-06_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 3235/1024, h 312/746) body(y 112/97, h 3123/927) main(y 124/121, h 3099/879) 없음:global-search |
| R-06_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 3235/1024, h 312/746) body(y 112/97, h 3123/927) main(y 124/121, h 3099/879) 없음:global-search |
| R-07_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 10840/476, h 312/224) body(y 112/97, h 10728/379) main(y 124/121, h 10704/331) 없음:global-search |
| R-07_1920_Signed-in | 4/12 | global-search(x 640/328, w 640/1264) footer(y 8671/625, h 281/113) body(h 8573/528) sidebar-nav(h 1322/1483) main(h 8525/237) |
| R-07_1920_Guest | 5/12 | global-search(x 640/328, w 640/1264) footer(y 8671/625, h 281/113) body(h 8573/528) sidebar-nav(h 1197/1340) main(h 8525/226) |
| R-07_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 10840/476, h 312/224) body(y 112/97, h 10728/379) main(y 124/121, h 10704/331) 없음:global-search |
| R-08_1920_Guest | 5/12 | global-search(x 640/328, w 640/1264) footer(y 8671/1810, h 281/113) body(h 8573/1713) sidebar-nav(h 1197/1340) main(h 8525/1665) |
| R-08_1920_Signed-in | 4/12 | global-search(x 640/328, w 640/1264) footer(y 8671/1810, h 281/113) body(h 8573/1713) sidebar-nav(h 1322/1483) main(h 8525/1665) |
| R-08_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 10840/3302, h 312/224) body(y 112/97, h 10728/3205) main(y 124/121, h 10704/3157) 없음:global-search |
| R-09_1920_Guest | 6/12 | global-search(x 640/277, w 640/1367) footer(y 19007/3277, h 281/492) body(h 18909/3180) sidebar-nav(h 1197/1340) main(h 18861/3132) 없음:section-title |
| R-08_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 10840/3302, h 312/224) body(y 112/97, h 10728/3205) main(y 124/121, h 10704/3157) 없음:global-search |
| R-09_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 35455/3309, h 312/746) body(y 112/97, h 35343/3212) main(y 124/121, h 35319/3164) 없음:global-search,section-title |
| R-09_1920_Signed-in | 5/12 | global-search(x 640/277, w 640/1273) footer(y 19007/3288, h 281/492) body(h 18909/3191) sidebar-nav(h 1322/1483) main(h 18861/3143) 없음:section-title |
| R-09_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 35455/3309, h 312/746) body(y 112/97, h 35343/3212) main(y 124/121, h 35319/3164) 없음:global-search,section-title |
| R-10_1920_Guest | 6/12 | global-search(x 640/328, w 640/1264) footer(y 1858/1510, h 281/113) body(h 1760/1413) sidebar-nav(h 1197/1340) main(h 1712/1365) |
| R-10_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1999/3462, h 312/224) body(y 112/97, h 1887/3365) main(y 124/121, h 1863/3317) 없음:global-search |
| R-10_1920_Signed-in | 5/12 | global-search(x 640/328, w 640/1264) footer(y 1858/1510, h 281/113) body(h 1760/1413) sidebar-nav(h 1322/1483) main(h 1712/1365) |
| R-11_1920_Guest | 5/13 | global-search(x 640/328, w 640/1264) footer(y 2437/1870, h 281/113) body(h 2339/1773) sidebar-nav(h 1197/1340) main(h 2291/1725) 없음:tabs |
| R-11_1920_Signed-in | 4/13 | global-search(x 640/328, w 640/1264) footer(y 2437/1870, h 281/113) body(h 2339/1773) sidebar-nav(h 1322/1483) main(h 2291/1725) 없음:tabs |
| R-10_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1999/3462, h 312/224) body(y 112/97, h 1887/3365) main(y 124/121, h 1863/3317) 없음:global-search |
| R-11_360_Guest | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 3348/3362, h 312/224) body(y 112/97, h 3236/3265) main(y 124/121, h 3212/3217) 없음:global-search,tabs |
| R-12_1920_Guest | 5/13 | global-search(x 640/328, w 640/1264) footer(y 1191/934, h 281/113) body(h 1093/837) sidebar-nav(h 1197/1340) main(h 1045/789) 없음:detail-area,meta-panel |
| R-11_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 3348/3362, h 312/224) body(y 112/97, h 3236/3265) main(y 124/121, h 3212/3217) 없음:global-search,tabs |
| R-12_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 2348/1385, h 312/224) body(y 112/97, h 2236/1288) main(y 124/121, h 2212/1240) 없음:global-search,detail-area |
| R-12_1920_Signed-in | 4/14 | global-search(x 640/328, w 640/1264) footer(y 1191/1104, h 281/113) body(h 1093/1007) sidebar-nav(h 1322/1483) main(h 1045/847) 없음:detail-area,comment-editor,meta-panel |
| R-12_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 2348/1443, h 312/224) body(y 112/97, h 2236/1346) main(y 124/121, h 2212/1298) 없음:global-search,detail-area,comment-editor |
| R-13_1920_Guest | 6/12 | global-search(x 640/277, w 640/1367) footer(y 1081/714, h 281/492) body(h 983/617) sidebar-nav(h 1197/1340) main(h 464/498) |
| R-13_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/861, h 312/746) body(y 112/97, h 636/764) main(y 124/121, h 612/716) 없음:global-search |
| R-13_1920_Signed-in | 5/12 | global-search(x 640/277, w 640/1438) footer(y 1081/714, h 281/492) body(h 983/617) sidebar-nav(h 1322/1483) main(h 464/498) |
| R-14_1920_Guest | 6/12 | global-search(x 640/277, w 640/1367) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 464/342) |
| R-14_1920_Signed-in | 5/12 | global-search(x 640/277, w 640/1438) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1322/1483) main(h 464/409) |
| R-13_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/861, h 312/746) body(y 112/97, h 636/764) main(y 124/121, h 612/716) 없음:global-search |
| R-14_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/739, h 312/746) body(y 112/97, h 636/642) main(y 124/121, h 612/594) 없음:global-search |
| R-14_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/739, h 312/746) body(y 112/97, h 636/642) main(y 124/121, h 612/594) 없음:global-search |
| R-15_1920_Guest | 6/12 | global-search(x 640/277, w 640/1367) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 464/327) |
| R-15_1920_Signed-in | 5/12 | global-search(x 640/277, w 640/1438) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1322/1483) main(h 464/364) |
| R-15_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/504, h 312/746) body(y 112/97, h 636/407) main(y 124/121, h 612/359) 없음:global-search |
| R-15_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/530, h 312/746) body(y 112/97, h 636/433) main(y 124/121, h 612/385) 없음:global-search |
| R-16_1920_Signed-in | 5/13 | global-search(x 640/277, w 640/1438) footer(y 3024/1948, h 281/492) body(h 2926/1851) sidebar-nav(h 1322/1483) main(h 2878/1803) 없음:section-title,tabs |
| R-16_1920_Guest | 6/13 | global-search(x 640/277, w 640/1367) footer(y 3024/1937, h 281/492) body(h 2926/1840) sidebar-nav(h 1197/1340) main(h 2878/1792) 없음:section-title,tabs |
| R-16_360_Guest | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 4410/3291, h 312/746) body(y 112/97, h 4298/3194) main(y 124/121, h 4274/3146) 없음:global-search,section-title,tabs |
| R-17_1920_Guest | 5/14 | global-search(x 640/328, w 640/1264) footer(y 1081/904, h 281/492) body(h 983/807) sidebar-nav(h 1197/1340) main(h 766/759) 없음:tabs,detail-area,meta-panel |
| R-17_1920_Signed-in | 4/14 | global-search(x 640/328, w 640/1264) footer(y 1081/1026, h 281/492) body(h 983/929) sidebar-nav(h 1322/1483) main(h 830/877) 없음:tabs,detail-area,meta-panel |
| R-16_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 4410/3291, h 312/746) body(y 112/97, h 4298/3194) main(y 124/121, h 4274/3146) 없음:global-search,section-title,tabs |
| R-18_1920_Guest | 6/12 | global-search(x 640/277, w 640/1367) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 464/363) |
| R-17_360_Guest | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 1397/1138, h 312/746) body(y 112/97, h 1285/1041) main(y 124/121, h 1261/993) 없음:global-search,tabs,detail-area |
| R-17_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 1461/1256, h 312/746) body(y 112/97, h 1349/1159) main(y 124/121, h 1325/1111) 없음:global-search,tabs,detail-area |
| R-18_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 774/586, h 312/746) body(y 112/97, h 662/489) main(y 124/121, h 638/441) 없음:global-search |
| R-18_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 774/646, h 312/746) body(y 112/97, h 662/549) main(y 124/121, h 638/501) 없음:global-search |
| R-18_1920_Signed-in | 5/12 | global-search(x 640/277, w 640/1438) footer(y 1081/639, h 281/492) body(h 983/542) sidebar-nav(h 1322/1483) main(h 464/434) |
| R-20_1920_Guest | 6/12 | global-search(x 640/277, w 640/1367) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 464/363) |
| R-20_1920_Signed-in | 5/12 | global-search(x 640/277, w 640/1438) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1322/1483) main(h 464/363) |
| R-20_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/563, h 312/746) body(y 112/97, h 636/466) main(y 124/121, h 612/418) 없음:global-search |
| R-21_1920_Guest | 6/12 | global-search(x 640/277, w 640/1367) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 464/327) |
| R-20_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/563, h 312/746) body(y 112/97, h 636/466) main(y 124/121, h 612/418) 없음:global-search |
| R-21_1920_Signed-in | 5/12 | global-search(x 640/277, w 640/1438) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1322/1483) main(h 464/364) |
| R-21_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/504, h 312/746) body(y 112/97, h 636/407) main(y 124/121, h 612/359) 없음:global-search |
| R-22_1920_Guest | 6/12 | global-search(x 640/277, w 640/1367) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 464/293) |
| R-21_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/530, h 312/746) body(y 112/97, h 636/433) main(y 124/121, h 612/385) 없음:global-search |
| R-22_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/470, h 312/746) body(y 112/97, h 636/373) main(y 124/121, h 612/325) 없음:global-search |
| R-22_1920_Signed-in | 5/12 | global-search(x 640/277, w 640/1438) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1322/1483) main(h 464/364) |
| R-22_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/530, h 312/746) body(y 112/97, h 636/433) main(y 124/121, h 612/385) 없음:global-search |
| R-23_1920_Signed-in | 5/12 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/113) body(h 983/528) sidebar-nav(h 1322/1483) main(h 464/381) |
| R-23_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/790, h 312/224) body(y 112/97, h 636/693) main(y 124/121, h 612/645) 없음:global-search |
| R-23_1920_Guest | 6/12 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/113) body(h 983/528) sidebar-nav(h 1197/1340) main(h 464/370) |
| R-24_1920_Guest | 6/12 | global-search(x 640/328, w 640/1264) footer(y 1081/1739, h 281/492) body(h 983/1642) sidebar-nav(h 1197/1340) main(h 464/1594) |
| R-24_1920_Signed-in | 5/12 | global-search(x 640/328, w 640/1264) footer(y 1081/1739, h 281/492) body(h 983/1642) sidebar-nav(h 1322/1483) main(h 464/1594) |
| R-23_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 748/790, h 312/224) body(y 112/97, h 636/693) main(y 124/121, h 612/645) 없음:global-search |
| R-24_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 774/3311, h 312/746) body(y 112/97, h 662/3214) main(y 124/121, h 638/3166) 없음:global-search |
| R-25_1920_Guest | 5/12 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 308/329) |
| R-24_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 774/3311, h 312/746) body(y 112/97, h 662/3214) main(y 124/121, h 638/3166) 없음:global-search |
| R-25_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 704/805, h 312/746) body(y 112/97, h 592/708) main(y 179/121, h 459/660) 없음:global-search |
| R-25_1920_Signed-in | 4/12 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1322/1483) main(h 308/329) |
| R-25_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 704/805, h 312/746) body(y 112/97, h 592/708) main(y 179/121, h 459/660) 없음:global-search |
| R-26_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 1003/510, h 312/224) body(y 112/97, h 891/413) main(y 124/121, h 867/365) 없음:global-search |
| R-26_1920_Guest | 5/11 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/113) body(h 983/528) sidebar-nav(h 1197/1340) main(h 661/333) |
| R-26_1920_Signed-in | 4/12 | global-search(x 640/328, w 640/1264) footer(y 1081/862, h 281/113) body(h 983/765) sidebar-nav(h 1322/1483) main(h 661/646) |
| R-27_1920_Signed-in | 4/13 | global-search(x 640/328, w 640/1264) footer(y 1081/1102, h 281/492) body(h 983/1005) sidebar-nav(h 1322/1483) main(h 910/886) 없음:tabs |
| R-27_1920_Guest | 5/12 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 910/356) |
| R-26_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1003/823, h 312/224) body(y 112/97, h 891/726) main(y 124/121, h 867/678) 없음:global-search |
| R-27_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 1217/1063, h 312/746) body(y 112/97, h 1105/966) main(y 124/121, h 1081/918) 없음:global-search,tabs |
| R-27_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1217/533, h 312/746) body(y 112/97, h 1105/436) main(y 124/121, h 1081/388) 없음:global-search |
| R-28_1920_Guest | 6/12 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 528/356) |
| R-28_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 838/533, h 312/746) body(y 112/97, h 726/436) main(y 124/121, h 702/388) 없음:global-search |
| R-28_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 838/983, h 312/746) body(y 112/97, h 726/886) main(y 124/121, h 702/838) 없음:global-search |
| R-28_1920_Signed-in | 5/12 | global-search(x 640/328, w 640/1264) footer(y 1081/999, h 281/492) body(h 983/902) sidebar-nav(h 1322/1483) main(h 528/783) |
| R-29_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 798/533, h 312/746) body(y 112/97, h 686/436) main(y 124/121, h 662/388) 없음:global-search |
| R-29_1920_Guest | 5/12 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 511/356) |
| R-29_1920_Signed-in | 4/12 | global-search(x 640/328, w 640/1264) footer(y 1081/706, h 281/492) body(h 983/609) sidebar-nav(h 1322/1483) main(h 511/490) |
| R-30_1920_Guest | 6/13 | global-search(x 640/328, w 640/1264) footer(y 2120/1067, h 281/492) body(h 2022/970) sidebar-nav(h 1197/1340) main(h 1974/851) 없음:steps |
| R-30_1920_Signed-in | 5/13 | global-search(x 640/328, w 640/1264) footer(y 2120/1067, h 281/492) body(h 2022/970) sidebar-nav(h 1322/1483) main(h 1974/851) 없음:steps |
| R-29_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 798/690, h 312/746) body(y 112/97, h 686/593) main(y 124/121, h 662/545) 없음:global-search |
| G-02_1920_Guest | 3/11 | global-search(x 640/328, w 640/1264) footer(y 1213/857, h 281/492) body(h 1115/760) sidebar-nav(h 492/504) main(h 1067/712) 없음:filters,results |
| R-30_360_Guest | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 2467/1097, h 312/746) body(y 112/97, h 2355/1000) main(y 124/121, h 2331/952) 없음:global-search,steps |
| R-30_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 2467/1097, h 312/746) body(y 112/97, h 2355/1000) main(y 124/121, h 2331/952) 없음:global-search,steps |
| G-02_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1297/662, h 312/746) body(y 112/97, h 1185/565) main(y 124/121, h 1161/517) 없음:global-search,filters,results |
| G-02_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1297/662, h 312/746) body(y 112/97, h 1185/565) main(y 124/121, h 1161/517) 없음:global-search,filters,results |
| G-02_1920_Signed-in | 3/11 | global-search(x 640/328, w 640/1264) footer(y 1213/857, h 281/492) body(h 1115/760) sidebar-nav(h 492/669) main(h 1067/712) 없음:filters,results |
| G-03_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1150/458, h 312/746) body(y 112/97, h 1038/361) main(y 124/121, h 1014/313) 없음:global-search |
| G-03_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/545, h 281/492) body(h 701/448) sidebar-nav(h 492/504) main(h 563/93) |
| G-03_1920_Signed-in | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/545, h 281/492) body(h 701/448) sidebar-nav(h 492/669) main(h 563/93) |
| G-04_1920_Signed-in | 3/9 | global-search(x 640/328, w 640/1264) footer(y 13573/814, h 281/492) body(h 13475/717) sidebar-nav(h 492/669) main(h 13427/627) |
| G-04_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 13573/772, h 281/492) body(h 13475/675) sidebar-nav(h 492/504) main(h 13427/627) |
| G-03_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1150/458, h 312/746) body(y 112/97, h 1038/361) main(y 124/121, h 1014/313) 없음:global-search |
| G-04_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 37393/1420, h 312/746) body(y 112/97, h 37281/1323) main(y 124/121, h 37257/1275) 없음:global-search |
| G-04_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 37393/1420, h 312/746) body(y 112/97, h 37281/1323) main(y 124/121, h 37257/1275) 없음:global-search |
| G-05_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 1110/545, h 281/492) body(h 1012/448) sidebar-nav(h 492/504) main(h 964/253) |
| G-05_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1206/951, h 312/746) body(y 112/97, h 1094/854) main(y 124/121, h 1070/806) 없음:global-search |
| G-05_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1206/398, h 312/746) body(y 112/97, h 1094/301) main(y 124/121, h 1070/253) 없음:global-search |
| G-05_1920_Signed-in | 3/9 | global-search(x 640/328, w 640/1264) footer(y 1110/939, h 281/492) body(h 1012/842) sidebar-nav(h 492/669) main(h 964/794) |
| G-06_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/398, h 312/746) body(y 112/97, h 592/301) main(y 296/121, h 224/253) 없음:global-search |
| G-06_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/545, h 281/492) body(h 701/448) sidebar-nav(h 492/504) main(h 217/253) |
| G-06_1920_Signed-in | 3/10 | global-search(x 640/328, w 640/1264) footer(y 799/545, h 281/492) body(h 701/448) sidebar-nav(h 492/669) main(h 217/320) 없음:tabs |
| G-07_1920_Signed-in | 3/10 | global-search(x 640/328, w 640/1264) footer(y 799/545, h 281/492) body(h 701/448) sidebar-nav(h 492/669) main(h 175/264) 없음:tabs |
| G-07_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/545, h 281/492) body(h 701/448) sidebar-nav(h 492/504) main(h 175/253) |
| G-06_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/753, h 312/746) body(y 112/97, h 592/656) main(y 296/121, h 224/608) 없음:global-search,tabs |
| G-07_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/487, h 312/746) body(y 112/97, h 592/390) main(y 314/121, h 189/342) 없음:global-search,tabs |
| G-07_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/398, h 312/746) body(y 112/97, h 592/301) main(y 314/121, h 189/253) 없음:global-search |
| G-08_1920_Guest | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/708, h 281/492) body(h 701/611) 없음:login-card |
| G-08_1920_Signed-in | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/708, h 281/492) body(h 701/611) 없음:login-card |
| G-08_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 750/731, h 312/746) body(y 112/97, h 638/634) tabbar(y 1015/1477, h 65/93) 없음:global-search,login-card |
| G-08_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 750/731, h 312/746) body(y 112/97, h 638/634) tabbar(y 1015/1477, h 65/93) 없음:global-search,login-card |
| G-09_1920_Guest | 2/5 | global-search(x 640/328, w 640/1264) footer(y 799/489, h 281/492) body(h 701/392) |
| G-09_1920_Signed-in | 2/5 | global-search(x 640/328, w 640/1264) footer(y 799/489, h 281/492) body(h 701/392) |
| G-09_360_Guest | 0/6 | masthead(h 46/32) header(y 46/32) footer(y 704/512, h 312/746) body(y 112/97, h 592/415) tabbar(y 1015/1258, h 65/93) 없음:global-search |
| G-10_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 1715/749, h 281/492) body(h 1617/652) sidebar-nav(h 492/504) main(h 1569/604) |
| G-10_1920_Signed-in | 3/9 | global-search(x 640/328, w 640/1264) footer(y 1715/814, h 281/492) body(h 1617/717) sidebar-nav(h 492/669) main(h 1569/604) |
| G-09_360_Signed-in | 0/6 | masthead(h 46/32) header(y 46/32) footer(y 704/512, h 312/746) body(y 112/97, h 592/415) tabbar(y 1015/1258, h 65/93) 없음:global-search |
| G-11_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/545, h 281/492) body(h 701/448) sidebar-nav(h 492/504) main(h 381/253) |
| G-10_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1718/568, h 312/746) body(y 112/97, h 1606/471) main(y 124/121, h 1582/423) 없음:global-search |
| G-10_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 1718/568, h 312/746) body(y 112/97, h 1606/471) main(y 124/121, h 1582/423) 없음:global-search |
| G-11_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/398, h 312/746) body(y 112/97, h 592/301) main(y 224/121, h 369/253) 없음:global-search |
| G-11_1920_Signed-in | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/693, h 281/492) body(h 701/596) sidebar-nav(h 492/669) main(h 381/477) |
| G-11_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/622, h 312/746) body(y 112/97, h 592/525) main(y 224/121, h 369/477) 없음:global-search |
| A-01_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 1856/869, h 281/492) body(h 1758/772) sidebar-nav(h 492/504) main(h 1710/724) |
| A-01_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 2123/1143, h 312/746) body(y 112/97, h 2011/1046) main(y 124/121, h 1987/998) 없음:global-search |
| A-01_1920_Signed-in | 3/9 | global-search(x 640/328, w 640/1264) footer(y 1856/869, h 281/492) body(h 1758/772) sidebar-nav(h 492/669) main(h 1710/724) |
| A-01_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 2123/1143, h 312/746) body(y 112/97, h 2011/1046) main(y 124/121, h 1987/998) 없음:global-search |
| A-02_1920_Signed-in | 5/12 | global-search(x 640/328, w 640/1264) footer(y 4199/4447, h 281/492) body(h 4101/4350) sidebar-nav(h 1322/1483) main(h 4053/4302) 없음:readme |
| A-02_1920_Guest | 6/12 | global-search(x 640/328, w 640/1264) footer(y 4199/4447, h 281/492) body(h 4101/4350) sidebar-nav(h 1197/1340) main(h 4053/4302) 없음:readme |
| A-02_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 6671/8810, h 312/746) body(y 112/97, h 6559/8713) main(y 124/121, h 6535/8665) 없음:global-search,readme |
| A-03_1920_Guest | 6/12 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 910/356) |
| A-02_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 6671/8810, h 312/746) body(y 112/97, h 6559/8713) main(y 124/121, h 6535/8665) 없음:global-search,readme |
| A-03_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 1240/533, h 312/746) body(y 112/97, h 1128/436) main(y 124/121, h 1104/388) 없음:global-search |
| A-03_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 1240/1704, h 312/746) body(y 112/97, h 1128/1607) main(y 124/121, h 1104/1559) 없음:global-search |
| A-03_1920_Signed-in | 5/13 | global-search(x 640/328, w 640/1264) footer(y 1081/1137, h 281/492) body(h 983/1040) sidebar-nav(h 1322/1483) main(h 910/921) |
| A-04_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 711/848, h 312/746) body(y 112/97, h 599/751) main(y 124/121, h 575/703) 없음:global-search,section-title |
| A-04_1920_Guest | 6/12 | global-search(x 640/328, w 640/1264) footer(y 1081/638, h 281/492) body(h 983/541) sidebar-nav(h 1197/1340) main(h 448/422) 없음:section-title |
| A-04_1920_Signed-in | 5/13 | global-search(x 640/328, w 640/1264) footer(y 1081/892, h 281/492) body(h 983/795) sidebar-nav(h 1322/1483) main(h 448/575) 없음:section-title,comment-editor |
| A-04_360_Signed-in | 0/11 | masthead(h 46/32) header(y 46/32) footer(y 711/990, h 312/746) body(y 112/97, h 599/893) main(y 124/121, h 575/845) 없음:global-search,section-title,comment-editor |
| A-05_1920_Guest | 3/10 | global-search(x 640/328, w 640/1264) footer(y 799/649, h 281/492) body(h 701/552) sidebar-nav(h 492/504) main(h 297/433) 없음:tabs |
| A-05_1920_Signed-in | 3/10 | global-search(x 640/328, w 640/1264) footer(y 799/649, h 281/492) body(h 701/552) sidebar-nav(h 492/669) main(h 297/444) 없음:tabs |
| A-06_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 1985/706, h 281/492) body(h 1887/609) sidebar-nav(h 492/504) main(h 1839/561) |
| A-05_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/848, h 312/746) body(y 112/97, h 592/751) main(y 260/121, h 297/703) 없음:global-search,tabs |
| A-05_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/848, h 312/746) body(y 112/97, h 592/751) main(y 260/121, h 297/703) 없음:global-search,tabs |
| A-06_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 2046/1886, h 312/746) body(y 112/97, h 1934/1789) main(y 124/121, h 1910/1741) 없음:global-search |
| A-06_1920_Signed-in | 3/9 | global-search(x 640/328, w 640/1264) footer(y 1985/777, h 281/492) body(h 1887/680) sidebar-nav(h 492/669) main(h 1839/561) |
| A-06_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 2046/1886, h 312/746) body(y 112/97, h 1934/1789) main(y 124/121, h 1910/1741) 없음:global-search |
| A-07_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/618, h 281/492) body(h 701/521) sidebar-nav(h 492/504) main(h 435/402) |
| A-07_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/616, h 312/746) body(y 112/97, h 592/519) main(y 158/121, h 501/471) 없음:global-search |
| A-07_1920_Signed-in | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/618, h 281/492) body(h 701/521) sidebar-nav(h 492/669) main(h 435/402) |
| A-08_1920_Guest | 5/12 | global-search(x 640/328, w 640/1264) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 330/356) |
| A-07_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/616, h 312/746) body(y 112/97, h 592/519) main(y 158/121, h 501/471) 없음:global-search |
| A-08_1920_Signed-in | 4/12 | global-search(x 640/328, w 640/1264) footer(y 1081/913, h 281/492) body(h 983/816) sidebar-nav(h 1322/1483) main(h 330/697) |
| A-08_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 704/533, h 312/746) body(y 112/97, h 592/436) main(y 155/121, h 507/388) 없음:global-search |
| A-09_1920_Guest | 3/10 | global-search(x 640/328, w 640/1264) footer(y 799/567, h 281/113) body(h 701/470) sidebar-nav(h 492/504) main(h 218/422) 없음:tabs |
| A-08_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 704/1335, h 312/746) body(y 112/97, h 592/1238) main(y 155/121, h 507/1190) 없음:global-search |
| A-09_1920_Signed-in | 3/10 | global-search(x 640/328, w 640/1264) footer(y 799/567, h 281/113) body(h 701/470) sidebar-nav(h 492/669) main(h 218/422) 없음:tabs |
| A-09_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/613, h 312/224) body(y 112/97, h 592/516) main(y 281/121, h 255/468) 없음:global-search,tabs |
| A-09_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 704/613, h 312/224) body(y 112/97, h 592/516) main(y 281/121, h 255/468) 없음:global-search,tabs |
| A-10_1920_Guest | 2/9 | global-search(x 640/328, w 640/1264) footer(y 1081/545, h 281/113) body(h 983/448) sidebar(w 296/264) sidebar-nav(y 166/121, w 296/264, h 1197/504) |
| A-10_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 718/582, h 312/224) body(y 112/97, h 606/485) main(y 124/121, h 582/437) 없음:global-search |
| A-10_1920_Signed-in | 2/9 | global-search(x 640/328, w 640/1264) footer(y 1081/545, h 281/113) body(h 983/448) sidebar(w 296/264) sidebar-nav(y 166/121, w 296/264, h 1322/669) |
| A-11_1920_Guest | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/545, h 281/113) body(h 701/448) sidebar-nav(h 492/504) main(h 415/324) 없음:section-title |
| A-11_1920_Signed-in | 3/9 | global-search(x 640/328, w 640/1264) footer(y 799/1158, h 281/113) body(h 701/1061) sidebar-nav(h 492/669) main(h 415/1013) 없음:section-title |
| A-10_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 718/622, h 312/224) body(y 112/97, h 606/525) main(y 124/121, h 582/477) 없음:global-search |
| G-01_1920_Guest | 3/10 | global-search(x 640/328, w 640/1264) footer(y 5099/1068, h 281/492) body(h 5001/971) sidebar-nav(h 492/504) main(h 4953/923) |
| A-11_360_Guest | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/469, h 312/224) body(y 112/97, h 592/372) main(y 194/121, h 429/324) 없음:global-search,section-title |
| A-11_360_Signed-in | 0/8 | masthead(h 46/32) header(y 46/32) footer(y 704/2209, h 312/224) body(y 112/97, h 592/2112) main(y 194/121, h 429/2064) 없음:global-search,section-title |
| G-01_360_Guest | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 5409/1224, h 312/746) body(y 112/97, h 5297/1127) main(y 124/121, h 5273/1079) 없음:global-search |
| G-01_1920_Signed-in | 3/10 | global-search(x 640/328, w 640/1264) footer(y 5099/1079, h 281/492) body(h 5001/982) sidebar-nav(h 492/669) main(h 4953/934) |
| G-01_360_Signed-in | 0/9 | masthead(h 46/32) header(y 46/32) footer(y 5409/1224, h 312/746) body(y 112/97, h 5297/1127) main(y 124/121, h 5273/1079) 없음:global-search |
| R-19_360_Guest | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 813/530, h 312/746) body(y 112/97, h 701/433) main(y 124/121, h 677/385) 없음:global-search |
| R-19_1920_Signed-in | 5/12 | global-search(x 640/277, w 640/1438) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1322/1483) main(h 503/353) |
| R-19_1920_Guest | 6/12 | global-search(x 640/277, w 640/1367) footer(y 1081/625, h 281/492) body(h 983/528) sidebar-nav(h 1197/1340) main(h 503/353) |
| R-19_360_Signed-in | 0/10 | masthead(h 46/32) header(y 46/32) footer(y 813/530, h 312/746) body(y 112/97, h 701/433) main(y 124/121, h 677/385) 없음:global-search |
| G-08b_1920_Signed-in | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/767, h 281/492) body(h 701/670) login-card(x 735/740, y 122/129, w 451/440, h 419/606) |
| G-08b_1920_Guest | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/767, h 281/492) body(h 701/670) login-card(x 735/740, y 122/129, w 451/440, h 419/606) |
| G-08c_1920_Guest | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/543, h 281/492) body(h 701/446) login-card(x 735/740, y 122/129, w 451/440, h 271/382) |
| G-08b_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/813, h 312/746) body(y 112/97, h 592/716) login-card(x 12/24, y 124/129, w 336/312, h 416/652) 없음:global-search |
| G-08b_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/813, h 312/746) body(y 112/97, h 592/716) login-card(x 12/24, y 124/129, w 336/312, h 416/652) 없음:global-search |
| G-08c_1920_Signed-in | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/543, h 281/492) body(h 701/446) login-card(x 735/740, y 122/129, w 451/440, h 271/382) |
| G-08c_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/566, h 312/746) body(y 112/97, h 592/469) login-card(x 12/24, y 124/129, w 336/312, h 294/405) 없음:global-search |
| G-08c_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/566, h 312/746) body(y 112/97, h 592/469) login-card(x 12/24, y 124/129, w 336/312, h 294/405) 없음:global-search |
| G-08d_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/792, h 312/746) body(y 112/97, h 592/695) login-card(x 12/24, y 124/129, w 336/312, h 192/631) 없음:global-search |
| G-08d_1920_Guest | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/792, h 281/492) body(h 701/695) login-card(x 735/740, y 122/129, w 451/440, h 195/631) |
| G-08d_1920_Signed-in | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/792, h 281/492) body(h 701/695) login-card(x 735/740, y 122/129, w 451/440, h 195/631) |
| G-08d_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/792, h 312/746) body(y 112/97, h 592/695) login-card(x 12/24, y 124/129, w 336/312, h 192/631) 없음:global-search |
| G-08e_1920_Signed-in | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/516, h 281/492) body(h 701/419) login-card(x 735/740, y 122/129, w 451/440, h 271/355) |
| G-08e_1920_Guest | 2/6 | global-search(x 640/328, w 640/1264) footer(y 799/516, h 281/492) body(h 701/419) login-card(x 735/740, y 122/129, w 451/440, h 271/355) |
| G-08e_360_Guest | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/539, h 312/746) body(y 112/97, h 592/442) login-card(x 12/24, y 124/129, w 336/312, h 294/378) 없음:global-search |
| G-08e_360_Signed-in | 0/7 | masthead(h 46/32) header(y 46/32) footer(y 704/539, h 312/746) body(y 112/97, h 592/442) login-card(x 12/24, y 124/129, w 336/312, h 294/378) 없음:global-search |