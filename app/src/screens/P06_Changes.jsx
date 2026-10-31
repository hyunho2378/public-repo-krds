// P-06 커밋 목록. 공공 깃랩 캡처 13 구성: 브랜치 선택 + 프로젝트 이름, 제목 '커밋', 필터 막대, 날짜 묶음 제목, 행(아바타, 제목 굵게, 작성자와 시간, 태그, 해시, 복사, 파일 찾아보기, 본문 펼침).
import { useMemo, useState } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { g } from '../copy/gl';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { Icon } from '../components/Code/Icon';
import { IconButton } from '../components/Action/IconButton';
import { newWindow } from '../components/Layout/newWindow';
import { Menu } from '../components/Navigation/Menu';
import { Avatar } from '../components/Layout/Avatar';
import { orgLabel } from '../components/Layout/orgLabel';
import { enc, groupByDay } from './parts/repoCommon';
import { CopyButton, FilterField } from './gl/parts';
import { readPref, writePref } from '../app/prefs';
import './gl/gl.css';
import '../components/Code/code.css';

function CommitRow({ id, c, owner, tags, path, open, onToggle }) {
  const who = owner && owner.path === c.author_name ? owner.name : orgLabel(c.author_name);
  const body = (c.message || '').replace(c.title, '').trim();
  return (
    <li className="gl-crow">
      <div className="gl-crow-line">
        <Avatar className="is-32" src={owner?.avatar_url} name={who} />
        <div className="gl-ref-main gl-grow">
          <p className="gl-ref-name"><Link to={`/projects/${id}/changes/${c.id}`}>{c.title}</Link></p>
          <p className="gl-ref-meta"><span>{c.author_name}</span><time dateTime={c.committed_date}>{g.wrote} {t.fn.ago(c.committed_date)}</time></p>
        </div>
        <div className="gl-ref-side">
          {tags.map((n) => <span key={n} className="rb-pill"><Icon name="ext/tag" />{n}</span>)}
          <code className="gl-sha">{c.short_id}</code>
          <CopyButton text={c.id} label={g.copySha} />
          <IconButton icon="ext/folder" label={g.browseFiles} size="small" to={`/projects/${id}/code${path ? '/' + path.split('/').map(enc).join('/') : ''}?ref=${enc(c.id)}`} />
          <button type="button" className={'gl-fold' + (open ? ' is-open' : '')} aria-expanded={open} aria-label={open ? g.collapseBody : g.expandBody} onClick={onToggle}><Icon name="arrow-down" /></button>
        </div>
      </div>
      {open ? <pre className="gl-commit-body">{body || c.title}</pre> : null}
    </li>
  );
}

