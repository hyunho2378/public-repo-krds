// 한 화면의 왼쪽 선을 재는 함수 본문(페이지 안에서 실행). check-left-edges.mjs가 읽어 쓴다.
// 기준 E = 머리글 안쪽 컨테이너(.rb-gbar-in)의 왼쪽. 머리글 로고와 탭 줄은 화면 끝에서 시작하는 것이 GitHub와 같아 비교에서 뺀다.
// 같은 컨테이너 안 요소(바닥글 로고/링크/구분선/문장, 왼쪽 메뉴, 본문 제목/영역)의 왼쪽이 E와 2px 넘게 다르면 위반.
(() => {
  const E = document.querySelector('.rb-gbar-in')?.getBoundingClientRect().left;
  const shown = (e) => { const r = e?.getBoundingClientRect(); return r && r.width > 0 && r.height > 0; };
  const textLeft = (el) => {
    const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
    for (let n = w.nextNode(); n; n = w.nextNode()) {
      if (!n.textContent.trim()) continue;
      const rg = document.createRange();
      rg.selectNodeContents(n);
      const q = rg.getClientRects()[0];
      if (q) return q.left;
    }
    return el.getBoundingClientRect().left;
  };
  const items = [];
  const add = (name, el, text) => { if (shown(el)) items.push([name, Math.round(((text ? textLeft(el) : el.getBoundingClientRect().left)) * 10) / 10]); };
  add('바닥글 로고', document.querySelector('#krds-footer .rb-f-logo svg'));
  add('바닥글 구분선', document.querySelector('#krds-footer .f-btm'));
  add('바닥글 문장', document.querySelector('#krds-footer .f-copy'), true);
  const side = document.querySelector('.rb-side');
  // 좁은 폭에서는 왼쪽 메뉴가 화면 밖 서랍이라 비교에서 뺀다
  if (shown(side) && getComputedStyle(side).position !== 'fixed' && side.getBoundingClientRect().right > 0) add('왼쪽 메뉴', side);
  else if (shown(side)) { /* 서랍 */ }
  else {
    const main = document.querySelector('#main');
    // 로그인/오류/가입 화면은 가운데 정렬 구성이라 본문 비교에서 뺀다
    if (/^\/(login|register|password|error)/.test(location.pathname.replace(/^\/public-repo-krds/, ''))) return { E: Math.round(E * 10) / 10, items, bad: [] };
    const h = [...(main?.querySelectorAll('h1') || [])].find(shown);
    if (h) add('본문 제목', h);
    add('본문 영역', main?.querySelector('.rb-code-area, .rb-repo-main > *, .rb-main > *'));
    add('저장소 제목 줄', document.querySelector('.rb-repo-head'));
  }
  // D-19 3장: 목록 항목 글자는 목록(구분선) 왼쪽과 같아야 한다
  const lst = document.querySelector('.krds-structured-list.rb-list:not(.rb-cards)');
  const tit = lst?.querySelector('.c-tit');
  if (shown(lst) && shown(tit)) { const base = lst.getBoundingClientRect().left; const l = textLeft(tit); if (Math.abs(l - base) > 2) items.push(['목록 항목 글자(구분선 기준 ' + Math.round(base * 10) / 10 + ')', l - base + E]); }
  const bad = items.filter(([, l]) => Math.abs(l - E) > 2).map(([n, l]) => `${n} ${l} (기준 ${Math.round(E * 10) / 10})`);
  return { E: Math.round(E * 10) / 10, items, bad };
})()
