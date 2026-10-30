// D-18 4장: 도킹 패널. 화면 오른쪽 끝에 붙어 본문을 밀어내고(덮개 막 없음), 닫기 버튼과 Esc로 닫는다. 768 이하는 바텀시트.
// 지금은 정보를 담고, 이후 AI 도우미와 질문 창이 같은 자리와 같은 부품으로 들어온다.
import { IconButton } from '../Action/IconButton';
import { useEffect, useRef } from 'react';
import { u } from '../../copy/ui';
import { Icon } from '../Code/Icon';

export const DOCK_ID = 'rb-dock';

export function DockPanel({ open, onClose, title, slotRef }) {
  const closeBtn = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    closeBtn.current?.focus({ preventScroll: true });
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <aside id={DOCK_ID} className="rb-dock" role="complementary" aria-label={title}>
      <header className="rb-dock-head">
        <h2 className="krds-text-body-small-bold">{title}</h2>
        <IconButton buttonRef={closeBtn} icon="close" label={u.Dock_close} size="small" className="rb-dock-close" onClick={onClose} />
      </header>
      <div className="rb-dock-body" ref={slotRef} />
    </aside>
  );
}
