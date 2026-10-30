// README와 이슈 본문을 읽는 마크다운 해석기(GitHub Flavored Markdown 일부). 외부 라이브러리와 innerHTML을 쓰지 않는다.
// 결과는 데이터(노드 목록)이고 그리는 일은 Markdown.jsx가 한다. 그래서 HTML을 문자열로 꽂는 경로가 없고 sanitize 대상도 없다.
// 지원: 제목(#, 밑줄형), 문단, 줄바꿈, 굵게/기울임/취소선/코드, 링크(인라인, 참조형, 자동 링크), 그림(인라인, <img>),
//       인용(중첩), 목록(순서/비순서/중첩/체크), 가로선, 코드 블록(``` ~~~ 언어), 표(GFM, 정렬), <details>/<summary>,
//       <p align>/<div align>, <br>, <kbd>, <sub>, <sup>, <b>, <i>, <u>, <del>, <a>, HTML 주석(무시).
// 그 밖의 HTML 태그는 태그만 지우고 안의 글자는 남긴다. 원문에 없는 내용은 만들지 않는다.

const SAFE_SCHEME = /^(https?:|mailto:)/i;

/** GitHub 방식 제목 앵커: 소문자, 글자/숫자/공백/하이픈/밑줄만 남기고 공백은 하이픈. */
export function slugify(text) {
  return String(text).trim().toLowerCase().replace(/[^\p{L}\p{N}\s_-]/gu, '').replace(/\s/g, '-');
}

export function plainText(nodes) {
  return (nodes || []).map((n) => (n.t === 'text' || n.t === 'code' ? n.v : n.t === 'br' ? ' ' : n.t === 'img' ? n.alt : plainText(n.c))).join('');
}

// ---------- 인라인 ----------
const ESCAPABLE = /[\\`*_{}[\]()#+\-.!|~<>]/;

function findClose(s, from, open, close) {
  // s[from-1]이 열기 문자. 짝이 맞는 닫는 문자 위치(코드 조각과 이스케이프는 건너뜀)
  let depth = 1;
  for (let i = from; i < s.length; i += 1) {
    const c = s[i];
    if (c === '\\') { i += 1; continue; }
    if (c === '`') {
      const run = /^`+/.exec(s.slice(i))[0];
      const end = s.indexOf(run, i + run.length);
      if (end > -1) { i = end + run.length - 1; continue; }
    }
    if (c === open) depth += 1;
    else if (c === close) { depth -= 1; if (depth === 0) return i; }
  }
  return -1;
}

function parseDestination(s, from) {
  // [text](url "title") 의 괄호 안쪽. 돌려주는 값: { url, title, end } 또는 null
  let i = from;
  while (s[i] === ' ') i += 1;
  let url = '';
  if (s[i] === '<') {
    const e = s.indexOf('>', i);
    if (e < 0) return null;
    url = s.slice(i + 1, e);
    i = e + 1;
  } else {
    let depth = 0;
    const start = i;
    for (; i < s.length; i += 1) {
      const c = s[i];
      if (c === '\\') { i += 1; continue; }
      if (c === ' ' || c === '\n') break;
      if (c === '(') depth += 1;
      if (c === ')') { if (depth === 0) break; depth -= 1; }
    }
    url = s.slice(start, i);
  }
  while (s[i] === ' ' || s[i] === '\n') i += 1;
  let title = '';
  if (s[i] === '"' || s[i] === "'") {
    const q = s[i];
    const e = s.indexOf(q, i + 1);
    if (e < 0) return null;
    title = s.slice(i + 1, e);
    i = e + 1;
    while (s[i] === ' ') i += 1;
  }
  if (s[i] !== ')') return null;
  return { url, title, end: i + 1 };
}

const PAIRED = { b: 'strong', strong: 'strong', i: 'em', em: 'em', u: 'u', del: 'del', s: 'del', strike: 'del', kbd: 'kbd', sub: 'sub', sup: 'sup', code: 'codehtml', mark: 'em', small: 'plain', span: 'plain', font: 'plain', center: 'plain' };

function attr(tag, name) {
  const m = new RegExp(`${name}\\s*=\\s*("([^"]*)"|'([^']*)'|([^\\s>]+))`, 'i').exec(tag);
  return m ? (m[2] ?? m[3] ?? m[4] ?? '') : '';
}

