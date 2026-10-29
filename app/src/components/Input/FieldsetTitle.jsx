// KRDS는 legend를 화면에서 숨긴다(.krds 공통). 화면 낭독용 legend와 눈에 보이는 제목을 함께 둔다.
export function FieldsetTitle({ children, className = 'krds-text-body-medium-bold' }) {
  return (
    <>
      <legend>{children}</legend>
      <p className={className} aria-hidden="true">{children}</p>
    </>
  );
}
