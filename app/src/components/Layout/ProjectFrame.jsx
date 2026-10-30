// 프로젝트 안 공통 머리: 브레드크럼, 이름, 기관, 탭. 프로젝트 자료를 한 번 불러와 하위 화면에 넘긴다.
import { t } from '../../copy/ko';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { createPortal } from 'react-dom';
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
import { DockInfo } from './DockInfo';
import { useDock } from '../../app/dock';
import { DOCK_ID } from './DockPanel';
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
  const dock = useDock();
  return (
    <>
      <div className="rb-repo-head" data-figma="repo-title">
        <h1 className="krds-text-heading-small rb-repo-name">
          <Avatar src={project.avatar_url || project.namespace?.avatar_url} name={project.name} />
          <span className="rb-repo-title-text">{project.name}</span>
          <span className="rb-pill">{t.RepoHead_public}</span>
        </h1>
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
      {reuseOpen && <ReuseAction id={id} onClose={() => setReuse(false)} />}
      {loginFor && <LoginRequiredModal action={loginFor} onClose={() => setLoginFor(null)} />}
    </>
  );
}

export function ProjectFrame({ screenId, tab, tabLabel, crumbs, data, children, state, stats, wide = false, hideCrumbs = false, title = false }) {
  // 프로젝트 알림: 머리글 경로(만든 사람 / 이름)와 탭 줄 이슈 수에 쓴다. 화면을 떠나면 지운다.
  const project0 = data.data?.project;
  const dock = useDock();
  useEffect(() => {
    if (project0) setProjectNav({ id: data.id, name: project0.name, owner: organizationOf(project0), issues: project0.open_issues_count, avatarUrl: project0.avatar_url || project0.namespace?.avatar_url });
    return () => setProjectNav(null);
  }, [data.id, project0?.name, project0?.open_issues_count]);
  if (!data.data) {
    return (
      <Page id={screenId} title={t.ProjectFrame_2} state={data.state}>
        <Status {...data} />
      </Page>
    );
  }
  const { project } = data.data;
  // UX-007 10장: 제목에 서비스명 접미, 세로선 구분 기호를 쓰지 않는다.
  const ownerProject = `${organizationOf(project)}/${project.name}`;
  const deepLabel = crumbs?.length ? crumbs[crumbs.length - 1][0] : tabLabel;
  const docTitle = deepLabel ? `${deepLabel}: ${ownerProject}` : `${ownerProject}: ${cleanDescription(project.description) || ''}`.replace(/: $/, '');
  return (
    <Page id={screenId} title={docTitle} state={state} noFigma>
      <div className={'rb-repo-main' + (wide ? ' is-wide' : '')} data-figma="main">
        <div className="rb-repo-top">
          {crumbs?.length && !hideCrumbs ? (
            <Breadcrumb home={false} items={[[organizationOf(project), `/search?q=${encodeURIComponent(organizationOf(project))}`], [project.name, `/projects/${data.id}`], ...crumbs]} />
          ) : null}
          {title ? <RepoHeader project={project} id={data.id} /> : null}
        </div>
        {children}
      </div>
      {dock.open && dock.slot ? createPortal(<DockInfo id={data.id} project={project} readme={data.data.readme} totals={data.data.totals} stats={stats} />, dock.slot) : null}
    </Page>
  );
}
