// Figma: Code/CodeView (R-03 파일 보기). 공공 깃랩 파일 보기와 같은 구성.
// 보기 전환(코드, 미리보기, Blame), 줄 번호와 줄 주소, 줄바꿈 토글, 파일 크기, 원본 보기, 복사, 이력.
// 큰 파일은 보이는 범위만 그린다(가상 스크롤). 코드 영역 안에는 쉬운 설명을 넣지 않는다(UX-001 2.4).
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { t } from '../../copy/ko';
import { languageOf, tokenize } from './highlight';
import { Readme } from '../Help/Readme';
import { day } from '../../screens/parts/repoCommon';

const WINDOW = 400; // 한 번에 그리는 줄 수
const OVERSCAN = 80;

/** 파일 크기를 사람이 읽는 단위로. 공공 깃랩과 같은 표기. */
function sizeLabel(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return t.fn.bytes(bytes);
  if (bytes < 1024 * 1024) return t.fn.kib((bytes / 1024).toFixed(1));
  return t.fn.mib((bytes / 1024 / 1024).toFixed(1));
}

const isMarkdown = (path) => /\.(md|markdown)$/i.test(path || '');

function CodeLines({ lines, lang, blame, wrap }) {
  const scroller = useRef(null);
  const [range, setRange] = useState([0, Math.min(lines.length, WINDOW)]);
  const lineHeight = useRef(0);
  const hash = typeof window !== 'undefined' ? window.location.hash : '';

  const recalc = useCallback(() => {
    const el = scroller.current;
    if (!el || lines.length <= WINDOW) return;
    if (!lineHeight.current) {
      const row = el.querySelector('tr');
      lineHeight.current = row ? row.getBoundingClientRect().height : 0;
      if (!lineHeight.current) return;
    }
    const first = Math.max(0, Math.floor(el.scrollTop / lineHeight.current) - OVERSCAN);
    const count = Math.ceil(el.clientHeight / lineHeight.current) + OVERSCAN * 2;
    setRange([first, Math.min(lines.length, first + count)]);
  }, [lines.length]);

  useEffect(() => {
    setRange([0, Math.min(lines.length, WINDOW)]);
    lineHeight.current = 0;
  }, [lines]);

  // 줄 주소(#L12)로 들어오면 그 줄을 그린 뒤 그 자리로 옮긴다.
  useEffect(() => {
    const n = Number((hash.match(/^#L(\d+)$/) || [])[1]);
    if (!n || n > lines.length) return undefined;
    if (lines.length > WINDOW) setRange([Math.max(0, n - WINDOW / 2), Math.min(lines.length, n + WINDOW / 2)]);
    const timer = setTimeout(() => document.getElementById(`L${n}`)?.scrollIntoView({ block: 'center' }), 60);
    return () => clearTimeout(timer);
  }, [hash, lines.length]);

  const [from, to] = range;
  const slice = lines.slice(from, to);
  const h = lineHeight.current || 0;
  return (
    <div
      className={'rb-code-scroll' + (wrap ? ' is-wrap' : '')}
      tabIndex={0}
      aria-label={t.P16_codeLabel}
      ref={scroller}
      onScroll={recalc}
    >
      {h && from > 0 ? <div style={{ height: `${from * h}px` }} aria-hidden="true" /> : null}
      <table className="rb-code-table">
        <tbody>
          {slice.map((line, i) => {
            const n = from + i + 1;
            const info = blame ? blame.get(n) : null;
            return (
              <tr key={n} id={`L${n}`} className={hash === `#L${n}` ? 'is-target' : undefined}>
                {blame ? (
                  <td className="rb-code-blame">
                    {info ? <span className="rb-ellipsis">{info.author}</span> : null}
                    {info ? <span className="rb-subtle">{day(info.date)}</span> : null}
                  </td>
                ) : null}
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
      {h && to < lines.length ? <div style={{ height: `${(lines.length - to) * h}px` }} aria-hidden="true" /> : null}
    </div>
  );
}

export function CodeView({ path, base, text, rawUrl, size, historyTo, onHistory, blame, onBlame, blameState }) {
  const [copied, setCopied] = useState(false);
  const [wrap, setWrap] = useState(false);
  const [view, setView] = useState(isMarkdown(path) ? 'preview' : 'code');
  // GitHub처럼 마크다운 파일은 미리보기가 기본이다. 다른 파일로 옮기면 기본 보기로 돌아간다
  useEffect(() => { setView(isMarkdown(path) ? 'preview' : 'code'); }, [path]);
  const lang = languageOf(path);
  const lines = useMemo(() => (text ?? '').replace(/\r\n/g, '\n').split('\n'), [text]);
  const binary = /\u0000/.test(text ?? '');
  const canPreview = isMarkdown(path);

  const copy = async () => {
    await navigator.clipboard.writeText(text ?? '');
    setCopied(true);
  };

  const choose = (next) => {
    setView(next);
    if (next === 'blame' && !blame && onBlame) onBlame();
  };

  const views = [canPreview ? ['preview', t.P16_viewPreview] : null, ['code', t.P16_viewCode], ['blame', t.P16_viewBlame]].filter(Boolean);

  return (
    <section className="rb-code" aria-label={t.P16_codeLabel}>
      <div className="rb-code-bar">
        {!binary ? (
          <div className="rb-code-views" role="tablist" aria-label={t.P16_viewLabel}>
            {views.map(([key, label]) => (
              <button
                key={key}
                type="button"
                role="tab"
                aria-selected={view === key}
                className={'rb-code-view' + (view === key ? ' active' : '')}
                onClick={() => choose(key)}
              >
                {label}
              </button>
            ))}
          </div>
        ) : null}
        <div className="rb-code-meta">
          <p className="krds-text-body-xsmall rb-subtle">{t.fn.lines(lines.length)}</p>
          {size ? <p className="krds-text-body-xsmall rb-subtle">{sizeLabel(size)}</p> : null}
        </div>
        <div className="rb-code-actions">
          {!binary && view === 'code' ? (
            <button type="button" className="krds-btn small tertiary" aria-pressed={wrap} onClick={() => setWrap(!wrap)}>{t.P16_wrap}</button>
          ) : null}
          {rawUrl ? <a className="krds-btn small tertiary" href={rawUrl} target="_blank" rel="noreferrer">{t.P16_raw}<span className="sr-only"> {t.Footer_3}</span></a> : null}
          {!binary ? <button type="button" className="krds-btn small tertiary" onClick={copy}>{t.P16_copy}</button> : null}
          {historyTo ? <button type="button" className="krds-btn small tertiary" onClick={onHistory}>{t.P16_history}</button> : null}
        </div>
      </div>
      <p className="sr-only" role="status" aria-live="polite">{copied ? t.P16_copied : ''}</p>
      {binary ? (
        <p className="krds-text-body-small rb-code-note">{t.P16_binary}</p>
      ) : view === 'preview' ? (
        <div className="rb-code-preview"><Readme source={text} base={base} /></div>
      ) : view === 'blame' && !blame ? (
        <p className="krds-text-body-small rb-code-note">{blameState === 'Error' ? t.P16_blameError : t.P16_blameLoading}</p>
      ) : (
        <CodeLines lines={lines} lang={lang} blame={view === 'blame' ? blame : null} wrap={wrap} />
      )}
    </section>
  );
}
