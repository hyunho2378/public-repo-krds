// 필터 막대 안 검색 단추(공공 깃랩 돋보기, 32x32). Figma 이름: filter-search
import { Icon } from '../../components/Code/Icon';

export function FilterSearch({ label }) {
  return (
    <button type="button" className="gl-filter-search" data-figma="filter-search" aria-label={label} tabIndex={-1}>
      <Icon name="search" />
    </button>
  );
}
