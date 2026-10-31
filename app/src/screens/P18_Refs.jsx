// P-18 브랜치, 태그, 릴리스. 공공 깃랩 캡처 15(브랜치), 16(태그), 17(릴리스) 구성을 그대로 옮긴다(D-21).
import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../copy/ko';
import { g } from '../copy/gl';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { Readme } from '../components/Help/Readme';
import { Icon } from '../components/Code/Icon';
import { IconButton } from '../components/Action/IconButton';
import { Avatar } from '../components/Layout/Avatar';
import { CopyButton, FilterField, SortControl, SourceMenu } from './gl/parts';
import './gl/gl.css';
import '../components/Code/code.css';

const STALE_MS = 90 * 24 * 3600 * 1000;
const when = (c) => new Date(c?.committed_date || c?.created_at || 0).getTime();
const ago = (iso) => (iso ? t.fn.ago(iso) : '');

function Rss({ href }) {
  return <IconButton icon="ext/rss" label={g.rss} size="medium" onClick={() => window.open(href, '_blank', 'noopener,noreferrer')} />;
}

function RefRow({ id, project, name, commit, isBranch, flags }) {
  return (
    <li>
      <div className="gl-ref-row">
        <div className="gl-ref-main">
          <p className={'gl-ref-name' + (isBranch ? '' : ' is-lg')}>
            {isBranch ? null : <Icon name="ext/tag" />}
            <Link to={`/projects/${id}/code?ref=${encodeURIComponent(name)}`}>{name}</Link>
            <CopyButton text={name} label={g.copyName} />
            {flags}
          </p>
          {commit ? (
            <p className="gl-ref-meta">
              <Link to={`/projects/${id}/changes/${commit.id}`}><code>{commit.short_id || String(commit.id).slice(0, 8)}</code></Link>
              <span className="gl-trunc">{commit.title}</span>
              <time dateTime={commit.committed_date || commit.created_at}>{ago(commit.committed_date || commit.created_at)}</time>
            </p>
          ) : null}
        </div>
        <div className="gl-ref-side"><SourceMenu project={project} refName={name} /></div>
      </div>
    </li>
  );
}

function Flags({ x }) {
  return (
    <>
      {x.default ? <span className="gl-badge is-primary">{g.defaultBadge}</span> : null}
      {x.protected ? <span className="gl-badge">{g.protectedBadge}</span> : null}
    </>
  );
}

export function Branches() {
  const frame = useProject();
  const [tab, setTab] = useState('overview');
  const [query, setQuery] = useState('');
  const body = useData(async () => (await gitlab.branches(frame.id)).data, [frame.id]);
  const list = body.data;
  if (!frame.data) return <ProjectFrame screenId="R-07" data={frame} />;
  const project = frame.data.project;
  const now = Date.now();
  const q = query.trim().toLowerCase();
  const sorted = list ? [...list].sort((a, b) => when(b.commit) - when(a.commit)) : [];
  const fresh = sorted.filter((x) => x.default || now - when(x.commit) <= STALE_MS);
  const stale = sorted.filter((x) => !x.default && now - when(x.commit) > STALE_MS);
  const byTab = { overview: fresh, active: fresh, stale, all: sorted };
  const shown = (byTab[tab] || []).filter((x) => !q || x.name.toLowerCase().includes(q));
  const tabs = [['overview', g.tabOverview, null], ['active', g.tabActive, null], ['stale', g.tabStale, null], ['all', g.tabAll, null]];
  const rows = (arr) => arr.map((x) => <RefRow key={x.name} id={frame.id} project={project} name={x.name} commit={x.commit} isBranch flags={<Flags x={x} />} />);
  return (
    <ProjectFrame screenId="R-07" tab="" tabLabel={g.brTitle} data={frame} state={list ? (list.length ? (list.length === 1 ? 'Min' : 'Ideal') : 'Empty') : body.state}>
      <div className="gl-page">
        <div className="gl-tabs" data-figma="gl-tabs" role="tablist" aria-label={g.brTitle}>
          {tabs.map(([k, name, n]) => (
            <button key={k} type="button" role="tab" aria-selected={tab === k} className="gl-tab" onClick={() => setTab(k)}>
              <span>{name}</span>{n != null ? <span className="gl-tab-count">{n}</span> : null}
            </button>
          ))}
        </div>
        {!list ? <Status {...body} /> : (
          <div>
            <div className="gl-bar" data-figma="gl-filter"><FilterField value={query} onChange={setQuery} placeholder={g.brFilter} /></div>
            <section className="gl-box is-attached" aria-labelledby="gl-br-title">
              <h2 id="gl-br-title" className="gl-box-title">{tab === 'stale' ? g.brStale : g.brActive}</h2>
              {shown.length ? <ul className="gl-rows">{rows(shown)}</ul> : <p className="gl-empty">{g.brNone}</p>}
            </section>
          </div>
        )}
      </div>
    </ProjectFrame>
  );
}

