// 마크다운 그리기(해석은 markdown.js). README, 이슈 본문, 미리보기가 모두 이 부품을 거친다.
// 그림은 저장소 자신의 파일(상대 경로)과 같은 서버 그림만 불러온다. 바깥 서버 그림(배지 등)은 설명 글자로 대신한다(외부 요청 차단).
import { newWindow } from '../Layout/newWindow';
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { Icon } from '../Code/Icon';
import { languageOf, tokenize } from '../Code/highlight';
import { linkKind, parseMarkdown, plainText, repoPath, slugify } from './mdparse';
import './markdown.css';

const ID_PREFIX = 'md-';
const SHELL = new Set(['bash', 'sh', 'shell', 'zsh', 'console', 'powershell', 'ps1', 'cmd', 'bat']);

function jump(id) {
  const el = document.getElementById(id);
  if (!el) return;
  el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  el.setAttribute('tabindex', '-1');
  el.focus({ preventScroll: true });
}

function Img({ node, base }) {
  const [failed, setFailed] = useState(false);
  const { src, alt, title, width } = node;
  let url = null;
  if (/^https:\/\//i.test(src)) {
    url = src;
  } else if (base?.rawBase && !/^[a-z][a-z0-9+.-]*:/i.test(src) && !src.startsWith('//')) {
    const p = repoPath(src);
    if (p) url = base.rawBase + p.split('/').map(encodeURIComponent).join('/');
  }
  // 그림이 없거나 불러오지 못하면 설명 글자 알약(onerror)
  if (!url || failed) return <span className="rb-md-img">{alt || t.Readme_image}</span>;
  const w = Number.parseInt(width, 10);
  return <img className="rb-md-photo" src={url} alt={alt} title={title || undefined} loading="lazy" referrerPolicy="no-referrer" style={w > 0 ? { width: w } : undefined} onError={() => setFailed(true)} />;
}

function Inline({ nodes, base }) {
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'text': return n.v;
      case 'br': return <br key={i} />;
      case 'code': return <code key={i} className="rb-md-code">{n.v}</code>;
      case 'strong': return <strong key={i}><Inline nodes={n.c} base={base} /></strong>;
      case 'em': return <em key={i}><Inline nodes={n.c} base={base} /></em>;
      case 'del': return <del key={i}><Inline nodes={n.c} base={base} /></del>;
      case 'u': return <u key={i}><Inline nodes={n.c} base={base} /></u>;
      case 'kbd': return <kbd key={i}><Inline nodes={n.c} base={base} /></kbd>;
      case 'sub': return <sub key={i}><Inline nodes={n.c} base={base} /></sub>;
      case 'sup': return <sup key={i}><Inline nodes={n.c} base={base} /></sup>;
      case 'img': return <Img key={i} node={n} base={base} />;
      case 'link': return <LinkNode key={i} node={n} base={base} />;
      default: return null;
    }
  });
}

function LinkNode({ node, base }) {
  const kind = linkKind(node.href);
  const body = <Inline nodes={node.c} base={base} />;
  if (kind === 'anchor') {
    const id = ID_PREFIX + slugify(decodeURIComponent(node.href.slice(1)));
    return <a className="krds-link" href={'#' + id} title={node.title || undefined} onClick={(e) => { e.preventDefault(); jump(id); }}>{body}</a>;
  }
  if (kind === 'external') {
    return <a className="krds-link" href={node.href} title={node.title || undefined} {...newWindow(plainText(node.c) || node.href)}>{body}</a>;
  }
  if (kind === 'repo' && base?.id) {
    const p = repoPath(node.href);
    if (p) return <Link className="krds-link" to={`/projects/${base.id}/code/${p}`} title={node.title || undefined}>{body}</Link>;
  }
  return <span className="rb-md-img">{body}</span>;
}

function CodeBlock({ node }) {
  const [copied, setCopied] = useState(false);
  const lang = SHELL.has(node.lang) ? 'sh' : languageOf('x.' + node.lang);
  const copy = async () => {
    try { await navigator.clipboard.writeText(node.text); setCopied(true); setTimeout(() => setCopied(false), 2000); } catch { /* 복사가 막힌 브라우저 */ }
  };
  return (
    <figure className="rb-md-block">
      <figcaption className="rb-md-block-head">
        <span className="krds-text-body-xsmall rb-subtle">{node.lang}</span>
        <button type="button" className="krds-btn xsmall text" onClick={copy}>{copied ? u.Md_copied : u.Md_copy}</button>
        <span className="sr-only" role="status">{copied ? u.Md_copied : ''}</span>
      </figcaption>
      <pre className="rb-md-pre" tabIndex={0}>
        <code>
          {node.text.split('\n').map((line, i) => (
            <span key={i}>
              {tokenize(line, lang).map(([role, s], k) => (<span key={k} className={role === 'plain' ? undefined : `tok-${role}`}>{s}</span>))}
              {'\n'}
            </span>
          ))}
        </code>
      </pre>
    </figure>
  );
}

