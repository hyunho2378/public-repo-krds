// D-08 앱 틀 생성기(Figma 편집기 페이지 컨텍스트, window.figma). 2026. 10. 30. Figma 화면 갈래
// 사용: 이 파일 내용을 page.evaluate로 실행 → window.f = window.figma; window.H = window.__H; await H.init();
// 주의: 일부 함수는 전역 f, H를 참조하므로 실행 전 window.f, window.H 지정 필요. H.IC(아이콘 이름→id)는 Foundations / Iconography에서 다시 읽어 넣는다.
window.f = window.figma; const H = window.__H = window.__H || {}; window.H = H;
H.init = async () => {
    const vs = await f.variables.getLocalVariablesAsync(); const cols = await f.variables.getLocalVariableCollectionsAsync();
    H.cols = Object.fromEntries(cols.map(c => [c.name, c])); const cn = Object.fromEntries(cols.map(c => [c.id, c.name]));
    H.V = {}; for (const v of vs) H.V[cn[v.variableCollectionId] + ':' + v.name] = v;
    H.S = Object.fromEntries((await f.getLocalTextStylesAsync()).map(s => [s.name, s]));
    for (const st of ['Regular','Bold','SemiBold','Medium']) { try { await f.loadFontAsync({ family: 'Pretendard GOV', style: st }); } catch (e) {} }
    H.sets = {}; for (const [k, id] of Object.entries({ button: '305:2236', button_text: '300:26102', modal: '1037:37636', alert: '343:54539', spinner: '343:42756', sheet: '1545:35095', step: '343:53899', badge: '361:44254', info: '343:54598' })) H.sets[k] = await f.getNodeByIdAsync(id);
    H.stepmo = await f.getNodeByIdAsync('343:53986');
    return true;
  };

H.v = (n, c = 'mode') => H.V[c + ':' + n] || H.V['semantic:' + n] || H.V['primitive:' + n] || H.V['responsive:' + n];

H.paint = (name) => f.variables.setBoundVariableForPaint({ type: 'SOLID', color: { r: 0, g: 0, b: 0 } }, 'color', H.v(name));

H.text = async (s, style = 'body/medium', color = 'color/text/basic', name) => { const t = f.createText(); await t.setTextStyleIdAsync(H.S[style].id); t.characters = s; t.fills = [H.paint(color)]; t.name = name || s.slice(0, 40); t.textAutoResize = 'HEIGHT'; return t; };

H.frame = (name, dir = 'VERTICAL', gap = 'gap/3', pad) => { const fr = f.createFrame(); fr.name = name; fr.layoutMode = dir; fr.fills = []; fr.primaryAxisSizingMode = 'AUTO'; fr.counterAxisSizingMode = 'AUTO'; if (gap) fr.setBoundVariable('itemSpacing', H.v(gap)); if (pad) for (const k of ['paddingTop','paddingBottom','paddingLeft','paddingRight']) fr.setBoundVariable(k, H.v(pad)); return fr; };

H.variant = (set, props) => set.children.find(c => Object.entries(props).every(([k, v]) => c.name.split(', ').includes(k + '=' + v)));

H.setProp = (inst, base, val) => { const k = Object.keys(inst.componentProperties).find(x => x.split('#')[0] === base); if (k) inst.setProperties({ [k]: val }); };

H.btn = (label, Type = 'primary', Size = 'large') => { const c = H.variant(H.sets.button, { Type, Size, State: 'default' }); const i = c.createInstance(); H.setProp(i, 'Label', label); i.name = 'button'; return i; };

H.tbtn = (label, Size = 'medium') => { const c = H.variant(H.sets.button_text, { Size, State: 'default' }); const i = c.createInstance(); H.setProp(i, 'label', label); i.name = 'button_text'; return i; };

H.fill = (n) => { n.layoutSizingHorizontal = 'FILL'; return n; };

H.place = (sec, fr, row) => { /* row: y 위치 기준 */ };

