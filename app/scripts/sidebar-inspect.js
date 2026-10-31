// 사이드바 computed 값이 UX/17 실측 명세(sidebar-spec.json)와 1px 이내인지 검사(페이지 안에서 실행).
// 사용: check-sidebar.mjs가 window.__SIDEBAR_SPEC에 명세를 넣고 이 파일을 evaluate. 결과 { bad: [...], n }
(() => {
  const S = window.__SIDEBAR_SPEC; const tol = S.tolerance; const bad = []; let n = 0;
  const side = document.querySelector('.rb-side'); if (!side) return { bad: ['사이드바 없음'], n };
  const sb = side.getBoundingClientRect(); const rail = side.classList.contains('is-rail');
  const R = (e) => { const b = e.getBoundingClientRect(); return { x: b.x - sb.x, y: b.y - sb.y, w: b.width, h: b.height }; };
  const eq = (name, got, want) => { n++; if (Math.abs(got - want) > tol) bad.push(`${name}: ${Math.round(got)} (명세 ${want})`); };
  const col = (name, got, want) => { n++; if (got !== want) bad.push(`${name}: ${got} (명세 ${want})`); };
  const vis = (e) => e && e.getBoundingClientRect().height > 0 && !e.closest('.rb-side-fold:not(.is-open)');
  col('바탕', getComputedStyle(side).backgroundColor, S.colors.bg);
  if (side.closest('.rb-shell.is-drawer') || innerWidth < 768) { const want = S.drawer[innerWidth]; if (want) eq('서랍 폭', sb.width, want); n++; if (innerWidth >= S.drawerBelow) bad.push(`서랍 모드인데 폭 ${innerWidth} (명세: ${S.drawerBelow} 미만만 서랍)`); return { bad, n }; }
  if (innerWidth < S.drawerBelow) { n++; bad.push(`폭 ${innerWidth}인데 서랍이 아님(명세: ${S.drawerBelow} 미만은 서랍)`); }
  eq('폭', sb.width, rail ? S.railWidth : S.width);
  // 목록이 넘치면 스크롤 막대 폭만큼 항목이 줄어든다(공공 깃랩도 224 → 209). 그 폭을 빼고 비교
  const sc = side.querySelector('.rb-side-scroll'); const sbw = sc ? sc.offsetWidth - sc.clientWidth : 0;
  const items = [...side.querySelectorAll('.rb-side-scroll .rb-side-link, .rb-side-scroll .rb-side-group-btn')].filter(vis);
  if (rail) {
    items.forEach((e, i) => { const b = R(e); eq(`열 항목${i} x`, b.x, S.rail.itemX); eq(`열 항목${i} 폭`, b.w, S.rail.item); eq(`열 항목${i} 높이`, b.h, S.rail.item);
      const ic = e.querySelector('.rb-icon'); if (ic && !e.classList.contains('rb-side-project')) eq(`열 항목${i} 아이콘 x`, R(ic).x, S.rail.iconX); });
    if (items[0]) eq('열 첫 항목 y', R(items[0]).y, S.rail.firstItemDy);
    return { bad, n };
  }
  const head = side.querySelector('.rb-side-title'); if (head) { const b = R(head); eq('머리 y', b.y, S.header.dy); eq('머리 높이', b.h, S.header.h);
    const pl = parseFloat(getComputedStyle(head).paddingLeft); eq('머리 글자 x', b.x + pl, S.header.textX); }
  if (items[0]) eq('첫 항목 y', R(items[0]).y, S.firstItemDy);
  items.forEach((e, i) => {
    const b = R(e); const nm = `${(e.textContent || '').trim().slice(0, 8)}`;
    eq(`${nm} x`, b.x, S.item.x); eq(`${nm} 폭`, b.w, S.item.w - sbw); eq(`${nm} 높이`, b.h, S.item.h); eq(`${nm} 모서리`, parseFloat(getComputedStyle(e).borderTopLeftRadius), S.item.radius);
    const txt = e.querySelector('.rb-side-text'); if (txt) eq(`${nm} 글자 x`, R(txt).x, e.classList.contains('rb-side-project') ? S.project.labelX : S.item.labelX);
    const icons = [...e.querySelectorAll(':scope > .rb-icon')];
    if (e.classList.contains('rb-side-project')) { const av = e.querySelector('.rb-avatar'); if (av) { eq(`${nm} 아바타 x`, R(av).x, S.project.avatarX); eq(`${nm} 아바타`, R(av).w, S.project.avatar); } }
    else if (icons[0]) { eq(`${nm} 아이콘 x`, R(icons[0]).x, S.item.iconX); eq(`${nm} 아이콘`, R(icons[0]).w, S.item.icon); }
    if (e.classList.contains('rb-side-group-btn') && icons[1]) eq(`${nm} 꺾쇠 x`, R(icons[1]).x, S.item.chevronX - sbw);
    const cs = getComputedStyle(e); if (!e.classList.contains('active') && !e.matches(':hover')) col(`${nm} 글자색`, cs.color, S.colors.text); else if (e.classList.contains('active')) col(`${nm} 현재 면`, cs.backgroundColor, S.colors.current);
    const next = items[i + 1]; if (next) { const d = R(next).y - b.y; const sep = next.closest('.rb-side-group.is-extra') !== e.closest('.rb-side-group.is-extra') || e.closest('.has-sep') !== next.closest('.has-sep');
      if (e.classList.contains('rb-side-project')) eq(`${nm} → 다음 간격`, d, S.project.pitchToNext); else if (!sep) eq(`${nm} → 다음 간격`, d, S.item.pitch); }
  });
  const foot = [...side.querySelectorAll('.rb-side-foot .rb-side-link')];
  if (foot[0]) eq('도움말 아래에서', sb.height - R(foot[0]).y, S.foot.helpFromBottom);
  if (foot[1]) eq('사이드바 접음 아래에서', sb.height - R(foot[1]).y, S.foot.collapseFromBottom);
  return { bad, n };
})();
