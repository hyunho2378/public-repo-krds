// Figma: Code/DiffView. 변경 비교(D-05): 한 줄로 보기(통합), 나란히 보기. 줄 앞 +, - 표시로 색에만 기대지 않는다.
import { useEffect, useState } from 'react';
import { u } from '../../copy/ui';
import { useBoolPref } from '../../app/prefs';
import { t } from '../../copy/ko';
import { Icon } from './Icon';

const BIG = 400;

export function parseHunks(diff) {
  const rows = [];
  let a = 0;
  let b = 0;
  for (const line of (diff || '').split('\n')) {
    const h = /^@@ -(\d+)(?:,\d+)? \+(\d+)(?:,\d+)? @@(.*)/.exec(line);
    if (h) {
      a = Number(h[1]);
      b = Number(h[2]);
      rows.push({ kind: 'hunk', text: line });
    } else if (line.startsWith('+')) rows.push({ kind: 'add', b: b++, text: line.slice(1) });
    else if (line.startsWith('-')) rows.push({ kind: 'del', a: a++, text: line.slice(1) });
    else if (line.startsWith('\\')) continue;
    else if (line.length || rows.length) rows.push({ kind: 'ctx', a: a++, b: b++, text: line.slice(1) });
  }
  while (rows.length && rows[rows.length - 1].kind === 'ctx' && !rows[rows.length - 1].text) rows.pop();
  return rows;
}

export function diffStat(files) {
  let add = 0;
  let del = 0;
  for (const f of files) for (const r of parseHunks(f.diff)) {
    if (r.kind === 'add') add += 1;
    if (r.kind === 'del') del += 1;
  }
  return { add, del };
}

function pairRows(rows) {
  const out = [];
  for (let i = 0; i < rows.length; i += 1) {
    const r = rows[i];
    if (r.kind === 'del') {
      const dels = [];
      while (rows[i]?.kind === 'del') dels.push(rows[i++]);
      const adds = [];
      while (rows[i]?.kind === 'add') adds.push(rows[i++]);
      i -= 1;
      for (let k = 0; k < Math.max(dels.length, adds.length); k += 1) out.push([dels[k] || null, adds[k] || null]);
    } else if (r.kind === 'add') out.push([null, r]);
    else out.push([r, r]);
  }
  return out;
}

