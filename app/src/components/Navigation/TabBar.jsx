// Figma: KRDS tab_bars__mo. KRDS 원문(컴포넌트 > 모바일 > 탭바) 지침: 하단 고정, 스크롤해도 숨기지 않음, 같은 너비,
// 아이콘과 레이블 함께, 선택 상태 명확(인디케이터와 글자 굵기), 홈은 맨 왼쪽, 5개 이내. 1023 이하에서만 보인다(D-03).
// KRDS 웹 코드에는 탭바 마크업이 없어 KRDS 변수와 공식 아이콘(svg)만으로 만든다.
import { NavLink } from 'react-router-dom';
import { t } from '../../copy/ko';

export const TAB_ITEMS = [
  { to: '/', label: t.TabBar_home, icon: 'home', end: true },
  { to: '/search', label: t.TabBar_find, icon: 'find' },
  { to: '/notifications', label: t.TabBar_alerts, icon: 'alerts' },
  { to: '/my', label: t.TabBar_my, icon: 'my' },
];

export function TabBar() {
  return (
    <nav className="rb-tabbar" aria-label={t.TabBar_label}>
      <ul>
        {TAB_ITEMS.map((item) => (
          <li key={item.to}>
            <NavLink to={item.to} end={item.end} className={({ isActive }) => 'rb-tab' + (isActive ? ' is-active' : '')}>
              <i className={`rb-tab-icon rb-tab-${item.icon}`} aria-hidden="true" />
              <span className="rb-tab-label">{item.label}</span>
            </NavLink>
          </li>
        ))}
      </ul>
    </nav>
  );
}