export function parseInline(src, ctx = {}) {
  const s = String(src);
  const out = [];
  let buf = '';
  const flush = () => { if (buf) { out.push({ t: 'text', v: buf }); buf = ''; } };
  let i = 0;
  while (i < s.length) {
    const c = s[i];
    const rest = s.slice(i);
    if (c === '\\' && i + 1 < s.length) {
      if (s[i + 1] === '\n') { flush(); out.push({ t: 'br' }); i += 2; continue; }
      if (ESCAPABLE.test(s[i + 1])) { buf += s[i + 1]; i += 2; continue; }
    }
    if (c === '\n') {
      if (/ {2,}$/.test(buf)) { buf = buf.replace(/ +$/, ''); flush(); out.push({ t: 'br' }); } else buf = buf.replace(/ +$/, '') + ' ';
      i += 1;
      while (s[i] === ' ') i += 1;
      continue;
    }
    if (c === '`') {
      const run = /^`+/.exec(rest)[0];
      const end = s.indexOf(run, i + run.length);
      if (end > -1) {
        flush();
        let v = s.slice(i + run.length, end).replace(/\n/g, ' ');
        if (/^ .* $/.test(v) && v.trim()) v = v.slice(1, -1);
        out.push({ t: 'code', v });
        i = end + run.length;
        continue;
      }
      buf += run;
      i += run.length;
      continue;
    }
    if (c === '<') {
      const comment = /^<!--[\s\S]*?-->/.exec(rest);
      if (comment) { i += comment[0].length; continue; }
      const auto = /^<((?:https?:\/\/|mailto:)[^\s>]+)>/i.exec(rest);
      if (auto) { flush(); out.push({ t: 'link', href: auto[1], title: '', c: [{ t: 'text', v: auto[1] }] }); i += auto[0].length; continue; }
      const tag = /^<(\/?)([a-zA-Z][a-zA-Z0-9]*)\b([^>]*)>/.exec(rest);
      if (tag) {
        const [whole, closing, nameRaw, attrs] = tag;
        const name = nameRaw.toLowerCase();
        if (closing) { i += whole.length; continue; }
        if (name === 'br') { flush(); out.push({ t: 'br' }); i += whole.length; continue; }
        if (name === 'img') {
          flush();
          out.push({ t: 'img', src: attr(attrs, 'src'), alt: attr(attrs, 'alt'), title: attr(attrs, 'title') });
          i += whole.length;
          continue;
        }
        if (PAIRED[name] || name === 'a') {
          const closeRe = new RegExp(`</${name}\\s*>`, 'i');
          const after = s.slice(i + whole.length);
          const cm = closeRe.exec(after);
          if (cm) {
            flush();
            const inner = parseInline(after.slice(0, cm.index), ctx);
            if (name === 'a') out.push({ t: 'link', href: attr(attrs, 'href'), title: attr(attrs, 'title'), c: inner });
            else if (PAIRED[name] === 'codehtml') out.push({ t: 'code', v: plainText(inner) });
            else if (PAIRED[name] === 'plain') out.push(...inner);
            else out.push({ t: PAIRED[name], c: inner });
            i += whole.length + cm.index + cm[0].length;
            continue;
          }
        }
        i += whole.length; // 모르는 태그는 태그만 지운다
        continue;
      }
    }
    if (c === '!' && s[i + 1] === '[') {
      const close = findClose(s, i + 2, '[', ']');
      if (close > -1 && s[close + 1] === '(') {
        const d = parseDestination(s, close + 2);
        if (d) { flush(); out.push({ t: 'img', src: d.url, alt: plainText(parseInline(s.slice(i + 2, close), ctx)), title: d.title }); i = d.end; continue; }
      }
      if (close > -1) {
        const ref = (/^\[([^\]]*)\]/.exec(s.slice(close + 1)) || [])[1];
        const key = String(ref || s.slice(i + 2, close)).toLowerCase();
        const def = ctx.refs?.[key];
        if (def) { flush(); out.push({ t: 'img', src: def.url, alt: s.slice(i + 2, close), title: def.title }); i = close + 1 + (ref !== undefined ? ref.length + 2 : 0); continue; }
      }
    }
    if (c === '[') {
      const close = findClose(s, i + 1, '[', ']');
      if (close > -1) {
        const text = s.slice(i + 1, close);
        if (s[close + 1] === '(') {
          const d = parseDestination(s, close + 2);
          if (d) { flush(); out.push({ t: 'link', href: d.url, title: d.title, c: parseInline(text, ctx) }); i = d.end; continue; }
        }
        const refMatch = /^\[([^\]]*)\]/.exec(s.slice(close + 1));
        const key = String(refMatch ? refMatch[1] || text : text).toLowerCase();
        const def = ctx.refs?.[key];
        if (def) { flush(); out.push({ t: 'link', href: def.url, title: def.title, c: parseInline(text, ctx) }); i = close + 1 + (refMatch ? refMatch[0].length : 0); continue; }
      }
    }
    if (c === '~' && s[i + 1] === '~') {
      const end = s.indexOf('~~', i + 2);
      if (end > i + 2) { flush(); out.push({ t: 'del', c: parseInline(s.slice(i + 2, end), ctx) }); i = end + 2; continue; }
    }
    if (c === '*' || c === '_') {
      const run = /^[*_]+/.exec(rest)[0];
      const ch = c;
      const n = Math.min(run.length, 3);
      const prev = s[i - 1] || ' ';
      const intraword = ch === '_' && /[\p{L}\p{N}]/u.test(prev);
      if (!intraword && s[i + n] && !/\s/.test(s[i + n])) {
        const closer = ch.repeat(n);
        let end = -1;
        for (let k = i + n; k < s.length; k += 1) {
          if (s[k] === '\\') { k += 1; continue; }
          if (s[k] === '`') { const r = /^`+/.exec(s.slice(k))[0]; const e = s.indexOf(r, k + r.length); if (e > -1) { k = e + r.length - 1; continue; } }
          if (s.startsWith(closer, k) && !/\s/.test(s[k - 1]) && s[k + n] !== ch && !(ch === '_' && /[\p{L}\p{N}]/u.test(s[k + n] || ' '))) { end = k; break; }
        }
        if (end > -1) {
          flush();
          const inner = parseInline(s.slice(i + n, end), ctx);
          out.push(n === 3 ? { t: 'strong', c: [{ t: 'em', c: inner }] } : { t: n === 2 ? 'strong' : 'em', c: inner });
          i = end + n;
          continue;
        }
      }
      buf += run;
      i += run.length;
      continue;
    }
    if (c === 'h' && /^https?:\/\//i.test(rest) && !/[\p{L}\p{N}]/u.test(s[i - 1] || ' ')) {
      const m = /^https?:\/\/[^\s<]+/i.exec(rest);
      let url = m[0];
      while (/[.,;:!?'"]$/.test(url) || (url.endsWith(')') && (url.match(/\(/g) || []).length < (url.match(/\)/g) || []).length)) url = url.slice(0, -1);
      flush();
      out.push({ t: 'link', href: url, title: '', c: [{ t: 'text', v: url }] });
      i += url.length;
      continue;
    }
    buf += c;
    i += 1;
  }
  flush();
  return out;
}

