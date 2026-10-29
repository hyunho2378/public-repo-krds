// 한국어 줄바꿈 검사(design_rules K1~K4). 브라우저에서 실행하는 함수. check-responsive.mjs와 수동 검사에서 같이 쓴다.
// 대상: 제목, 문단, 목록, 레이블. 글 상자의 줄을 글자 단위 Range로 재서
//  - lastWord: 두 줄 이상인데 마지막 줄이 한 어절
//  - ratio: 두세 줄짜리에서 가장 짧은 줄 / 가장 긴 줄 < 0.5 (마지막 줄 포함)
//  - phraseSpace: 절 덩어리 사이 공백 누락
//  - midWord: 줄 끝이 공백이 아닌데 다음 줄 첫 글자와 같은 어절(어절 중간 끊김). 파일명, 주소(.rb-break-any 등)는 제외
export function inspectLines() {
  const SKIP = '.rb-break-any, code, pre, .rb-code, .sr-only, legend, [aria-hidden="true"], .rb-path, td a';
  const els = [...document.querySelectorAll('#root h1, #root h2, #root h3, #root p, #root li, #root label, #root dd, #root dt')];
  const issues = [];
  for (const el of els) {
    if (el.closest(SKIP) || !el.offsetParent) continue;
    if ([...el.querySelectorAll('*')].some((d) => !d.closest(SKIP) && /^(block|flex|grid|list-item|table)/.test(getComputedStyle(d).display))) continue;
    const text = [...(function* walk(n) { for (const c of n.childNodes) { if (c.nodeType === 3) { if (!c.parentElement.closest(SKIP)) yield c.data; } else yield* walk(c); } })(el)].join('');
    if (!text.trim()) continue;
    const walker = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    const chars = [];
    let index = 0;
    for (let node = walker.nextNode(); node; node = walker.nextNode()) {
      if (node.parentElement.closest(SKIP)) continue;
      const base = index;
      index += node.length;
      for (let i = 0; i < node.length; i++) {
        const r = document.createRange();
        r.setStart(node, i);
        r.setEnd(node, i + 1);
        const box = r.getClientRects()[0];
        if (box) chars.push({ c: node.data[i], at: base + i, top: Math.round(box.top), left: box.left, right: box.right });
      }
    }
    if (!chars.length) continue;
    const lines = [];
    for (const ch of chars) {
      const last = lines[lines.length - 1];
      if (!last || Math.abs(ch.top - last.top) > 4) lines.push({ top: ch.top, chars: [ch] });
      else last.chars.push(ch);
    }
    if (lines.length < 2) continue;
    const str = (l) => l.chars.map((c) => c.c).join('').trim();
    const width = (l) => l.chars[l.chars.length - 1].right - l.chars[0].left;
    const name = el.tagName.toLowerCase() + ': ' + text.trim().slice(0, 24);
    const lastLine = str(lines[lines.length - 1]);
    if (lastLine && !/\s/.test(lastLine) && lastLine.length <= 6) issues.push(['lastWord', name, lastLine]);
    if (lines.length <= 3) {
      const ws = lines.map(width);
      if (Math.min(...ws) / Math.max(...ws) < 0.5) issues.push(['ratio', name, ws.map(Math.round).join('/')]);
    }
    for (let i = 0; i < lines.length - 1; i++) {
      const endChar = lines[i].chars[lines[i].chars.length - 1];
      const startChar = lines[i + 1].chars[0];
      const between = text.slice(endChar.at + 1, startChar.at);
      if (!/\s/.test(between) && /[가-힣A-Za-z0-9]/.test(endChar.c) && /[가-힣A-Za-z0-9]/.test(startChar.c)) issues.push(['midWord', name, endChar.c + '|' + startChar.c]);
    }
  }
  // phraseSpace: 덩어리(.rb-phrase) 사이 공백이 사라졌는지(copy/ko.js 원문에서 '|'만 뺀 문장과 같아야 한다)
  for (const ph of document.querySelectorAll('#root .rb-phrase + .rb-phrase')) {
    const gap = ph.previousSibling;
    if (!gap || gap.nodeType !== 3 || gap.data !== ' ') issues.push(['phraseSpace', ph.parentElement.textContent.trim().slice(0, 24), ph.textContent.slice(0, 8)]);
  }
  return issues;
}