export function Tags() {
  const frame = useProject();
  const [query, setQuery] = useState('');
  const [sort, setSort] = useState('updated');
  const [desc, setDesc] = useState(true);
  const body = useData(async () => (await gitlab.tags(frame.id)).data, [frame.id]);
  const list = body.data;
  const shown = useMemo(() => {
    const q = query.trim().toLowerCase();
    const rows = (list || []).filter((x) => !q || x.name.toLowerCase().includes(q));
    rows.sort((a, b) => (sort === 'name' ? a.name.localeCompare(b.name, 'ko', { numeric: true }) : when(a.commit) - when(b.commit)));
    return desc ? rows.reverse() : rows;
  }, [list, query, sort, desc]);
  if (!frame.data) return <ProjectFrame screenId="R-08" data={frame} />;
  const project = frame.data.project;
  return (
    <ProjectFrame screenId="R-08" tab="" tabLabel={t.P18_tags} data={frame} state={list ? (list.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="gl-page">
        <div className="gl-head" data-figma="page-head">
          <div className="gl-head-text">
            <h1 className="gl-title">{g.tagTitle}</h1>
            <p className="gl-intro">{g.tagIntro}</p>
          </div>
          <div className="gl-head-actions"><Rss href={`${project.web_url}/-/tags?format=atom`} /></div>
        </div>
        {!list ? <Status {...body} /> : (
          <div>
            <div className="gl-bar" data-figma="gl-filter">
              <FilterField value={query} onChange={setQuery} placeholder={g.tagFilter} />
              <SortControl options={[['updated', g.sortUpdated], ['name', g.sortName]]} value={sort} onChange={setSort} desc={desc} onDir={() => setDesc(!desc)} />
            </div>
            <section className="gl-box is-attached" aria-label={g.tagTitle}>
              {shown.length ? (
                <ul className="gl-rows">
                  {shown.map((x) => <RefRow key={x.name} id={frame.id} project={project} name={x.name} commit={x.commit} />)}
                </ul>
              ) : <p className="gl-empty">{g.tagNone}</p>}
            </section>
          </div>
        )}
      </div>
    </ProjectFrame>
  );
}

export function Releases() {
  const frame = useProject();
  const [desc, setDesc] = useState(true);
  const body = useData(async () => (await gitlab.releases(frame.id)).data, [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-09" data={frame} />;
  const project = frame.data.project;
  const list = body.data ? [...body.data].sort((a, b) => { const d = new Date(a.released_at || a.created_at) - new Date(b.released_at || b.created_at); return desc ? -d : d; }) : null;
  return (
    <ProjectFrame screenId="R-09" tab="" tabLabel={t.RepoSub_releases} data={frame} state={list ? (list.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="gl-page">
        <div className="gl-head" data-figma="page-head">
          <h1 className="gl-title">{g.relTitle}</h1>
          <div className="gl-head-actions">
            <SortControl options={[['date', g.sortRelease]]} value="date" onChange={() => {}} desc={desc} onDir={() => setDesc(!desc)} />
            <Rss href={`${project.web_url}/-/releases.atom`} />
          </div>
        </div>
        {!list ? <Status {...body} /> : list.length ? (
          <div className="gl-page">
            {list.map((r) => (
              <article className="gl-release" key={r.tag_name}>
                <h2 className="gl-release-head">{r.name || r.tag_name}</h2>
                <div className="gl-release-body">
                  <div className="gl-release-meta">
                    <p><Avatar className="is-16" src={r.author?.avatar_url || project.namespace?.avatar_url} name={project.namespace?.name} /><span>{project.namespace?.name}</span></p>
                    <p><Icon name="calendar" /><span>{g.relAt} {ago(r.released_at || r.created_at)}</span></p>
                    <p><Icon name="ext/tag" /><Link to={`/projects/${frame.id}/code?ref=${encodeURIComponent(r.tag_name)}`}>{r.tag_name}</Link></p>
                  </div>
                  <div className="gl-release-text">
                    <h3>{g.relNotes}</h3>
                    {r.description ? <Readme source={r.description} /> : null}
                    {r.assets?.sources?.length ? (
                      <details className="gl-assets" open>
                        <summary>{g.relAssets} <span className="gl-tab-count">{r.assets.sources.length}</span></summary>
                        <ul>
                          {r.assets.sources.map((s) => (
                            <li key={s.url}><a className="krds-link" href={s.url}><Icon name="document" /><span>{g.srcAsset(s.format)}</span><Icon name="download" /></a></li>
                          ))}
                        </ul>
                      </details>
                    ) : null}
                  </div>
                </div>
              </article>
            ))}
          </div>
        ) : <EmptyState title={g.relNone} />}
      </div>
    </ProjectFrame>
  );
}
