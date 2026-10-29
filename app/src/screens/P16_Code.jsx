// P-16 코드 둘러보기(D-04 저장소 공통 틀, D-05 코드 표시, UX-004 2장). GitHub 저장소 Code 탭 구성.
import { Link, useNavigate, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { Readme } from '../components/Help/Readme';
import { EmptyState, Status } from '../components/Feedback/Status';
import { CodeView } from '../components/Code/CodeView';
import { Icon } from '../components/Code/Icon';
import { DownloadMenu } from '../components/Code/DownloadMenu';
import '../components/Code/code.css';

const enc = encodeURIComponent;
const LOG_LIMIT = 30;
const day = (iso) => (iso ? new Date(iso).toLocaleDateString('ko-KR') : '');

function PathCrumbs({ id, path }) {
  const parts = path ? path.split('/') : [];
  return (
    <nav className="krds-breadcrumb-wrap rb-path" aria-label={t.P16_path}>
      <ol className="breadcrumb">
        <li className="home">
          <Link className="txt" to={`/projects/${id}/code`}>{t.P16_root}</Link>
        </li>
        {parts.map((p, i) => {
          const to = parts.slice(0, i + 1).join('/');
          return (
            <li key={to}>
              {i === parts.length - 1 ? <span className="txt" aria-current="page">{p}</span> : <Link className="txt" to={`/projects/${id}/code/${to}`}>{p}</Link>}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

/** 파일 표 위 마지막 변경 줄(GitHub latest commit bar). */
function LastCommit({ id, commit, count, more, path }) {
  if (!commit) return null;
  return (
    <div className="rb-commit-bar">
      <p className="rb-commit-main">
        <span className="krds-text-body-small-bold">{commit.author_name}</span>
        <Link className="krds-link rb-ellipsis" to={`/projects/${id}/changes/${commit.id}`}>{commit.title}</Link>
      </p>
      <p className="rb-commit-meta krds-text-body-small rb-subtle">
        <code>{commit.short_id}</code>
        <span>{day(commit.committed_date)}</span>
        <Link className="krds-link rb-commit-count" to={`/projects/${id}/changes${path ? `?path=${enc(path)}` : ''}`}>
          <Icon name="time" />
          {t.fn.commitCount(count, more)}
        </Link>
      </p>
    </div>
  );
}

function Tree({ id, path, items, log }) {
  const sorted = [...items].sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'tree' ? -1 : 1));
  const up = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
  return (
    <div className="krds-table-wrap rb-tree-wrap">
      <table className="tbl data rb-tree">
        <caption className="sr-only">{t.fn.treeCount(items.length)}</caption>
        <thead>
          <tr>
            <th scope="col">{t.P16_name}</th>
            <th scope="col" className="rb-col-msg">{t.P16_msg}</th>
            <th scope="col" className="rb-col-date">{t.P16_date}</th>
          </tr>
        </thead>
        <tbody>
          {path ? (
            <tr>
              <td colSpan={3}>
                <Link className="rb-tree-name" to={`/projects/${id}/code${up ? '/' + up : ''}`}>
                  <Icon name="new_folder" />
                  <span>{t.P16_up}</span>
                </Link>
              </td>
            </tr>
          ) : null}
          {sorted.map((f) => {
            const c = log?.[f.path];
            return (
              <tr key={f.path}>
                <td>
                  <Link className="rb-tree-name" to={`/projects/${id}/code/${f.path}`}>
                    <Icon name={f.type === 'tree' ? 'new_folder' : 'document'} label={f.type === 'tree' ? t.P16_folder : t.P16_file} />
                    <span className="rb-ellipsis">{f.name}</span>
                  </Link>
                  <span className="rb-tree-mobile krds-text-body-small rb-subtle">
                    <span className="rb-ellipsis">{c ? c.title : t.P16_noLog}</span>
                    <span>{c ? day(c.committed_date) : ''}</span>
                  </span>
                </td>
                <td className="rb-col-msg">
                  {c ? <Link className="krds-link rb-ellipsis" to={`/projects/${id}/changes/${c.id}`}>{c.title}</Link> : <span className="rb-subtle">{t.P16_noLog}</span>}
                </td>
                <td className="rb-col-date rb-subtle">{c ? day(c.committed_date) : ''}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

async function loadTree(id, path) {
  // 정적 배포에서도 되도록 공개 API를 순서대로 부른다(동시 요청 제한).
  const items = (await gitlab.tree(id, path)).data;
  const head = await gitlab.commits(id, { path });
  const log = {};
  for (const it of items.slice(0, LOG_LIMIT)) {
    try {
      log[it.path] = (await gitlab.commits(id, { path: it.path })).data[0] || null;
    } catch {
      log[it.path] = null;
    }
  }
  return { kind: 'tree', items, log, last: head.data[0] || null, count: head.data.length, more: !!head.pagination?.nextPage, partial: items.length > LOG_LIMIT };
}

export default function Code() {
  const params = useParams();
  const path = (params['*'] || '').replace(/\/$/, '');
  const navigate = useNavigate();
  const frame = useProject();
  const body = useData(async () => {
    const { id } = params;
    if (path) {
      try {
        const meta = (await gitlab.fileMeta(id, path)).data;
        if (meta?.file_name) {
          const text = (await gitlab.fileRaw(id, path)).data;
          const last = (await gitlab.commits(id, { path })).data[0] || null;
          return { kind: 'file', text, meta, last };
        }
      } catch {
        /* 파일이 아니면 폴더로 읽는다 */
      }
    }
    return loadTree(id, path);
  }, [params.id, path]);

  if (!frame.data) return <ProjectFrame screenId="P-16" data={frame} />;
  const { project, readme } = frame.data;
  const ref = project.default_branch || 'main';
  const rawUrl = path ? `${project.web_url}/-/raw/${ref}/${path.split('/').map(enc).join('/')}` : null;
  const zipUrl = `${project.web_url}/-/archive/${ref}/${project.path}-${ref}.zip`;
  const b = body.data;
  const state = b ? (b.kind === 'tree' && !b.items.length ? 'Empty' : 'Ideal') : body.state;

  return (
    <ProjectFrame screenId="P-16" tab="/code" tabLabel={t.ProjectTabs_3} data={frame} state={state}>
      <div className="rb-code-area">
        <div className="rb-repo-bar">
          <div className="rb-repo-bar-left">
            <span className="krds-badge medium light-gray rb-branch" title={t.P16_branch}>
              <span className="sr-only">{t.P16_branch} </span>
              {ref}
            </span>
            <PathCrumbs id={frame.id} path={path} />
          </div>
          <DownloadMenu zipUrl={zipUrl} cloneUrl={project.http_url_to_repo} />
        </div>
        {!b ? (
          <Status {...body} />
        ) : b.kind === 'file' ? (
          <>
            <LastCommit id={frame.id} commit={b.last} count={1} path={path} />
            <CodeView path={path} text={b.text} rawUrl={rawUrl} historyTo onHistory={() => navigate(`/projects/${frame.id}/changes?path=${enc(path)}`)} />
          </>
        ) : b.items.length ? (
          <>
            <div className="rb-tree-block">
              <LastCommit id={frame.id} commit={b.last} count={b.count} more={b.more} path={path} />
              <Tree id={frame.id} path={path} items={b.items} log={b.log} />
            </div>
            {b.partial ? <p className="krds-text-body-small rb-subtle">{t.P16_partial}</p> : null}
            {!path && readme ? (
              <section className="rb-readme-box" aria-label="README">
                <Readme source={readme} />
              </section>
            ) : null}
          </>
        ) : (
          <EmptyState title={t.P16_emptyRepo}>{t.P16_emptyRepoHelp}</EmptyState>
        )}
      </div>
    </ProjectFrame>
  );
}
