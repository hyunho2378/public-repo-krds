// R-06 리비전 비교. 공공 깃랩 캡처 18(선택), 19(결과) 구성: 소스/대상 선택, 변경 사항 표시, 비교 단추, 소스상의 커밋, 변경 비교.
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { g } from '../copy/gl';
import { gitlab, request } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject, organizationOf } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { Icon } from '../components/Code/Icon';
import { IconButton } from '../components/Action/IconButton';
import { Menu } from '../components/Navigation/Menu';
import { Avatar } from '../components/Layout/Avatar';
import { orgLabel } from '../components/Layout/orgLabel';
import { newWindow } from '../components/Layout/newWindow';
import { CopyButton } from './gl/parts';
import { GlDiff } from './gl/GlDiff';
import './gl/gl.css';
import '../components/Code/code.css';

const enc = encodeURIComponent;

function RefPicker({ label, value, list, onChange, loading }) {
  const [q, setQ] = useState('');
  const shown = list.filter((n) => !q || n.toLowerCase().includes(q.toLowerCase()));
  return (
    <Menu label={label} align="left" btnClass="krds-btn small tertiary gl-select" button={<span className="gl-select-text">{loading ? g.loadingRef : (value || g.pickRef)}</span>}>
      {(close) => (
        <div className="gl-pick">
          <input type="search" className="gl-pick-input" value={q} placeholder={g.search} aria-label={g.search} onChange={(e) => setQ(e.target.value)} />
          <ul className="drop-list" aria-label={label}>
            {shown.map((n) => (
              <li key={n}><button type="button" className={'item-link' + (n === value ? ' active' : '')} aria-current={n === value ? 'true' : undefined} onClick={() => { close(); onChange(n); }}>{n}</button></li>
            ))}
          </ul>
        </div>
      )}
    </Menu>
  );
}

function Side({ title, name, value, list, onChange, fixedProject, loading }) {
  return (
    <div className="gl-side">
      <span className="gl-side-title">{title}</span>
      <div className="gl-side-row">
        <span className="gl-select is-fixed"><span className="gl-select-text">{fixedProject}</span></span>
        <RefPicker label={`${title} ${g.pickRef}`} value={value} list={list} onChange={onChange} loading={loading} />
      </div>
    </div>
  );
}

