// 한국어 줄바꿈 K2: 문구 안 '|'를 절 경계로 보고 덩어리(inline-block)로 나눠 렌더한다. 덩어리 안에서는 줄이 나뉘지 않는다.
// 문구 원본은 src/copy/ko.js. '|'가 없으면 그대로 돌려준다. 화면 제목(document.title)처럼 글만 필요하면 plain()을 쓴다.
export function plain(text) {
  return typeof text === 'string' ? text.replaceAll('|', '').replace(/\s{2,}/g, ' ').trim() : text;
}

export function phrase(text) {
  if (typeof text !== 'string' || !text.includes('|')) return text;
  const parts = text.split('|').map((s) => s.trim()).filter(Boolean);
  const out = [];
  parts.forEach((part, i) => {
    if (i) out.push(' ');
    out.push(
      <span className="rb-phrase" key={i}>
        {part}
      </span>,
    );
  });
  return out;
}
