// P-18 브랜치, 태그, 릴리스. GitHub Branches(개요/활성/오래됨/전체 탭과 표), Tags, Releases 구성.
// 코드 탭 아래 세 화면은 위쪽 전환 링크(브랜치, 태그, 릴리스)로 오간다.
import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../copy/ko';
import { u } from '../copy/ui';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { SearchBox } from '../components/Code/ListTools';
import { Readme } from '../components/Help/Readme';
import { Icon } from '../components/Code/Icon';
import { orgLabel } from '../components/Layout/orgLabel';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';

const STALE_MS = 90 * 24 * 3600 * 1000;
const when = (c) => new Date(c?.committed_date || c?.created_at || 0).getTime();

function RefNav({ id, active }) {
  const items = [['branches', u.Ref_branches], ['tags', u.Ref_tags], ['releases', u.Ref_releases]];
  return (
    <nav className="rb-refnav" aria-label={u.Ref_nav}>
      {items.map(([k, label]) => (
        <Link key={k} className={'rb-refnav-link' + (k === active ? ' active' : '')} aria-current={k === active ? 'page' : undefined} to={`/projects/${id}/${k}`}>{label}</Link>
      ))}
    </nav>
  );
}

function BranchTable({ id, rows, base, ahead }) {
  return (
    <div className="rb-reftable-wrap">
      <table className="rb-reftable">
        <thead>
          <tr>
            <th scope="col">{u.Br_name}</th>
            <th scope="col">{u.Br_updated}</th>
            <th scope="col">{u.Br_compare}</th>
            <th scope="col">{u.Br_author}</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((x) => {
            const c = ahead[x.name];
            return (
              <tr key={x.name}>
                <td>
                  <Link className="krds-link rb-break-any" to={`/projects/${id}/code?ref=${encodeURIComponent(x.name)}`}>{x.name}</Link>
                  {x.default ? <span className="rb-pill">{t.P18_default}</span> : null}
                  {x.protected ? <span className="rb-pill">{t.P18_protected}</span> : null}
                </td>
                <td className="rb-num">{day(x.commit?.committed_date || x.commit?.created_at)}</td>
                <td className="rb-num">{x.default ? '' : c ? `${u.Br_behind} ${c.behind} / ${u.Br_ahead} ${c.ahead}` : ''}</td>
                <td>{orgLabel(x.commit?.author_name)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export function Branches() {
  const frame = useProject();
  const [tab, setTab] = useState('overview');
  const [query, setQuery] = useState('');
  const [cmp, setCmp] = useState({});
  const body = useData(async () => (await gitlab.branches(frame.id)).data, [frame.id]);
  const list = body.data;
  const baseName = list?.find((x) => x.default)?.name;
  // 커밋 비교(뒤/앞): 기본 브랜치와 견줘 앞뒤 커밋 수를 센다. 20개까지만 불러온다
  useEffect(() => {
    if (!list || !baseName) return undefined;
    let live = true;
    const others = list.filter((x) => !x.default).slice(0, 20);
    Promise.all(others.map(async (x) => {
      try {
        const [a, b] = await Promise.all([gitlab.compare(frame.id, baseName, x.name), gitlab.compare(frame.id, x.name, baseName)]);
        return [x.name, { ahead: a.data?.commits?.length ?? 0, behind: b.data?.commits?.length ?? 0 }];
      } catch { return null; }
    })).then((r) => { if (live) setCmp(Object.fromEntries(r.filter(Boolean))); });
    return () => { live = false; };
  }, [frame.id, baseName, list]);
  if (!frame.data) return <ProjectFrame screenId="R-07" data={frame} />;
  const now = Date.now();
  const q = query.trim().toLowerCase();
  const sorted = list ? [...list].sort((a, b) => when(b.commit) - when(a.commit)) : [];
  const defaults = sorted.filter((x) => x.default);
  const fresh = sorted.filter((x) => !x.default && now - when(x.commit) <= STALE_MS);
  const stale = sorted.filter((x) => !x.default && now - when(x.commit) > STALE_MS);
  const byTab = { active: [...defaults, ...fresh], stale, all: sorted };
  const shown = (byTab[tab] || []).filter((x) => !q || x.name.toLowerCase().includes(q));
  const tabs = [['overview', u.Br_overview, null], ['active', u.Br_active, byTab.active.length], ['stale', u.Br_stale, stale.length], ['all', u.Br_all, sorted.length]];
  return (
    <ProjectFrame screenId="R-07" tab="" tabLabel={t.RepoSub_branches} data={frame} state={list ? (list.length ? (list.length === 1 ? 'Min' : 'Ideal') : 'Empty') : body.state}>
      <div className="rb-code-area">
        <RefNav id={frame.id} active="branches" />
        {!list ? <Status {...body} /> : (
          <>
            <div className="rb-statetabs rb-brtabs" role="tablist" aria-label={u.Ref_branches}>
              {tabs.map(([k, name, n]) => (
                <button key={k} type="button" role="tab" aria-selected={tab === k} className={'rb-statetab' + (tab === k ? ' active' : '')} onClick={() => setTab(k)}>
                  <span>{name}</span>{n != null ? <span className="rb-statetab-count">{n}</span> : null}
                </button>
              ))}
            </div>
            <SearchBox value={query} onChange={setQuery} label={u.Br_search} placeholder={u.Br_search} />
            {tab === 'overview' ? (
              <>
                <section className="rb-stack-tight" aria-labelledby="br-def">
                  <h2 id="br-def" className="krds-text-body-small-bold">{u.Br_default}</h2>
                  <BranchTable id={frame.id} rows={defaults.filter((x) => !q || x.name.toLowerCase().includes(q))} ahead={cmp} />
                </section>
                <section className="rb-stack-tight" aria-labelledby="br-act">
                  <h2 id="br-act" className="krds-text-body-small-bold">{u.Br_activeList}</h2>
                  {fresh.length ? <BranchTable id={frame.id} rows={fresh.filter((x) => !q || x.name.toLowerCase().includes(q))} ahead={cmp} /> : <EmptyState title={u.Br_none} />}
                </section>
              </>
            ) : shown.length ? <BranchTable id={frame.id} rows={shown} ahead={cmp} /> : <EmptyState title={u.Br_none} />}
          </>
        )}
      </div>
    </ProjectFrame>
  );
}

export function Tags() {
  const frame = useProject();
  const [query, setQuery] = useState('');
  const body = useData(async () => (await gitlab.tags(frame.id)).data, [frame.id]);
  if (!frame.data) return <ProjectFrame screenId="R-08" data={frame} />;
  const list = body.data;
  const q = query.trim().toLowerCase();
  const shown = list ? list.filter((x) => !q || x.name.toLowerCase().includes(q)) : [];
  return (
    <ProjectFrame screenId="R-08" tab="" tabLabel={t.P18_tags} data={frame} state={list ? (list.length ? 'Ideal' : 'Empty') : body.state}>
      <div className="rb-code-area">
        <RefNav id={frame.id} active="tags" />
        <SearchBox value={query} onChange={setQuery} label={u.Tag_search} placeholder={u.Tag_search} />
        {!list ? <Status {...body} /> : shown.length ? (
          <ul className="rb-row-list">
            {shown.map((x) => (
              <li className="rb-row" key={x.name}>
                <div className="rb-row-main">
                  <p className="rb-row-title"><Link className="krds-link krds-text-body-small rb-break-any" to={`/projects/${frame.id}/code?ref=${encodeURIComponent(x.name)}`}>{x.name}</Link></p>
                  {x.commit ? (
                    <p className="krds-text-body-xsmall rb-row-meta">
                      <Link className="krds-link rb-ellipsis" to={`/projects/${frame.id}/changes/${x.commit.id}`}>{x.commit.title}</Link>
                      <span>{day(x.commit.committed_date || x.commit.created_at)}</span>
                    </p>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        ) : <EmptyState title={query ? u.List_none : t.P18_noTag} />}
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
        <RefNav id={frame.id} active="releases" />
        {!list ? <Status {...body} /> : list.length ? (
          <ol className="rb-row-list">
            {list.map((r, i) => (
              <li className="rb-row" key={r.tag_name}>
                <div className="rb-row-main">
                  <p className="rb-row-title">
                    <span className="krds-text-body-small-bold rb-break-any">{r.name || r.tag_name}</span>
                    {i === 0 ? <span className="rb-pill">{t.P18_latest}</span> : null}
                  </p>
                  <p className="krds-text-body-xsmall rb-row-meta"><span>{r.tag_name}</span><span>{day(r.released_at || r.created_at)}</span></p>
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
