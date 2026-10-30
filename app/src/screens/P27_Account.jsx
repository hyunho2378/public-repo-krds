// G-06 알림, G-11 사용자 설정, R-26 프로젝트 설정, R-11 저장소 그래프, A-03 협업과 팀원 모집.
// 공공 깃랩과 GitHub의 같은 화면 배치를 따른다. 로그인해야 보이는 것은 로그인 안내를 보여 준다.
import { useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab, auth, STATIC_MODE as isStatic } from '../api/client';
import { useData } from '../api/useData';
import { Page } from '../components/Layout/Page';
import { EmptyState, Status } from '../components/Feedback/Status';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { ScreenModeOptions, useScreenMode } from '../components/Identity/ScreenMode';
import { day } from './parts/repoCommon';
import '../components/Write/write.css';
import '../components/Code/code.css';

/** 로그인해야 쓰는 화면에서 보여 주는 안내. 가짜 자료를 만들지 않는다. */
function NeedLogin({ title, path }) {
  return (
    <EmptyState
      title={isStatic ? t.Write_cannotStatic : t.fn.needLogin(title)}
      action={!isStatic ? <Link className="krds-btn medium primary" to={`/login?returnTo=${encodeURIComponent(path)}`}>{t.Header_login}</Link> : null}
    />
  );
}

/** G-06 알림. 로그인 전에는 받은 알림이 없다. */
export function Notifications() {
  const me = useData(async () => (await auth.session()), []);
  const signedIn = !!me.data?.user;
  return (
    <Page id="G-07" title={t.TabBar_alerts} state={signedIn ? 'Empty' : 'Empty'}>
      <div className="rb-write">
        <div className="rb-write-head">
          <h1 className="krds-text-heading-large" data-figma="section-title">{t.TabBar_alerts}</h1>
          <p className="krds-text-body-medium rb-subtle">{t.Alerts_hint}</p>
        </div>
        {!signedIn ? <NeedLogin title={t.TabBar_alerts} path="/notifications" /> : <EmptyState title={t.Alerts_none} />}
      </div>
    </Page>
  );
}

/** G-11 사용자 설정. 로그인 없이도 바꿀 수 있는 화면 설정은 그대로 둔다. */
export function Settings() {
  const [mode, setMode] = useScreenMode();
  const me = useData(async () => (await auth.session()), []);
  const signedIn = !!me.data?.user;
  return (
    <Page id="G-11" title={t.Settings_title} state="Ideal">
      <div className="rb-write">
        <div className="rb-write-head">
          <h1 className="krds-text-heading-large">{t.Settings_title}</h1>
        </div>
        <section aria-label={t.Header_mode}>
          <ScreenModeOptions name="settings-mode" mode={mode} setMode={setMode} />
        </section>
        <section aria-labelledby="set-account">
          <h2 id="set-account" className="krds-text-heading-small">{t.Settings_account}</h2>
          {signedIn ? (
            <p className="krds-text-body-medium">{t.fn.signedInAs(me.data.user.name)}</p>
          ) : (
            <NeedLogin title={t.Settings_account} path="/settings" />
          )}
        </section>
      </div>
    </Page>
  );
}

/** R-26 프로젝트 설정. 읽기로 확인할 수 있는 값만 보여 주고, 바꾸려면 로그인과 권한이 필요하다고 알린다. */
export function ProjectSettings() {
  const { id } = useParams();
  const frame = useProject();
  if (!frame.data) return <ProjectFrame screenId="R-26" data={frame} />;
  const p = frame.data.project;
  const rows = [
    [t.PSet_name, p.name],
    [t.PSet_path, p.path_with_namespace],
    [t.PSet_visibility, p.visibility === 'public' ? t.PSet_public : p.visibility],
    [t.PSet_default, p.default_branch],
    [t.PSet_created, day(p.created_at)],
    [t.PSet_updated, day(p.last_activity_at)],
  ];
  return (
    <ProjectFrame screenId="R-26" tab="" tabLabel={t.PSet_title} data={frame} state="Ideal">
      <div className="rb-write">
        <div className="rb-write-head">
          <h2 className="krds-text-heading-medium">{t.PSet_title}</h2>
          <p className="krds-text-body-medium rb-subtle">{t.PSet_hint}</p>
        </div>
        <ul className="rb-plain-list">
          {rows.map(([k, v]) => (
            <li className="rb-plain-row" key={k}>
              <span className="rb-plain-main">{k}</span>
              <span className="rb-plain-sub rb-ellipsis">{v || t.PSet_none}</span>
            </li>
          ))}
        </ul>
        <NeedLogin title={t.PSet_title} path={`/projects/${id}/settings`} />
      </div>
    </ProjectFrame>
  );
}

/** R-11 저장소 그래프. 커밋을 날짜별로 세어 활동 흐름을 보여 준다(GitHub Insights 그래프 자리). */
export function RepoGraph() {
  const { id } = useParams();
  const frame = useProject();
  const [weeks] = useState(26);
  const body = useData(async () => (await gitlab.commits(id, {})).data, [id]);
  const series = useMemo(() => {
    const list = body.data || [];
    const buckets = new Map();
    for (const c of list) {
      const d = new Date(c.created_at);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      buckets.set(key, (buckets.get(key) || 0) + 1);
    }
    return [...buckets.entries()].sort((a, b) => a[0].localeCompare(b[0]));
  }, [body.data]);
  if (!frame.data) return <ProjectFrame screenId="R-25" data={frame} />;
  const max = Math.max(1, ...series.map(([, n]) => n));
  return (
    <ProjectFrame screenId="R-25" tab="" tabLabel={t.Graph_title} data={frame} state={series.length ? 'Ideal' : body.state}>
      <div className="rb-write">
        <div className="rb-write-head">
          <h2 className="krds-text-heading-medium">{t.Graph_title}</h2>
          <p className="krds-text-body-medium rb-subtle">{t.fn.graphHint(weeks)}</p>
        </div>
        {!series.length ? <Status {...body} /> : (
          <ul className="rb-bars">
            {series.map(([month, n]) => (
              <li key={month}>
                <span className="rb-bar-label">{month}</span>
                <span className="rb-bar"><span className="rb-bar-fill" style={{ inlineSize: `${Math.round((n / max) * 100)}%` }} /></span>
                <span className="rb-bar-count rb-subtle">{t.fn.times(n)}</span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </ProjectFrame>
  );
}

/** A-03 협업과 팀원 모집. 비슷한 도구를 만드는 사람을 잇는다(F-05). */
export function Collaborate() {
  return (
    <Page id="A-09" title={t.Collab_title} state="Empty">
      <div className="rb-write">
        <div className="rb-write-head">
          <h1 className="krds-text-heading-large">{t.Collab_title}</h1>
          <p className="krds-text-body-medium rb-subtle">{t.Collab_hint}</p>
        </div>
        <EmptyState
          title={t.Collab_none}
          action={<Link className="krds-btn medium primary" to="/requests">{t.Collab_toRequests}</Link>}
        />
        <p className="krds-text-body-small rb-subtle">{t.Collab_notice}</p>
      </div>
    </Page>
  );
}
