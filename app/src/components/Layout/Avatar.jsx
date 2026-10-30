// 공개 아바타 그림을 쓴다. 없으면 머리글자를 둔다(사용자 결정 2026. 10. 30.).
// 주소가 상대 경로면 공공 저장소 주소를 붙인다. 그림을 못 불러오면 머리글자로 되돌린다.
import { useState } from 'react';

const GITLAB = 'https://gitlab.aigov.go.kr';

export function avatarUrl(raw) {
  if (!raw) return null;
  return /^https?:/.test(raw) ? raw : GITLAB + raw;
}

export function Avatar({ src, name, className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = avatarUrl(src);
  const letter = (name || '').trim().slice(0, 1).toUpperCase();
  if (url && !failed) {
    return (
      <img
        className={`rb-avatar rb-avatar-img ${className}`.trim()}
        src={url}
        alt=""
        loading="lazy"
        onError={() => setFailed(true)}
      />
    );
  }
  return <span className={`rb-avatar ${className}`.trim()} aria-hidden="true">{letter}</span>;
}