function FileDiff({ file, mode, index }) {
  const rows = parseHunks(file.diff);
  const [open, setOpen] = useState(rows.length <= BIG);
  const stat = diffStat([file]);
  const name = file.renamed_file ? `${file.new_path} (${u.Diff_prev} ${file.old_path})` : file.new_path;
  const badge = file.new_file ? t.P17_new : file.deleted_file ? t.P17_deleted : file.renamed_file ? t.P17_renamed : null;
  return (
    <section className="rb-diff-file" id={`file-${index}`} aria-label={name}>
      <header className="rb-diff-head">
        <span className="rb-diff-name">
          <Icon name="document" />
          <span className="rb-ellipsis rb-break-any">{name}</span>
          {badge ? <span className="rb-pill">{badge}</span> : null}
        </span>
        <span className="krds-text-body-xsmall rb-subtle">{t.fn.diffStat(stat.add, stat.del)}</span>
      </header>
      {!file.diff ? (
        <p className="krds-text-body-small rb-code-note rb-diff-note">{t.P17_noDiff}</p>
      ) : !open ? (
        <p className="rb-diff-note">
          <span className="krds-text-body-xsmall rb-subtle">{t.P17_tooBig}</span>{' '}
          <button type="button" className="krds-btn small tertiary" onClick={() => setOpen(true)}>{t.P17_expand}</button>
        </p>
      ) : (
        <div className="rb-code-scroll" tabIndex={0} aria-label={name}>
          <table className={`rb-code-table rb-diff rb-diff-${mode}`}>
            <tbody>
              {mode === 'split'
                ? pairRows(rows).map(([l, r], i) =>
                    l?.kind === 'hunk' ? (
                      <tr key={i} className="is-hunk"><td colSpan={4}><code>{l.text}</code></td></tr>
                    ) : (
                      <tr key={i}>
                        <td className="rb-code-no">{l?.a ?? ''}</td>
                        <td className={`rb-code-line ${l?.kind === 'del' ? 'is-del' : ''}`}><code>{l ? (l.kind === 'del' ? '- ' : '  ') + l.text : ''}</code></td>
                        <td className="rb-code-no">{r?.b ?? ''}</td>
                        <td className={`rb-code-line ${r?.kind === 'add' ? 'is-add' : ''}`}><code>{r ? (r.kind === 'add' ? '+ ' : '  ') + r.text : ''}</code></td>
                      </tr>
                    ),
                  )
                : rows.map((r, i) =>
                    r.kind === 'hunk' ? (
                      <tr key={i} className="is-hunk"><td colSpan={3}><code>{r.text}</code></td></tr>
                    ) : (
                      <tr key={i} className={r.kind === 'add' ? 'is-add' : r.kind === 'del' ? 'is-del' : undefined}>
                        <td className="rb-code-no">{r.a ?? ''}</td>
                        <td className="rb-code-no">{r.b ?? ''}</td>
                        <td className="rb-code-line"><code>{r.kind === 'add' ? '+ ' : r.kind === 'del' ? '- ' : '  '}{r.text}</code></td>
                      </tr>
                    ),
                  )}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

function buildTree(files) {
  const root = { dirs: new Map(), files: [] };
  files.forEach((f, i) => {
    const parts = (f.new_path || f.old_path || '').split('/');
    let node = root;
    parts.slice(0, -1).forEach((dir) => {
      if (!node.dirs.has(dir)) node.dirs.set(dir, { dirs: new Map(), files: [] });
      node = node.dirs.get(dir);
    });
    node.files.push({ name: parts[parts.length - 1], index: i });
  });
  return root;
}

const jump = (i) => document.getElementById(`file-${i}`)?.scrollIntoView({ block: 'start' });

function TreeNode({ node }) {
  return (
    <ul className="rb-dtree-list">
      {[...node.dirs.entries()].map(([name, child]) => (
        <li key={name}>
          <details open>
            <summary className="rb-dtree-dir"><Icon name="new_folder" /><span className="rb-break-any">{name}</span></summary>
            <TreeNode node={child} />
          </details>
        </li>
      ))}
      {node.files.map((f) => (
        <li key={f.index}>
          <button type="button" className="rb-dtree-file" onClick={() => jump(f.index)}>
            <Icon name="document" /><span className="rb-break-any">{f.name}</span>
          </button>
        </li>
      ))}
    </ul>
  );
}

export function DiffView({ files }) {
  const [mode, setMode] = useState('unified');
  const [treeOpen, setTreeOpen] = useBoolPref('rb-difftree-open', true);
  useEffect(() => {
    const onB = (e) => {
      if (e.key !== 'b' || e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = document.activeElement?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || document.activeElement?.isContentEditable) return;
      e.preventDefault();
      setTreeOpen(!treeOpen);
    };
    document.addEventListener('keydown', onB);
    return () => document.removeEventListener('keydown', onB);
  }, [treeOpen, setTreeOpen]);
  const tree = buildTree(files);
  return (
    <div className={'rb-diff-layout' + (treeOpen ? ' has-tree' : '')}>
      {treeOpen ? (
        <nav className="rb-dtree" aria-label={u.Diff_tree}>
          <TreeNode node={tree} />
        </nav>
      ) : null}
      <div className="rb-diffs">
        <div className="rb-diff-bar">
          <div className="rb-diff-bar-left">
            <button type="button" className="krds-btn small tertiary" title={`${u.Tree_toggle} (B)`} aria-expanded={treeOpen} aria-keyshortcuts="B" onClick={() => setTreeOpen(!treeOpen)}>
              <Icon name="view_all" />
              <span>{u.Diff_treeToggle}</span>
            </button>
            <p className="krds-text-body-small-bold">{t.fn.filesChanged(files.length)}</p>
          </div>
          <div className="krds-form-chip rb-diff-mode" role="radiogroup" aria-label={t.P17_view}>
            {[['unified', t.P17_unified], ['split', t.P17_split]].map(([v, label]) => (
              <button key={v} type="button" role="radio" aria-checked={mode === v} className={`krds-btn small ${mode === v ? 'primary' : 'tertiary'} rb-mode-${v}`} onClick={() => setMode(v)}>{label}</button>
            ))}
          </div>
        </div>
        {files.map((f, i) => <FileDiff key={i} file={f} mode={mode} index={i} />)}
      </div>
    </div>
  );
}
