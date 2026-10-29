# UI 실행 규칙
- B형 반응형 웹이다. 주 퍼소나는 코딩을 모르는 공무원이다.
- 원본: KRDS v1.0.0, 공식 SCSS 직접 빌드 CSS + bridge다.
- 색: light와 high-contrast는 원본, dark는 D-01 생성 규칙이다. 시스템 설정 따르기는 접근성 고대비 선호를 우선하고 OS dark를 dark로 연결한다.
- 값: app/src/tokens.js는 의미 연결만 한다. 실제 값은 KRDS CSS 변수에서 온다.
- 간격 gap 1~12, padding 1~10, radius, typography, shadow 모두 KRDS 변수다. Tailwind 기본 팔레트와 크기 스케일은 비운다.
- 공식 키트의 구조 수치(rem, breakpoints, 1200 콘텐츠 폭)는 upstream 예외다. 우리 화면에 복사해 직접 수치를 만들지 않는다.
- 임의 애니메이션은 없다. reduced-motion, reduced-transparency, prefers-contrast를 처리한다.
- 데이터 상태: Ideal, Min, Max, Empty, Loading, Error를 명시한다. Min/Max는 데이터 변형이고 Loading은 클라이언트 요청 상태다.
- 검증: audit:code는 소스 패턴 검사만 한다. 통과가 접근성 검증을 뜻하지 않는다. Figma와 화면 상태별 검증은 후속이다.

## 한국어 줄바꿈 (K1~K5, 필수)
단어 중간 끊김 금지, 절 단위로 나눔, 마지막 줄 한 어절 금지, 위아래 줄 길이 균형, 폭마다 확인. 전문: krds-ui-kit/references/design_rules.md 끝, fullstack-product-setup/references/korean_linebreak.md
