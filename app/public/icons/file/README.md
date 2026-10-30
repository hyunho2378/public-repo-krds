# 파일 종류 아이콘 (공공 깃랩과 같은 것)

- 출처: @gitlab/svgs 3.171.0 `dist/file_icons/file_icons.svg` 스프라이트(https://unpkg.com/@gitlab/svgs@3.171.0/dist/file_icons/file_icons.svg)의 symbol 187개를 아이콘별 SVG로 풀었다. 파일 이름은 symbol id 그대로
- 라이선스: MIT, Copyright (c) GitLab B.V. (https://gitlab.com/gitlab-org/gitlab-svgs/-/blob/main/LICENSE)
- 대응 규칙: 같은 패키지 `src/file_icon_map.js`(GitLab 화면의 file_icon.vue가 쓰는 getIconForFile)를 app/src/lib/fileIcon.js에 그대로 옮겼다. 정확한 파일 이름(.gitignore, Dockerfile, package.json, LICENSE 등) → 세 겹/두 겹 확장자 → 확장자 순서, 없으면 'file'
- 색: 원본 색 그대로 둔다. 공공 깃랩 로고와 같은 팔레트 예외로, KRDS 색 규칙(D-15)의 예외는 이 폴더(app/public/icons/file/)만이다. audit:code와 팔레트 검사는 이 폴더와 img.rb-file-icon을 예외로 둔다
- 쓰는 곳: 프로젝트 홈 파일 표, 파일 트리, 폴더 보기 표, 파일 보기 머리, README 머리, 커밋 상세와 비교의 파일 목록과 파일 머리. 폴더는 확장 folder 아이콘
