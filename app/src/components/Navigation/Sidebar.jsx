// D-08 왼쪽 메뉴. 공공 깃랩 사이드바 배치를 그대로 따른다.
// 프로젝트 안에서는 프로젝트 이름과 고정됨, 코드, 계획 묶음을. 그 밖에서는 탐색 메뉴를 보여 준다.
// 어려운 개발 용어 옆에는 쉬운 설명을 함께 둔다(공무원 이용자).
import { useEffect, useRef, useState } from 'react';
import { NavLink } from 'react-router-dom';
import { t } from '../../copy/ko';
import { Icon } from '../Code/Icon';

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
      [t.Header_menuPublish, '/publish', 'plus'],
      [t.Checklist_title, '/checklist', 'check_circle'],
      [t.Mcp_title, '/mcp', 'component'],
    ]],
    [t.Side_operate, [
      [t.Insights_title, '/insights', 'multi'],
    ]],
  ];
}

/** 프로젝트 안 메뉴. 공공 깃랩 사이드바 묶음 이름을 그대로 쓴다. */
export function projectGroups(id) {
  const p = `/projects/${id}`;
  return [
    [t.Side_pinned, [
      [t.Tab_code, p, 'document', true],
      [t.ProjectTabs_1, `${p}/about`, 'faq'],
      [t.ProjectTabs_2, `${p}/use`, 'help'],
    ]],
    [t.Side_manage, [
      [t.P22_activity, `${p}/activity`, 'time'],
      [t.P22_members, `${p}/members`, 'myinfo'],
      [t.P22_labels, `${p}/labels`, 'bookmarks'],
    ]],
    [t.Side_plan, [
      [t.Side_issues, `${p}/issues`, 'attach'],
      [t.P22_boards, `${p}/boards`, 'multi'],
      [t.P22_milestones, `${p}/milestones`, 'check_circle'],
      [t.P22_wiki, `${p}/wiki`, 'document'],
      [t.ProjectTabs_5, `${p}/feedback`, 'edit'],
    ]],
    [t.Side_code, [
      [t.RepoSub_files, `${p}/code`, 'new_folder'],
      [t.ProjectTabs_4, `${p}/changes`, 'time'],
      [t.Compare_title, `${p}/compare`, 'multi'],
      [t.RepoSub_branches, `${p}/branches`, 'multi', false, t.Side_hintBranch],
      [t.RepoSub_mr, `${p}/merge-requests`, 'component', false, t.Side_hintMr],
      [t.P22_snippets, `${p}/snippets`, 'file'],
    ]],
    [t.Side_deploy, [
      [t.RepoSub_releases, `${p}/releases`, 'upload', false, t.Side_hintRelease],
      [t.P22_packages, `${p}/packages`, 'component'],
      [t.Law_title, `${p}/law-alerts`, 'bell'],
      [t.Handover_title, `${p}/handover`, 'document'],
      [t.P22_pipelines, `${p}/pipelines`, 'reset'],
    ]],
    [t.Side_analyze, [
      [t.RepoSub_people, `${p}/contributors`, 'myinfo'],
      [t.Graph_title, `${p}/graph`, 'multi'],
    ]],
  ];
}

function Group({ group, items }) {
  const [open, setOpen] = useState(true);
  return (
    <div className="rb-side-group">
      {group ? (
        <button
          type="button"
          className="rb-side-group-btn krds-text-body-small-bold"
          aria-expanded={open}
          onClick={() => setOpen(!open)}
        >
          {group}
          <i className="svg-icon ico-toggle" aria-hidden="true" />
        </button>
      ) : null}
      {open ? (
        <ul>
          {items.map(([label, to, icon, end, hint]) => (
            <li key={to + label}>
              <NavLink end={!!end} to={to} className={({ isActive }) => `rb-side-link${isActive ? ' active' : ''}`}>
                <Icon name={icon} />
                <span className="rb-side-text">
                  <span>{label}</span>
                  {hint ? <span className="rb-side-hint">{hint}</span> : null}
                </span>
              </NavLink>
            </li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}

export function Sidebar({ project, open, onClose }) {
  const groups = project ? projectGroups(project.id) : globalGroups();
  const panel = useRef(null);
  // 좁은 화면에서 서랍으로 열렸을 때만 초점을 가두고 Esc로 닫는다.
  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <>
      {open ? <div className="rb-side-dim" onClick={onClose} /> : null}
      <nav
        id="rb-sidebar"
        ref={panel}
        className={'rb-side' + (open ? ' is-open' : '')}
        aria-label={project ? t.Side_labelProject : t.Side_label}
      >
        {project ? (
          <p className="rb-side-project krds-text-body-medium-bold">
            <span className="rb-avatar" aria-hidden="true">{(project.name || '').slice(0, 1)}</span>
            <span className="rb-ellipsis">{project.name}</span>
          </p>
        ) : (
          <p className="rb-side-project krds-text-body-medium-bold">{t.Side_explore}</p>
        )}
        {groups.map(([group, items], i) => (
          <Group key={group || `g${i}`} group={group} items={items} />
        ))}
        <div className="rb-side-foot">
          <NavLink to={project ? `/projects/${project.id}/settings` : '/settings'} className={({ isActive }) => `rb-side-link${isActive ? ' active' : ''}`}>
            <Icon name="setting" />
            <span className="rb-side-text"><span>{project ? t.PSet_title : t.Settings_title}</span></span>
          </NavLink>
          <NavLink to="/help" className={({ isActive }) => `rb-side-link${isActive ? ' active' : ''}`}>
            <Icon name="help" />
            <span className="rb-side-text"><span>{t.Header_menuHelp}</span></span>
          </NavLink>
        </div>
      </nav>
    </>
  );
}
