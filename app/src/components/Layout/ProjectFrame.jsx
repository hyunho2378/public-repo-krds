// 프로젝트 안 공통 머리: 브레드크럼, 이름, 기관, 탭. 프로젝트 자료를 한 번 불러와 하위 화면에 넘긴다.
import { t } from '../../copy/ko';
import { useState } from 'react';
import { useLocation, useParams, useSearchParams } from 'react-router-dom';
import { auth, gitlab, readmeOrEmpty } from '../../api/client';
import { cleanDescription } from './StructuredList';
import { LoginRequiredModal } from '../Feedback/LoginRequiredModal';
import { Icon } from '../Code/Icon';
import { ReuseAction } from '../../screens/parts/ReuseAction';
import { orgLabel } from './orgLabel';
import { Avatar } from './Avatar';
import './repo.css';
import { useData } from '../../api/useData';
import { Page } from './Page';
import { Breadcrumb } from '../Navigation/Breadcrumb';
import { ProjectTabs } from '../Navigation/ProjectTabs';
import { Status } from '../Feedback/Status';
import { useEffect } from 'react';
import { setProjectNav } from '../../app/projectNav';
import { Drop } from '../Code/Drop';
import { Link } from 'react-router-dom';
import { DecisionBlock, loadDecision } from './DecisionPanel';
import { infoMode } from '../../app/screenKind';
import { breakpoint, useBoolPref, useMinWidth } from '../../app/prefs';

export function organizationOf(project) {
  // D-09 GitLab과 같게 공개된 이름을 그대로 쓴다. 기관만 쓰면 만든 사람이 지워진다.
  return project?.namespace?.name || orgLabel(project?.namespace?.name);
}

export function useProject(extra = async () => ({})) {
  const { id } = useParams();
  const data = useData(async () => {
    const [project, readme] = await Promise.all([gitlab.project(id), readmeOrEmpty(id)]);
    return { project: project.data, readme, ...(await extra(id)) };
  }, [id]);
  return { id, ...data };
}

/** Figma: Repo/Header. GitHub 저장소 머리처럼 기관 / 이름, 한 줄 설명, 행동 버튼을 한 줄에 둔다(D-04). */
function RepoHeader({ project, id, info }) {
  const [params, setParams] = useSearchParams();
  const [loginFor, setLoginFor] = useState(null);
  const reuseOpen = params.get('reuse') === '1';
  const setReuse = (open) => {
    const next = new URLSearchParams(params);
    if (open) next.set('reuse', '1');
    else next.delete('reuse');
    setParams(next, { replace: true });
  };
  const star = async () => {
    const s = await auth.session().catch(() => ({ authenticated: false }));
    if (!s.authenticated) setLoginFor(t.RepoHead_star);
    else window.open(project.web_url, '_blank', 'noopener');
  };
  const desc = cleanDescription(project.description);
  return (
    <>
      <div className="rb-repo-head" data-figma="repo-title">
        <div className="rb-repo-title">
          <h1 className="krds-text-heading-small rb-repo-name">
            <Avatar src={project.avatar_url || project.namespace?.avatar_url} name={project.name} />
            <span className="rb-repo-org">{organizationOf(project)} /</span>
            <span>{project.name}</span>
            <span className="rb-pill">{t.RepoHead_public}</span>
          </h1>
        </div>
        {info.mode !== 'none' ? (
          <div className="rb-repo-info-toggle" role="group" aria-label={t.About_title}>
            <button type="button" className="krds-btn small tertiary" aria-expanded={info.open} aria-controls="rb-info" onClick={() => info.setOpen(!info.open)}>
              {t.About_title}
            </button>
            {info.summary ? <span className="krds-text-body-xsmall rb-subtle" title={t.P04_10}>{info.summary}</span> : null}
          </div>
        ) : null}
        <div className="rb-repo-actions" data-figma="repo-actions" role="group" aria-label={t.RepoHead_actions}>
          <button type="button" className="krds-btn small tertiary" onClick={star}>
            {t.RepoHead_star}
            <span className="rb-subtle">{project.star_count ?? 0}</span>
          </button>
          <button type="button" className="krds-btn small tertiary" aria-expanded={reuseOpen} onClick={() => setReuse(!reuseOpen)}>
            {t.RepoHead_reuse}
          </button>
          <Drop label={t.Home_more} btnClass="krds-btn small text" button={<><Icon name="ellipsis_horizontal" /><span>{t.Home_more}</span></>}>
            {(close) => (
              <ul className="drop-list">
                <li><a className="item-link" href={project.web_url} target="_blank" rel="noreferrer" onClick={close}>{t.Home_openOrigin}<span className="sr-only"> {t.Footer_3}</span></a></li>
                <li><Link className="item-link" to={`/projects/${id}/feedback?type=bug`} onClick={close}>{t.Home_reportIssue}</Link></li>
              </ul>
            )}
          </Drop>
        </div>
      </div>
      <p className="krds-text-body-small rb-repo-desc" title={desc || undefined}>{desc || t.RepoHead_noDesc}</p>
      {project.last_activity_at ? (
        <p className="krds-text-body-xsmall rb-repo-meta">{t.fn.updated(new Date(project.last_activity_at).toLocaleDateString('ko-KR'))}</p>
      ) : null}
      {reuseOpen && <ReuseAction id={id} onClose={() => setReuse(false)} />}
      {loginFor && <LoginRequiredModal action={loginFor} onClose={() => setLoginFor(null)} />}
    </>
  );
}

