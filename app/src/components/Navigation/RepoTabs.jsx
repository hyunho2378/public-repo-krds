// D-18: GitHub처럼 머리글 아래 탭 줄(높이 48). 코드, 이슈, 변경 제안, 파이프라인, 위키, 분석, 설정, 더보기(나머지 공공 깃랩 메뉴 전부), 맨 끝에 사용 방법.
import { useEffect, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { Icon } from '../Code/Icon';
import { atLeast, useAuth } from '../Identity/useAuth';
import { projectGroups } from './Sidebar';
import { useDock } from '../../app/dock';
import { DOCK_ID } from '../Layout/DockPanel';

const under = (path, base, list) => list.some((s) => path === base + s || path.startsWith(base + s + '/'));

function MoreMenu({ id, groups, active }) {
  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState(null);
  const wrap = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const onDown = (e) => { if (!wrap.current?.contains(e.target)) setOpen(false); };
    const onKey = (e) => { if (e.key === 'Escape') setOpen(false); };
    document.addEventListener('mousedown', onDown);
    document.addEventListener('keydown', onKey);
    return () => { document.removeEventListener('mousedown', onDown); document.removeEventListener('keydown', onKey); };
  }, [open]);
  const toggle = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    setPos({ top: r.bottom, right: document.documentElement.clientWidth - r.right });
    setOpen(!open);
  };
  return (
    <li className="rb-rtab-more" ref={wrap}>
      <button type="button" className={'rb-rtab' + (active ? ' active' : '')} aria-haspopup="true" aria-expanded={open} onClick={toggle}>
        <Icon name="ellipsis_horizontal" />
        <span>{u.More_menu}</span>
        <i className="svg-icon ico-toggle" aria-hidden="true" />
      </button>
      {open ? (
        <div className="rb-flyout rb-more-menu" role="menu" aria-label={u.More_menu} style={{ top: pos.top, right: pos.right, left: 'auto' }}>
          {groups.map(([group, items]) => (
            <div key={group || 'g'} className="rb-more-group">
              {group ? <p className="rb-flyout-title krds-text-body-xsmall-bold">{group}</p> : null}
              <ul>
                {items.map(([label, to, icon]) => (
                  <li key={to + label}>
                    <Link role="menuitem" className="rb-side-link" to={to} onClick={() => setOpen(false)}>
                      <Icon name={icon} />
                      <span className="rb-side-text">{label}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ) : null}
    </li>
  );
}

export function RepoTabs({ id, nav }) {
  const { pathname } = useLocation();
  const { signedIn, role } = useAuth();
  const p = `/projects/${id}`;
  const manage = signedIn && atLeast(role, 'developer');
  const TABS = [
    { to: p, label: t.Tab_code, icon: 'document', match: (s) => s === p || under(s, p, ['/code', '/changes', '/branches', '/releases', '/compare', '/snippets']) },
    { to: p + '/issues', label: t.Side_issues, icon: 'guide_check', count: nav?.issues, match: (s) => under(s, p, ['/issues']) },
    { to: p + '/merge-requests', label: t.RepoSub_mr, icon: 'edit', match: (s) => under(s, p, ['/merge-requests']) },
    { to: p + '/pipelines', label: t.P22_pipelines, icon: 'component', match: (s) => under(s, p, ['/pipelines', '/jobs']) },
    { to: p + '/wiki', label: t.P22_wiki, icon: 'document_fill', match: (s) => under(s, p, ['/wiki']) },
    { to: p + '/graph', label: t.Side_analyze, icon: 'analytics', match: (s) => under(s, p, ['/graph', '/contributors', '/law-alerts', '/handover']) },
    ...(manage ? [{ to: p + '/settings', label: t.PSet_title, icon: 'setting', match: (s) => under(s, p, ['/settings']) }] : []),
  ];
  const TAB_ROOTS = new Set([p + '/issues', p + '/merge-requests', p + '/pipelines', p + '/wiki', p + '/graph', p + '/settings', p + '/use', p]);
  const groups = projectGroups(id, { signedIn, role })
    .map(([g, items]) => [g, items.filter(([, to]) => !TAB_ROOTS.has(to) && to !== p + '/code')])
    .filter(([, items]) => items.length);
  const moreActive = groups.some(([, items]) => items.some(([, to]) => pathname === to || pathname.startsWith(to + '/')))
    && !TABS.some((x) => x.match(pathname));
  const useActive = under(pathname, p, ['/use']);
  const dock = useDock();
  return (
    <nav className="rb-rtabs" aria-label={t.ProjectTabs_6} data-figma="repo-tabs">
      <ul className="rb-rtabs-in">
        {TABS.map((x) => {
          const on = x.match(pathname);
          return (
            <li key={x.to}>
              <Link className={'rb-rtab' + (on ? ' active' : '')} aria-current={on ? 'page' : undefined} to={x.to}>
                <Icon name={x.icon} />
                <span>{x.label}</span>
                {x.count ? <span className="rb-rtab-count">{x.count}</span> : null}
              </Link>
            </li>
          );
        })}
        <li className="rb-rtab-use">
          <Link className={'rb-rtab' + (useActive ? ' active' : '')} aria-current={useActive ? 'page' : undefined} to={p + '/use'}>
            <Icon name="play" />
            <span>{t.ProjectTabs_2}</span>
          </Link>
        </li>
        <MoreMenu id={id} groups={groups} active={moreActive} />
        <li className="rb-rtab-info">
          <button type="button" className={'rb-rtab' + (dock.open ? ' active' : '')} aria-expanded={dock.open} aria-controls={DOCK_ID} onClick={() => dock.setOpen(!dock.open)}>
            <Icon name="help" />
            <span>{u.Dock_info}</span>
          </button>
        </li>
      </ul>
    </nav>
  );
}