// ---------- 블록 ----------
const FENCE = /^ {0,3}(`{3,}|~{3,})\s*([^\s`]*)[^`]*$/;
const HEADING = /^ {0,3}(#{1,6})\s+(.*?)(?:\s+#+)?\s*$/;
const HR = /^ {0,3}([-*_])(?:\s*\1){2,}\s*$/;
const LIST = /^( {0,3})([-*+]|\d{1,9}[.)])( +|$)(.*)$/;
const TABLE_DELIM = /^\s*\|?\s*:?-+:?\s*(\|\s*:?-+:?\s*)*\|?\s*$/;
const DETAILS = /^\s*<details\b/i;
const ALIGN_BLOCK = /^\s*<(p|div)\b[^>]*\balign\s*=\s*["']?(center|right|left)/i;

function splitCells(row) {
  let r = row.trim();
  if (r.startsWith('|')) r = r.slice(1);
  if (r.endsWith('|') && !r.endsWith('\\|')) r = r.slice(0, -1);
  const cells = [];
  let cur = '';
  let inCode = false;
  for (let i = 0; i < r.length; i += 1) {
    const c = r[i];
    if (c === '\\' && r[i + 1] === '|') { cur += '|'; i += 1; continue; }
    if (c === '`') inCode = !inCode;
    if (c === '|' && !inCode) { cells.push(cur.trim()); cur = ''; continue; }
    cur += c;
  }
  cells.push(cur.trim());
  return cells;
}

