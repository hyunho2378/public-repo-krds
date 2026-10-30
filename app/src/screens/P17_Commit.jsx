// P-17 커밋 상세. 공공 깃랩 캡처 14, 14b, 14c 구성: 머리 줄(커밋 해시, 작성됨, 작성자, 파일 찾아보기, 옵션), 제목, 본문, 정보 상자, 변경 비교.
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { g } from '../copy/gl';
import { gitlab, request } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { Icon } from '../components/Code/Icon';
import { Menu } from '../components/Navigation/Menu';
import { Avatar } from '../components/Layout/Avatar';
import { orgLabel } from '../components/Layout/orgLabel';
import { CopyButton } from './gl/parts';
import { GlDiff } from './gl/GlDiff';
import './gl/gl.css';
import '../components/Code/code.css';

const enc = encodeURIComponent;

export default function Commit() {
  const { sha } = useParams();
  const frame = useProject();
  const body = useData(async () => {
    const commit = (await gitlab.commit(frame.id, sha)).data;
    const files = (await gitlab.diff(frame.id, sha)).data;
    const refs = await request(`/api/gitlab/projects/${enc(frame.id)}/repository/commits/${enc(sha)}/refs?type=all`).then((r) => r.data).catch(() => null);
    const mrs = await request(`/api/gitlab/projects/${enc(frame.id)}/repository/commits/${enc(sha)}/merge_requests`).then((r) => r.data).catch(() => null);
    return { commit, files, refs: Array.isArray(refs) ? refs : null, mrs: Array.isArray(mrs) ? mrs : null };
  }, [frame.id, sha]);
  if (!frame.data) return <ProjectFrame screenId="R-05" data={frame} />;
  const b = body.data;
  const project = frame.data.project;
  const c = b?.commit;
  const owner = project.namespace;
  const who = c ? (owner && owner.path === c.author_name ? owner.name : orgLabel(c.author_name)) : '';
  const branches = (b?.refs || []).filter((r) => r.type === 'branch');
  const tags = (b?.refs || []).filter((r) => r.type === 'tag');
  const rawBase = c ? `${project.web_url}/-/commit/${c.id}` : '';
  return (
    <ProjectFrame screenId="R-05" tab="/changes" tabLabel={t.P17_title} crumbs={[[t.Side_hintCommit, `/projects/${frame.id}/changes`], [sha.slice(0, 8)]]} data={frame} state={b ? (b.files.length ? 'Ideal' : 'Empty') : body.state}>
      {!b ? <Status {...body} /> : (
        <div className="gl-page">
          <header className="gl-commit-head">
            <p className="gl-commit-line">
              <span>{g.commitTitle} <code>{c.short_id}</code></span>
              <CopyButton text={c.id} label={g.copySha} />
              <span>{g.wrote} <time dateTime={c.committed_date}>{t.fn.ago(c.committed_date)}</time></span>
              <span>{g.wroteBy}</span>
              <Avatar className="is-24" src={owner?.avatar_url} name={who} />
              <strong>{who}</strong>
            </p>
            <div className="gl-head-actions">
              <Link className="krds-btn small tertiary" to={`/projects/${frame.id}/code?ref=${enc(c.id)}`}>{g.filesFind}</Link>
              <Menu label={g.options} align="right" btnClass="krds-btn small tertiary" button={<span>{g.options}</span>}>
                {(close) => (
                  <ul className="drop-list">
                    <li><p className="rb-menu-title">{g.optDownload}</p></li>
                    <li><a className="item-link" href={`${rawBase}.patch`} onClick={close}>{g.optPatch}</a></li>
                    <li><a className="item-link" href={`${rawBase}.diff`} onClick={close}>{g.optPlain}</a></li>
                  </ul>
                )}
              </Menu>
            </div>
          </header>
          <h1 className="gl-commit-title">{c.title}</h1>
          {c.message && c.message.trim() !== c.title ? <pre className="gl-commit-body">{c.message.replace(c.title, '').trim()}</pre> : null}
          <ul className="gl-info">
            {c.parent_ids?.[0] ? (
              <li><Icon name="ext/commit" /><span>{g.parent}</span><Link className="krds-link" to={`/projects/${frame.id}/changes/${c.parent_ids[0]}`}><code>{c.parent_ids[0].slice(0, 8)}</code></Link></li>
            ) : null}
            {branches.length ? <li><Icon name="ext/branch" /><span>{g.branchLabel}</span>{branches.map((r) => <Link key={r.name} className="rb-pill" to={`/projects/${frame.id}/code?ref=${enc(r.name)}`}>{r.name}</Link>)}</li> : null}
            {tags.length ? <li><Icon name="ext/tag" /><span>{g.tagLabel}</span>{tags.map((r) => <Link key={r.name} className="rb-pill" to={`/projects/${frame.id}/code?ref=${enc(r.name)}`}>{r.name}</Link>)}</li> : null}
            {b.mrs && !b.mrs.length ? <li><Icon name="ext/merge-request" /><span>{g.noMr}</span></li> : null}
            {b.mrs?.map((m) => <li key={m.iid}><Icon name="ext/merge-request" /><Link className="krds-link" to={`/projects/${frame.id}/merge-requests/${m.iid}`}>{m.title}</Link></li>)}
          </ul>
          {b.files.length ? <GlDiff files={b.files} id={frame.id} refName={c.id} webUrl={project.web_url} /> : <EmptyState title={t.P17_noDiff} />}
        </div>
      )}
    </ProjectFrame>
  );
}
