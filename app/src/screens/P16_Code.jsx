// P-16 저장소 첫 화면과 코드 둘러보기(D-04 개정: 공공 깃랩 + GitHub 배치, KRDS 부품).
// 왼쪽 프로젝트 메뉴(ProjectFrame), 파일 트리 패널, 본문(도구 줄, 마지막 변경, 파일 표, README), 오른쪽 정보와 판단 정보.
import { useEffect, useRef, useState } from 'react';
import { atLeast, useAuth } from '../components/Identity/useAuth';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab, request } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { CodeView } from '../components/Code/CodeView';
import { Icon } from '../components/Code/Icon';
import { About, AddFileMenu, BranchSelect, CodeMenu, CommitBar, FileFind, FileTable, ReadmeBox, RepoMenuList, enc } from '../components/Code/RepoParts';
import { FileTreePanel } from '../components/Code/FileTreePanel';
import { DecisionPanel } from '../components/Layout/DecisionPanel';
import '../components/Code/code.css';

const LOG_LIMIT = 30;

function PathCrumbs({ id, path, refQuery }) {
  const parts = path ? path.split('/') : [];
  const [copied, setCopied] = useState(false);
  return (
    <div className="rb-pathline">
      <nav className="krds-breadcrumb-wrap rb-path" aria-label={t.P16_path}>
        <ol className="breadcrumb">
          <li className="home"><Link className="txt" to={`/projects/${id}${refQuery}`}>{t.P16_root}</Link></li>
          {parts.map((p, i) => {
            const to = parts.slice(0, i + 1).join('/');
            return (
              <li key={to}>
                {i === parts.length - 1 ? <span className="txt rb-break-any" aria-current="page">{p}</span> : <Link className="txt rb-break-any" to={`/projects/${id}/code/${to}${refQuery}`}>{p}</Link>}
              </li>
            );
          })}
        </ol>
      </nav>
      {path ? (
        <button type="button" className="krds-btn xsmall text rb-icon-btn" onClick={() => { navigator.clipboard.writeText(path); setCopied(true); }}>
          <Icon name="copy" /><span className="sr-only">{t.P16_cloneCopy.replace('가져오기 주소(clone)', t.P16_path)}</span>
        </button>
      ) : null}
      <span className="sr-only" role="status" aria-live="polite">{copied ? t.Home_copied : ''}</span>
    </div>
  );
}

async function loadTree(id, path, ref) {
  // 정적 배포에서도 되도록 공개 API를 순서대로 부른다(동시 요청 제한).
  const items = (await gitlab.tree(id, path, ref)).data;
  const head = await gitlab.commits(id, { path, ref }).catch(() => ({ data: [], pagination: {} }));
  const log = {};
  for (const it of items.slice(0, LOG_LIMIT)) {
    try {
      log[it.path] = (await gitlab.commits(id, { path: it.path, ref })).data[0] || null;
    } catch {
      log[it.path] = null;
    }
  }
  // 전체 커밋 수는 응답의 total을 쓴다. 없으면 받은 만큼만 세고 "이상"을 붙인다(없는 수를 만들지 않는다).
  const total = head.pagination?.total ?? null;
  return {
    kind: 'tree',
    items,
    log,
    last: head.data[0] || null,
    count: total ?? head.data.length,
    more: total == null && !!head.pagination?.nextPage,
    partial: items.length > LOG_LIMIT,
  };
}

async function loadRepo(id) {
  // 불러오지 못하면 null로 둔다. 0개로 보여 주면 사실과 다르다(실제로는 main 1개).
  // 목록은 한 쪽(100개)만 받는다. 전체 수는 응답의 total(X-Total 헤더)을 쓴다. 없으면 받은 만큼만 보여 준다.
  const branches = await gitlab.branches(id).catch(() => ({ data: null }));
  const tags = await gitlab.tags(id).catch(() => ({ data: null }));
  const releases = await gitlab.releases(id).catch(() => ({ data: null }));
  const root = await gitlab.tree(id, '').catch(() => ({ data: [] }));
  const languages = await request(`/api/gitlab/projects/${enc(id)}/languages`).catch(() => ({ data: {} }));
  const count = (r) => (r?.pagination?.total ?? (Array.isArray(r?.data) ? r.data.length : null));
  return {
    branches: branches.data,
    tags: tags.data,
    releases: releases.data,
    totals: { branches: count(branches), tags: count(tags), releases: count(releases) },
    root: root.data,
    languages: languages.data,
  };
}

/** R-03 Blame: 줄마다 마지막으로 고친 사람과 날짜. 눌렀을 때만 불러온다(무거운 요청). */
function useBlame(id, path, ref) {
  const [blame, setBlame] = useState(null);
  const [blameState, setBlameState] = useState(null);
  useEffect(() => { setBlame(null); setBlameState(null); }, [id, path, ref]);
  const onBlame = async () => {
    setBlameState('Loading');
    try {
      const res = await gitlab.blame(id, path, ref || 'HEAD');
      const map = new Map();
      let n = 1;
      for (const chunk of res.data || []) {
        for (let i = 0; i < (chunk.lines || []).length; i++) {
          map.set(n++, { author: chunk.commit?.author_name || '', date: chunk.commit?.authored_date });
        }
      }
      setBlame(map);
      setBlameState('Ideal');
    } catch {
      setBlameState('Error');
    }
  };
  return { blame, blameState, onBlame };
}

