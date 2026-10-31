// Figma: KRDS icon/*, 확장 icon-ext/* (Foundations / Iconography에서 SVG로 내보냄, public/icons/krds). 색은 글자색을 따른다.
const BASE = import.meta.env.BASE_URL || '/';

export function Icon({ name, label }) {
  // 'ext/이름'은 KRDS에 없는 공공 깃랩 아이콘(Pajamas, MIT)을 KRDS 규격으로 다시 그린 확장 아이콘(D-11 6장)
  const file = name.startsWith('ext/') ? name : `krds/${name}`;
  const url = `url(${BASE}icons/${file}.svg)`;
  return (
    <span
      className="rb-icon"
      data-icon={name}
      style={{ WebkitMaskImage: url, maskImage: url }}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}
