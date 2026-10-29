// 프로젝트 안 공통 머리: 브레드크럼, 이름, 기관, 탭. 프로젝트 자료를 한 번 불러와 하위 화면에 넘긴다.
import { t } from '../../copy/ko';
import { useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { auth, gitlab, readmeOrEmpty } from '../../api/client';
import { cleanDescription } from './StructuredList';
import { LoginRequiredModal } from '../Feedback/LoginRequiredModal';
import { Icon } from '../Code/Icon';
import { ReuseAction } from '../../screens/parts/ReuseAction';
import { orgLabel } from './orgLabel';
import './repo.css';
import { useData } from '../../api/useData';
import { Page } from './Page';
import { Breadcrumb } from '../Navigation/Breadcrumb';
import { ProjectTabs } from '../Navigation/ProjectTabs';
import { Status } from '../Feedback/Status';

export function organizationOf(project) {
  return orgLabel(project?.namespace?.name);
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
  const desc = cleanDescription(project.description);
  return (
    <>
      <div className="rb-repo-head">
        <div className="rb-repo-title">
          <h1 className="krds-text-heading-large rb-repo-name">
            <span className="rb-repo-org">{organizationOf(project)} /</span>
            <span>{project.name}</span>
            <span className="krds-badge small bg-light-gray">{t.RepoHead_public}</span>
          </h1>
          <p className="krds-text-body-medium rb-repo-desc" title={desc || undefined}>{desc || t.RepoHead_noDesc}</p>
          {project.last_activity_at ? (
            <p className="krds-text-body-small rb-repo-meta">{t.fn.updated(new Date(project.last_activity_at).toLocaleDateString('ko-KR'))}</p>
          ) : null}
        </div>
        <div className="rb-repo-actions" role="group" aria-label={t.RepoHead_actions}>
          <button type="button" className="krds-btn medium tertiary" onClick={star}>
            <Icon name="bookmarks" />
            {t.RepoHead_star}
            <span className="rb-subtle">{project.star_count ?? 0}</span>
          </button>
          <button type="button" className="krds-btn medium secondary" aria-expanded={reuseOpen} onClick={() => setReuse(!reuseOpen)}>
            {t.RepoHead_reuse}
          </button>
        </div>
      </div>
      {reuseOpen && <ReuseAction id={id} onClose={() => setReuse(false)} />}
      {loginFor && <LoginRequiredModal action={loginFor} onClose={() => setLoginFor(null)} />}
    </>
  );
}

export function ProjectFrame({ screenId, tab, tabLabel, data, children, state }) {
  if (!data.data) {
    return (
      <Page id={screenId} title={t.ProjectFrame_2} state={data.state}>
        <Status {...data} />
      </Page>
    );
  }
  const { project } = data.data;
  return (
    <Page id={screenId} title={`${project.name} ${tabLabel || ''}`} state={state}>
      <div className="rb-repo-top">
        <Breadcrumb items={[[t.Header_2, '/search'], [project.name, tab ? `/projects/${data.id}` : null], ...(tab ? [[tabLabel]] : [])]} />
        <RepoHeader project={project} id={data.id} />
        <ProjectTabs id={data.id} active={tab} />
      </div>
      {children}
    </Page>
  );
}
