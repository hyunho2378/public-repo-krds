// C1 파일 보기(공공 깃랩 08, 09, 10, 11). 파일 이름 큰 제목과 단추 줄, 파일 상자(이름 크기, 목차, 코드/미리보기/Blame, 복사, raw, 내려받기), 줄 번호 링크.
import { useEffect, useMemo, useRef, useState } from 'react';
import { g } from '../../copy/gl';
import { t } from '../../copy/ko';
import { languageOf, tokenize } from '../../components/Code/highlight';
import { Readme } from '../../components/Help/Readme';
import { Icon } from '../../components/Code/Icon';
import { IconButton } from '../../components/Action/IconButton';
import { Menu } from '../../components/Navigation/Menu';
import { newWindow } from '../../components/Layout/newWindow';
import { day } from './format';
import { CopyButton } from './parts';

const CHUNK = 1500;
const isMd = (p) => /\.(md|markdown)$/i.test(p || '');

function sizeLabel(bytes) {
  if (!Number.isFinite(bytes)) return '';
  if (bytes < 1024) return t.fn.bytes(bytes);
  if (bytes < 1024 * 1024) return t.fn.kib((bytes / 1024).toFixed(1));
  return t.fn.mib((bytes / 1024 / 1024).toFixed(1));
}

function Lines({ lines, lang, blame }) {
  const [shown, setShown] = useState(CHUNK);
  const hash = typeof window !== 'undefined' ? window.location.hash : '';
  const target = Number((hash.match(/^#L(\d+)/) || [])[1]) || 0;
  useEffect(() => { if (target > shown) setShown(Math.min(lines.length, target + 50)); }, [target]); // eslint-disable-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!target) return undefined;
    const timer = setTimeout(() => document.getElementById(`L${target}`)?.scrollIntoView({ block: 'center' }), 80);
    return () => clearTimeout(timer);
  }, [target, shown]);
  const slice = lines.slice(0, shown);
  return (
    <div className="gl-code-scroll rb-table-scroll" tabIndex={0} aria-label={t.P16_codeLabel}>
      <table className="gl-code-table">
        <tbody>
          {slice.map((line, i) => {
            const n = i + 1;
            const info = blame ? blame.get(n) : null;
            return (
              <tr key={n} id={`L${n}`} className={target === n ? 'is-target' : undefined}>
                {blame ? <td className="gl-blame"><span className="gl-trunc">{info?.author}</span><span>{info ? day(info.date) : ''}</span></td> : null}
                <td className="gl-no"><a href={`#L${n}`} aria-label={g.lineLink(n)}>{n}</a></td>
                <td className="gl-ln"><code>{tokenize(line, lang).map(([role, s], k) => <span key={k} className={role === 'plain' ? undefined : `tok-${role}`}>{s}</span>)}</code></td>
              </tr>
            );
          })}
        </tbody>
      </table>
      {shown < lines.length ? (
        <p className="gl-more"><button type="button" className="krds-btn small tertiary" onClick={() => setShown(Math.min(lines.length, shown + CHUNK))}>{g.moreLines(lines.length - shown)}</button></p>
      ) : null}
    </div>
  );
}

function headingsOf(md) {
  return (md || '').split('\n').map((l) => /^(#{1,4})\s+(.+)/.exec(l)).filter(Boolean).map((m) => ({ level: m[1].length, text: m[2].replace(/[*`]/g, '').trim() }));
}

/** 파일 제목 줄: 큰 파일 이름, 파일 찾기, 편집(비활성), 더보기 */
export function FileTitle({ path, project, refName, onFind }) {
  const name = path.split('/').pop();
  const web = `${project.web_url}/-/blob/${encodeURIComponent(refName)}/${path.split('/').map(encodeURIComponent).join('/')}`;
  return (
    <div className="gl-filetitle">
      <h2 className="gl-title gl-filetitle-name"><Icon name={isMd(path) ? 'ext/file-text' : 'ext/file'} /><span>{name}</span></h2>
      <div className="gl-head-actions">
        <button type="button" className="krds-btn small tertiary" onClick={onFind}>{g.findFile}</button>
        <button type="button" className="krds-btn small tertiary" disabled title={g.editDisabled}>{g.edit}</button>
        <Menu label={g.moreOpts} align="right" toggle={false} btnClass="krds-btn text rb-iconbtn is-small" button={<Icon name="ellipsis_vertical" />}>
          {(close) => (
            <ul className="drop-list">
              <li><a className="item-link" href={web} {...newWindow(g.openOrigin)} onClick={close}>{g.openOrigin}</a></li>
              <li><button type="button" className="item-link" onClick={() => { navigator.clipboard.writeText(path); close(); }}>{g.copyPath}</button></li>
            </ul>
          )}
        </Menu>
      </div>
    </div>
  );
}

export function GlFile({ path, base, text, rawUrl, size, blame, onBlame, blameState }) {
  const md = isMd(path);
  const [view, setView] = useState(md ? 'preview' : 'code');
  useEffect(() => { setView(md ? 'preview' : 'code'); }, [path, md]);
  const lang = languageOf(path);
  const lines = useMemo(() => (text ?? '').replace(/\r\n/g, '\n').split('\n'), [text]);
  const binary = /\u0000/.test(text ?? '');
  const box = useRef(null);
  const outline = useMemo(() => (md ? headingsOf(text) : []), [md, text]);
  const choose = (v) => { setView(v); if (v === 'blame' && !blame && onBlame) onBlame(); };
  const go = (label) => {
    setView('preview');
    setTimeout(() => {
      const h = [...(box.current?.querySelectorAll('h1,h2,h3,h4') || [])].find((x) => x.textContent.trim() === label);
      h?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 60);
  };
  const views = [md ? ['code', g.code] : ['code', g.code], md ? ['preview', g.preview] : null, ['blame', g.blame]].filter(Boolean);
  // 공공 깃랩 순서: 코드, 미리보기, Blame
  const ordered = md ? [['code', g.code], ['preview', g.preview], ['blame', g.blame]] : views;
  return (
    <section className="gl-filebox" aria-label={path.split('/').pop()} ref={box}>
      <header className="gl-filebox-head">
        <p className="gl-filebox-name"><Icon name={md ? 'ext/file-text' : 'ext/file'} /><strong>{path.split('/').pop()}</strong><span className="gl-filebox-size">{sizeLabel(size)}</span></p>
        <div className="gl-filebox-tools">
          {outline.length > 1 ? (
            <Menu label={g.outline} align="right" btnClass="krds-btn small tertiary" button={<Icon name="view_all" label={g.outline} />}>
              {(close) => (
                <ul className="drop-list" aria-label={g.outline}>
                  {outline.map((h, i) => <li key={i}><button type="button" className="item-link" style={{ paddingInlineStart: `calc(var(--krds-padding-4) * ${h.level})` }} onClick={() => { close(); go(h.text); }}>{h.text}</button></li>)}
                </ul>
              )}
            </Menu>
          ) : null}
          {!binary ? (
            <div className="gl-seg gl-seg-text" role="tablist" aria-label={t.P16_viewLabel}>
              {ordered.map(([k, n]) => <button key={k} type="button" role="tab" aria-selected={view === k} className="gl-segbtn" onClick={() => choose(k)}>{n}</button>)}
            </div>
          ) : null}
          {!binary ? <CopyButton text={text ?? ''} label={g.copyContent} /> : null}
          {rawUrl ? <IconButton icon="document" label={g.rawOpen} size="small" onClick={() => window.open(rawUrl, '_blank', 'noopener,noreferrer')} /> : null}
          {rawUrl ? <IconButton icon="download" label={g.downloadFile} size="small" onClick={() => window.open(rawUrl, '_blank', 'noopener,noreferrer')} /> : null}
        </div>
      </header>
      {binary ? <p className="gl-empty">{t.P16_binary}</p>
        : view === 'preview' ? <div className="gl-preview"><Readme source={text} base={base} /></div>
          : view === 'blame' && !blame ? <p className="gl-empty">{blameState === 'Error' ? t.P16_blameError : t.P16_blameLoading}</p>
            : <Lines lines={lines} lang={lang} blame={view === 'blame' ? blame : null} />}
    </section>
  );
}