export default function Compare() {
  const { id } = useParams();
  const [search, setSearch] = useSearchParams();
  const frame = useProject();
  const [from, setFrom] = useState(search.get('from') || '');
  const [to, setTo] = useState(search.get('to') || '');
  const [boxOpen, setBoxOpen] = useState(true);
  const [bodyOpen, setBodyOpen] = useState({});
  const [straight, setStraight] = useState(search.get('straight') === '1');
  const [applied, setApplied] = useState(search.get('from') && search.get('to') ? { from: search.get('from'), to: search.get('to'), straight: search.get('straight') === '1' } : null);

  const refs = useData(async () => {
    const [branches, tags] = await Promise.all([
      gitlab.branches(id).then((r) => r.data).catch(() => []),
      gitlab.tags(id).then((r) => r.data).catch(() => []),
    ]);
    return [...(branches || []).map((b) => b.name), ...(tags || []).map((x) => x.name)];
  }, [id]);

  useEffect(() => {
    if (!applied) return;
    const next = new URLSearchParams(search);
    next.set('from', applied.from);
    next.set('to', applied.to);
    if (applied.straight) next.set('straight', '1'); else next.delete('straight');
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [applied]);

  const result = useData(
    async () => (applied && applied.from !== applied.to
      ? (await request(`/api/gitlab/projects/${enc(id)}/repository/compare?from=${enc(applied.from)}&to=${enc(applied.to)}${applied.straight ? '&straight=true' : ''}`)).data
      : null),
    [id, applied?.from, applied?.to, applied?.straight],
  );

  if (!frame.data) return <ProjectFrame screenId="R-06" data={frame} />;
  const project = frame.data.project;
  const owner = organizationOf(project);
  const projectName = `${owner} / ${project.name}`;
  const list = refs.data || [];
  const diffs = result.data?.diffs || [];
  const commits = [...(result.data?.commits || [])].reverse();
  const same = applied && applied.from === applied.to;
  return (
    <ProjectFrame screenId="R-06" tab="" tabLabel={g.compareTitle} data={frame} state={applied ? (same ? 'Empty' : result.state) : 'Ideal'}>
      <div className="gl-page">
        <div className="gl-head-text">
          <h1 className="gl-title">{g.compareTitle}</h1>
          <p className="gl-intro">{g.compareIntro} <a className="krds-link" href="https://docs.gitlab.com/user/project/repository/branches/#compare-branches" {...newWindow(g.compareHelp)}>{g.compareHelp}</a></p>
        </div>
        <form className="gl-compare" onSubmit={(e) => { e.preventDefault(); if (from && to) setApplied({ from, to, straight }); }}>
          <div className="gl-compare-pick">
            <Side title={g.source} value={to} list={list} onChange={setTo} fixedProject={projectName} />
            <IconButton icon="arrow-right" label={g.swap} size="medium" className="gl-swap" onClick={() => { setFrom(to); setTo(from); }} />
            <Side title={g.target} value={from} list={list} onChange={setFrom} fixedProject={projectName} loading={!!applied && result.state === 'Loading'} />
          </div>
          <fieldset className="gl-radios">
            <legend className="gl-side-title">{g.showChanges}</legend>
            <div className="krds-form-check"><input id="gl-st-0" type="radio" name="straight" checked={!straight} onChange={() => setStraight(false)} /><label htmlFor="gl-st-0">{g.onlySource}</label></div>
            <div className="krds-form-check"><input id="gl-st-1" type="radio" name="straight" checked={straight} onChange={() => setStraight(true)} /><label htmlFor="gl-st-1">{g.sinceSource}</label></div>
          </fieldset>
          <div><button type="submit" className="krds-btn small primary" disabled={!from || !to}>{g.compareBtn}</button></div>
        </form>
        {!applied ? null : same ? <EmptyState title={t.Issue_sameBranch} /> : !result.data ? <Status {...result} /> : (
          <>
            <section className="gl-box" aria-labelledby="gl-src-commits">
              <h2 id="gl-src-commits" className="gl-box-title gl-box-titlebar"><span>{g.sourceCommits} <span className="gl-tab-count">{commits.length}</span></span><button type="button" className={'gl-fold' + (boxOpen ? ' is-open' : '')} aria-expanded={boxOpen} aria-label={boxOpen ? g.collapseBox : g.expandBox} onClick={() => setBoxOpen(!boxOpen)}><Icon name="arrow-down" /></button></h2>
              {boxOpen ? <ul className="gl-rows">
                {commits.map((c) => (
                  <li key={c.id}>
                    <div className="gl-ref-row">
                      <Avatar className="is-24" src={project.namespace?.avatar_url} name={orgLabel(c.author_name)} />
                      <div className="gl-ref-main gl-grow">
                        <p className="gl-ref-name"><Link to={`/projects/${id}/changes/${c.id}`}>{c.title}</Link>{(c.message || '').replace(c.title, '').trim() ? <button type="button" className="gl-dots" aria-expanded={!!bodyOpen[c.id]} aria-label={bodyOpen[c.id] ? g.collapseBody : g.expandBody} onClick={() => setBodyOpen({ ...bodyOpen, [c.id]: !bodyOpen[c.id] })}><Icon name="ellipsis_horizontal" /></button> : null}</p>
                        {bodyOpen[c.id] ? <pre className="gl-commit-body">{(c.message || '').replace(c.title, '').trim()}</pre> : null}
                        <p className="gl-ref-meta"><time dateTime={c.created_at}>{t.fn.ago(c.created_at)}</time><span>{c.author_name}{g.commitedBy}</span></p>
                      </div>
                      <div className="gl-ref-side"><code className="gl-sha">{c.short_id}</code><CopyButton text={c.id} label={g.copySha} /></div>
                    </div>
                  </li>
                ))}
              </ul> : null}
            </section>
            {diffs.length ? <GlDiff files={diffs} id={id} refName={applied.to} webUrl={project.web_url} /> : <EmptyState title={g.noDiffHere} />}
            <div><Link className="krds-btn small primary" to={`/projects/${id}/merge-requests/new?source=${enc(applied.to)}`}>{g.toMr}</Link></div>
          </>
        )}
      </div>
    </ProjectFrame>
  );
}