H.sectionOf = (n) => { let s = n; while (s && s.type !== 'SECTION') s = s.parent; return s; };

H.topFrame = (n) => { let s = n; while (s.parent && s.parent.type !== 'SECTION') s = s.parent; return s; };

H.nextY = (sec) => Math.max(...sec.children.map(c => c.y + c.height)) + 200;

H.fit = (sec) => { let mx = 0, my = 0; for (const c of sec.children) { mx = Math.max(mx, c.x + c.width); my = Math.max(my, c.y + c.height); } sec.resizeWithoutConstraints(mx + 80, my + 80); };

H.clone = (base, newName, x, y) => { const c = base.clone(); base.parent.appendChild(c); c.name = newName; c.x = x; c.y = y; return c; };

H.main = (fr) => fr.findOne(n => n.name === 'Main content');

H.trimAfter = (main, keepFn) => { const kids = [...main.children]; let cut = -1; kids.forEach((k, i) => { if (keepFn(k)) cut = i; }); kids.slice(cut + 1).forEach(k => k.remove()); };

H.dim = (fr) => { const r = f.createRectangle(); fr.appendChild(r); r.layoutPositioning = 'ABSOLUTE'; r.name = 'dim'; r.x = 0; r.y = 0; r.resize(fr.width, fr.height); r.fills = [H.paint('color/background/dim')]; r.constraints = { horizontal: 'STRETCH', vertical: 'STRETCH' }; return r; };

H.overlay = (fr, node, mode = 'center') => { fr.appendChild(node); node.layoutPositioning = 'ABSOLUTE'; if (mode === 'center') { node.x = Math.round((fr.width - node.width) / 2); node.y = Math.max(240, Math.round(Math.min(fr.height, 1080) / 2 - node.height / 2)); } else if (mode === 'bottom') { node.x = 0; node.y = fr.height - node.height; } return node; };

H.steps = async (labels, current, w) => {
    const wrap = H.frame('Steps', 'VERTICAL', 'gap/3');
    const now = await H.text(`${current + 1}/${labels.length}단계 ${labels[current]}`, 'body/medium-bold', 'color/text/basic', 'rb-step-current'); wrap.appendChild(now);
    if (w >= 1024) {
      const set = await f.getNodeByIdAsync('343:53899'); const i = H.variant(set, { Type: 'full' }).createInstance(); i.name = 'step_indicator__pc';
      const props = {}; for (const k of Object.keys(i.componentProperties)) { const b = k.split('#')[0]; const m = b.match(/^Step(\d)$/); if (m) props[k] = +m[1] <= labels.length; const l = b.match(/^↪️(\d)-label$/); if (l && labels[+l[1] - 1]) props[k] = labels[+l[1] - 1]; }
      i.setProperties(props);
      const atoms = i.findAll(n => n.type === 'INSTANCE' && n.name === 'step_indicator__atomic');
      atoms.slice(0, labels.length).forEach((a, idx) => a.setProperties({ State: idx < current ? 'completion' : idx === current ? 'ongoing' : 'before', 'Last-item': idx === labels.length - 1 ? 'true' : 'fale' }));
      wrap.appendChild(i); H.fill(i);
    } else {
      const m = (await f.getNodeByIdAsync('343:53986')).createInstance(); m.name = 'step_indicator__mo';
      const atoms = m.children.filter(n => n.type === 'INSTANCE');
      atoms.forEach((a, idx) => { if (idx >= labels.length) a.visible = false; else a.setProperties({ State: idx < current ? 'completion' : idx === current ? 'ongoing' : 'before', 'Last-item': idx === labels.length - 1 ? 'true' : 'fale' }); });
      wrap.appendChild(m); H.fill(m);
    }
    now.layoutSizingHorizontal = 'FILL';
    return wrap;
  };

