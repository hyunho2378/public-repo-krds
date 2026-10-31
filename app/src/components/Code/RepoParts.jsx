// Figma: Repo/Toolbar, Repo/CommitBar, Repo/FileTable, Repo/Readme, Repo/About. GitHub와 GitLab 저장소 첫 화면 배치(D-04 개정).
import { FileIcon } from './FileIcon';
import { gitlab } from '../../api/client';
const fetchTree = async (id, ref, page) => (await gitlab.treeAll(id, ref, page)).data || [];
import { u } from '../../copy/ui';
import { newWindow } from '../Layout/newWindow';
import { toast } from '../Feedback/Toast';
import { IconButton } from '../Action/IconButton';
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
    toast(t.Home_copied);
    setTimeout(() => setNote(''), 2000);
  };
  return [note, copy];
}

export function BranchSelect({ id, current, branches = [], path }) {
  branches = branches || [];
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const list = (branches.length ? branches : [{ name: current }]).filter((b) => !q || b.name.toLowerCase().includes(q.toLowerCase()));
  // 공공 깃랩: 브랜치 단추는 회색 채움 32, 열면 맨 위에 'Git 리비전으로 검색' 입력(audit_v3 02-10, 02-15)
  return (
    <Drop label={t.Home_branchSelect} align="left" btnClass="rb-branch-btn rb-btn-fill" button={<><Icon name="ext/branch" /><span className="rb-ellipsis">{current}</span></>}>
      {(close) => (
        <div className="rb-branch-menu">
          <p className="rb-menu-title">{u.R_switchRef}</p>
          <div className="rb-menu-search">
            <label className="sr-only" htmlFor="ref-search">{u.R_searchRef}</label>
            <Icon name="search" />
            <input id="ref-search" type="search" autoFocus value={q} onChange={(e) => setQ(e.target.value)} placeholder={u.R_searchRef} autoComplete="off" />
          </div>
          <p className="rb-menu-title">{t.Home_branches || u.I_branches}</p>
          {list.length ? (
            <ul className="drop-list" aria-label={t.Home_branchSelect}>
              {list.map((b) => (
                <li key={b.name}>
                  <button type="button" className={`item-link${b.name === current ? ' active' : ''}`} aria-current={b.name === current ? 'true' : undefined} onClick={() => { close(); navigate(`/projects/${id}${path ? '/code/' + path : ''}?ref=${enc(b.name)}`); }}>
                    <span className="rb-break-any">{b.name}</span>
                  </button>
                </li>
              ))}
            </ul>
          ) : <p className="rb-menu-empty">{u.R_noRef}</p>}
        </div>
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

// 공공 깃랩 코드 메뉴: 복제(SSH, HTTPS), IDE에서 열기, 소스 코드 내려받기 4형식. 실행 방법은 우리 덧붙임(audit_v3 02-16)
export function CodeMenu({ id, zipUrl, cloneUrl, sshUrl }) {
  const [note, copy] = useCopy();
  const base = zipUrl ? zipUrl.replace(/\.zip$/, '') : '';
  const fmts = base ? [['zip', '.zip'], ['tar.gz', '.tar.gz'], ['tar.bz2', '.tar.bz2'], ['tar', '.tar']] : [];
  return (
    <>
      <Drop label={t.Home_code} btnClass="rb-btn-light" button={<><span className="rb-drop-full">{t.Home_code}</span><span className="rb-drop-compact"><Icon name="download" /><span className="sr-only">{t.Home_code}</span></span><Icon name="arrow-down" /></>}>
        {(close) => (
          <div className="rb-code-menu">
            {sshUrl ? (
              <div className="rb-code-clone">
                <p className="rb-menu-title">{u.C_ssh}</p>
                <div className="rb-code-url"><code>{sshUrl}</code><IconButton icon="copy" label={u.C_copyUrl} size="small" onClick={() => copy(sshUrl)} /></div>
              </div>
            ) : null}
            {cloneUrl ? (
              <div className="rb-code-clone">
                <p className="rb-menu-title">{u.C_https}</p>
                <div className="rb-code-url"><code>{cloneUrl}</code><IconButton icon="copy" label={u.C_copyUrl} size="small" onClick={() => copy(cloneUrl)} /></div>
              </div>
            ) : null}
            {cloneUrl ? (
              <>
                <p className="rb-menu-title">{u.C_ide}</p>
                <ul className="drop-list">
                  <li><a className="item-link" href={`vscode://vscode.git/clone?url=${encodeURIComponent(cloneUrl)}`} onClick={close}>{u.C_vscode}</a></li>
                  <li><a className="item-link" href={`jetbrains://idea/checkout/git?idea.required.plugins.id=Git4Idea&checkout.repo=${encodeURIComponent(cloneUrl)}`} onClick={close}>{u.C_intellij}</a></li>
                </ul>
              </>
            ) : null}
            {fmts.length ? (
              <>
                <p className="rb-menu-title">{u.C_download}</p>
                <ul className="rb-code-fmts">
                  {fmts.map(([label, ext]) => <li key={label}><a className="rb-btn-fill" href={base + ext}>{label}</a></li>)}
                </ul>
              </>
            ) : null}
            <ul className="drop-list rb-code-extra">
              <li><Link className="item-link" to={`/projects/${id}/use`} onClick={close}><Icon name="document" /> {t.Home_runGuide}</Link></li>
            </ul>
          </div>
        )}
      </Drop>
      <span className="sr-only" role="status" aria-live="polite">{note}</span>
    </>
  );
}

// 공공 깃랩: '파일 찾기'는 회색 채움 단추(32). 누르거나 t를 누르면 파일 찾기 대화창이 열리고 전체 파일 경로에서 거른다(audit_v3 02-1, 02-17)
export function FileFind({ id, refName }) {
  const [open, setOpen] = useState(false);
  const btn = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 't' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT' || document.activeElement?.isContentEditable) return;
      if (document.querySelector('[role="dialog"]')) return;
      e.preventDefault();
      setOpen(true);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  return (
    <>
      <button type="button" ref={btn} className="rb-btn-fill rb-find-btn" aria-haspopup="dialog" aria-keyshortcuts="T" title={`${t.Home_find} (T)`} onClick={() => setOpen(true)}>{t.Home_find}</button>
      {open ? <FileFinder id={id} refName={refName} onClose={() => { setOpen(false); requestAnimationFrame(() => btn.current?.focus()); }} /> : null}
    </>
  );
}

function FileFinder({ id, refName, onClose }) {
  const navigate = useNavigate();
  const [q, setQ] = useState('');
  const [files, setFiles] = useState(null);
  const [sel, setSel] = useState(0);
  const input = useRef(null);
  useEffect(() => {
    input.current?.focus();
    let live = true;
    gitlabTreeAll(id, refName).then((list) => { if (live) setFiles(list); }).catch(() => { if (live) setFiles([]); });
    const onKey = (e) => { if (e.key === 'Escape') { e.stopPropagation(); onClose(); } };
    document.addEventListener('keydown', onKey, true);
    return () => { live = false; document.removeEventListener('keydown', onKey, true); };
  }, [id, refName]);
  const hits = useMemo(() => {
    const k = q.trim().toLowerCase();
    return (files || []).filter((f) => !k || f.toLowerCase().includes(k)).slice(0, 20);
  }, [files, q]);
  const open = (p) => { onClose(); navigate(`/projects/${id}/code/${p.split('/').map(enc).join('/')}${refName ? `?ref=${enc(refName)}` : ''}`); };
  return (
    <div className="rb-gsdlg-dim" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className="rb-gsdlg" role="dialog" aria-modal="true" aria-label={t.Home_find}>
        <form className="rb-gsdlg-form" role="search" onSubmit={(e) => { e.preventDefault(); if (hits[sel]) open(hits[sel]); }}>
          <label className="sr-only" htmlFor="file-finder">{t.Home_findLabel}</label>
          <Icon name="search" />
          <input id="file-finder" ref={input} type="search" value={q} autoComplete="off" placeholder={u.F_placeholder} onChange={(e) => { setQ(e.target.value); setSel(0); }}
            onKeyDown={(e) => { if (e.key === 'ArrowDown') { e.preventDefault(); setSel((n) => Math.min(n + 1, hits.length - 1)); } if (e.key === 'ArrowUp') { e.preventDefault(); setSel((n) => Math.max(n - 1, 0)); } }} />
        </form>
        <div className="rb-gsdlg-list">
          <p className="rb-menu-title">{u.F_files}</p>
          {files == null ? <p className="rb-menu-empty">{u.F_loading}</p> : hits.length ? (
            <ul className="drop-list">
              {hits.map((f, i) => (
                <li key={f}><button type="button" className={'item-link' + (i === sel ? ' is-sel' : '')} onClick={() => open(f)}><FileIcon name={f.split('/').pop()} /><span className="rb-break-any">{f}</span></button></li>
              ))}
            </ul>
          ) : <p className="rb-menu-empty">{u.F_none}</p>}
        </div>
      </div>
    </div>
  );
}

/** 저장소 전체 파일 경로(재귀 트리, 100개씩 최대 10쪽). 공공 깃랩 파일 찾기와 같은 자료 */
async function gitlabTreeAll(id, ref) {
  const out = [];
  for (let page = 1; page <= 10; page++) {
    const res = await fetchTree(id, ref, page);
    out.push(...res.filter((x) => x.type === 'blob').map((x) => x.path));
    if (res.length < 100) break;
  }
  return out;
}

export function CommitBar({ id, commit, count, more, path, owner, pipeline }) {
  const [note, copy] = useCopy();
  if (!commit) return null;
  // 커밋 자료는 계정 이름(chrisryugj)만 준다. 그 계정이 이 프로젝트 소유자면 공개 이름을 쓴다.
  const org = owner && owner.path === commit.author_name ? owner.name : orgLabel(commit.author_name);
  return (
    <div className="rb-commit-bar" data-figma="commit-bar">
      <Avatar className="rb-commit-avatar" src={owner?.avatar_url} name={org} />
      <span className="rb-commit-texts">
        <Link className="rb-plain-link krds-text-body-small-bold rb-ellipsis" to={`/projects/${id}/changes/${commit.id}`}>{commit.title}</Link>
        <span className="krds-text-body-xsmall rb-subtle">{t.fn.wroteAt(org)} <Ago iso={commit.committed_date} />{t.fn.wroteSuffix}</span>
      </span>
      <p className="rb-commit-meta krds-text-body-xsmall rb-subtle">
        {pipeline ? (
          <a className={'rb-pipe is-' + (pipeline.status === 'success' ? 'ok' : pipeline.status === 'failed' ? 'fail' : 'other')} href={pipeline.web_url} {...newWindow(pipeline.status === 'success' ? u.I_pipeOk : pipeline.status === 'failed' ? u.I_pipeFail : u.I_pipe(pipeline.status))} title={pipeline.status === 'success' ? u.I_pipeOk : pipeline.status === 'failed' ? u.I_pipeFail : u.I_pipe(pipeline.status)}>
            <Icon name={pipeline.status === 'failed' ? 'sys_danger_mark' : pipeline.status === 'success' ? 'sys_success_mark' : 'ext/pipeline'} />
          </a>
        ) : null}
        <code>{commit.short_id}</code>
        <IconButton icon="copy" label={t.Home_copySha} size="small" onClick={() => copy(commit.id)} />
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
                <Link className="rb-tree-name" to={`/projects/${id}${up ? '/code/' + up : ''}${refQuery}`}><Icon name="ext/folder" /><span>{t.P16_up}</span></Link>
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
                    {f.type === 'tree' ? <Icon name="ext/folder" label={t.P16_folder} /> : <FileIcon name={f.name} label={t.P16_file} />}
                    <span className="rb-ellipsis rb-break-any">{f.name}</span>
                  </Link>
                  <span className="rb-tree-mobile krds-text-body-xsmall rb-subtle">
                    {wait ? <Skeleton widths={['60%']} inline /> : <span className="rb-ellipsis">{c ? c.title : ''}</span>}
                    <span>{c ? <Ago iso={c.committed_date} /> : ''}</span>
                  </span>
                </td>
                <td className="rb-col-msg">
                  {c ? <Link className="rb-ellipsis rb-plain-link" to={`/projects/${id}/changes/${c.id}`}>{c.title}</Link> : wait ? <Skeleton widths={['70%']} inline /> : null}
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

export function ReadmeBox({ source, base }) {
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
        <p className="krds-text-body-small-bold"><FileIcon name="README.md" /> {t.Readme_label}</p>
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
      <div className="rb-readme-body"><Readme source={source} base={base} /></div>
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
        {stats.commits === undefined ? <li><Icon name="ext/commit" /><Skeleton widths={['50%']} inline /></li> : stats.commits === null ? null : (
          <li><Icon name="ext/commit" /><Link className="krds-link" to={`/projects/${id}/changes`}>{stats.sample ? t.fn.nCommitsSample(stats.commits) : t.fn.nCommits(stats.commits, stats.more)}</Link></li>
        )}
        {stats.branches != null ? <li><Icon name="ext/branch" /><Link className="krds-link" to={`/projects/${id}/branches`}>{t.fn.nBranches(stats.branches)}</Link></li> : null}
        {stats.tags != null ? <li><Icon name="ext/tag" /><Link className="krds-link" to={`/projects/${id}/tags`}>{t.fn.nTags(stats.tags)}</Link></li> : null}
        {stats.releases != null ? <li><Icon name="ext/rocket" /><Link className="krds-link" to={`/projects/${id}/releases`}>{t.fn.nReleases(stats.releases)}</Link></li> : null}
      </ul>

    </section>
  );
}

export function RepoMenuList({ id }) {
  const items = [
    ['document-check', t.ProjectTabs_1, `/projects/${id}/about`],
    ['guide_check', t.ProjectTabs_2, `/projects/${id}/use`],
    ['ext/commit', t.ProjectTabs_4, `/projects/${id}/changes`],
    ['inquiry', t.ProjectTabs_5, `/projects/${id}/feedback`],
    ['round_check', t.Side_issues, `/projects/${id}/issues`],
    ['ext/merge-request', t.RepoSub_mr, `/projects/${id}/merge-requests`],
    ['ext/branch', t.RepoSub_branches, `/projects/${id}/branches`],
    ['ext/rocket', t.RepoSub_releases, `/projects/${id}/releases`],
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
