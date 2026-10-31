// C1 공통 조각: 복사 단추, 소스 코드 내려받기 메뉴, 필터 줄. 공공 깃랩 15~19 캡처 구성.
import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Avatar } from '../../components/Layout/Avatar';
import { IconButton } from '../../components/Action/IconButton';
import { Menu } from '../../components/Navigation/Menu';
import { Icon } from '../../components/Code/Icon';
import { g } from '../../copy/gl';
import { t } from '../../copy/ko';

export function CopyButton({ text, label = g.copy }) {
  const [done, setDone] = useState(false);
  return (
    <>
      <IconButton icon="copy" label={label} size="small" onClick={async () => { await navigator.clipboard.writeText(text); setDone(true); setTimeout(() => setDone(false), 2000); }} />
      <span className="sr-only" role="status" aria-live="polite">{done ? t.Home_copied : ''}</span>
    </>
  );
}

export function SourceMenu({ project, refName }) {
  const base = `${project.web_url}/-/archive/${encodeURIComponent(refName)}/${project.path}-${encodeURIComponent(refName)}`;
  const rows = [[g.srcZip, 'zip'], [g.srcTarGz, 'tar.gz'], [g.srcTarBz2, 'tar.bz2'], [g.srcTar, 'tar']];
  return (
    <Menu label={g.download} align="right" btnClass="krds-btn small tertiary gl-dl gl-filled" button={<Icon name="download" />}>
      {(close) => (
        <ul className="drop-list">
          <li><p className="rb-menu-title">{g.dlTitle}</p></li>
          {rows.map(([name, ext]) => (
            <li key={ext}><a className="item-link" href={`${base}.${ext}`} onClick={close}>{name}</a></li>
          ))}
        </ul>
      )}
    </Menu>
  );
}

/** 검색칸 + 돋보기 단추가 붙은 공공 깃랩 필터 입력 */
export function FilterField({ value, onChange, placeholder, label, lead, figma }) {
  return (
    <div className="gl-filter-field" data-figma={figma}>
      {lead ? <span className="gl-filter-lead">{lead}</span> : null}
      <input type="search" className="gl-filter-input" value={value} placeholder={placeholder} aria-label={label || placeholder} onChange={(e) => onChange(e.target.value)} />
      <span className="gl-filter-go"><Icon name="search" label={g.search} /></span>
    </div>
  );
}

/** 정렬 선택(드롭다운) + 방향 단추 */
export function SortControl({ options, value, onChange, desc, onDir }) {
  return (
    <div className="gl-sort">
      <Menu label={g.sort} align="right" btnClass="krds-btn small tertiary" button={<span>{options.find(([k]) => k === value)?.[1]}</span>}>
        {(close) => (
          <ul className="drop-list" aria-label={g.sort}>
            {options.map(([k, name]) => (
              <li key={k}><button type="button" className={'item-link' + (k === value ? ' active' : '')} aria-current={k === value ? 'true' : undefined} onClick={() => { close(); onChange(k); }}>{name}</button></li>
            ))}
          </ul>
        )}
      </Menu>
      <IconButton icon={desc ? 'ext/sort-desc' : 'ext/sort-asc'} label={g.sortDir} size="small" className="gl-sort-dir" onClick={onDir} />
    </div>
  );
}

/** 파일 보기 최근 커밋 막대(공공 깃랩 08): 아바타, 제목 굵게 + 본문 펼침 점 세 개, 작성자와 시간, 해시, 복사, 이력 */
export function GlCommitBar({ id, commit, owner, path }) {
  const [open, setOpen] = useState(false);
  if (!commit) return null;
  const who = owner && owner.path === commit.author_name ? owner.name : commit.author_name;
  const body = (commit.message || '').replace(commit.title, '').trim();
  return (
    <div className="gl-cbar" data-figma="commit-bar">
      <div className="gl-cbar-line">
        <Avatar className="is-32" name={commit.author_name} />
        <div className="gl-ref-main gl-grow">
          <p className="gl-ref-name">
            <Link to={`/projects/${id}/changes/${commit.id}`}>{commit.title}</Link>
            {body ? <button type="button" className="gl-dots" aria-expanded={open} aria-label={open ? g.collapseBody : g.expandBody} onClick={() => setOpen(!open)}><Icon name="ellipsis_horizontal" /></button> : null}
          </p>
          <p className="gl-ref-meta"><span>{t.fn.wroteAt(who)} <time dateTime={commit.committed_date}>{t.fn.ago(commit.committed_date)}</time>{t.fn.wroteSuffix}</span></p>
        </div>
        <div className="gl-ref-side">
          <code className="gl-sha">{commit.short_id}</code>
          <CopyButton text={commit.id} label={g.copySha} />
          <Link className="krds-btn small tertiary" to={`/projects/${id}/changes${path ? `?path=${encodeURIComponent(path)}` : ''}`}>{g.history}</Link>
        </div>
      </div>
      {open ? <pre className="gl-commit-body">{body}</pre> : null}
    </div>
  );
}
