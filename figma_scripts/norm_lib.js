// 화면 변형 정리 함수 모음 (Figma 편집기 페이지 컨텍스트). 2026. 10. 30.
// 불러오기: await page.evaluate(src)  → window.__norm 생성. 새 탭을 열 때마다 다시 불러온다.
// 모든 함수는 변형 프레임(component set 의 자식) 또는 그 안의 바닥글 인스턴스를 받는다. 호출은 세트 3~6개씩 끊어서 한다(편집기 시간 초과).
// 예: await window.__norm.eachVariant('Screens / R 저장소', 0, 5, v => window.__norm.fix360(v));
window.__norm = (() => {
  const f = window.figma;
  const T1 = '서비스명(미정)', T2 = '공공 저장소 개선 시제품입니다. 공식 서비스가 아닙니다.', T4 = '본 화면은 행정안전부 범정부 UI/UX 디자인 시스템(KRDS, 공공누리 제1유형)을 이용하였습니다.';
  const setTxt = async (t, s) => { await f.loadFontAsync(t.fontName); t.characters = s; };
  const hide = n => { if (n) n.visible = false; }, show = n => { if (n) n.visible = true; };
  const L = {};

  // 바닥글: 코드(app/src/components/Identity/Footer.jsx)와 같은 구성. 숨김 = 관련 사이트, 운영기관 식별자, 정부 로고, 위치/전화, 유틸리티 링크, SNS, 추가영역(이미지)
  L.footerPC = async ftr => {
    for (const n of ftr.findAll(x => x.name === 'Related Site' || /^identifier/.test(x.name) || (x.name === 'logo' && x.type === 'INSTANCE') || x.name === 'Social media' || x.name === '위치정보' || x.name === '전화번호' || x.name === '유틸리티링크' || x.name === 'columns-1' || x.name === 'columns-3')) hide(n);
    show(ftr.findOne(x => x.name === 'fixed-con' && x.parent && x.parent.name === 'surface')); show(ftr.findOne(x => x.name === 'grid'));
    const c2 = ftr.findOne(x => x.name === 'columns-2'); show(c2);
    const infos = c2 ? c2.children.filter(x => x.name === '정보') : [];
    infos.forEach((x, i) => i === 0 ? show(x) : hide(x));
    if (infos[0]) { const ts = infos[0].findAll(x => x.type === 'TEXT'); if (ts[0]) await setTxt(ts[0], T1); if (ts[1]) await setTxt(ts[1], T2); }
    const cp = ftr.findOne(x => x.name === 'footer_copyright__atomic');
    if (cp) { show(cp.findOne(x => x.name === 'fixed-con')); await L._policy(cp); const cr = cp.findOne(x => x.name === 'copyright'); if (cr) { const t = cr.findOne(x => x.type === 'TEXT'); if (t) await setTxt(t, T4); try { cr.layoutSizingHorizontal = 'HUG'; } catch (e) {} } }
  };
  // 정책 줄: 앞 두 버튼만 "이용 안내", "KRDS 출처"
  L._policy = async cp => { const pol = cp.findOne(x => x.name === '정책'); if (!pol) return; const bs = pol.children.filter(x => x.name === 'button_text'); const labels = ['이용 안내', 'KRDS 출처']; for (let i = 0; i < bs.length; i++) { if (i < 2) { show(bs[i]); const t = bs[i].findOne(x => x.type === 'TEXT'); if (t) await setTxt(t, labels[i]); try { bs[i].layoutSizingHorizontal = 'HUG'; } catch (e) {} } else hide(bs[i]); } };
  // 모바일 바닥글(footer__mo): footer__mo > Related Site, content(logo/대한민국정부, content(columns-1~3), footer_copyright__atomic__mo(정책, 추가영역, copyright), identifier__mo)
  L.footerMO = async ftr => {
    hide(ftr.findOne(x => x.name === 'Related Site'));
    const content = ftr.children.find(x => x.name === 'content'); if (!content) return;
    for (const n of content.children) if (/^logo\//.test(n.name) || /^identifier/.test(n.name)) hide(n);
    const inner = content.children.find(x => x.name === 'content'); show(inner);
    if (inner) { hide(inner.children.find(x => x.name === 'columns-1')); hide(inner.children.find(x => x.name === 'columns-3')); const c2 = inner.children.find(x => x.name === 'columns-2'); show(c2);
      const infos = c2 ? c2.children.filter(x => x.name === '정보') : []; infos.forEach((x, i) => i === 0 ? show(x) : hide(x));
      if (infos[0]) { const ts = infos[0].findAll(x => x.type === 'TEXT'); if (ts[0]) await setTxt(ts[0], T1); if (ts[1]) await setTxt(ts[1], T2); } }
    const cp = content.children.find(x => x.name === 'footer_copyright__atomic__mo'); show(cp);
    if (cp) { await L._policy(cp); hide(cp.children.find(x => x.name === '추가영역')); const cr = cp.children.find(x => x.name === 'copyright'); if (cr) { const t = cr.findOne(x => x.type === 'TEXT'); if (t) await setTxt(t, T4); try { cr.layoutSizingHorizontal = 'FILL'; } catch (e) {} } }
  };
  // 360 공식 배너(두 줄 46)와 하단 탭바(기기 홈 막대 숨김, 72)
  L.mast360 = v => { const m = v.children.find(c => /^masthead/.test(c.name)); if (!m) return; try { m.layoutSizingVertical = 'HUG'; } catch (e) { m.resize(m.width, 46); } };
  L.tab360 = v => { const t = v.children.find(c => /^tab_bars/.test(c.name)); if (!t) return; hide(t.findOne(n => n.name === 'home_indicator__atomic')); try { t.layoutSizingVertical = 'HUG'; } catch (e) {} };
  // 세로 쌓기: 공식 배너, 머리글, 본문, 바닥글, 탭바. 계산하는 동안 세로 제약을 MIN으로 잠그고 끝나면 본문 STRETCH, 바닥글과 탭바 MAX
  L.restack = v => {
    const cs = ['masthead', 'app_header', 'Body', 'footer', 'tab_bars'].map(p => v.children.find(c => c.name.startsWith(p))).filter(Boolean);
    for (const c of cs) c.constraints = { horizontal: c.constraints.horizontal, vertical: 'MIN' };
    let y = 0; for (const c of cs) { c.y = y; y += Math.round(c.height); } v.resize(v.width, y);
    for (const c of cs) { const k = c.name === 'Body' ? 'STRETCH' : (/^footer|^tab_bars/.test(c.name) ? 'MAX' : 'MIN'); c.constraints = { horizontal: c.constraints.horizontal, vertical: k }; }
    return y;
  };
  // 360 저장소 화면 규칙: 제목 아래에 버튼 줄(Repo actions), 판단 정보(project_info)는 설명과 갱신일 바로 아래
  L.repo360 = async (v, auth) => {
    const main = v.findOne(n => n.name === 'Main content'); if (!main) return;
    const title = main.children.find(c => c.name === 'Repo title'); if (!title) return;
    const btnSet = await f.getNodeByIdAsync('305:2236'); const bvar = t => btnSet.children.find(c => c.name.includes('Type=' + t) && c.name.includes('Size=medium') && c.name.includes('State=default'));
    if (!main.children.find(c => c.name === 'Repo actions')) {
      const row = f.createFrame(); row.name = 'Repo actions'; row.layoutMode = 'HORIZONTAL'; row.fills = []; row.itemSpacing = 8; row.primaryAxisSizingMode = 'FIXED'; row.counterAxisSizingMode = 'AUTO';
      main.insertChild(main.children.indexOf(title) + 1, row); row.layoutSizingHorizontal = 'FILL';
      for (const [label, type] of [['관심 표시 24', 'secondary'], ['써 봤어요', 'primary'], ['더보기', 'tertiary']]) { const i = (bvar(type) || bvar('secondary')).createInstance(); const k = Object.keys(i.componentProperties).find(x => x.split('#')[0] === 'Label'); if (k) i.setProperties({ [k]: label }); i.name = 'button'; row.appendChild(i); }
    }
    const pi = main.children.find(c => c.name === 'project_info');
    if (pi) { const idx = Math.max(main.children.findIndex(c => c.name === 'updated'), main.children.findIndex(c => c.name === 'description'), main.children.findIndex(c => c.name === 'Repo actions')); main.insertChild(idx + 1, pi); try { pi.layoutSizingHorizontal = 'FILL'; } catch (e) {} }
  };
  // 360 변형 한 개에 전부(바닥글, 배너, 탭바, 저장소 규칙, 세로 쌓기)
  L.fix360 = async v => {
    const auth = /Signed-in/.test(v.name) ? 'Signed-in' : 'Guest';
    const ftr = v.children.find(c => /^footer__mo/.test(c.name)); if (ftr) await L.footerMO(ftr);
    L.mast360(v); L.tab360(v); await L.repo360(v, auth); return L.restack(v);
  };
  L.eachVariant = async (pageName, start, count, fn, bpFilter) => {
    const page = f.root.children.find(p => p.name === pageName); await page.loadAsync();
    const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] }).sort((a, b) => a.name.localeCompare(b.name)).slice(start, start + count);
    const out = []; for (const s of sets) for (const v of s.children) { if (bpFilter && !v.name.includes('breakpoint=' + bpFilter)) continue; out.push([s.name.slice(0, 6), v.name, await fn(v)]); } return out;
  };
  return L;
})();