function startsBlock(line, next) {
  return FENCE.test(line) || HEADING.test(line) || HR.test(line) || /^ {0,3}>/.test(line) || DETAILS.test(line) || ALIGN_BLOCK.test(line)
    || (LIST.test(line) && (/^( {0,3})([-*+]|1[.)])( +|$)/.test(line))) || (line.includes('|') && next !== undefined && TABLE_DELIM.test(next) && line.trim() !== '');
}

function indentOf(line) { return /^ */.exec(line)[0].length; }

function parseBlocks(lines, ctx) {
  const out = [];
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim()) { i += 1; continue; }
    let m = FENCE.exec(line);
    if (m) {
      const [, fence, lang] = m;
      const close = new RegExp(`^ {0,3}${fence[0]}{${fence.length},}\\s*$`);
      const body = [];
      i += 1;
      while (i < lines.length && !close.test(lines[i])) { body.push(lines[i]); i += 1; }
      i += 1;
      out.push({ t: 'code', lang, text: body.join('\n') });
      continue;
    }
    m = HEADING.exec(line);
    if (m) { out.push(makeHeading(m[1].length, m[2], ctx)); i += 1; continue; }
    if (HR.test(line)) { out.push({ t: 'hr' }); i += 1; continue; }
    if (DETAILS.test(line)) {
      let j = i;
      let depth = 0;
      const chunk = [];
      for (; j < lines.length; j += 1) {
        chunk.push(lines[j]);
        depth += (lines[j].match(/<details\b/gi) || []).length - (lines[j].match(/<\/details\s*>/gi) || []).length;
        if (depth <= 0) break;
      }
      i = j + 1;
      let text = chunk.join('\n').replace(/^\s*<details[^>]*>/i, '').replace(/<\/details\s*>\s*$/i, '');
      let summary = '';
      const sm = /^\s*<summary[^>]*>([\s\S]*?)<\/summary\s*>/i.exec(text);
      if (sm) { summary = sm[1]; text = text.slice(sm[0].length); }
      out.push({ t: 'details', summary: parseInline(summary.trim(), ctx), c: parseBlocks(text.split('\n'), ctx) });
      continue;
    }
    m = ALIGN_BLOCK.exec(line);
    if (m) {
      const tag = m[1].toLowerCase();
      const closeRe = new RegExp(`</${tag}\\s*>`, 'i');
      let j = i;
      const chunk = [];
      for (; j < lines.length; j += 1) { chunk.push(lines[j]); if (closeRe.test(lines[j])) break; }
      i = j + 1;
      const inner = chunk.join('\n').replace(/^\s*<[^>]*>/, '').replace(closeRe, '');
      out.push({ t: 'align', align: m[2].toLowerCase(), c: parseBlocks(inner.split('\n'), ctx) });
      continue;
    }
    if (/^ {0,3}>/.test(line)) {
      const body = [];
      while (i < lines.length && /^ {0,3}>/.test(lines[i])) { body.push(lines[i].replace(/^ {0,3}> ?/, '')); i += 1; }
      out.push({ t: 'quote', c: parseBlocks(body, ctx) });
      continue;
    }
    if (line.includes('|') && i + 1 < lines.length && TABLE_DELIM.test(lines[i + 1]) && lines[i + 1].includes('-')) {
      const head = splitCells(line);
      const aligns = splitCells(lines[i + 1]).map((d) => (/^:-+:$/.test(d) ? 'center' : /-:$/.test(d) ? 'right' : /^:-/.test(d) ? 'left' : null));
      if (head.length === aligns.length) {
        const rows = [];
        i += 2;
        while (i < lines.length && lines[i].trim() && lines[i].includes('|') && !FENCE.test(lines[i])) {
          const cells = splitCells(lines[i]);
          rows.push(aligns.map((_, k) => cells[k] ?? ''));
          i += 1;
        }
        out.push({
          t: 'table',
          aligns,
          head: head.map((h) => parseInline(h, ctx)),
          rows: rows.map((r) => r.map((cell) => parseInline(cell, ctx))),
        });
        continue;
      }
    }
    m = LIST.exec(line);
    if (m) {
      const ordered = /\d/.test(m[2]);
      const items = [];
      const start = ordered ? parseInt(m[2], 10) : 1;
      let loose = false;
      while (i < lines.length) {
        const lm = LIST.exec(lines[i]);
        if (!lm || /\d/.test(lm[2]) !== ordered || HR.test(lines[i])) break;
        const baseIndent = lm[1].length;
        const contentIndent = baseIndent + lm[2].length + Math.min(Math.max(lm[3].length, 1), 4);
        const body = [lm[4]];
        i += 1;
        while (i < lines.length) {
          const l = lines[i];
          if (!l.trim()) {
            let k = i + 1;
            while (k < lines.length && !lines[k].trim()) k += 1;
            if (k < lines.length && indentOf(lines[k]) >= contentIndent) { body.push(''); i += 1; loose = true; continue; }
            break;
          }
          if (indentOf(l) >= contentIndent) { body.push(l.slice(contentIndent)); i += 1; continue; }
          const nm = LIST.exec(l);
          if (nm && nm[1].length <= baseIndent + 3) break; // 같은 단계의 다음 항목
          if (body[body.length - 1] !== '' && !startsBlock(l, lines[i + 1]) && !nm) { body.push(l.trim()); i += 1; continue; } // 이어지는 줄
          break;
        }
        let checked = null;
        const tm = /^\[([ xX])\]\s+/.exec(body[0]);
        if (tm) { checked = tm[1] !== ' '; body[0] = body[0].slice(tm[0].length); }
        items.push({ checked, c: parseBlocks(body, ctx) });
        while (i < lines.length && !lines[i].trim() && i + 1 < lines.length && LIST.test(lines[i + 1])) { i += 1; loose = true; }
      }
      out.push({ t: 'list', ordered, start, loose, items });
      continue;
    }
    // 문단(밑줄형 제목 포함)
    const para = [line];
    i += 1;
    let setext = 0;
    while (i < lines.length && lines[i].trim() && !startsBlock(lines[i], lines[i + 1])) {
      if (/^ {0,3}(=+|-+)\s*$/.test(lines[i])) { setext = lines[i].trim()[0] === '=' ? 1 : 2; i += 1; break; }
      para.push(lines[i]);
      i += 1;
    }
    if (setext) out.push(makeHeading(setext, para.join(' '), ctx));
    else out.push({ t: 'p', c: parseInline(para.map((l) => l.replace(/^\s+/, '')).join('\n'), ctx) });
  }
  return out;
}

