// D-08 왼쪽 메뉴. 공공 깃랩 사이드바 배치를 그대로 따른다.
// 프로젝트 안에서는 프로젝트 이름과 고정됨, 코드, 계획 묶음을. 그 밖에서는 탐색 메뉴를 보여 준다.
// 어려운 개발 용어 옆에는 쉬운 설명을 함께 둔다(공무원 이용자).
import { useEffect, useRef, useState } from 'react';
import { Menu } from './Menu';
import { NavLink, useLocation } from 'react-router-dom';
import { t } from '../../copy/ko';
import { Icon } from '../Code/Icon';
import { Avatar } from '../Layout/Avatar';
import { useAuth } from '../Identity/useAuth';

/** 전역 탐색 메뉴. [묶음 이름, [항목 이름, 주소, 아이콘, 끝경로 여부, 보조 설명]] */
export function globalGroups() {
  return [
    [null, [
      [t.Side_explore, '/', 'global', true],
      [t.Side_fields, '/fields', 'bookmarks'],
      [t.Side_orgs, '/organizations', 'myinfo'],
    ]],
    [t.Side_myWork, [
      [t.Header_my, '/my', 'my'],
      [t.TabBar_alerts, '/notifications', 'bell'],
      [t.Side_requests, '/requests', 'edit'],
      [t.Collab_title, '/collaborate', 'multi'],
    ]],
    [t.Side_make, [
      [t.NewProject_title, '/projects/new', 'plus'],
      [t.Header_menuPublish, '/projects/new', 'document-check'],
      [t.Checklist_title, '/checklist', 'check_circle'],
      [t.Mcp_title, '/mcp', 'component'],
    ]],
    [t.Side_operate, [
      [t.Insights_title, '/insights', 'analytics'],
    ]],
  ];
}

/** 프로젝트 안 메뉴. 공공 깃랩 사이드바 묶음 이름을 그대로 쓴다. */
export function projectGroups(id, { signedIn, role } = {}) {
  const p = `/projects/${id}`;
  const manage = [
    [t.P22_activity, `${p}/activity`, 'ecg_heart'],
    [t.P22_members, `${p}/members`, 'myinfo'],
    [t.P22_labels, `${p}/labels`, 'bookmarks'],
  ];
  const groups = [
    [t.Side_pinned, [
      [t.Tab_code, p, 'document', true],
      [t.ProjectTabs_1, `${p}/about`, 'identity'],
      [t.ProjectTabs_2, `${p}/use`, 'play', false, t.Side_hintUse],
    ]],
    [t.Side_manage, manage],
    [t.Side_plan, [
      [t.ProjectTabs_5, `${p}/feedback`, 'inquiry', false, t.Side_hintFeedback],
      [t.Side_issues, `${p}/issues`, 'guide_check', false, t.Side_hintIssue],
      [t.P22_boards, `${p}/boards`, 'component'],
      [t.P22_milestones, `${p}/milestones`, 'calendar'],
      [t.P22_wiki, `${p}/wiki`, 'document_fill'],
    ]],
    [t.Side_code, [
      [t.RepoSub_files, `${p}/code`, 'folder'],
      [t.ProjectTabs_4, `${p}/changes`, 'time', false, t.Side_hintCommit],
      [t.RepoSub_branches, `${p}/branches`, 'share', false, t.Side_hintBranch],
      [t.RepoSub_mr, `${p}/merge-requests`, 'edit', false, t.Side_hintMr],
      [t.Compare_title, `${p}/compare`, 'filter'],
      [t.P22_snippets, `${p}/snippets`, 'attach'],
    ]],
    [t.Side_deploy, [
      [t.RepoSub_releases, `${p}/releases`, 'upload', false, t.Side_hintRelease],
      [t.P22_packages, `${p}/packages`, 'scrap'],
      [t.P22_pipelines, `${p}/pipelines`, 'component', false, t.Side_hintPipeline],
      [t.Jobs_title, `${p}/jobs`, 'check_circle'],
    ]],
    [t.Side_analyze, [
      [t.RepoSub_people, `${p}/contributors`, 'nonmember'],
      [t.Graph_title, `${p}/graph`, 'analytics'],
      [t.Law_title, `${p}/law-alerts`, 'bell'],
      [t.Handover_title, `${p}/handover`, 'file'],
    ]],
  ];
  // 프로젝트 관리는 권한이 있을 때만 보인다(D-10 role).
  if (signedIn && (role === 'developer' || role === 'owner')) {
    groups.push([t.Side_projectManage, [
      [t.PSet_title, `${p}/settings`, 'setting'],
      [t.Side_publishCheck, `${p}/publish-check`, 'document-check', false, t.Side_hintPublish],
    ]]);
  }
  return groups;
}

