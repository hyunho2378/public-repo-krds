// P-18 브랜치와 태그, 릴리스. GitHub Branches, Tags, Releases 구성. 코드 탭 하위 메뉴(D-04).
import { Link } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { RepoSubNav } from '../components/Code/RepoSubNav';
import { Readme } from '../components/Help/Readme';
import { Icon } from '../components/Code/Icon';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';

function RefRow({ id, name, commit, badges }) {
  return (
    <li className="rb-row">
      <div className="rb-row-main">
        <p className="rb-row-title">
          <Link className="krds-link krds-text-body-large rb-ellipsis rb-break-any" to={`/projects/${id}/code`}>{name}</Link>
          {badges}
        </p>
        {commit ? (
          <p className="krds-text-body-small rb-row-meta">
            <span>{t.P18_lastCommit}</span>
            <Link className="krds-link rb-ellipsis" to={`/projects/${id}/changes/${commit.id}`}>{commit.title}</Link>
            <span>{day(commit.committed_date || commit.created_at)}</span>
          </p>
        ) : null}
      </div>
    </li>
  );
}

export function Branches() {
  const frame = useProject();
  const body = useData(async () => ({ branches: (await gitlab.branches(frame.id)).data, tags: (await gitlab.tags(frame.id)).data }), [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-07" data={frame} />;
  const b = body.data;
  return (
    <ProjectFrame screenId="R-07" tab="" tabLabel={t.RepoSub_branches} data={frame} state={b ? (b.branches.length ? (b.branches.length === 1 && !b.tags.length ? 'Min' : 'Ideal') : 'Empty') : body.state}>
      <div className="rb-code-area">
        <RepoSubNav id={frame.id} active="branches" />
        {!b ? <Status {...body} /> : (
          <>
            <section className="rb-stack-tight" aria-labelledby="br-title">
              <h2 id="br-title" className="krds-text-heading-small">{t.fn.countLabel(t.P18_branches, b.branches.length)}</h2>
              {b.branches.length ? (
                <ul className="rb-row-list">
                  {b.branches.map((x) => (
                    <RefRow key={x.name} id={frame.id} name={x.name} commit={x.commit} badges={<>
                      {x.default ? <span className="krds-badge small bg-light-primary">{t.P18_default}</span> : null}
                      {x.protected ? <span className="krds-badge small bg-light-gray">{t.P18_protected}</span> : null}
                    </>} />
                  ))}
                </ul>
              ) : <EmptyState title={t.P18_noBranch} />}
            </section>
            <section className="rb-stack-tight" aria-labelledby="tag-title">
              <h2 id="tag-title" className="krds-text-heading-small">{t.fn.countLabel(t.P18_tags, b.tags.length)}</h2>
              {b.tags.length ? (
                <ul className="rb-row-list">{b.tags.map((x) => <RefRow key={x.name} id={frame.id} name={x.name} commit={x.commit} />)}</ul>
              ) : <EmptyState title={t.P18_noTag} />}
            </section>
          </>
        )}
      </div>
    </ProjectFrame>
  );
}

export function Releases() {
  const frame = useProject();
  const body = useData(async () => (await gitlab.releases(frame.id)).data, [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-09" data={frame} />;
  const list = body.data;
  return (
    <ProjectFrame screenId="R-09" tab="" tabLabel={t.RepoSub_releases} data={frame} state={list ? (list.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <RepoSubNav id={frame.id} active="releases" />
        {!list ? <Status {...body} /> : list.length ? (
          <ol className="rb-row-list">
            {list.map((r, i) => (
              <li className="rb-row" key={r.tag_name}>
                <div className="rb-row-main">
                  <p className="rb-row-title">
                    <span className="krds-text-heading-small rb-break-any">{r.name || r.tag_name}</span>
                    {i === 0 ? <span className="krds-badge small bg-light-success">{t.P18_latest}</span> : null}
                  </p>
                  <p className="krds-text-body-small rb-row-meta"><span>{r.tag_name}</span><span>{day(r.released_at || r.created_at)}</span></p>
                  {r.description ? <Readme source={r.description} /> : null}
                  {r.assets?.sources?.length ? (
                    <div className="rb-labels" aria-label={t.P18_assets}>
                      {r.assets.sources.map((s) => (
                        <a key={s.url} className="krds-btn small tertiary" href={s.url}><Icon name="download" />{s.format}</a>
                      ))}
                    </div>
                  ) : null}
                </div>
              </li>
            ))}
          </ol>
        ) : <EmptyState title={t.P18_noRelease}>{t.P18_noReleaseHelp}</EmptyState>}
      </div>
    </ProjectFrame>
  );
}