H.resp = (c, w) => {
    c.resize(w, c.height); c.primaryAxisSizingMode = 'AUTO'; c.counterAxisAlignItems = 'CENTER';
    for (const k of c.children) { if (k.name === 'Main content') { k.layoutSizingHorizontal = 'FILL'; k.maxWidth = 1248; } else if (k.layoutPositioning !== 'ABSOLUTE') { try { k.layoutSizingHorizontal = 'FILL'; } catch (e) {} } }
    const walk = n => { if (n !== c && 'layoutSizingHorizontal' in n && n.layoutSizingHorizontal === 'FIXED' && Math.round(n.width) >= 1088 && n.parent && n.parent.layoutMode && n.parent.layoutMode !== 'NONE') { try { n.layoutSizingHorizontal = 'FILL'; } catch (e) {} } if (n.children) n.children.forEach(walk); };
    walk(c);
  };

H.respPad = async (c) => {
    const m = c.children.find(k => k.name === 'Main content'); const pv = m.boundVariables?.paddingLeft; const v = pv ? await f.variables.getVariableByIdAsync(pv.id) : H.v('padding/8', 'semantic');
    const targets = []; const hdr = c.children.find(k => k.name === 'Official KRDS header'); if (hdr) { for (const k of hdr.children) if (k.type === 'INSTANCE') targets.push(k.name === 'main_menu' ? k.children[0] : k); }
    const ft = c.children.find(k => k.name === 'footer__pc'); if (ft) { const s = ft.findOne(x => x.name === 'surface'); if (s) targets.push(s); const r = ft.findOne(x => x.name === 'Related Site'); if (r) targets.push(r); }
    for (const t of targets) { try { t.setBoundVariable('paddingLeft', v); t.setBoundVariable('paddingRight', v); } catch (e) {} }
    return targets.length;
  };

