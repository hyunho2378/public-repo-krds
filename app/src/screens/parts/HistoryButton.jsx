// 최근 검색 단추(공공 깃랩: 시계 아이콘 + 아래 꺾쇠). Figma 이름: history, arrow-down
import { Icon } from '../../components/Code/Icon';

export function HistoryButton({ label, onClick }) {
  return (
    <button type="button" className="krds-btn text gl-history-btn" aria-label={label} onClick={onClick}>
      <Icon name="ext/history" /><Icon name="arrow-down" />
    </button>
  );
}
