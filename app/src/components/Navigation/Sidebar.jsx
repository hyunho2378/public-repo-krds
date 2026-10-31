// D-21 왼쪽 세로 바. 공공 깃랩 사이드바(UX/handson/README.md 1절, 캡처 01, 03) 항목과 순서를 그대로 옮긴다.
// 폭 240, 항목 높이 32, 글자 15(현재 항목만 굵게 + 회색 면). 묶음은 꺾쇠로 접고 편다. 맨 아래 '도움말', '사이드바 접음'.
// 접으면 완전히 숨기고 상단 바의 펼침 단추로 다시 연다(공공 깃랩 방식). 쉬운 풀이는 항목 옆이 아니라 툴팁.
// 덧붙임은 탐색 메뉴 맨 아래 묶음 하나와 프로젝트 고정됨 맨 끝 '사용 방법'뿐이다.
import { useEffect, useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { Icon } from '../Code/Icon';
import { Avatar } from '../Layout/Avatar';
import { useAuth } from '../Identity/useAuth';
import { newWindow } from '../Layout/newWindow';

const GITLAB = 'https://gitlab.aigov.go.kr';

/** 항목: { label, to | href, icon, end, hint, count } */
const item = (label, to, extra = {}) => ({ label, to, ...extra });

/** 전역 탐색 메뉴(공공 깃랩 '탐색'). 우리에게 아직 없는 화면은 공공 깃랩 원본을 새 창으로 연다. */
export function globalMenu({ signedIn } = {}) {
  // 덧붙임 묶음 '덧붙인 기능'(Figma A·G 화면: 업무로 찾기, 요청 보드, 운영 현황판) + UX/14 1장 7번 '협업 모집'(Figma에 자리 없음 → UX/14 표의 자리).
  // 업무 분야는 탐색 필터 막대(UX/14 2번), 내 작업·알림은 상단 바, 새 프로젝트·점검표·AI 코딩 도구 연결은 각 화면 진입점에 둔다(한 화면 덧붙임 하나)
  const extra = [
    item(u.C_task, '/search', { icon: 'search' }),
    item(t.Side_requests, '/requests', { icon: 'inquiry' }),
    item(t.Insights_title, '/insights', { icon: 'analytics' }),
    item(t.Collab_title, '/collaborate', { icon: 'multi' }),
  ];
  return {
    title: u.G_explore,
    groups: [
      { items: [
        item(u.G_projects, '/', { icon: 'ext/project', end: true }),
        item(u.G_groups, '/organizations', { icon: 'ext/group', end: true }),
        item(u.G_ciCatalog, null, { href: `${GITLAB}/explore/catalog`, icon: 'ext/catalog' }),
        item(u.G_aiCatalog, null, { href: `${GITLAB}/explore/ai-catalog`, icon: 'ext/sparkle' }),
        item(u.G_topics, '/explore/topics', { icon: 'ext/tag' }),
        item(u.G_snippets, '/explore/snippets', { icon: 'ext/snippet' }),
      ] },
      { name: u.G_extraTitle, heading: true, items: extra, extra: true },
    ],
  };
}

/** 프로젝트 메뉴(공공 깃랩 03_사이드바_전체펼침 원문 순서). 묶음 아이콘만 두고 하위 항목은 글자만(공공 깃랩과 같다). */
export function projectMenu(id, { signedIn, role, issues, webUrl } = {}) {
  const p = `/projects/${id}`;
  const up = (path) => ({ href: `${webUrl || GITLAB}${path}` });
  const groups = [
    { name: u.G_pinned, icon: 'ext/pin', open: true, items: [
      item(u.G_members, `${p}/members`),
      item(u.G_workItems, `${p}/issues`, { count: issues, hint: t.Side_hintIssue }),
      item(u.G_branches, `${p}/branches`, { hint: t.Side_hintBranch }),
      item(u.G_mr, `${p}/merge-requests`, { hint: t.Side_hintMr }),
      item(u.G_pipelines, `${p}/pipelines`, { hint: t.Side_hintPipeline }),
      item(u.G_usage, `${p}/use`, { hint: t.Side_hintUse, extra: true }),
    ] },
    // 공공 깃랩 '추가 기능': 펼침 없는 한 줄(실제는 기능 모음 창을 여는 단추, 하위 항목 없음, 2026. 10. 31. 실측). 아래 구분선
    { sep: true, items: [item(u.G_more, null, { href: `${webUrl || GITLAB}`, icon: 'view_all' })] },
    { name: u.G_manage, icon: 'ext/users', items: [
      item(u.G_activity, `${p}/activity`), item(u.G_members, `${p}/members`), item(u.G_labels, `${p}/labels`),
    ] },
    { name: u.G_plan, icon: 'calendar', items: [
      item(u.G_workItems, `${p}/issues`), item(u.G_boards, `${p}/boards`), item(u.G_milestones, `${p}/milestones`), item(u.G_wiki, `${p}/wiki`),
    ] },
    { name: u.G_code, icon: 'ext/code', items: [
      item(u.G_mr, `${p}/merge-requests`), item(u.G_repository, `${p}/code`), item(u.G_branches, `${p}/branches`),
      item(u.G_commits, `${p}/changes`, { hint: t.Side_hintCommit }), item(u.G_tags, `${p}/tags`), item(u.G_graph, `${p}/graph`),
      item(u.G_compare, `${p}/compare`), item(u.G_snippets, `${p}/snippets`),
    ] },
    { name: u.G_build, icon: 'ext/rocket', items: [
      item(u.G_pipelines, `${p}/pipelines`), item(u.G_jobs, `${p}/jobs`),
      item(u.G_schedules, null, up('/-/pipeline_schedules')), item(u.G_artifacts, null, up('/-/artifacts')),
    ] },
    { name: u.G_deploy, icon: 'ext/deploy', items: [
      item(u.G_releases, `${p}/releases`, { hint: t.Side_hintRelease }), item(u.G_packages, `${p}/packages`), item(u.G_models, null, up('/-/ml/models')),
    ] },
    { name: u.G_operate, icon: 'ext/cloud', items: [
      item(u.G_envs, null, up('/-/environments')), item(u.G_terraform, null, up('/-/terraform_module_registry')),
    ] },
    // 덧붙임 법령 변경 알림: '모니터' 묶음 아래(UX/14 1장 8번, Figma A-10)
    { name: u.G_monitor, icon: 'ext/monitor', items: [item(u.G_incidents, null, up('/-/incidents')), item(t.Law_title, `${p}/law-alerts`, { extra: true })] },
    { name: u.G_analyze, icon: 'analytics', items: [
      item(u.G_vsa, null, up('/-/value_stream_analytics')), item(u.G_contributors, `${p}/contributors`),
      item(u.G_cicdAnalytics, null, up('/-/pipelines/charts')), item(u.G_repoAnalytics, `${p}/analytics`),
      item(u.G_experiments, null, up('/-/ml/experiments')),
    ] },
  ];
  // 프로젝트 관리(설정, 공개 준비 점검)는 권한이 있을 때만(D-10 role). 공공 깃랩의 '설정' 자리(맨 끝)
  // 덧붙임 공개 준비 점검: 권한이 있으면 '설정' 묶음 아래(UX/14 1장 5번), 없으면 목록 끝 한 줄(Figma R-01·A 화면). 소개·의견·인수인계는 세로 바에 두지 않는다(UX/14: 한 화면 덧붙임 하나, 진입은 프로젝트 홈 정보 열과 화면 안 단추)
  if (signedIn && (role === 'developer' || role === 'owner')) {
    groups.push({ name: t.PSet_title, icon: 'setting', items: [item(t.PSet_title, `${p}/settings`), item(t.Side_publishCheck, `${p}/publish-check`, { hint: t.Side_hintPublish })] });
  } else {
    groups.push({ items: [item(t.Side_publishCheck, `${p}/publish-check`, { hint: t.Side_hintPublish, icon: 'analytics', extra: true })] });
  }
  return { groups };
}

/** 쉬운 풀이 툴팁. 마우스와 키보드 초점 모두에서 열고 Esc로 닫는다(WCAG 1.4.13). */
function useTip() {
  const [tip, setTip] = useState(null);
  useEffect(() => {
    if (!tip) return undefined;
    const onKey = (e) => e.key === 'Escape' && setTip(null);
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [tip]);
  return {
    tip,
    show: (el, hint, id) => {
      const r = el.getBoundingClientRect();
      setTip({ hint, id, top: r.top + r.height / 2, left: r.right });
    },
    hide: () => setTip(null),
  };
}

function SideLink({ it, tipApi, indent }) {
  const id = 'rb-tip-' + (it.to || it.href).replace(/[^a-z0-9]/gi, '-');
  const tipOn = it.hint ? (e) => tipApi.show(e.currentTarget, it.hint, id) : undefined;
  const common = {
    onMouseEnter: tipOn, onFocus: tipOn, onMouseLeave: it.hint ? tipApi.hide : undefined, onBlur: it.hint ? tipApi.hide : undefined,
    'aria-describedby': tipApi.tip?.id === id ? id : undefined,
  };
  const body = (
    <>
      {it.icon ? <Icon name={it.icon} /> : null}
      <span className="rb-side-text">{it.label}</span>
      {it.count ? <span className="rb-side-count">{it.count}</span> : null}
    </>
  );
  const cls = 'rb-side-link' + (indent ? ' is-sub' : '');
  if (it.href) {
    return <a className={cls} href={it.href} {...newWindow(it.label)} title={u.G_newWindow} {...common}>{body}</a>;
  }
  return (
    <NavLink end={!!it.end} to={it.to} className={({ isActive }) => cls + (isActive ? ' active' : '')} {...common}>
      {body}
    </NavLink>
  );
}

function Group({ group, tipApi, rail, onShow }) {
  const { pathname } = useLocation();
  const hasActive = group.items.some((it) => it.to && (pathname === it.to || pathname.startsWith(it.to + '/')));
  const [open, setOpen] = useState(group.open || hasActive);
  useEffect(() => { if (hasActive) setOpen(true); }, [hasActive]);
  if (group.heading) {
    // Figma '덧붙인 기능': 접지 않는 제목 한 줄(머리 '탐색'과 같은 글자) + 아이콘 있는 항목
    return (
      <div className="rb-side-group is-heading">
        <p className="rb-side-title">{group.name}</p>
        <ul className="rb-side-list">
          {group.items.map((it) => <li key={(it.to || it.href) + it.label}><SideLink it={it} tipApi={tipApi} /></li>)}
        </ul>
      </div>
    );
  }
  if (!group.name) {
    const list = (
      <ul className="rb-side-list">
        {group.items.map((it) => <li key={(it.to || it.href) + it.label}><SideLink it={it} tipApi={tipApi} /></li>)}
      </ul>
    );
    return group.sep ? <div className="rb-side-group has-sep">{list}</div> : list;
  }
  const listId = 'rb-side-g-' + group.name.replace(/\s/g, '');
  return (
    <div className={'rb-side-group' + (group.extra && !group.sep ? ' is-extra' : '') + (group.sep ? ' has-sep' : '')}>
      <button type="button" className="rb-side-group-btn" aria-expanded={open} aria-controls={listId} title={rail ? group.name : undefined} onClick={() => { if (rail) { onShow(); setOpen(true); } else setOpen(!open); }}>
        <Icon name={group.icon} />
        <span className="rb-side-text">{group.name}</span>
        {/* 공공 깃랩: 접힌 묶음은 오른쪽 꺾쇠, 펼친 묶음은 아래 꺾쇠(Figma 아이콘 이름과 같게) */}
        <Icon name={open && !rail ? 'arrow-down' : 'arrow-right'} />
      </button>
      {/* D-22: 목록은 늘 그려 두고 grid-template-rows 0fr↔1fr로 접는다(조건부 렌더링은 끊김 원인) */}
      <div className={'rb-side-fold' + (open ? ' is-open' : '')}>
        <ul id={listId} className="rb-side-list" aria-hidden={!open || undefined} ref={(el) => { if (el) el.inert = !open; }}>
          {group.items.map((it) => <li key={(it.to || it.href) + it.label}><SideLink it={it} tipApi={tipApi} indent /></li>)}
        </ul>
      </div>
    </div>
  );
}

// 접음(공공 깃랩 '사이드바 접음'): 숨기지 않고 폭 44 아이콘 열로 줄인다(UX/17 3절). 묶음 아이콘을 누르면 다시 펼치고 그 묶음을 연다
export function Sidebar({ project, open, onClose, onHide, onShow, hidden = false }) {
  const rail = hidden;
  const { signedIn, role } = useAuth();
  const menu = project ? projectMenu(project.id, { signedIn, role, issues: project.issues, webUrl: project.webUrl }) : globalMenu({ signedIn });
  const tipApi = useTip();
  const { tip } = tipApi;
  // 좁은 화면 서랍: Esc로 닫는다
  useEffect(() => {
    if (!open) return undefined;
    // 서랍이 열리면 첫 링크로 초점(공공 깃랩, audit_v3 05 1절)
    requestAnimationFrame(() => document.querySelector('#rb-sidebar .rb-side-link')?.focus());
    const onKey = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, onClose]);
  return (
    <>
      {open ? <div className="rb-side-dim" onClick={onClose} /> : null}
      <div className="rb-side-wrap" data-figma="gitlab-sidebar">
        <nav id="rb-sidebar" className={'rb-side' + (open ? ' is-open' : '') + (rail ? ' is-rail' : '')} aria-label={project ? t.Side_labelProject : t.Side_label}>
          <div className="rb-side-scroll">
            <p className="rb-side-title">{project ? u.G_project : menu.title}</p>
            {project ? (
              <NavLink end to={`/projects/${project.id}`} className={({ isActive }) => 'rb-side-link rb-side-project' + (isActive ? ' active' : '')}>
                <Avatar src={project.avatarUrl} name={project.name} seed={project.seed} />
                <span className="rb-side-text">{project.name}</span>
              </NavLink>
            ) : null}
            <div className="rb-side-groups" data-figma="sidebar-nav">
              {menu.groups.map((g, i) => <Group key={g.name || `g${i}`} group={g} tipApi={tipApi} rail={rail} onShow={onShow} />)}
            </div>
          </div>
          <div className="rb-side-foot">
            <ul className="rb-side-list">
              <li><SideLink it={item(u.G_help, '/help', { icon: 'help' })} tipApi={tipApi} /></li>
              <li>
                {rail ? (
                  <button type="button" className="rb-side-link rb-side-hide" onClick={() => { tipApi.hide(); onShow(); }} aria-controls="rb-sidebar" title={u.G_sideExpand}>
                    <Icon name="panel_close" />
                    <span className="rb-side-text">{u.G_sideExpand}</span>
                  </button>
                ) : (
                  <button type="button" className="rb-side-link rb-side-hide" onClick={() => { tipApi.hide(); onHide(); }} aria-controls="rb-sidebar">
                    <Icon name="panel_open" />
                    <span className="rb-side-text">{u.G_sideCollapse}</span>
                  </button>
                )}
              </li>
            </ul>
          </div>
        </nav>
        {tip ? (
          <div role="tooltip" id={tip.id} className="rb-tip" style={{ top: tip.top, left: tip.left }}>
            <span className="rb-tip-hint">{tip.hint}</span>
          </div>
        ) : null}
      </div>
    </>
  );
}
