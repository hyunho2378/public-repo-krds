// figma_boxes 내보내기 (Figma 편집기 페이지 컨텍스트, window.figma). 2026. 10. 30.
// 사용: page.evaluate(src) 로 이 파일 내용을 실행해 window.__exportBoxes 를 만든 뒤
//   const out = await window.__exportBoxes('Screens / R 저장소', { start: 0, count: 4 });   // 세트 4개씩 끊어 호출(편집기 시간 제한 때문)
//   out.files = [{ file: 'R-01_1920_Guest.json', json: {...} }, ...] → REPL 쪽 fs.writeFile 로 code_plan/figma_boxes/ 에 저장
// 규칙은 code_plan/figma_boxes/README.md 와 같다: 폭 1920, 360, auth Guest, Signed-in, 좌표는 변형 프레임 왼쪽 위 0,0 기준 정수 px,
// 같은 이름이 여러 번이면 맨 처음 것만, 보이지 않는 요소는 제외.
window.__exportBoxes = async (pageName, opt = {}) => {
  const f = window.figma;
  const NAMES = {
    'masthead': n => /^masthead/.test(n.name),
    'header': n => n.name === 'app_header' || n.name === 'App header',
    'global-search': n => n.name === 'Global search',
    'sidebar': n => n.name === 'repo_sidebar' || n.name === 'Global sidebar' || n.name === 'global_sidebar',
    'sidebar-nav': n => n.name === 'Project navigation' || n.name === 'Global navigation',
    'body': n => n.name === 'Body',
    'main': n => n.name === 'Main content',
    'breadcrumb': n => n.name === 'Breadcrumb',
    'repo-title': n => n.name === 'Repo title',
    'repo-actions': n => n.name === 'Repo actions',
    'toolbar': n => n.name === 'Toolbar' || n.name === 'Repo toolbar',
    'commit-bar': n => n.name === 'Commit bar' || n.name === 'commit_bar',
    'file-table': n => n.name === 'File table',
    'code-view': n => n.name === 'Code view',
    'readme': n => n.name === 'README' || n.name === 'Readme',
    'info-panel': n => n.name === 'Info panel' || n.name === 'project_info',
    'about': n => n.name === 'About' || n.name === 'what it does',
    'decision-panel': n => n.name === 'Decision panel' || n.name === 'before use',
    'meta-panel': n => n.name === 'Meta panel',
    'detail-area': n => n.name === 'Detail area',
    'diff-area': n => n.name === 'Diff area',
    'diff-tree': n => n.name === 'Diff tree',
    'diff-file': n => n.name === 'Diff file',
    'tabs': n => n.name === 'Tabs',
    'section-title': n => n.name === 'Section title',
    'filters': n => n.name === 'Filters',
    'search': n => n.name === 'Search',
    'results': n => n.name === 'Results',
    'login-card': n => n.name === 'Login card',
    'comment-editor': n => n.name === 'Comment editor',
    'steps': n => n.name === 'Steps',
    'checks': n => n.name === 'Checks',
    'footer': n => /^footer/.test(n.name),
    'tabbar': n => /^tab_?bar|^Tab bar|^tabbar/i.test(n.name),
  };
  const page = f.root.children.find(p => p.name === pageName); await page.loadAsync();
  const sets = page.findAllWithCriteria({ types: ['COMPONENT_SET'] }).sort((a, b) => a.name.localeCompare(b.name));
  const slice = sets.slice(opt.start || 0, (opt.start || 0) + (opt.count || sets.length));
  const files = [];
  for (const s of slice) {
    const screen = (s.name.match(/^[A-Z]-\d+[a-z]?/) || [s.name])[0];
    for (const v of s.children) {
      const bp = +((v.name.match(/breakpoint=(\d+)/) || [])[1] || 0);
      if (bp !== 1920 && bp !== 360) continue;
      const auth = /Signed-in/.test(v.name) ? 'Signed-in' : 'Guest';
      const roleM = v.name.match(/role=(\w+)/);
      if (roleM && !['none', 'developer'].includes(roleM[1])) continue;
      const o = v.absoluteBoundingBox; const boxes = {};
      // 깊이 5까지만 한 번 훑는다(큰 화면에서 findAll 은 편집기 시간 초과를 낸다)
      const MAXD = opt.maxDepth || 5; const queue = [[v, 0]]; const entries = Object.entries(NAMES);
      for (let qi = 0; qi < queue.length; qi++) {
        const [n, d] = queue[qi];
        if (n !== v) {
          if (n.visible === false) continue;
          for (const [key, test] of entries) {
            if (boxes[key] || !test(n)) continue;
            const b = n.absoluteBoundingBox; if (!b) continue;
            boxes[key] = { x: Math.round(b.x - o.x), y: Math.round(b.y - o.y), w: Math.round(b.width), h: Math.round(b.height) };
          }
        }
        if (d < MAXD && n.children) for (const c of n.children) queue.push([c, d + 1]);
      }
      files.push({ file: `${screen}_${bp}_${auth}.json`, json: { screen, title: s.name, breakpoint: bp, auth, variant: v.name, frame: { w: Math.round(v.width), h: Math.round(v.height) }, boxes } });
    }
  }
  return { total: sets.length, from: opt.start || 0, count: slice.length, files };
};