function HtmlTable({ node, base }) {
  const head = node.rows[0]?.every((c) => c.head) ? node.rows[0] : null;
  const body = head ? node.rows.slice(1) : node.rows;
  const cell = (c, k) => {
    const Tag = c.head ? 'th' : 'td';
    return <Tag key={k} colSpan={c.colspan > 1 ? c.colspan : undefined} rowSpan={c.rowspan > 1 ? c.rowspan : undefined} scope={c.head ? 'col' : undefined} style={c.align ? { textAlign: c.align } : undefined}><Inline nodes={c.c} base={base} /></Tag>;
  };
  return (
    <div className="rb-md-scroll" tabIndex={0}>
      <div className="krds-table-wrap">
        <table className="tbl data">
          {head ? <thead><tr>{head.map(cell)}</tr></thead> : null}
          <tbody>{body.map((r, i) => <tr key={i}>{r.map(cell)}</tr>)}</tbody>
        </table>
      </div>
    </div>
  );
}

const ALERT_ICON = { note: 'help', tip: 'check_circle', important: 'inquiry', warning: 'bell', caution: 'close' };
const ALERT_TITLE = { note: u.Alert_note, tip: u.Alert_tip, important: u.Alert_important, warning: u.Alert_warning, caution: u.Alert_caution };

function Table({ node, base }) {
  return (
    <div className="rb-md-scroll" tabIndex={0}>
      <div className="krds-table-wrap">
        <table className="tbl data">
          <thead>
            <tr>{node.head.map((h, i) => <th key={i} scope="col" style={node.aligns[i] ? { textAlign: node.aligns[i] } : undefined}><Inline nodes={h} base={base} /></th>)}</tr>
          </thead>
          <tbody>
            {node.rows.map((r, i) => (
              <tr key={i}>{r.map((c, k) => <td key={k} style={node.aligns[k] ? { textAlign: node.aligns[k] } : undefined}><Inline nodes={c} base={base} /></td>)}</tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function Blocks({ nodes, base }) {
  return nodes.map((n, i) => {
    switch (n.t) {
      case 'p': return <p key={i}><Inline nodes={n.c} base={base} /></p>;
      case 'h': {
        const Tag = `h${Math.min(6, n.level + 1)}`;
        const id = ID_PREFIX + n.id;
        return (
          <Tag key={i} id={id} className={`rb-md-h rb-md-h${Math.min(n.level, 4)}`}>
            <Inline nodes={n.c} base={base} />
            <a className="rb-md-anchor" href={'#' + id} aria-label={u.Md_anchor} onClick={(e) => { e.preventDefault(); jump(id); }} />
          </Tag>
        );
      }
      case 'hr': return <hr key={i} className="rb-md-hr" />;
      case 'quote': return <blockquote key={i} className="rb-md-quote"><Blocks nodes={n.c} base={base} /></blockquote>;
      case 'code': return <CodeBlock key={i} node={n} />;
      case 'table': return <Table key={i} node={n} base={base} />;
      case 'htable': return <HtmlTable key={i} node={n} base={base} />;
      case 'alert': return (
        <div key={i} className={'rb-md-alert is-' + n.kind} role="note">
          <p className="rb-md-alert-title krds-text-body-small-bold"><Icon name={ALERT_ICON[n.kind]} />{ALERT_TITLE[n.kind]}</p>
          <Blocks nodes={n.c} base={base} />
        </div>
      );
      case 'details': return (
        <details key={i} className="rb-md-details">
          <summary className="krds-text-body-small-bold"><Inline nodes={n.summary} base={base} /></summary>
          <div className="rb-md-details-body"><Blocks nodes={n.c} base={base} /></div>
        </details>
      );
      case 'align': return <div key={i} className={'rb-md-align-' + n.align}><Blocks nodes={n.c} base={base} /></div>;
      case 'list': {
        const List = n.ordered ? 'ol' : 'ul';
        return (
          <List key={i} className="rb-md-list" start={n.ordered && n.start !== 1 ? n.start : undefined}>
            {n.items.map((it, k) => (
              <li key={k} className={it.checked === null ? undefined : 'rb-md-task'}>
                {it.checked === null ? null : (
                  <span className={'rb-md-box' + (it.checked ? ' is-checked' : '')} role="checkbox" aria-checked={it.checked} aria-disabled="true">
                    {it.checked ? <Icon name="check_circle" /> : null}
                  </span>
                )}
                <div className="rb-md-li"><Blocks nodes={it.c} base={base} /></div>
              </li>
            ))}
          </List>
        );
      }
      default: return null;
    }
  });
}

/** base: { id: 프로젝트 번호, rawBase: 저장소 원본 파일 주소(끝에 /) }. 없으면 상대 경로 그림과 링크는 글자로만 나온다. */
export function Markdown({ source, base }) {
  const nodes = parseMarkdown(source);
  return <div className="rb-md"><Blocks nodes={nodes} base={base} /></div>;
}

export { plainText };
