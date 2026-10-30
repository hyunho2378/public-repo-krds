// Figma: Repo/FileTree. GitLab 파일 트리 패널: 파일 검색(f), 폴더 펼침, 현재 위치 강조. 폴더는 펼칠 때 불러온다.
import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';
import { gitlab } from '../../api/client';
import { Icon } from './Icon';

function Node({ id, item, current, refQuery, depth, filter }) {
  const isDir = item.type === 'tree';
  const onPath = current === item.path || current.startsWith(item.path + '/');
  const [open, setOpen] = useState(isDir && onPath);
  const [kids, setKids] = useState(null);
  useEffect(() => {
    if (open && isDir && !kids) gitlab.tree(id, item.path).then((r) => setKids(r.data)).catch(() => setKids([]));
  }, [open, isDir, kids, id, item.path]);
  if (filter && !isDir && !item.name.toLowerCase().includes(filter)) return null;
  const sorted = (kids || []).slice().sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'tree' ? -1 : 1));
  return (
    <li role="treeitem" aria-expanded={isDir ? open : undefined} aria-selected={current === item.path}>
      <div className={`rb-ft-row${current === item.path ? ' is-current' : ''}`} style={{ paddingLeft: `calc(var(--krds-padding-4) * ${depth})` }}>
        {isDir ? (
          <button type="button" className="rb-ft-toggle" aria-label={item.name} onClick={() => setOpen(!open)}>
            <i className="svg-icon ico-toggle" aria-hidden="true" style={{ transform: open ? 'none' : 'rotate(-90deg)' }} />
          </button>
        ) : <span className="rb-ft-gap" aria-hidden="true" />}
        <Link className="rb-ft-link" to={`/projects/${id}/code/${item.path}${refQuery}`} aria-current={current === item.path ? 'page' : undefined}>
          <Icon name={isDir ? 'new_folder' : 'document'} />
          <span className="rb-ellipsis rb-break-any">{item.name}</span>
        </Link>
      </div>
      {isDir && open ? (
        kids ? (
          <ul role="group">{sorted.map((k) => <Node key={k.path} id={id} item={k} current={current} refQuery={refQuery} depth={depth + 1} filter={filter} />)}</ul>
        ) : <p className="krds-text-body-xsmall rb-subtle rb-ft-loading" role="status">{t.Tree_loading}</p>
      ) : null}
    </li>
  );
}

export function FileTreePanel({ id, items, current, refQuery }) {
  const [q, setQ] = useState('');
  const input = useRef(null);
  useEffect(() => {
    const onKey = (e) => {
      if (e.key !== 'f' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;
      e.preventDefault();
      input.current?.focus();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);
  const sorted = (items || []).slice().sort((a, b) => (a.type === b.type ? a.name.localeCompare(b.name) : a.type === 'tree' ? -1 : 1));
  return (
    <aside className="rb-filetree" aria-label={t.Tree_label}>
      <div className="krds-input-wrap rb-find">
        <label className="sr-only" htmlFor="tree-find">{t.Tree_search}</label>
        <Icon name="search" />
        <input ref={input} id="tree-find" className="krds-input small" type="search" placeholder={t.Tree_search} value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" />
        <kbd className="rb-kbd" aria-hidden="true">{t.Tree_hint}</kbd>
      </div>
      <ul role="tree" aria-label={t.Tree_label} className="rb-ft">
        {sorted.map((it) => <Node key={it.path} id={id} item={it} current={current} refQuery={refQuery} depth={0} filter={q.toLowerCase()} />)}
      </ul>
    </aside>
  );
}
