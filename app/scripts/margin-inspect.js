// D-21 7장 여백 검사(페이지 안에서 실행). check-left-edges.mjs가 읽어 쓴다.
// 기준 = 본문 판 안 컨테이너(.rb-panel-in의 내용 상자). 검사:
//  1) 컨테이너 좌우 여백 대칭(판 왼쪽-컨테이너 왼쪽 = 컨테이너 오른쪽-판 오른쪽, 2px 안)
//  2) 왼쪽 끝: 경로, 첫 제목, 바닥글 구분선이 컨테이너 왼쪽과 같다
//  3) 오른쪽 끝: 목록 행, 프로젝트 정보 열, 바닥글이 컨테이너 오른쪽과 같다(넘지도, 판 끝에 붙지도 않는다)
//  4) 사이드바 아래 끝과 본문 판 아래 끝(화면에 보이는 판 바닥)이 같은 y(맨 아래로 스크롤했을 때)
(() => {
  const shown = (e) => { const r = e?.getBoundingClientRect(); return r && r.width > 0 && r.height > 0; };
  const panel = document.querySelector('.rb-panel');
  const inEl = document.querySelector('.rb-panel-in');
  if (!shown(panel) || !shown(inEl)) return { skip: true };
  const cs = getComputedStyle(inEl);
  const ir = inEl.getBoundingClientRect();
  const L = ir.left + parseFloat(cs.paddingLeft);
  const R = ir.right - parseFloat(cs.paddingRight);
  const pr = panel.getBoundingClientRect();
  const r1 = (n) => Math.round(n * 10) / 10;
  const bad = [];
  const ml = L - pr.left, mr = pr.right - R;
  if (Math.abs(ml - mr) > 2) bad.push(`좌우 여백 비대칭 ${r1(ml)} / ${r1(mr)}`);
  const left = [['경로', '.rb-panel-in .krds-breadcrumb-wrap'], ['제목', '#main h1'], ['바닥글', '#krds-footer']];
  for (const [n, sel] of left) { const e = document.querySelector(sel); if (shown(e) && Math.abs(e.getBoundingClientRect().left - L) > 2) bad.push(`${n} 왼쪽 ${r1(e.getBoundingClientRect().left)} (기준 ${r1(L)})`); }
  const right = [['목록 행', '.rb-prow'], ['프로젝트 정보', '.rb-repo-info'], ['바닥글', '#krds-footer'], ['파일 표', '.rb-tree-wrap']];
  for (const [n, sel] of right) { const e = document.querySelector(sel); if (shown(e) && Math.abs(e.getBoundingClientRect().right - R) > 2) bad.push(`${n} 오른쪽 ${r1(e.getBoundingClientRect().right)} (기준 ${r1(R)})`); }
  const side = document.querySelector('.rb-side');
  if (shown(side) && getComputedStyle(side).position !== 'fixed') {
    const sb = side.getBoundingClientRect().bottom, vb = Math.min(pr.bottom, innerHeight);
    if (Math.abs(sb - vb) > 2 && pr.bottom <= innerHeight + 1) bad.push(`사이드바 아래 ${r1(sb)} / 판 아래 ${r1(pr.bottom)}`);
  }
  return { L: r1(L), R: r1(R), ml: r1(ml), mr: r1(mr), cw: r1(R - L), bad };
})();
