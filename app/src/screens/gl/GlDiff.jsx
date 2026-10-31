// C1 변경 비교(커밋 상세 14, 14b, 14c, 리비전 비교 19). 공공 깃랩: 위 줄(n개 파일 +a -d, 모두 펼침/접기, 보기 방식),
// 왼쪽 파일 패널(목록/트리 보기, 검색), 오른쪽 파일별 접이식 비교.
import { FileIcon } from '../../components/Code/FileIcon';
import { useMemo, useState } from 'react';
import { g } from '../../copy/gl';
import { Icon } from '../../components/Code/Icon';
import { IconButton } from '../../components/Action/IconButton';
import { Menu } from '../../components/Navigation/Menu';
import { parseHunks, diffStat } from '../../components/Code/DiffView';
import { Link } from 'react-router-dom';
import { gitlab } from '../../api/client';
import { CopyButton } from './parts';

const nameOf = (f) => f.new_path || f.old_path || '';

function pair(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i += 1) {
    const r = rows[i];
    if (r.kind === 'del') {
      const d = [];
      while (rows[i]?.kind === 'del') d.push(rows[i++]);
      const a = [];
      while (rows[i]?.kind === 'add') a.push(rows[i++]);
      i -= 1;
      for (let k = 0; k < Math.max(d.length, a.length); k += 1) out.push([d[k] || null, a[k] || null]);
    } else if (r.kind === 'add') out.push([null, r]);
    else if (r.kind === 'hunk') out.push([r, r]);
    else out.push([r, r]);
  }
  return out;
}

function Stat({ add, del }) {
  return (
    <span className="gl-stat">
      <span className="gl-add">{`+${add}`}</span>
      <span className="gl-del">{`-${del}`}</span>
    </span>
  );
}

const CTX = 20;