function makeHeading(level, text, ctx) {
  const c = parseInline(text.trim(), ctx);
  const base = slugify(plainText(c)) || 'section';
  const n = ctx.seen[base] || 0;
  ctx.seen[base] = n + 1;
  return { t: 'h', level, id: n ? `${base}-${n}` : base, c };
}

/** 참조형 링크 정의([이름]: 주소 "제목") 줄을 떼어 내고 { 이름: {url, title} }를 돌려준다. */
function takeDefinitions(lines) {
  const refs = {};
  const kept = [];
  let inFence = false;
  for (const l of lines) {
    if (/^ {0,3}(```|~~~)/.test(l)) inFence = !inFence;
    const m = !inFence && /^ {0,3}\[([^\]]+)\]:\s*<?([^\s>]+)>?(?:\s+["'(](.*)["')])?\s*$/.exec(l);
    if (m) refs[m[1].toLowerCase()] = { url: m[2], title: m[3] || '' };
    else kept.push(l);
  }
  return { refs, kept };
}

/** 마크다운 원문을 블록 노드 목록으로 해석한다. */
export function parseMarkdown(source) {
  const lines = String(source || '').replace(/\r\n?/g, '\n').split('\n');
  const { refs, kept } = takeDefinitions(lines);
  return parseBlocks(kept, { refs, seen: {} });
}

/** 상대 경로 정리: ./ 제거, 쪽 이름/검색어 제거. 위 폴더(../)는 저장소 밖일 수 있어 null. */
export function repoPath(href) {
  const clean = decodeURI(href.split('#')[0].split('?')[0]).replace(/^\.\//, '').replace(/^\/+/, '');
  return clean.includes('../') || !clean ? null : clean;
}

/** 링크 종류: anchor(같은 문서), external, repo(저장소 안 파일), none(허용하지 않음). */
export function linkKind(href) {
  if (!href) return 'none';
  if (href.startsWith('#')) return 'anchor';
  if (SAFE_SCHEME.test(href)) return 'external';
  if (/^[a-z][a-z0-9+.-]*:/i.test(href) || href.startsWith('//')) return 'none';
  return 'repo';
}
