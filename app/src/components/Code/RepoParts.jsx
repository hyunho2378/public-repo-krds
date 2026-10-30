// Figma: Repo/Toolbar, Repo/CommitBar, Repo/FileTable, Repo/Readme, Repo/About. GitHub와 GitLab 저장소 첫 화면 배치(D-04 개정).
import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { t } from '../../copy/ko';
import { Icon } from './Icon';
import { Avatar } from '../Layout/Avatar';
import { Drop } from './Drop';
import { Skeleton } from '../Feedback/Status';
import { Readme } from '../Help/Readme';
import { orgLabel } from '../Layout/orgLabel';
import { cleanDescription } from '../Layout/StructuredList';

const day = (iso) => (iso ? new Date(iso).toLocaleDateString('ko-KR') : '');
export const enc = encodeURIComponent;

export function Ago({ iso }) {
  if (!iso) return null;
  return <time dateTime={iso} title={day(iso)}>{t.fn.ago(iso)}</time>;
}

function useCopy() {
  const [note, setNote] = useState('');
  const copy = async (text) => {
    await navigator.clipboard.writeText(text);
    setNote(t.Home_copied);
    setTimeout(() => setNote(''), 2000);
  };
  return [note, copy];
}

export function BranchSelect({ id, current, branches = [], path }) {
  branches = branches || [];
  const navigate = useNavigate();
  return (
    <Drop label={t.Home_branchSelect} align="left" btnClass="rb-branch-btn" button={<span className="rb-ellipsis">{current}</span>}>
      {(close) => (
        <ul className="drop-list" aria-label={t.Home_branchSelect}>
          {(branches || [{ name: current }]).map((b) => (
            <li key={b.name}>
              <button type="button" className={`item-link${b.name === current ? ' active' : ''}`} aria-current={b.name === current ? 'true' : undefined} onClick={() => { close(); navigate(`/projects/${id}${path ? '/code/' + path : ''}?ref=${enc(b.name)}`); }}>
                <span className="rb-break-any">{b.name}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Drop>
  );
}

/** R-27, R-28 들어가는 곳. GitHub의 "Add file" 메뉴 자리와 같다. */
export function AddFileMenu({ id, branch }) {
  const q = branch ? `?ref=${enc(branch)}` : '';
  return (
    <Drop label={t.Home_addFile} button={<><Icon name="plus" /><span className="rb-drop-full">{t.Home_addFile}</span></>}>
      {(close) => (
        <ul className="drop-list">
          <li><Link className="item-link" to={`/projects/${id}/new${q}`} onClick={close}><Icon name="document" /> {t.Write_title_new}</Link></li>
          <li><Link className="item-link" to={`/projects/${id}/upload${q}`} onClick={close}><Icon name="upload" /> {t.Write_title_upload}</Link></li>
        </ul>
      )}
    </Drop>
  );
}

export function CodeMenu({ id, zipUrl, cloneUrl }) {
  const [note, copy] = useCopy();
  return (
    <>
      <Drop label={t.Home_code} btnClass="krds-btn medium primary" button={<><span className="rb-drop-full">{t.Home_code}</span><span className="rb-drop-compact"><Icon name="download" /><span className="sr-only">{t.Home_code}</span></span></>}>
        {(close) => (
          <ul className="drop-list">
            <li><a className="item-link" href={zipUrl}><Icon name="download" /> {t.Home_zip}</a></li>
            {cloneUrl ? <li><button type="button" className="item-link" onClick={() => { copy(cloneUrl); close(); }}><Icon name="copy" /> {t.Home_https}</button></li> : null}
            <li><Link className="item-link" to={`/projects/${id}/use`} onClick={close}><Icon name="document" /> {t.Home_runGuide}</Link></li>
          </ul>
        )}
      </Drop>
      <span className="sr-only" role="status" aria-live="polite">{note}</span>
    </>
  );
}

export function FileFind({ value, onChange }) {
  const input = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 't' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <div className="krds-input-wrap rb-find">
      <label className="sr-only" htmlFor="file-find">{t.Home_findLabel}</label>
      <Icon name="search" />
      <input ref={input} id="file-find" className="krds-input small" type="search" placeholder={t.Home_find} value={value} onChange={(e) => onChange(e.target.value)} autoComplete="off" />
      <kbd className="rb-kbd" aria-hidden="true">{t.Home_findHint}</kbd>
    </div>
  );
}

export function CommitBar({ id, commit, count, more, path, owner }) {
  const [note, copy] = useCopy();
  if (!commit) return null;
  // 커밋 자료는 계정 이름(chrisryugj)만 준다. 그 계정이 이 프로젝트 소유자면 공개 이름을 쓴다.
  const org = owner && owner.path === commit.author_name ? owner.name : orgLabel(commit.author_name);
  return (
    <div className="rb-commit-bar" data-figma="commit-bar">
      <Avatar className="rb-commit-avatar" src={owner?.avatar_url} name={org} />
      <span className="rb-commit-texts">
        <Link className="krds-link krds-text-body-small-bold rb-ellipsis" to={`/projects/${id}/changes/${commit.id}`}>{commit.title}</Link>
        <span className="krds-text-body-xsmall rb-subtle">{t.fn.wroteAt(org)} <Ago iso={commit.committed_date} />{t.fn.wroteSuffix}</span>
      </span>
      <p className="rb-commit-meta krds-text-body-xsmall rb-subtle">
        <code>{commit.short_id}</code>
        <button type="button" className="krds-btn xsmall text rb-icon-btn" onClick={() => copy(commit.id)}>
          <Icon name="copy" /><span className="sr-only">{t.Home_copySha}</span>
        </button>
        <Link className="krds-btn small tertiary rb-commit-count" to={`/projects/${id}/changes${path ? `?path=${enc(path)}` : ''}`}>
          {t.Home_history}
        </Link>
        <span className="sr-only" role="status" aria-live="polite">{note}</span>
      </p>
    </div>
  );
}

export function FileTable({ id, path, items, log, pending, filter, refQuery }) {
  const sorted = useMemo(
    () => items.filter((f) => !filter || f.name.toLowerCase().includes(filter.toLowerCase())),
    [items, filter],
  );
  const up = path.includes('/') ? path.slice(0, path.lastIndexOf('/')) : '';
  return (
    <div className="krds-table-wrap rb-tree-wrap">
      <table className="tbl data rb-tree" data-figma="file-table">
        <caption className="sr-only">{t.fn.treeCount(sorted.length)}</caption>
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
                <Link className="rb-tree-name" to={`/projects/${id}${up ? '/code/' + up : ''}${refQuery}`}><Icon name="new_folder" /><span>{t.P16_up}</span></Link>
              </td>
            </tr>
          ) : null}
          {sorted.length ? sorted.map((f) => {
            const c = log?.[f.path];
            const wait = !c && pending?.has(f.path);
            return (
              <tr key={f.path}>
                <td>
                  <Link className="rb-tree-name" to={`/projects/${id}/code/${f.path}${refQuery}`}>
                    <Icon name={f.type === 'tree' ? 'new_folder' : 'document'} label={f.type === 'tree' ? t.P16_folder : t.P16_file} />
                    <span className="rb-ellipsis rb-break-any">{f.name}</span>
                  </Link>
                  <span className="rb-tree-mobile krds-text-body-xsmall rb-subtle">
                    {wait ? <Skeleton widths={['60%']} inline /> : <span className="rb-ellipsis">{c ? c.title : ''}</span>}
                    <span>{c ? <Ago iso={c.committed_date} /> : ''}</span>
                  </span>
                </td>
                <td className="rb-col-msg">
                  {c ? <Link className="krds-link rb-ellipsis rb-muted-link" to={`/projects/${id}/changes/${c.id}`}>{c.title}</Link> : wait ? <Skeleton widths={['70%']} inline /> : null}
                </td>
                <td className="rb-col-date rb-subtle">{c ? <Ago iso={c.committed_date} /> : wait ? <Skeleton widths={['50%']} inline /> : ''}</td>
              </tr>
            );
          }) : (
            <tr><td colSpan={3} className="rb-subtle">{t.Home_noMatch}</td></tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

function headings(md) {
  return (md || '').split('\n').map((l) => /^(#{1,3})\s+(.+)/.exec(l)).filter(Boolean).map((m) => ({ level: m[1].length, text: m[2].replace(/[*`]/g, '').trim() }));
}

export function ReadmeBox({ source }) {
  const [toc, setToc] = useState(false);
  const box = useRef(null);
  const list = headings(source);
  const go = (text) => {
    const h = [...(box.current?.querySelectorAll('h1,h2,h3,h4') || [])].find((x) => x.textContent.trim() === text);
    h?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    h?.setAttribute('tabindex', '-1');
    h?.focus({ preventScroll: true });
  };
  return (
    <section className="rb-readme-box" data-figma="readme" aria-label={t.Readme_label} ref={box}>
      <header className="rb-readme-head">
        <p className="krds-text-body-small-bold"><Icon name="document" /> {t.Readme_label}</p>
        {list.length > 1 ? (
          <button type="button" className="krds-btn small tertiary" aria-expanded={toc} onClick={() => setToc(!toc)}>{t.Readme_toc}</button>
        ) : null}
      </header>
      {toc ? (
        <nav className="rb-readme-toc" aria-label={t.Readme_toc}>
          <ul>
            {list.map((h, i) => (
              <li key={i} style={{ paddingLeft: `calc(var(--krds-padding-4) * ${h.level - 1})` }}>
                <button type="button" className="krds-link rb-link-button" onClick={() => go(h.text)}>{h.text}</button>
              </li>
            ))}
          </ul>
        </nav>
      ) : null}
      <div className="rb-readme-body"><Readme source={source} /></div>
    </section>
  );
}

const LANG_COLORS = ['primary', 'secondary', 'point', 'success', 'warning', 'information'];

export function About({ id, project, readme, languages, stats, summary }) {
  const topics = project.topics || project.tag_list || [];
  const [allTopics, setAllTopics] = useState(false);
  const shown = allTopics ? topics : topics.slice(0, 5);
  const desc = cleanDescription(project.description);
  const langs = Object.entries(languages || {}).sort((a, b) => b[1] - a[1]);
  return (
    <section className="rb-about-block" data-figma="about" aria-labelledby="about-title">
      <h2 id="about-title" className="krds-text-body-small-bold">{t.About_title}</h2>
      <div className="rb-about-does">
        <p className="krds-text-body-small-bold">{t.About_does}</p>
        <p className="krds-text-body-small rb-clamp-3">{summary || desc || t.About_noDesc}</p>
      </div>
      {topics.length ? (
        <div className="rb-labels" aria-label={t.About_topics}>
          {shown.map((tp) => <Link key={tp} className="rb-pill" to={`/search?topic=${enc(tp)}`}>{tp}</Link>)}
          {topics.length > 5 && !allTopics ? <button type="button" className="krds-btn xsmall text" onClick={() => setAllTopics(true)}>{t.fn.moreTopics(topics.length - 5)}</button> : null}
        </div>
      ) : null}
      <ul className="rb-about-links krds-text-body-small">
        {stats.commits === undefined ? <li><Icon name="time" /><Skeleton widths={['50%']} inline /></li> : stats.commits === null ? null : (
          <li><Icon name="time" /><Link className="krds-link" to={`/projects/${id}/changes`}>{stats.sample ? t.fn.nCommitsSample(stats.commits) : t.fn.nCommits(stats.commits, stats.more)}</Link></li>
        )}
        {stats.branches != null ? <li><Icon name="share" /><Link className="krds-link" to={`/projects/${id}/branches`}>{t.fn.nBranches(stats.branches)}</Link></li> : null}
        {stats.tags != null ? <li><Icon name="scrap" /><Link className="krds-link" to={`/projects/${id}/branches`}>{t.fn.nTags(stats.tags)}</Link></li> : null}
        {stats.releases != null ? <li><Icon name="upload" /><Link className="krds-link" to={`/projects/${id}/releases`}>{t.fn.nReleases(stats.releases)}</Link></li> : null}
      </ul>

    </section>
  );
}

export function RepoMenuList({ id }) {
  const items = [
    ['document-check', t.ProjectTabs_1, `/projects/${id}/about`],
    ['guide_check', t.ProjectTabs_2, `/projects/${id}/use`],
    ['time', t.ProjectTabs_4, `/projects/${id}/changes`],
    ['inquiry', t.ProjectTabs_5, `/projects/${id}/feedback`],
    ['round_check', t.Side_issues, `/projects/${id}/issues`],
    ['edit', t.RepoSub_mr, `/projects/${id}/merge-requests`],
    ['share', t.RepoSub_branches, `/projects/${id}/branches`],
    ['upload', t.RepoSub_releases, `/projects/${id}/releases`],
    ['myinfo', t.RepoSub_people, `/projects/${id}/contributors`],
  ];
  return (
    <nav className="rb-menu-list" aria-label={t.About_menu}>
      <ul>
        {items.map(([icon, label, to]) => (
          <li key={to}><Link to={to}><Icon name={icon} /><span>{label}</span><Icon name="arrow-right" /></Link></li>
        ))}
      </ul>
    </nav>
  );
}
