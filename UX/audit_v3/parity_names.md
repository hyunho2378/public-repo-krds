# data-figma 이름 규칙(Figma 대 코드 전수 대조용)

- 코드 요소에 `data-figma="이름"`을 단다. 같은 이름이 여럿이면 문서 순서대로 이름, 이름#2, 이름#3으로 대조한다(Figma index 0, 1, 2)
- 이름은 Figma 레이어 이름과 1대1. 새 이름이 필요하면 Figma 작업자와 함께 정하고 이 표에 넣는다
- 담당: 화면 파일 담당자가 단다(C1: R-02~09, 25, 27~29 / C2: R-10~24, 26 / D21: 전역 틀, R-01, R-30, G, A, 로그인). Page 부품이 첫 h1에 page-head, 첫 h2에 section-title을 자동으로 단다

| 이름 | Figma 쓰는 화면 수 | 코드 쓰는 화면 수 | 코드에 없는 Figma 화면(일부) |
|---|---:|---:|---|
| body | 56 | 56 |  |
| breadcrumb | 50 | 42 | A-05, A-06, A-07, A-09, A-11, G-06, G-07, G-09, G-11 |
| checks | 1 | 1 |  |
| comment-editor | 1 | 0 | R-12 |
| commit-bar | 5 | 2 | A-02, A-04, R-03 |
| content-panel | 50 | 56 |  |
| diff-area | 1 | 0 | R-05 |
| diff-file | 1 | 0 | R-05 |
| extra-field | 0 | 1 |  |
| extra-field-filter | 0 | 1 |  |
| extra-reuse | 0 | 1 |  |
| file-table | 4 | 2 | A-02, A-04 |
| filters | 1 | 0 | G-02 |
| footer | 56 | 56 |  |
| gitlab-sidebar | 50 | 49 | A-01, G-02 |
| gl-filter | 12 | 8 | R-13, R-18, R-19, R-20 |
| gl-tabs | 7 | 9 | R-14, R-24 |
| global-search | 51 | 51 |  |
| header | 1 | 0 | R-26 |
| intro-card | 2 | 1 | A-02 |
| language-bar | 0 | 1 |  |
| login-card | 5 | 5 |  |
| login-divider | 5 | 1 | G-08b, G-08c, G-08d, G-08e |
| login-fact | 0 | 1 |  |
| login-field | 5 | 1 | G-08b, G-08c, G-08d, G-08e |
| login-join | 2 | 1 | G-08b |
| login-logo | 5 | 1 | G-08b, G-08c, G-08d, G-08e |
| login-notice | 5 | 1 | G-08b, G-08c, G-08d, G-08e |
| login-options | 2 | 1 | G-08b |
| main | 51 | 56 |  |
| notice-block | 5 | 1 | G-08b, G-08c, G-08d, G-08e |
| page-head | 33 | 25 | A-03, A-05, A-06, A-08, A-10, G-06, G-07, G-09, R-05, R-10, R-16, R-18 … |
| preview | 1 | 0 | R-03 |
| project-info | 3 | 1 | A-02, A-04 |
| project-row | 0 | 3 |  |
| readme | 3 | 1 | A-02, A-04 |
| repo-actions | 0 | 1 |  |
| repo-path | 1 | 0 | R-26 |
| repo-tabs | 1 | 0 | R-26 |
| results | 1 | 0 | G-02 |
| search | 1 | 0 | G-04 |
| section-title | 4 | 41 |  |
| sidebar-nav | 0 | 49 |  |
| steps | 1 | 0 | R-30 |
| system-band | 55 | 56 |  |
| tabbar | 1 | 0 | G-04 |
| tabs | 8 | 0 | A-05, A-09, G-01, G-04, G-06, G-07, R-17, R-27 |
| toolbar | 3 | 3 | A-02, A-04 |
| topbar | 50 | 51 |  |