function FileBlock({ file, index, mode, open, onToggle, id, refName, webUrl }) {
  const base = useMemo(() => parseHunks(file.diff), [file.diff]);
  const [lines, setLines] = useState(null);
  const [above, setAbove] = useState(0);
  const [below, setBelow] = useState(0);
  const [failed, setFailed] = useState(false);
  const canExpand = id && refName && file.new_path && !file.deleted_file && !file.new_file && base.length > 0 && !failed;
  const load = async () => {
    if (lines) return lines;
    try {
      const txt = (await gitlab.fileRaw(id, file.new_path, refName)).data;
      const l = String(txt ?? '').replace(/\r\n/g, '\n').split('\n');
      setLines(l);
      return l;
    } catch { setFailed(true); return null; }
  };
  const rows = useMemo(() => {
    if (!lines || (!above && !below)) return base;
    const body = base.filter((r) => r.kind !== 'hunk');
    if (!body.length) return base;
    const first = body[0];
    const n0 = first.b ?? first.a;
    const up = [];
    for (let n = Math.max(1, n0 - above); n < n0; n += 1) up.push({ kind: 'ctx', a: n, b: n, text: lines[n - 1] ?? '' });
    const lastA = [...body].reverse().find((r) => r.a !== undefined);
    const lastB = [...body].reverse().find((r) => r.b !== undefined);
    const nextA = (lastA?.a ?? 0) + 1;
    const nextB = (lastB?.b ?? 0) + 1;
    const down = [];
    for (let k = 0; k < below && nextB + k <= lines.length; k += 1) down.push({ kind: 'ctx', a: nextA + k, b: nextB + k, text: lines[nextB + k - 1] ?? '' });
    const h0 = base[0]?.kind === 'hunk';
    return [...(h0 ? [base[0]] : []), ...up, ...(h0 ? base.slice(1) : base), ...down];
  }, [base, lines, above, below]);
  const firstN = (base.find((r) => r.kind !== 'hunk') || {});
  const startN = (firstN.b ?? firstN.a ?? 1) - above;
  const moreAbove = canExpand && startN > 1;
  const lastB0 = [...base].reverse().find((r) => r.b !== undefined);
  const moreBelow = canExpand && (!lines || ((lastB0?.b ?? 0) + below) < lines.length);
  const expand = async (dir) => { const l = await load(); if (!l) return; if (dir === 'up') setAbove((v) => v + CTX); else setBelow((v) => v + CTX); };
  const st = useMemo(() => diffStat([file]), [file]);
  const name = nameOf(file);
  return (
    <section className="gl-file" id={`file-${index}`} aria-label={name} data-figma="diff-file">
      <header className="gl-file-head">
        <button type="button" className={'gl-fold' + (open ? ' is-open' : '')} aria-expanded={open} aria-label={open ? g.hideFile : g.showFile} onClick={onToggle}>
          <Icon name="arrow-down" />
        </button>
        <span className="gl-file-name">{name}</span>
        <CopyButton text={name} label={g.copyPath} />
        <span className="gl-file-side">
          <Stat add={st.add} del={st.del} />
          <Menu label={g.moreOpts} align="right" toggle={false} btnClass="krds-btn text rb-iconbtn is-small" button={<Icon name="ellipsis_vertical" />}>
            {(close) => (
              <ul className="drop-list">
                {id && refName ? <li><Link className="item-link" to={`/projects/${id}/code/${(file.new_path || name).split('/').map(encodeURIComponent).join('/')}?ref=${encodeURIComponent(refName)}`} onClick={close}>{g.viewAtCommit}</Link></li> : null}
                {webUrl && refName ? <li><a className="item-link" href={`${webUrl}/-/raw/${encodeURIComponent(refName)}/${(file.new_path || name).split('/').map(encodeURIComponent).join('/')}`} onClick={close}>{g.openRawAtCommit}</a></li> : null}
                <li><button type="button" className="item-link" onClick={() => { navigator.clipboard.writeText(name); close(); }}>{g.copyPath}</button></li>
              </ul>
            )}
          </Menu>
        </span>
      </header>
      {open && file.diff ? (
        <div className="gl-code-scroll rb-table-scroll" tabIndex={0} aria-label={name}>
          <table className="gl-diff-table">
            <tbody>
              {moreAbove ? <tr className="is-hunk"><td colSpan={mode === 'parallel' ? 4 : 3}><button type="button" className="gl-expand" aria-label={g.showAbove} title={g.showAbove} onClick={() => expand('up')}><Icon name="upload" /></button></td></tr> : null}
              {mode === 'parallel'
                ? pair(rows).map(([l, r], i) => (l?.kind === 'hunk' ? (
                  <tr key={i} className="is-hunk"><td colSpan={4}><code>{l.text}</code></td></tr>
                ) : (
                  <tr key={i}>
                    <td className="gl-no">{l?.a ?? ''}</td>
                    <td className={'gl-ln' + (l?.kind === 'del' ? ' is-del' : '')}><code>{l ? l.text : ''}</code></td>
                    <td className="gl-no">{r?.b ?? ''}</td>
                    <td className={'gl-ln' + (r?.kind === 'add' ? ' is-add' : '')}><code>{r ? r.text : ''}</code></td>
                  </tr>
                )))
                : rows.map((r, i) => (r.kind === 'hunk' ? (
                  <tr key={i} className="is-hunk"><td colSpan={3}><code>{r.text}</code></td></tr>
                ) : (
                  <tr key={i} className={r.kind === 'add' ? 'is-add' : r.kind === 'del' ? 'is-del' : undefined}>
                    <td className="gl-no">{r.a ?? ''}</td>
                    <td className="gl-no">{r.b ?? ''}</td>
                    <td className="gl-ln"><code>{(r.kind === 'add' ? '+' : r.kind === 'del' ? '-' : ' ') + r.text}</code></td>
                  </tr>
                )))}
              {moreBelow ? <tr className="is-hunk"><td colSpan={mode === 'parallel' ? 4 : 3}><button type="button" className="gl-expand" aria-label={g.showBelow} title={g.showBelow} onClick={() => expand('down')}><Icon name="download" /></button></td></tr> : null}
            </tbody>
          </table>
        </div>
      ) : null}
    </section>
  );
}

function treeOf(files) {
  const root = { dirs: new Map(), files: [] };
  files.forEach((f, i) => {
    const parts = nameOf(f).split('/');
    let node = root;
    parts.slice(0, -1).forEach((d) => {
      if (!node.dirs.has(d)) node.dirs.set(d, { dirs: new Map(), files: [] });
      node = node.dirs.get(d);
    });
    node.files.push({ name: parts[parts.length - 1], index: i });
  });
  return root;
}

const jump = (i) => document.getElementById(`file-${i}`)?.scrollIntoView({ block: 'start' });