export default function Changes() {
  const [params, setParams] = useSearchParams();
  const navigate = useNavigate();
  const path = params.get('path') || '';
  const ref = params.get('ref') || '';
  const frame = useProject();
  const [page, setPage] = useState(1);
  const [extra, setExtra] = useState([]);
  const [next, setNext] = useState(null);
  const [q, setQ] = useState('');
  const [openIds, setOpenIds] = useState({});
  const [folded, setFolded] = useState({});
  const [recent, setRecent] = useState(() => { try { return JSON.parse(readPref('rb-commit-recent') || '[]'); } catch { return []; } });
  const remember = (v) => { const s = v.trim(); if (s.length < 1) return; const n = [s, ...recent.filter((x) => x !== s)].slice(0, 5); setRecent(n); writePref('rb-commit-recent', JSON.stringify(n)); };
  const list = useData(async () => {
    const r = await gitlab.commits(frame.id, { path, ref });
    setExtra([]);
    setPage(1);
    setNext(r.pagination?.nextPage || null);
    return r.data;
  }, [frame.id, path, ref]);
  const refs = useData(async () => {
    const [b, tg] = await Promise.all([gitlab.branches(frame.id).then((r) => r.data).catch(() => []), gitlab.tags(frame.id).then((r) => r.data).catch(() => [])]);
    return { branches: b || [], tags: tg || [] };
  }, [frame.id]);
  const tagOf = useMemo(() => {
    const m = {};
    (refs.data?.tags || []).forEach((x) => { const sha = x.commit?.id || x.target; if (sha) (m[sha] = m[sha] || []).push(x.name); });
    return m;
  }, [refs.data]);
  const more = async () => {
    const r = await gitlab.commits(frame.id, { path, ref, page: page + 1 });
    setExtra((x) => [...x, ...r.data]);
    setPage(page + 1);
    setNext(r.pagination?.nextPage || null);
  };
  if (!frame.data) return <ProjectFrame screenId="R-04" data={frame} />;
  const project = frame.data.project;
  const cur = ref || project.default_branch || 'main';
  const needle = q.trim().toLowerCase();
  const all = list.data ? [...list.data, ...extra] : [];
  const items = needle ? all.filter((c) => `${c.title} ${c.author_name} ${c.short_id}`.toLowerCase().includes(needle)) : all;
  const state = list.data ? (all.length ? (all.length === 1 ? 'Min' : 'Ideal') : 'Empty') : list.state;
  const pick = (n) => { const p = new URLSearchParams(params); if (n === project.default_branch) p.delete('ref'); else p.set('ref', n); setParams(p); };
  return (
    <ProjectFrame screenId="R-04" tab="/changes" tabLabel={t.ProjectTabs_4} data={frame} state={state}>
      <div className="gl-page">
        <div className="gl-histtop">
          <Menu label={g.refSelect} align="left" btnClass="rb-branch-btn" button={<><Icon name="ext/branch" /><span className="rb-ellipsis">{cur}</span></>}>
            {(close) => (
              <ul className="drop-list" aria-label={g.refSelect}>
                {[...(refs.data?.branches || []), ...(refs.data?.tags || [])].map((x) => (
                  <li key={x.name}><button type="button" className={'item-link' + (x.name === cur ? ' active' : '')} onClick={() => { close(); pick(x.name); }}>{x.name}</button></li>
                ))}
              </ul>
            )}
          </Menu>
          <span className="gl-histproject">{project.path || project.name}</span>
        </div>
        <div className="gl-head" data-figma="page-head">
          <h1 className="gl-title">{g.histTitle}</h1>
          <div className="gl-head-actions"><Menu label={g.moreOpts} align="right" toggle={false} btnClass="krds-btn text rb-iconbtn is-small" button={<Icon name="ellipsis_vertical" />}>{(close) => (<ul className="drop-list"><li><a className="item-link" href={`${project.web_url}/-/commits/${encodeURIComponent(cur)}?format=atom`} {...newWindow(g.rss)} onClick={close}>{g.rss}</a></li></ul>)}</Menu></div>
        </div>
        {path ? (
          <p className="gl-ref-meta"><code className="rb-break-any">{path}</code><Link className="krds-link" to={`/projects/${frame.id}/changes`}>{t.P06_clearFilter}</Link></p>
        ) : null}
        <div className="gl-bar is-bare" data-figma="gl-filter">
          <Menu label={g.histRecent} align="left" btnClass="krds-btn text rb-iconbtn is-small" button={<Icon name="time" label={g.histRecent} />}>
            {(close) => (
              <ul className="drop-list" aria-label={g.histRecent}>
                <li><p className="rb-menu-title">{g.histRecent}</p></li>
                {recent.length ? recent.map((r) => <li key={r}><button type="button" className="item-link" onClick={() => { close(); setQ(r); }}>{r}</button></li>) : <li><p className="rb-menu-title">{g.noRecent}</p></li>}
              </ul>
            )}
          </Menu>
          <div className="gl-grow" onKeyDown={(e) => { if (e.key === 'Enter') remember(q); }}><FilterField value={q} onChange={setQ} placeholder={g.histFilter} /></div>
        </div>
        {!list.data ? (
          <Status {...list} />
        ) : !items.length ? (
          <EmptyState title={g.noCommits} />
        ) : (
          <div className="gl-commit-groups">
            {groupByDay(items, 'committed_date').map((grp) => (
              <section key={grp.day} aria-label={`${t.P06_dayGroup} ${grp.day}`}>
                <h2 className="gl-dayhead"><button type="button" className="gl-dayhead-btn" aria-expanded={!folded[grp.day]} aria-label={`${grp.day} ${folded[grp.day] ? g.expandDay : g.collapseDay}`} onClick={() => setFolded({ ...folded, [grp.day]: !folded[grp.day] })}><Icon name="ext/commit" /><span>{grp.day}</span></button></h2>
                {folded[grp.day] ? null : <ul className="gl-crows">
                  {grp.items.map((c) => (
                    <CommitRow key={c.id} id={frame.id} c={c} owner={project.namespace} tags={tagOf[c.id] || []} path={path} open={!!openIds[c.id]} onToggle={() => setOpenIds({ ...openIds, [c.id]: !openIds[c.id] })} />
                  ))}
                </ul>}
              </section>
            ))}
            {next ? <div><button type="button" className="krds-btn small tertiary" onClick={more}>{g.histMore}</button></div> : null}
          </div>
        )}
      </div>
    </ProjectFrame>
  );
}