export function ProjectFrame({ screenId, tab, tabLabel, crumbs, data, children, state, aside }) {
  // D-17 5장: 오른쪽 정보 영역(296)은 저장소 홈만 열림이 기본이다. 목록은 닫힘, 상세는 영역 자체가 없다.
  // 열고 닫은 선택은 이용자별로 기억한다. 닫혀 있어도 머리 줄에 점검 요약(예: 7/8 통과)을 남긴다.
  const { pathname } = useLocation();
  const mode = infoMode(pathname);
  const side = useMinWidth(breakpoint('--rb-bp-info-side'));
  const [open, setOpen] = useBoolPref('rb-info-open-' + mode, mode === 'home' && side);
  const decision = useData(() => (mode === 'none' ? Promise.resolve(null) : loadDecision(data.id)), [data.id, mode]);
  // 전역 왼쪽 메뉴를 이 프로젝트 메뉴로 바꾼다(공공 깃랩과 같은 구조). 화면을 떠나면 탐색 메뉴로 돌아간다.
  const project0 = data.data?.project;
  useEffect(() => {
    if (project0) setProjectNav({ id: data.id, name: project0.name, avatarUrl: project0.avatar_url || project0.namespace?.avatar_url });
    return () => setProjectNav(null);
  }, [data.id, project0?.name]);
  if (!data.data) {
    return (
      <Page id={screenId} title={t.ProjectFrame_2} state={data.state}>
        <Status {...data} />
      </Page>
    );
  }
  const { project } = data.data;
  // UX-007 10장: 제목에 서비스명 접미, 세로선 구분 기호를 쓰지 않는다.
  // 저장소 홈: "만든사람/프로젝트: 설명 한 줄", 저장소 안 화면: "화면 이름: 만든사람/프로젝트"
  const ownerProject = `${organizationOf(project)}/${project.name}`;
  const checks = decision.data?.check?.checks;
  const info = { mode, open, setOpen, summary: checks ? t.fn.checkSummary(checks.length, checks.filter((c) => c.pass).length) : '' };
  const showAside = mode !== 'none' && open;
  const deepLabel = crumbs?.length ? crumbs[crumbs.length - 1][0] : tabLabel;
  const docTitle = deepLabel ? `${deepLabel}: ${ownerProject}` : `${ownerProject}: ${cleanDescription(project.description) || ''}`.replace(/: $/, '');
  return (
    <Page id={screenId} title={docTitle} state={state} noFigma>
      <div className={'rb-repo-layout' + (showAside ? ' has-aside' : '')}>
        <div className="rb-repo-main" data-figma="main">
          <div className="rb-repo-top">
            <Breadcrumb home={false} items={[[organizationOf(project), `/search?q=${encodeURIComponent(organizationOf(project))}`], [project.name, (crumbs?.length || tabLabel) ? `/projects/${data.id}` : null], ...(crumbs || (tabLabel ? [[tabLabel]] : []))]} />
            <RepoHeader project={project} id={data.id} info={info} />
            <ProjectTabs id={data.id} active={tab} />
          </div>
          {children}
        </div>
        {showAside ? (
          <div className="rb-repo-aside" id="rb-info" data-figma="info-panel">
            {mode === 'home' ? aside : null}
            <DecisionBlock id={data.id} readme={data.data.readme} d={decision} />
          </div>
        ) : null}
      </div>
    </Page>
  );
}
