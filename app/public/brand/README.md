# 로고
- gitlab-logo.svg: 공공 깃랩(https://gitlab.aigov.go.kr) 머리글 로고를 SVG로 추출. 출처 gitlab-logo.source.html(2026. 10. 30. 확인)
- 색: #E24329, #FC6D26, #FCA326(로고 고유색, KRDS 팔레트 규칙의 예외)
- 사용: 머리글 왼쪽 서비스 이름 앞, 높이 24~32. 이름은 "공공 깃랩"

# 행정안전부 로고 (SVG)
- 출처: 행정안전부 누리집 기관소개 > 기관문양(MI) 내려받기(https://www.mois.go.kr/frt/sub/a07/miBanner/screen.do, 2026. 10. 30. 확인). 내려받은 공식 .ai(PDF 기반) 파일 '행정안전부_국_상하.ai', '행정안전부_국_좌우.ai'를 SVG로 변환(PyMuPDF), 여백 제거
- mois-logo.svg: 상하 조합(태극과 아래 글자), 80x88, 글자 색 #575756(정부회색)
- mois-logo-inline.svg: 같은 그림, 글자 부분만 currentColor. React에서 인라인으로 쓰고 어두운 화면에서는 글자 색을 밝게 지정
- mois-logo-horizontal*.svg: 좌우 조합 213x61
- 색: 정부청색 #023863, 정부적색 #e4042e, 정부회색 #575756, 태극 둘레 흰색 #ffffff. 로고 고유색은 KRDS 팔레트 규칙의 예외
- 사용: 로그인 화면 왼쪽 열(공공 깃랩 로그인과 같은 자리). 판(사각 배경)이나 흰 상자 위에 올리지 않고 어두운 화면에 그대로 올린다. 이전의 mois-login-logo.jpg(흰 배경 JPG)는 삭제