H.lines = async (t) => { const ls = await old(t); return ls.map(s => s.replace(/&#(\d+);/g, (_, d) => String.fromCodePoint(+d)).replace(/\n$/, '')); };

H.checkLines = (text, ls) => {
    const v = []; if (ls.length < 2) return v; let pos = 0;
    for (let i = 0; i < ls.length - 1; i++) { pos += ls[i].length; if (text[pos] === '\n') { pos++; continue; } const b = text[pos - 1], a = text[pos]; if (b && a && !/\s/.test(b) && !/\s/.test(a) && !/[\/\-_.(]/.test(b)) v.push('K1'); while (text[pos] === ' ') pos++; }
    const last = ls[ls.length - 1].trim(); if (last && !/\s/.test(last)) v.push('K3');
    if (ls.length <= 3) { const lens = ls.map(s => s.trim().length); if (Math.min(...lens) < Math.max(...lens) * 0.5) v.push('K4'); }
    return [...new Set(v)];
  };

H.balance = (text, nLines, cap) => {
    const words = text.split(' '); if (words.length < 2) return null;
    let best = null;
    const score = (lines) => { const lens = lines.map(l => l.length); if (Math.max(...lens) > cap) return Infinity; if (lines[lines.length - 1].split(' ').length < 2 && words.length >= nLines * 2) return Infinity; const mx = Math.max(...lens), mn = Math.min(...lens); let s = mx - mn; lines.slice(0, -1).forEach(l => { if (/[,.)\/]$/.test(l)) s -= 3; }); return s; };
    const rec = (start, k, acc) => { if (k === 1) { const l = words.slice(start).join(' '); const lines = [...acc, l]; const sc = score(lines); if (!best || sc < best.sc) best = { sc, lines }; return; } for (let i = start + 1; i <= words.length - (k - 1); i++) rec(i, k - 1, [...acc, words.slice(start, i).join(' ')]); };
    if (words.length > 40) return null; rec(0, nLines, []);
    return best && best.sc !== Infinity ? best.lines.join('\n') : null;
  };

H.comp = async id => f.getNodeByIdAsync(id);

H.hmenu = async (label, icon) => { const set = await H.comp('322:41847'); const i = H.variant(set, { Type: 'horizontal', State: 'default' }).createInstance(); const p = {}; for (const k of Object.keys(i.componentProperties)) { const b = k.split('#')[0]; if (b === 'Lable') p[k] = label; if (b === 'Icon' && icon) p[k] = IC[icon]; } i.setProperties(p); i.name = 'header_menu__atomic'; return i; };

H.divBottom = (fr) => { fr.strokes = [H.paint('color/divider/gray-light')]; fr.strokeTopWeight = 0; fr.strokeLeftWeight = 0; fr.strokeRightWeight = 0; fr.setBoundVariable('strokeBottomWeight', H.v('border-width/static-regular')); };

H.appHeader = async (w, signedIn) => {
    const hd = H.frame('App header', 'HORIZONTAL', 'gap/5'); hd.counterAxisAlignItems = 'CENTER'; hd.fills = [H.paint('color/surface/white')];
    for (const k of ['paddingTop', 'paddingBottom']) hd.setBoundVariable(k, H.v('padding/3', 'semantic')); for (const k of ['paddingLeft', 'paddingRight']) hd.setBoundVariable(k, H.v(w >= 1024 ? 'padding/8' : 'padding/5', 'semantic'));
    H.divBottom(hd);
    if (w < 1024) { hd.appendChild(await H.hmenu('메뉴', 'icon/menu')); }
    const sid = (await H.comp('11054:305676')).createInstance(); hd.appendChild(sid);
    if (w >= 1024) hd.appendChild(await H.hmenu('탐색', 'icon/view_all'));
    const sw = H.frame('Global search', 'HORIZONTAL', null); hd.appendChild(sw); sw.layoutGrow = 1; sw.primaryAxisAlignItems = 'CENTER'; sw.counterAxisAlignItems = 'CENTER';
    if (w >= 768) { const ti = H.variant(await H.comp('286:25890'), { Size: 'medium', State: 'default' }).createInstance(); const p = {}; for (const [k, v] of Object.entries(ti.componentProperties)) { const b = k.split('#')[0].replace('↪️', ''); if (v.type === 'TEXT' && b === 'Placeholder') p[k] = '검색 또는 이동...  /'; if (v.type === 'BOOLEAN' && (b === 'Label' || b === 'Hint')) p[k] = false; } ti.setProperties(p); ti.name = 'Global search input'; sw.appendChild(ti); ti.layoutSizingHorizontal = 'FILL'; ti.maxWidth = 640; }
    else { sw.primaryAxisAlignItems = 'MAX'; sw.appendChild(await H.hmenu('검색', 'icon/search')); }
    const right = H.frame('Header actions', 'HORIZONTAL', 'gap/3'); right.counterAxisAlignItems = 'CENTER'; hd.appendChild(right);
    if (signedIn) { right.appendChild(await H.hmenu('알림', 'icon/system-info')); right.appendChild(await H.hmenu('도구 올리기', 'icon/upload')); right.appendChild(await H.hmenu('내 계정', 'icon/myinfo')); }
    else if (w >= 768) { right.appendChild(await H.hmenu('계정 만들기', 'icon/join')); right.appendChild(await H.hmenu('로그인', 'icon/login')); }
    else right.appendChild(await H.hmenu('로그인', 'icon/login'));
    return hd;
  };

H.shell = async ({ scr, state, w, mode = 'light', signedIn = false, side = null, x = 0, y = 0, sec }) => {
    const fr = f.createFrame(); sec.appendChild(fr); fr.name = `${scr} / ${state} / ${w} / ${mode}`; fr.x = x; fr.y = y; fr.resize(w, 100);
    fr.layoutMode = 'VERTICAL'; fr.primaryAxisSizingMode = 'AUTO'; fr.counterAxisSizingMode = 'FIXED'; fr.fills = [H.paint('color/background/white')];
    const ms = (await H.comp(w >= 1024 ? '343:54100' : '343:54218')).createInstance(); fr.appendChild(ms); H.fill(ms); ms.fills = [H.paint('color/surface/gray-subtler')];
    const fl = ms.findOne(x => x.name === 'icon/flag'); if (fl) fl.visible = false; const mt = ms.findOne(x => x.type === 'TEXT'); await f.loadFontAsync(mt.fontName); mt.characters = '이 누리집은 공공 저장소 개선 시제품입니다. 공식 전자정부 누리집이 아닙니다.'; if (w < 1024) { try { const pf = ms.findOne(x => x.name === '공식누리집 문구'); pf.layoutSizingHorizontal = 'FILL'; mt.layoutSizingHorizontal = 'FILL'; mt.textAutoResize = 'HEIGHT'; } catch (e) {} }
    const hd = await H.appHeader(w, signedIn); fr.appendChild(hd); H.fill(hd);
    const body = H.frame('Body', 'HORIZONTAL', w >= 1024 ? 'gap/9' : null); fr.appendChild(body); H.fill(body);
    for (const k of ['paddingTop', 'paddingBottom']) body.setBoundVariable(k, H.v('padding/8', 'semantic')); for (const k of ['paddingLeft', 'paddingRight']) body.setBoundVariable(k, H.v(w >= 1024 ? 'padding/8' : 'padding/5', 'semantic'));
    let sideFr = null; if (side && w >= 1024) { sideFr = H.frame('Sidebar', 'VERTICAL', 'gap/5'); body.appendChild(sideFr); sideFr.resize(w >= 1440 ? 296 : 248, 10); sideFr.counterAxisSizingMode = 'FIXED'; sideFr.layoutSizingVertical = 'HUG'; }
    const main = H.frame('Main content', 'VERTICAL', 'gap/6'); body.appendChild(main); main.layoutGrow = 1; main.layoutSizingVertical = 'HUG';
    
    return { fr, main, side: sideFr, body };
  };

H.footer = async (fr, w) => { const ft = (await H.comp(w >= 1024 ? '340:30856' : '1548:41060')); const node = ft.type === 'COMPONENT_SET' ? ft.children[0] : ft; const i = node.createInstance(); fr.appendChild(i); H.fill(i); for (const lg of i.findAll(x => x.type === 'INSTANCE' && /^logo\//.test(x.name))) lg.visible = false; if (w < 1024) { const tb = (await H.comp('4932:97639')).createInstance(); } return i; };

H.addFooter = (fr, w) => { const c = H.footerSrc[w >= 1024 ? 1920 : 360].clone(); fr.appendChild(c); H.fill(c); if (w < 1024) { const t = H.tabbarSrc.clone(); fr.appendChild(t); H.fill(t); } };

H.clean = d => (d || '').replace(/^\s*\[[^\]]+\]\s*/, '').split(/\r?\n/)[0].trim();

H.priv = (o) => { if (o) { const t = o.trim().split(/\s+/); if (t.every(s => /^[가-힣]+$/.test(s)) && t.join('').length <= 4 && !/(청|처|부|과|팀|실|원|소|서|국|교|회|단|시|군|구|도)$/.test(t[t.length - 1])) return '기관 확인 필요'; } return oldPriv(o); };

H.resultRow = async (it) => {
    const row = H.frame('Result row', 'VERTICAL', 'gap/3'); for (const k of ['paddingTop', 'paddingBottom']) row.setBoundVariable(k, H.v('padding/6', 'semantic')); H.divBottom(row);
    const tl = H.frame('Title line', 'HORIZONTAL', 'gap/2'); tl.counterAxisAlignItems = 'BASELINE'; tl.layoutWrap = 'WRAP'; row.appendChild(tl);
    const org = await H.text(H.priv(it.organization) + ' /', 'body/large', 'color/text/subtle', 'organization'); tl.appendChild(org); org.textAutoResize = 'WIDTH_AND_HEIGHT';
    const nm = await H.text(it.name, 'body/large-bold', 'color/text/primary', 'name'); tl.appendChild(nm); nm.textAutoResize = 'WIDTH_AND_HEIGHT';
    const dsc = H.clean(it.description); const d = await H.text(dsc || '제작자가 하는 일을 아직 적지 않았습니다.', 'body/medium', dsc ? 'color/text/basic' : 'color/text/subtle', 'description'); row.appendChild(d); d.maxLines = 2; d.textTruncation = 'ENDING';
    const fields = (it.classification?.fields || []).map(x => x.name); const tagSet = await H.comp('306:26553');
    if (fields.length) { const tags = H.frame('Topics', 'HORIZONTAL', 'gap/2'); tags.counterAxisAlignItems = 'CENTER'; row.appendChild(tags); for (const fl of fields.slice(0, 3)) { const tg = H.variant(tagSet, { Type: 'button', Size: 'small', State: 'default' }).createInstance(); H.setProp(tg, 'Label', fl); tags.appendChild(tg); } if (fields.length > 3) tags.appendChild(await H.text(`+${fields.length - 3}개`, 'body/small', 'color/text/subtle', 'more')); }
    const meta = await H.text(`실행 환경 확인 필요${it.last ? ' / ' + it.last.replaceAll('-', '. ') + '. 갱신' : ''}`, 'body/small', 'color/text/subtle', 'meta'); row.appendChild(meta);
    return row;
  };

H.filterGroup = async (title, opts) => { const cbSet = await H.comp('306:26713'); const g = H.frame('Filter group / ' + title, 'VERTICAL', 'gap/3'); g.appendChild(await H.text(title, 'body/medium-bold', 'color/text/basic', title)); for (const [l, n] of opts) { const row = H.frame('Filter option', 'HORIZONTAL', 'gap/3'); row.counterAxisAlignItems = 'CENTER'; const cb = H.variant(cbSet, { Size: 'medium', Select: 'off', State: 'default' }) || cbSet.children[0]; row.appendChild(cb.createInstance()); const t = await H.text(l, 'body/medium', 'color/text/basic', l); row.appendChild(t); t.layoutGrow = 1; row.appendChild(await H.text(String(n), 'body/small', 'color/text/subtle', 'count')); g.appendChild(row); H.fill(row); } return g; };

H.setDark = async (fr) => { const col = H.cols['mode']; const m = col.modes.find(x => x.name === 'dark'); fr.setExplicitVariableModeForCollection(col, m.modeId); };

H.tagFix = (root) => { for (const tg of root.findAll(x => x.type === 'INSTANCE' && x.name === 'tag')) { const lk = Object.keys(tg.componentProperties).find(z => z.split('#')[0] === 'Label'); const p = {}; for (const k of Object.keys(tg.componentProperties)) { const b = k.split('#')[0]; if (b === 'Link-label') p[k] = tg.componentProperties[lk].value; if (b === 'Delete') p[k] = false; } tg.setProperties(p); try { tg.layoutSizingHorizontal = 'HUG'; } catch (e) {} } };

H.statusBlock = async (state, w, opts = {}) => {
    if (state === 'Loading') { const b = H.frame('Status / Loading', 'HORIZONTAL', 'gap/3'); for (const k of ['paddingTop', 'paddingBottom']) b.setBoundVariable(k, H.v('padding/8', 'semantic')); b.counterAxisAlignItems = 'CENTER'; b.appendChild(H.variant(H.sets.spinner, { Size: 'medium' }).createInstance()); b.appendChild(await H.text('자료를 불러오고 있습니다.', 'body/medium', 'color/text/subtle', 'Status_1')); return b; }
    const b = H.frame('Status / ' + state, 'VERTICAL', 'gap/4'); for (const k of ['paddingTop', 'paddingBottom']) b.setBoundVariable(k, H.v('padding/8', 'semantic'));
    const add = async (s, st, c, n) => { const t = await H.text(s, st, c, n); b.appendChild(t); t.layoutSizingHorizontal = 'FILL'; };
    if (state === 'Error') { await add('자료를 불러오지 못했습니다.', 'heading/medium', 'color/text/basic', 'Status_3'); await add('잠시 후 다시 시도해 주세요.', 'body/medium', 'color/text/subtle', 'Status_5'); }
    if (state === 'Empty') { await add(opts.title, 'heading/small', 'color/text/basic', 'fn.emptyQuery'); await add(opts.hint, 'body/medium', 'color/text/subtle', 'P02_emptyHint'); }
    const a = H.frame('Actions', w < 768 ? 'VERTICAL' : 'HORIZONTAL', 'gap/3'); a.counterAxisAlignItems = 'CENTER'; b.appendChild(a); if (w < 768) a.layoutSizingHorizontal = 'FILL';
    for (const [l, t] of opts.buttons || []) { const x = t === 'text' ? H.tbtn(l) : H.btn(l, t, 'large'); a.appendChild(x); if (w < 768 && t !== 'text') x.layoutSizingHorizontal = 'FILL'; }
    return b;
  };

H.mobileFix = async (fr, activeTab) => {
    const w = Math.round(fr.width); if (w >= 1024) return;
    const ms = fr.children.find(c => /^masthead__/.test(c.name)); if (ms) { try { ms.layoutSizingVertical = 'HUG'; } catch (e) {} const pf = ms.findOne(x => x.name === '공식누리집 문구'); if (pf) { try { pf.layoutSizingHorizontal = 'FILL'; pf.layoutSizingVertical = 'HUG'; } catch (e) {} } const t = ms.findOne(x => x.type === 'TEXT'); try { t.layoutSizingHorizontal = 'FILL'; t.textAutoResize = 'HEIGHT'; } catch (e) {} }
    const hd = fr.findOne(x => x.name === 'App header');
    if (hd && w < 768) { const menu = hd.children.find(c => c.name === 'header_menu__atomic' && c.findOne(x => x.type === 'TEXT')?.characters === '메뉴'); if (menu) menu.remove(); for (const hm of hd.findAll(x => x.type === 'INSTANCE' && x.name === 'header_menu__atomic')) hm.setProperties({ Type: 'vertical' }); }
    const tb = fr.findOne(x => x.name === 'tab_bars__mo'); if (tb && activeTab) { const L = ['홈', '찾기', '알림', '내 프로젝트']; tb.findAll(x => x.type === 'INSTANCE' && x.name === 'tab_bars__atomic__mo').forEach((it, i) => { if (i >= 4) return; const act = L[i] === activeTab; it.setProperties({ Style: act ? 'active' : 'inactive', State: act ? 'selected' : 'default' }); }); }
  };

H.fixIcons = (root) => { for (const hm of root.findAll(x => x.type === 'INSTANCE' && x.name === 'header_menu__atomic')) { const lk = Object.keys(hm.componentProperties).find(k => k.split('#')[0] === 'Lable'); const ik = Object.keys(hm.componentProperties).find(k => k.split('#')[0] === 'Icon'); const lab = hm.componentProperties[lk].value; if (ICON[lab]) hm.setProperties({ [ik]: H.IC[ICON[lab]] }); } };

H.mobileHeaderRow = async (fr) => { const w = Math.round(fr.width); if (w >= 768) return; const top = fr.findOne(x => x.name === 'Results header'); if (!top || top.layoutMode === 'VERTICAL') return; const title = top.children[0]; const rest = top.children.slice(1); top.layoutMode = 'VERTICAL'; top.counterAxisAlignItems = 'MIN'; title.layoutSizingHorizontal = 'FILL'; if (rest.length) { const r = H.frame('Results tools', 'HORIZONTAL', 'gap/3'); r.counterAxisAlignItems = 'CENTER'; top.appendChild(r); H.fill(r); rest.forEach(k => r.appendChild(k)); } };