export default function Code() {
  const params = useParams();
  const [search] = useSearchParams();
  const path = (params['*'] || '').replace(/\/$/, '');
  const navigate = useNavigate();
  const frame = useProject(loadRepo);
  const [filter, setFilter] = useState('');
  const ref = search.get('ref') || frame.data?.project.default_branch || 'main';
  const refQuery = search.get('ref') ? `?ref=${enc(search.get('ref'))}` : '';
  const blameApi = useBlame(params.id, path, ref);
  const { signedIn, role } = useAuth();
  // y: 지금 보는 지점을 커밋 번호로 고정한 영구 링크로 바꾼다(GitLab, GitHub와 같은 단축키).
  const shaRef = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'y' || e.metaKey || e.ctrlKey || e.altKey || !shaRef.current) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      navigate({ search: `?ref=${enc(shaRef.current)}` }, { replace: true });
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [navigate]);

  const body = useData(async () => {
    const { id } = params;
    if (path) {
      try {
        const meta = (await gitlab.fileMeta(id, path, ref)).data;
        if (meta?.file_name) {
          const text = (await gitlab.fileRaw(id, path, ref)).data;
          const last = (await gitlab.commits(id, { path, ref }).catch(() => ({ data: [] }))).data[0] || null;
          return { kind: 'file', text, meta, last };
        }
      } catch {
        /* 파일이 아니면 폴더로 읽는다 */
      }
    }
    return loadTree(id, path, ref);
  }, [params.id, path, ref]);

  if (!frame.data) return <ProjectFrame screenId={path ? "R-02" : "R-01"} data={frame} />;
  const { project, readme, branches, tags, releases, totals, root, languages } = frame.data;
  const rawUrl = path ? `${project.web_url}/-/raw/${ref}/${path.split('/').map(enc).join('/')}` : null;
  const zipUrl = `${project.web_url}/-/archive/${ref}/${project.path}-${ref}.zip`;
  const b = body.data;
  shaRef.current = b?.last?.id || null;
  const state = b ? (b.kind === 'tree' ? (!b.items.length ? 'Empty' : b.items.length === 1 ? 'Min' : 'Ideal') : 'Ideal') : body.state;
  const isHome = !path;

  const about = <About id={frame.id} project={project} readme={readme} languages={languages} stats={{ commits: b?.count ?? 0, more: b?.more, branches: totals.branches, tags: totals.tags, releases: totals.releases }} />;
  const aside = isHome ? (
    <>
      <div className="rb-only-wide">{about}</div>
      <DecisionPanel id={frame.id} readme={readme} />
    </>
  ) : null;

  return (
    <ProjectFrame screenId={path ? (body.data?.kind === "file" ? "R-03" : "R-02") : "R-01"} tab="" tabLabel={path ? t.Tab_code : ''} crumbs={path ? [[body.data?.kind === 'file' ? path.split('/').pop() : t.RepoSub_files]] : []} data={frame} state={state} aside={aside}>
      <div className={`rb-code-wrap${path ? ' has-tree' : ''}`}>
        {path ? <FileTreePanel id={frame.id} items={root} current={path} refQuery={refQuery} /> : null}
        <div className="rb-code-area">
          {isHome ? <div className="rb-only-narrow">{about}</div> : null}
          {isHome ? <RepoMenuList id={frame.id} /> : null}
          <div className="rb-toolbar" data-figma="toolbar">
            <div className="rb-toolbar-left">
              <BranchSelect id={frame.id} current={ref} branches={branches} path={path} />
              {isHome ? (
                <p className="rb-toolbar-counts krds-text-body-small">
                  {totals.branches != null ? <Link className="krds-link" to={`/projects/${frame.id}/branches`}>{t.fn.nBranches(totals.branches)}</Link> : null}
                  {totals.tags != null ? <Link className="krds-link" to={`/projects/${frame.id}/branches`}>{t.fn.nTags(totals.tags)}</Link> : null}
                </p>
              ) : <PathCrumbs id={frame.id} path={path} refQuery={refQuery} />}
            </div>
            <div className="rb-toolbar-right">
              {b?.kind === 'tree' ? <FileFind value={filter} onChange={setFilter} /> : null}
              {b?.kind === 'tree' && signedIn && atLeast(role, 'developer') ? <AddFileMenu id={frame.id} branch={ref} /> : null}
              <CodeMenu id={frame.id} zipUrl={zipUrl} cloneUrl={project.http_url_to_repo} />
            </div>
          </div>
          {!b ? (
            <Status {...body} />
          ) : b.kind === 'file' ? (
            <>
              <CommitBar id={frame.id} commit={b.last} count={1} path={path} owner={project.namespace} />
              <CodeView path={path} text={b.text} rawUrl={rawUrl} size={b.meta?.size} historyTo onHistory={() => navigate(`/projects/${frame.id}/changes?path=${enc(path)}`)} {...blameApi} />
            </>
          ) : b.items.length ? (
            <>
              <div className="rb-tree-block">
                <CommitBar id={frame.id} commit={b.last} count={b.count} more={b.more} path={path} owner={project.namespace} />
                <FileTable id={frame.id} path={path} items={b.items} log={b.log} filter={filter} refQuery={refQuery} />
              </div>
              {b.partial ? <p className="krds-text-body-small rb-subtle">{t.P16_partial}</p> : null}
              {isHome && readme ? <div id="readme"><ReadmeBox source={readme} /></div> : null}
            </>
          ) : (
            <EmptyState title={t.P16_emptyRepo}>{t.P16_emptyRepoHelp}</EmptyState>
          )}
        </div>
      </div>
    </ProjectFrame>
  );
}
