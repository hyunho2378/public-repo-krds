// 공공 깃랩 빈 상태 일러스트를 KRDS 토큰 색(회색 면 + 글자색 선)으로 다시 그린 것. 뜻을 돕는 그림이라 장식이 아니다.
export function EmptyArt({ kind = 'search' }) {
  return (
    <svg className="gl-art" viewBox="0 0 120 120" role="img" aria-label="" focusable="false">
      <circle cx="60" cy="60" r="60" className="gl-art-bg" />
      {kind === 'search' ? (
        <g className="gl-art-line"><circle cx="54" cy="54" r="22" /><path d="M70 70 L88 88" /><path d="M42 62 L62 42" /></g>
      ) : kind === 'label' ? (
        <g className="gl-art-line"><path d="M30 62 L58 34 H88 V64 L60 92 Z" /><circle cx="76" cy="46" r="4" /></g>
      ) : (
        <g className="gl-art-line"><rect x="32" y="34" width="56" height="52" rx="6" /><path d="M42 50 H78 M42 62 H78 M42 74 H64" /></g>
      )}
    </svg>
  );
}