/** 접힌 메뉴와 쉬운 풀이용 툴팁. 마우스와 키보드 초점 모두에서 열고, Esc로 닫는다(WCAG 1.4.13). 스크롤 상자에 잘리지 않게 고정 위치로 그린다. */
function useTip() {
  const [tip, setTip] = useState(null);
  const show = (el, label, hint, id) => {
    const r = el.getBoundingClientRect();
    setTip({ label, hint, id, top: r.top + r.height / 2, left: r.right });
  };
  const hide = () => setTip(null);
  useEffect(() => {
    if (!tip) return undefined;
    const onKey = (e) => e.key === 'Escape' && setTip(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [tip]);
  return { tip, show, hide };
}

function SideLink({ item, collapsed, tipApi }) {
  const [label, to, icon, end, hint] = item;
  const id = 'rb-tip-' + to.replace(/[^a-z0-9]/gi, '-') + '-' + label.length;
  // 접힘: 이름과 풀이, 펼침: 풀이가 있을 때만
  const wants = collapsed || hint;
  const open = (e) => wants && tipApi.show(e.currentTarget, collapsed ? label : null, hint, id);
  return (
    <NavLink
      end={!!end}
      to={to}
      className={({ isActive }) => `rb-side-link${isActive ? ' active' : ''}`}
      aria-describedby={tipApi.tip?.id === id && !collapsed ? id : undefined}
      aria-label={collapsed ? label : undefined}
      onMouseEnter={open}
      onFocus={open}
      onMouseLeave={tipApi.hide}
      onBlur={tipApi.hide}
    >
      <Icon name={icon} />
      {collapsed ? null : <span className="rb-side-text">{label}</span>}
    </NavLink>
  );
}

/** 접힌 메뉴의 묶음 하나. 대표 아이콘 하나만 보이고, 누르면 이름이 있는 항목 목록이 옆으로 열린다. */
function CollapsedGroup({ group, items, tipApi }) {
  const { pathname } = useLocation();
  const active = items.some(([, to, , end]) => (end ? pathname === to : pathname === to || pathname.startsWith(to + '/')));
  const tip = (e) => tipApi.show(e.currentTarget, group, null, 'rb-tip-g-' + group.length);
  return (
    <div className="rb-side-group">
      <Menu
        label={group}
        side
        toggle={false}
        btnClass={'rb-side-link rb-side-groupicon' + (active ? ' active' : '')}
        btnProps={{ onMouseEnter: tip, onFocus: tip, onMouseLeave: tipApi.hide, onBlur: tipApi.hide, onClick: tipApi.hide }}
        button={<Icon name={items[0][2]} />}
      >
        {(close) => (
          <div className="rb-menu-group">
            <p className="rb-menu-title">{group}</p>
            <ul>
              {items.map(([label, to, icon, end]) => (
                <li key={to + label}>
                  <NavLink role="menuitem" end={!!end} to={to} className={({ isActive }) => `item-link${isActive ? ' active' : ''}`} onClick={close}>
                    <Icon name={icon} />
                    <span>{label}</span>
                  </NavLink>
                </li>
              ))}
            </ul>
          </div>
        )}
      </Menu>
    </div>
  );
}

function Group({ group, items, collapsed, tipApi }) {
  const [open, setOpen] = useState(true);
  // D-17 5장: 접힘에서는 이름 있는 묶음을 대표 아이콘 하나로 줄이고, 이름 없는 묶음(맨 위)만 항목을 그대로 둔다
  if (collapsed && group) return <CollapsedGroup group={group} items={items} tipApi={tipApi} />;
  const showList = collapsed || open;
  return (
    <div className="rb-side-group">
      {group && !collapsed ? (
        <button
          type="button"
          className="rb-side-group-btn krds-text-body-xsmall-bold"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {group}
          <i className="svg-icon ico-toggle" aria-hidden="true" />
        </button>
      ) : null}
      {showList ? (
        <ul>
          {items.map((item) => (
            <li key={item[1] + item[0]}>
              <SideLink item={item} collapsed={collapsed} tipApi={tipApi} />
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Sidebar({ project, open, onClose, collapsed, onToggleCollapsed }) {
  const { signedIn, role } = useAuth();
  const groups = project ? projectGroups(project.id, { signedIn, role }) : globalGroups();
  const panel = useRef(null);
  const tipApi = useTip();
  const { tip } = tipApi;
  // 좁은 화면에서 서랍으로 열렸을 때만 초점을 가두고 Esc로 닫는다.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  const foot = [
    ...(project ? [] : [[t.Settings_title, '/settings', 'setting']]),
    [t.Header_menuHelp, '/help', 'help'],
  ];
  return (
    <>
      {open ? <div className="rb-side-dim" onClick={onClose} /> : null}
      <div className="rb-side-wrap" data-figma="sidebar">
        <nav
          id="rb-sidebar"
          ref={panel}
          className={'rb-side' + (open ? ' is-open' : '') + (collapsed ? ' is-collapsed' : '')}
          aria-label={project ? t.Side_labelProject : t.Side_label}
        >
          {/* D-17 5장: 접기 버튼은 메뉴 맨 위(GitLab처럼). 이름은 툴팁으로 */}
          <button
            type="button"
            className="rb-side-collapse"
            onClick={() => { tipApi.hide(); onToggleCollapsed(); }}
            aria-expanded={!collapsed}
            aria-controls="rb-sidebar"
            aria-label={collapsed ? t.Side_expand : t.Side_collapse}
            onMouseEnter={(e) => collapsed && tipApi.show(e.currentTarget, t.Side_expand, null, 'rb-tip-collapse')}
            onFocus={(e) => collapsed && tipApi.show(e.currentTarget, t.Side_expand, null, 'rb-tip-collapse')}
            onMouseLeave={tipApi.hide}
            onBlur={tipApi.hide}
          >
            <Icon name="arrow-right" />
            {collapsed ? null : <span className="rb-side-text">{t.Side_collapse}</span>}
          </button>
          {project && !collapsed ? (
            <p className="rb-side-project krds-text-body-small-bold">
              <Avatar src={project.avatarUrl} name={project.name} />
              <span className="rb-ellipsis">{project.name}</span>
            </p>
          ) : null}
          <div className="rb-side-groups" data-figma="sidebar-nav">
            {groups.map(([group, items], i) => (
              <Group key={group || `g${i}`} group={group} items={items} collapsed={collapsed} tipApi={tipApi} />
            ))}
          </div>
          <div className="rb-side-foot">
            <ul>
              {foot.map((item) => (
                <li key={item[1]}><SideLink item={item} collapsed={collapsed} tipApi={tipApi} /></li>
              ))}
            </ul>
          </div>
        </nav>
        {tip ? (
          <div role="tooltip" id={tip.id} className="rb-tip" style={{ top: tip.top, left: tip.left }}>
            {tip.label ? <span className="rb-tip-label">{tip.label}</span> : null}
            {tip.hint ? <span className="rb-tip-hint">{tip.hint}</span> : null}
          </div>
        ) : null}
      </div>
    </>
  );
}