function FileLine({ name, index, stat }) {
  return (
    <li>
      <button type="button" className="gl-pl-file" onClick={() => jump(index)}>
        <FileIcon name={name} /><span className="gl-pl-name">{name}</span>
        <Stat add={stat.add} del={stat.del} />
      </button>
    </li>
  );
}

function TreeNode({ node, stats }) {
  return (
    <ul className="gl-pl-list">
      {[...node.dirs.entries()].map(([name, child]) => (
        <li key={name}>
          <details open>
            <summary className="gl-pl-dir"><Icon name="ext/folder" /><span className="gl-pl-name">{name}</span></summary>
            <TreeNode node={child} stats={stats} />
          </details>
        </li>
      ))}
      {node.files.map((f) => <FileLine key={f.index} name={f.name} index={f.index} stat={stats[f.index]} />)}
    </ul>
  );
}

export function GlDiff({ files, id, refName, webUrl }) {
  const [mode, setMode] = useState('parallel');
  const [panel, setPanel] = useState(true);
  const [view, setView] = useState('tree');
  const [q, setQ] = useState('');
  const [closed, setClosed] = useState({});
  const stats = useMemo(() => files.map((f) => diffStat([f])), [files]);
  const total = useMemo(() => diffStat(files), [files]);
  const shown = files.map((f, i) => i).filter((i) => !q || nameOf(files[i]).toLowerCase().includes(q.toLowerCase()));
  const setAll = (v) => setClosed(Object.fromEntries(files.map((_, i) => [i, v])));
  return (
    <div className="gl-diff">
      <div className="gl-diff-bar">
        <IconButton icon={panel ? 'panel_close' : 'panel_open'} label={panel ? g.hideTree : g.showTree} size="medium" aria-expanded={panel} onClick={() => setPanel(!panel)} />
        <p className="gl-diff-total">
          <Icon name="document" /><span>{g.filesN(files.length)}</span><Stat add={total.add} del={total.del} />
        </p>
        <IconButton icon="expand_more" label={g.expandAll} size="small" onClick={() => setAll(false)} />
        <IconButton icon="arrow-right" label={g.collapseAll} size="small" onClick={() => setAll(true)} />
        <div className="gl-seg" role="group" aria-label={g.viewMode}>
          <IconButton icon="document" label={g.inline} size="small" aria-pressed={mode === 'inline'} className={mode === 'inline' ? 'is-on' : ''} onClick={() => setMode('inline')} />
          <IconButton icon="ext/code" label={g.parallel} size="small" aria-pressed={mode === 'parallel'} className={mode === 'parallel' ? 'is-on' : ''} onClick={() => setMode('parallel')} />
        </div>
      </div>
      <div className={'gl-diff-main' + (panel ? ' has-panel' : '')} data-figma="diff-area">
        {panel ? (
          <aside className="gl-panel" aria-label={g.files}>
            <div className="gl-panel-head">
              <p className="gl-panel-title">{g.files}<span className="gl-tab-count">{files.length}</span></p>
              <div className="gl-seg" role="group" aria-label={g.viewMode}>
                <IconButton icon="view_all" label={g.listView} size="small" aria-pressed={view === 'list'} className={view === 'list' ? 'is-on' : ''} onClick={() => setView('list')} />
                <IconButton icon="ext/folder" label={g.treeView} size="small" aria-pressed={view === 'tree'} className={view === 'tree' ? 'is-on' : ''} onClick={() => setView('tree')} />
              </div>
            </div>
            <div className="gl-filter-field">
              <input type="search" className="gl-filter-input" value={q} placeholder={g.fileFilter} aria-label={g.fileFilter} onChange={(e) => setQ(e.target.value)} />
              <span className="gl-filter-go"><Icon name="search" /></span>
            </div>
            {view === 'tree' && !q ? <TreeNode node={treeOf(files)} stats={stats} /> : (
              <ul className="gl-pl-list">{shown.map((i) => <FileLine key={i} name={nameOf(files[i])} index={i} stat={stats[i]} />)}</ul>
            )}
          </aside>
        ) : null}
        <div className="gl-files">
          {files.map((f, i) => <FileBlock key={i} file={f} index={i} id={id} refName={refName} webUrl={webUrl} mode={mode} open={!closed[i]} onToggle={() => setClosed({ ...closed, [i]: !closed[i] })} />)}
        </div>
      </div>
    </div>
  );
}
