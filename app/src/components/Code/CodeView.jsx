// Figma: Code/CodeView. 줄 번호, 구문 강조(D-05), 줄 주소, 원본 보기, 복사, 내려받기.
import { useMemo, useState } from 'react';
import { t } from '../../copy/ko';
import { languageOf, tokenize } from './highlight';

const MAX_LINES = 1000;

export function CodeView({ path, text, rawUrl, historyTo, onHistory }) {
  const [copied, setCopied] = useState(false);
  const lang = languageOf(path);
  const all = useMemo(() => (text ?? '').replace(/\r\n/g, '\n').split('\n'), [text]);
  const lines = all.slice(0, MAX_LINES);
  const binary = /\u0000/.test(text ?? '');
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  const copy = async () => {
    await navigator.clipboard.writeText(text ?? '');
    setCopied(true);
  };

  return (
    <section className="rb-code" aria-label={t.P16_codeLabel}>
      <div className="rb-code-bar">
        <p className="krds-text-body-small rb-subtle">{t.fn.lines(all.length)}</p>
        <div className="rb-code-actions">
          {rawUrl ? <a className="krds-btn small tertiary" href={rawUrl} target="_blank" rel="noreferrer">{t.P16_raw}<span className="sr-only"> {t.Footer_3}</span></a> : null}
          {!binary ? <button type="button" className="krds-btn small tertiary" onClick={copy}>{t.P16_copy}</button> : null}
          {historyTo ? <button type="button" className="krds-btn small tertiary" onClick={onHistory}>{t.P16_history}</button> : null}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{copied ? t.P16_copied : ''}</p>
      {binary ? (
        <p className="krds-text-body-medium rb-code-note">{t.P16_binary}</p>
      ) : (
        <>
          {all.length > MAX_LINES ? <p className="krds-text-body-small rb-code-note">{t.P16_large}</p> : null}
          <div className="rb-code-scroll" tabIndex={0} aria-label={t.P16_codeLabel}>
            <table className="rb-code-table">
              <tbody>
                {lines.map((line, i) => {
                  const n = i + 1;
                  return (
                    <tr key={n} id={`L${n}`} className={hash === `#L${n}` ? 'is-target' : undefined}>
                      <td className="rb-code-no">
                        <a href={`#L${n}`} aria-label={t.fn.lineNo(n)}>{n}</a>
                      </td>
                      <td className="rb-code-line">
                        <code>
                          {tokenize(line, lang).map(([role, s], k) => (
                            <span key={k} className={role === 'plain' ? undefined : `tok-${role}`}>{s}</span>
                          ))}
                        </code>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </>
      )}
    </section>
  );
}
