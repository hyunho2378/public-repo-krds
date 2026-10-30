// D-18: GitHub처럼 머리글 아래 탭 줄(높이 48). 코드, 이슈, 변경 제안, 파이프라인, 위키, 분석, 설정, 더보기(나머지 공공 깃랩 메뉴 전부), 맨 끝에 사용 방법.
import { Link, useLocation } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { Icon } from '../Code/Icon';
import { atLeast, useAuth } from '../Identity/useAuth';
import { projectGroups } from './Sidebar';
import { Menu } from './Menu';
import { useDock } from '../../app/dock';
import { DOCK_ID } from '../Layout/DockPanel';

const under = (path, base, list) => list.some((s) => path === base + s || path.startsWith(base + s + '/'));

function MoreMenu({ groups, active }) {
  return (
    <li className="rb-rtab-more">
      <Menu label={u.More_menu} align="left" btnClass={'rb-rtab' + (active ? ' active' : '')} button={<><Icon name="ellipsis_horizontal" /><span>{u.More_menu}</span></>}>
        {(close) => groups.map(([group, items]) => (
          <div key={group || 'g'} className="rb-menu-group">
            {group ? <p className="rb-menu-title">{group}</p> : null}
            <ul>
              {items.map(([label, to, icon]) => (
                <li key={to + label}>
                  <Link role="menuitem" className="item-link" to={to} onClick={close}>
                    <Icon name={icon} />
                    <span>{label}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </Menu>
    </li>
  );
}

export function RepoTabs({ id, nav }) {
  const { pathname } = useLocation();
  const { signedIn, role } = useAuth();
  const p = `/projects/${id}`;
  const manage = signedIn && atLeast(role, 'developer');
  const TABS = [
    { to: p, label: t.Tab_code, icon: 'document', match: (s) => s === p || under(s, p, ['/code', '/changes', '/branches', '/tags', '/releases', '/compare', '/snippets']) },
    { to: p + '/issues', label: t.Side_issues, tip: u.Tip_issues, icon: 'ext/issues', count: nav?.issues, match: (s) => under(s, p, ['/issues']) },
    { to: p + '/merge-requests', label: t.RepoSub_mr, tip: u.Tip_mr, icon: 'ext/merge-request', match: (s) => under(s, p, ['/merge-requests']) },
    { to: p + '/pipelines', label: t.P22_pipelines, icon: 'ext/pipeline', match: (s) => under(s, p, ['/pipelines', '/jobs']) },
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
              <Link className={'rb-rtab' + (on ? ' active' : '')} aria-current={on ? 'page' : undefined} title={x.tip} to={x.to}>
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
        <MoreMenu groups={groups} active={moreActive} />
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
