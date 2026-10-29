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

export function sectionLines(source, pattern) {
  const out = [];
  let on = false;
  for (const line of splitReadme(source).text) {
    if (/^#{1,4}\s/.test(line)) on = pattern.test(line);
    if (on) out.push(line);
  }
  return out.join('\n');
}

export function Readme({ source }) {
  const { text, code } = splitReadme(source);
  return (
    <div className="rb-readme">
      {text
        .filter((l) => l.trim())
        .map((line, i) => {
          if (/^#{1,4}\s/.test(line)) return <h3 key={i} className="krds-text-heading-small">{line.replace(/^#+\s*/, '')}</h3>;
          const clean = line.replace(/\*\*|`/g, '').replace(/^\s*[-*]\s+/, '').replace(/^\s*\d+\.\s+/, '');
          return <p key={i}>{clean}</p>;
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
