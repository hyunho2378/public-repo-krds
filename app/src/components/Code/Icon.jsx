// Figma: KRDS icon/* (Foundations / Iconography에서 SVG로 내보냄, public/icons/krds). 색은 글자색을 따른다.
const BASE = import.meta.env.BASE_URL || '/';

export function Icon({ name, label }) {
  const url = `url(${BASE}icons/krds/${name}.svg)`;
  return (
    <span
      className="rb-icon"
      style={{ WebkitMaskImage: url, maskImage: url }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
