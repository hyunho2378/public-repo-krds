// 공개 아바타 그림을 쓴다. 없으면 머리글자를 둔다(사용자 결정 2026. 10. 30.).
// 주소가 상대 경로면 공공 저장소 주소를 붙인다. 그림을 못 불러오면 머리글자로 되돌린다.
import { useState } from 'react';

const GITLAB = 'https://gitlab.aigov.go.kr';

export function avatarUrl(raw) {
  if (!raw) return null;
  return /^https?:/.test(raw) ? raw : GITLAB + raw;
}

// 머리글자 타일 색(D-15 개정 2026. 10. 31.): 공공 깃랩처럼 타일마다 색이 다르다(id % 7, id가 없으면 이름 해시).
// KRDS 원색 50 단계 7색 + 흰 글자. 판(gray-95)과 행 호버(gray-90) 위 비텍스트 대비 3:1 이상, 글자 4.5:1 이상(UX/gitlab_compare/v2/measure.md 5절)
export function avatarTone(seed, name) {
  let n = Number.isFinite(seed) ? seed : 0;
  if (!Number.isFinite(seed)) for (const ch of String(name || '')) n = (n * 31 + ch.codePointAt(0)) >>> 0;
  return n % 7;
}

export function Avatar({ src, name, seed, className = '' }) {
  const [failed, setFailed] = useState(false);
  const url = avatarUrl(src);
  const letter = (name || '').trim().slice(0, 1).toUpperCase();
  const tone = avatarTone(seed, name);
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
  return <span className={`rb-avatar is-letter is-tone-${tone} ${className}`.trim()} aria-hidden="true">{letter}</span>;
}
