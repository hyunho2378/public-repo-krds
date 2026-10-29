// Figma: KRDS critical_alerts. 점검 공지는 모든 화면 머리글 아래(불편 15).
export function NoticeBanner({ message }) {
  if (!message) return null;
  return (
    <aside className="rb-notice" role="status" data-krds="critical_alert">
      <div className="inner">{message}</div>
    </aside>
  );
}
