// 제작자 설명(README)을 공무원이 읽기 쉽게 보여 준다. 명령어 블록은 "개발자용 정보"로 접는다(U4).
import { t } from '../../copy/ko';
export function splitReadme(source) {
  const lines = (source || '').split(/\r?\n/);
  const text = [];
  const code = [];
  let inCode = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    (inCode ? code : text).push(line);
  }
  return { text, code };
}

/**
 * README에 적힌 명령만 뽑는다. 줄 번호를 함께 돌려줘 출처를 밝힌다(없는 명령을 만들지 않는다).
 * 돌려주는 값: [{ command, line, heading }]
 */
export function readmeCommands(source) {
  const lines = (source || '').split(/\r?\n/);
  const out = [];
  let inCode = false;
  let heading = '';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim().startsWith('```')) { inCode = !inCode; continue; }
    if (!inCode && /^#{1,4}\s/.test(line)) { heading = line.replace(/^#+\s*/, '').trim(); continue; }
    if (!inCode) continue;
    const cmd = line.trim();
    if (!cmd || cmd.startsWith('#')) continue;
    out.push({ command: cmd, line: i + 1, heading });
  }
  return out;
}

export function sectionLines(source, pattern) {
  const out = [];
  let on = false;
  for (const line of splitReadme(source).text) {
    if (/^#{1,4}\s/.test(line)) on = pattern.test(line);
    if (on) out.push(line);
  }
  return out.join('\n');
}

/** 인라인 서식: 이미지, 링크, 굵게, 기울임, 코드. 그림은 설명(alt)만 남긴다(바깥 그림은 불러오지 않는다). */
export function inline(text, keyBase = 'i') {
  const out = [];
  // 배지처럼 링크 안에 그림이 든 경우는 그림 설명만 남긴다. HTML 조각은 지운다.
  let rest = String(text)
    .replace(/\[!\[([^\]]*)\]\([^)]*\)\]\(([^)\s]+)[^)]*\)/g, '[$1]($2)')
    .replace(/<\/?[a-zA-Z][^>]*>/g, '');
  let n = 0;
  const RE = /!\[([^\]]*)\]\(([^)\s]+)[^)]*\)|\[([^\]]+)\]\(([^)\s]+)[^)]*\)|\*\*([^*]+)\*\*|`([^`]+)`|_([^_]+)_/;
  while (rest) {
    const m = RE.exec(rest);
    if (!m) { out.push(rest); break; }
    if (m.index) out.push(rest.slice(0, m.index));
    const key = `${keyBase}-${n++}`;
    if (m[1] !== undefined) out.push(<span key={key} className="rb-md-img">{m[1] || t.Readme_image}</span>);
    else if (m[3] !== undefined) {
      const href = m[4];
      const outside = /^https?:/.test(href);
      out.push(
        <a key={key} className="krds-link" href={href} {...(outside ? { target: '_blank', rel: 'noreferrer' } : {})}>
          {m[3]}
        </a>,
      );
    } else if (m[5] !== undefined) out.push(<strong key={key}>{m[5]}</strong>);
    else if (m[6] !== undefined) out.push(<code key={key} className="rb-md-code">{m[6]}</code>);
    else out.push(<em key={key}>{m[7]}</em>);
    rest = rest.slice(m.index + m[0].length);
  }
  return out;
}

export function Readme({ source }) {
  const { text, code } = splitReadme(source);
  return (
    <div className="rb-readme">
      {text
        .filter((l) => l.trim())
        .map((line, i) => {
          if (/^#{1,4}\s/.test(line)) return <h3 key={i} className="krds-text-body-small-bold">{inline(line.replace(/^#+\s*/, ''), `h${i}`)}</h3>;
          if (/^\s*>\s/.test(line)) return <blockquote key={i} className="rb-md-quote">{inline(line.replace(/^\s*>\s*/, ''), `q${i}`)}</blockquote>;
          const bullet = /^\s*([-*]|\d+\.)\s+/.test(line);
          const body = line.replace(/^\s*([-*]|\d+\.)\s+/, '');
          return bullet
            ? <p key={i} className="rb-md-item">{inline(body, `b${i}`)}</p>
            : <p key={i}>{inline(line, `p${i}`)}</p>;
        })}
      {code.length > 0 && (
        <details className="krds-disclosure rb-dev">
          <summary className="krds-btn small text">{t.Readme_1}</summary>
          <pre className="rb-code">{code.join('\n')}</pre>
        </details>
      )}
    </div>
  );
}
