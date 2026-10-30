// 아이콘 단독 버튼 공통 부품(UX-007). 크기는 짝수 두 가지: small 32x32(아이콘 20), medium 40x40(아이콘 24).
// 가운데 정렬은 inline-flex + center, 아이콘은 display block, 글자는 sr-only로 접근성 이름만 둔다. 호버/눌림은 회색 면, 초점은 바깥 outline.
import { Link } from 'react-router-dom';
import { Icon } from '../Code/Icon';

/** 메뉴(Menu)의 단추처럼 직접 button을 그리지 않는 곳에서 쓰는 class 문자열 */
export const iconBtnClass = (size = 'small', extra = '') => `krds-btn text rb-iconbtn is-${size} ${extra}`.trim();

export const IconButton = ({ icon, label, size = 'small', to, className = '', buttonRef, ...rest }) => {
  const cls = iconBtnClass(size, className);
  const inner = (<><Icon name={icon} /><span className="sr-only">{label}</span></>);
  if (to) return <Link className={cls} to={to} {...rest}>{inner}</Link>;
  return <button type="button" ref={buttonRef} className={cls} {...rest}>{inner}</button>;
};
