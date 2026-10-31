// 프로젝트 안 공통 머리: 브레드크럼, 이름, 기관, 탭. 프로젝트 자료를 한 번 불러와 하위 화면에 넘긴다.
import { iconBtnClass } from '../Action/IconButton';
import { newWindow } from './newWindow';
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
import { Status } from '../Feedback/Status';
import { useEffect } from 'react';
import { setProjectNav } from '../../app/projectNav';
import { Drop } from '../Code/Drop';
import { Link } from 'react-router-dom';
import { ProjectInfo } from './ProjectInfo';
import { u } from '../../copy/ui';

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
function RepoHeader({ project, id }) {
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
  return (
    <>
      <div className="rb-repo-head" data-figma="page-head">
        <h1 className="rb-repo-name">
          {/* 공공 깃랩: 프로젝트 그림이 없으면 만든 곳 그림이 아니라 프로젝트 이름 첫 글자 타일(kordoc → K) */}
          <Avatar className="is-48" src={project.avatar_url} name={project.name} seed={project.id} />
          <span className="rb-repo-title-text">{project.name}</span>
          <Icon name="globe" label={u.X_public} />
        </h1>
        <div className="rb-repo-actions" data-figma="repo-actions" role="group" aria-label={t.RepoHead_actions}>
          <span className="rb-split">
            <button type="button" className="rb-split-main" title={u.Tip_star} onClick={star}>
              <Icon name="ext/star" />
              <span>{u.I_star}</span>
            </button>
            <a className="rb-split-count" href={`${project.web_url}/-/starrers`} {...newWindow(`${u.I_starrers} ${project.star_count ?? 0}`)}>{project.star_count ?? 0}</a>
          </span>
          {/* 덧붙임(UX/14 6): 별표 옆 '사용 기록' 단추 하나 */}
          <button type="button" className="krds-btn small tertiary" data-figma="extra-reuse" title={u.Tip_usage} aria-expanded={reuseOpen} onClick={() => setReuse(!reuseOpen)}>
            {t.RepoHead_reuse}
          </button>
          <Drop label={u.I_projectMore} btnClass={iconBtnClass('small')} toggle={false} button={<Icon name="ellipsis_vertical" />}>
            {(close) => (
              <ul className="drop-list">
                <li><a className="item-link" href={project.web_url} {...newWindow(t.Home_openOrigin)} onClick={close}>{t.Home_openOrigin}</a></li>
                <li><a className="item-link" href={`${project.web_url}/-/forks`} {...newWindow(u.Fork_label)} onClick={close}>{u.Fork_label} {project.forks_count ?? 0}</a></li>
                <li><Link className="item-link" to={`/projects/${id}/feedback?type=bug`} onClick={close}>{t.Home_reportIssue}</Link></li>
              </ul>
            )}
          </Drop>
        </div>
      </div>
      {reuseOpen && <ReuseAction id={id} onClose={() => setReuse(false)} />}
      {loginFor && <LoginRequiredModal action={loginFor} onClose={() => setLoginFor(null)} />}
    </>
  );
}

// 탭 제목이 너무 길어지지 않게 설명은 80자에서 말줄임
const clip = (s) => (s.length > 80 ? `${s.slice(0, 79)}…` : s);

export function ProjectFrame({ screenId, tab, tabLabel, crumbs, data, children, state, stats, wide = false, hideCrumbs = false, title = false, info = false }) {
  // 프로젝트 알림: 왼쪽 바(프로젝트 메뉴, 작업 항목 수)에 쓴다. 화면을 떠나면 지운다.
  // 목록에서 눌러 들어오면 그 행의 프로젝트 자료(state.project)로 경로와 제목을 먼저 그린다(빈 제목 670ms 방지, audit_v3 05-17)
  const seed = useLocation().state?.project;
  const seeded = !data.data && seed && String(seed.id) === String(data.id);
  const project0 = data.data?.project || (seeded ? seed : null);
  useEffect(() => {
    if (project0) setProjectNav({ id: data.id, name: project0.name, owner: organizationOf(project0), issues: project0.open_issues_count, avatarUrl: project0.avatar_url, seed: data.id, webUrl: project0.web_url });
    return () => setProjectNav(null);
  }, [data.id, project0?.name, project0?.open_issues_count]);
  if (!data.data && !seeded) {
    return (
      <Page id={screenId} title={t.ProjectFrame_2} state={data.state}>
        <Status {...data} />
      </Page>
    );
  }
  const project = project0;
  // UX-007 10장: 제목에 서비스명 접미, 세로선 구분 기호를 쓰지 않는다.
  const ownerProject = `${organizationOf(project)}/${project.name}`;
  const deepLabel = crumbs?.length ? crumbs[crumbs.length - 1][0] : tabLabel;
  const docTitle = deepLabel ? `${deepLabel}: ${ownerProject}` : `${ownerProject}: ${clip(cleanDescription(project.description) || '')}`.replace(/: $/, '');
  // D-21: 판 안 맨 위 경로 '만든 곳 / 이름 / 화면'(공공 깃랩 그대로)
  const path = [
    [organizationOf(project), `/search?q=${encodeURIComponent(organizationOf(project) || '')}`],
    [project.name, crumbs?.length || tabLabel ? `/projects/${data.id}` : null],
    ...(crumbs?.length && !hideCrumbs ? crumbs : tabLabel ? [[tabLabel, null]] : []),
  ];
  return (
    <Page id={screenId} title={docTitle} state={state} noFigma>
      <Breadcrumb home={false} items={path} />
      <div className={'rb-repo-main' + (wide ? ' is-wide' : '') + (info ? ' has-info' : '')} data-figma="main">
        {/* 공공 깃랩 02, 52: 제목 줄은 본문과 정보 열 위 전체 폭(모바일에서는 정보 열이 제목 바로 아래로) */}
        {title ? <div className="rb-repo-title-row"><RepoHeader project={project} id={data.id} /></div> : null}
        <div className="rb-repo-body">
          {seeded ? <Status {...data} /> : children}
        </div>
        {info && !seeded ? (
            <ProjectInfo id={data.id} project={project} readme={data.data.readme} totals={data.data.totals} stats={stats} languages={data.data.languages} root={data.data.root} />
        ) : null}
      </div>
    </Page>
  );
}
