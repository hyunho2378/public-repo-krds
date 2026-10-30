// 공공 깃랩 점검 시간에도 배포 사이트가 화면을 보이도록 저장된 자료(스냅샷)를 만든다.
// 입력: data/raw/(공개 목록과 프로젝트별 README, 파일 목록, languages), data/cards/_meta.json(조회 날짜), data/cards/_private_alerts.json(README 제외 대상),
//       sample/kordoc/api/*(kordoc 150 전체 응답). 출력: app/public/data/snapshot/index.json, projects/{id}.json
// 실행: node scripts/snapshot/build.mjs
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const RAW = path.join(ROOT, 'data/raw');
const OUT = path.join(ROOT, 'app/public/data/snapshot');
const KOR = path.join(ROOT, 'sample/kordoc/api');
const README_MAX = 200000;
const read = (p, fb = null) => { try { return JSON.parse(fs.readFileSync(p, 'utf8')); } catch { return fb; } };
const readText = (p) => { try { return fs.readFileSync(p, 'utf8'); } catch { return null; } };

const meta = read(path.join(ROOT, 'data/cards/_meta.json'), {});
const list = read(path.join(RAW, '_list.json'), []);
const alerts = read(path.join(ROOT, 'data/cards/_private_alerts.json'), { items: [] });
// 개인정보, 계정 정보 패턴이 있는 README는 본문을 싣지 않는다(경로와 값도 싣지 않는다)
const noReadme = new Set((alerts.items || []).filter((a) => (a.items || []).some((x) => /readme/i.test(x.path) || /readme/.test(x.type))).map((a) => a.id));

fs.rmSync(OUT, { recursive: true, force: true });
fs.mkdirSync(path.join(OUT, 'projects'), { recursive: true });

const KEEP = ['id', 'name', 'name_with_namespace', 'path', 'path_with_namespace', 'description', 'default_branch', 'topics', 'tag_list', 'visibility', 'web_url', 'http_url_to_repo', 'avatar_url', 'star_count', 'forks_count', 'created_at', 'last_activity_at', 'namespace', 'readme_url'];
const slim = (p) => Object.fromEntries(KEEP.filter((k) => p[k] !== undefined).map((k) => [k, k === 'namespace' ? { id: p.namespace?.id, name: p.namespace?.name, path: p.namespace?.path, full_path: p.namespace?.full_path, avatar_url: p.namespace?.avatar_url } : p[k]]));

const kTotals = read(path.join(KOR, 'totals.json'), {});
const index = list.filter((p) => p.visibility === 'public').map((p) => ({
  ...slim(p),
  open_issues_count: p.id === 150 ? kTotals.issues ?? null : p.open_issues_count ?? null,
  open_merge_requests_count: p.id === 150 ? kTotals.merge_requests ?? null : null,
  archived: !!p.archived,
}));

let details = 0;
for (const p of index) {
  const dir = path.join(RAW, String(p.id));
  if (!fs.existsSync(dir) && p.id !== 150) continue;
  const done = read(path.join(dir, 'done.json'), {});
  const readme = noReadme.has(p.id) ? null : readText(path.join(dir, done.readmePath || 'README.md'));
  const detail = {
    project: { ...p, ...(slim(read(path.join(dir, 'project.json'), {}) || {})) },
    readmePath: noReadme.has(p.id) ? null : done.readmePath || (readme ? 'README.md' : null),
    readme: readme && readme.length > README_MAX ? readme.slice(0, README_MAX) : readme,
    readmeExcluded: noReadme.has(p.id) || undefined,
    tree: read(path.join(dir, 'tree.json'), null),
    languages: read(path.join(dir, 'languages.json'), null),
    fetchedAt: done.fetchedAt || null,
  };
  if (p.id === 150) {
    // kordoc: 받아 둔 공공 깃랩 응답 전체(커밋, 브랜치, 태그, 릴리스, 이슈, MR, 파일 트리, 총계)
    const k = (f) => read(path.join(KOR, f + '.json'));
    const tree1 = k('tree_1') || [];
    const trees = { '': k('tree_root'), src: k('tree_src') };
    for (const it of tree1) {
      const parent = it.path.includes('/') ? it.path.slice(0, it.path.lastIndexOf('/')) : '';
      if (parent in trees) continue;
      (trees[parent] ||= []).push(it);
    }
    Object.assign(detail, {
      project: { ...detail.project, ...slim(k('project') || {}) },
      readme: readText(path.join(KOR, 'readme_raw.md')),
      readmePath: 'README.md',
      tree: trees[''],
      trees,
      languages: k('languages'),
      totals: kTotals,
      commits: k('commits'), commit: k('commit_latest'), commitDiff: k('commit_latest_diff'),
      branches: k('branches'), tags: k('tags'), releases: k('releases'), contributors: k('contributors'),
      issues: k('issues'), issue55: k('issue_55'), merge_requests: k('merge_requests'), mr56: k('mr_56'), mr56Changes: k('mr_56_changes'),
      files: {
        'README.md': { meta: k('file_meta_readme'), raw: readText(path.join(KOR, 'readme_raw.md')) },
        'src/shared/numbering.ts': { meta: k('file_meta_numbering'), raw: readText(path.join(KOR, 'file_src_shared_numbering.ts')) },
        'package.json': { meta: null, raw: (() => { const j = k('file_package'); return j ? JSON.stringify(j, null, 2) : null; })() },
        'src/index.ts': { meta: null, raw: readText(path.join(KOR, 'file_src_index.ts')) },
      },
    });
  }
  fs.writeFileSync(path.join(OUT, 'projects', `${p.id}.json`), JSON.stringify(detail));
  details++;
}

fs.writeFileSync(path.join(OUT, 'index.json'), JSON.stringify({
  meta: { fetchedDate: meta.fetchedDate || null, fetchedAt: meta.fetchedAt || null, source: 'data/raw(공개 목록, README, 파일 목록, languages) + sample/kordoc', projectCount: index.length, detailCount: details, readmeExcluded: noReadme.size },
  projects: index,
}));
console.log(`index ${index.length}, 상세 ${details}, README 제외 ${noReadme.size}`);
