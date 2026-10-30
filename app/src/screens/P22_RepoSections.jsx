// P-22 공공 깃랩 프로젝트 메뉴 나머지. 활동, 위키, 파이프라인, 패키지, 라벨, 마일스톤, 멤버, 보드, 스니펫.
// 원래 GitLab에 있는 메뉴를 빼지 않는다(PRD 0장). 읽기는 공개 API로 실제 자료를 쓰고,
// 로그인해야 볼 수 있는 메뉴는 GitLab과 같게 로그인 안내를 보여 준다(가짜 자료를 만들지 않는다).
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { orgLabel } from '../components/Layout/orgLabel';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';

/** 메뉴별 설정: 자료 부르는 함수, 제목, 쉬운 설명, 빈 상태 문구, 줄 그리기. */
const SECTIONS = {
  activity: {
    load: (id) => gitlab.events(id),
    title: () => t.P22_activity,
    hint: () => t.P22_activityHint,
    empty: () => t.P22_activityNone,
    row: (e) => ({
      key: e.id,
      main: `${orgLabel(e.author?.name) || t.P22_someone} ${t.P22_action[e.action_name] || e.action_name}`,
      sub: e.push_data?.commit_title || e.target_title || '',
      meta: day(e.created_at),
    }),
  },
  wiki: {
    load: (id) => gitlab.wikis(id),
    title: () => t.P22_wiki,
    hint: () => t.P22_wikiHint,
    empty: () => t.P22_wikiNone,
    row: (w) => ({ key: w.slug, main: w.title, sub: '', meta: w.format || '' }),
  },
  pipelines: {
    load: (id) => gitlab.pipelines(id),
    title: () => t.P22_pipelines,
    hint: () => t.P22_pipelinesHint,
    empty: () => t.P22_pipelinesNone,
    row: (p) => ({ key: p.id, main: `#${p.id} ${p.ref || ''}`, sub: p.status || '', meta: day(p.created_at) }),
  },
  packages: {
    load: (id) => gitlab.packages(id),
    title: () => t.P22_packages,
    hint: () => t.P22_packagesHint,
    empty: () => t.P22_packagesNone,
    row: (p) => ({ key: p.id, main: p.name, sub: p.version || '', meta: p.package_type || '' }),
  },
  labels: {
    load: (id) => gitlab.labels(id),
    title: () => t.P22_labels,
    hint: () => t.P22_labelsHint,
    empty: () => t.P22_labelsNone,
    row: (l) => ({ key: l.id || l.name, main: l.name, sub: l.description || '', meta: '' }),
  },
  milestones: {
    load: (id) => gitlab.milestones(id),
    title: () => t.P22_milestones,
    hint: () => t.P22_milestonesHint,
    empty: () => t.P22_milestonesNone,
    row: (m) => ({ key: m.id, main: m.title, sub: m.description || '', meta: m.due_date || '' }),
  },
  members: {
    load: (id) => gitlab.members(id),
    title: () => t.P22_members,
    hint: () => t.P22_membersHint,
    empty: () => t.P22_membersNone,
    row: (m) => ({ key: m.id, main: orgLabel(m.name) || t.P22_someone, sub: '', meta: '' }),
  },
  boards: {
    load: (id) => gitlab.boards(id),
    title: () => t.P22_boards,
    hint: () => t.P22_boardsHint,
    empty: () => t.P22_boardsNone,
    row: (b) => ({ key: b.id, main: b.name, sub: '', meta: '' }),
  },
  snippets: {
    load: (id) => gitlab.snippets(id),
    title: () => t.P22_snippets,
    hint: () => t.P22_snippetsHint,
    empty: () => t.P22_snippetsNone,
    row: (s) => ({ key: s.id, main: s.title, sub: s.file_name || '', meta: day(s.created_at) }),
  },
};

export const SECTION_KEYS = Object.keys(SECTIONS);
const SECTION_SCREEN = { boards: 'R-13', labels: 'R-14', milestones: 'R-15', pipelines: 'R-18', packages: 'R-20', wiki: 'R-21', snippets: 'R-22', members: 'R-23', activity: 'R-24' };

export default function RepoSections({ section }) {
  const { id } = useParams();
  const conf = SECTIONS[section];
  const frame = useProject();
  const body = useData(async () => (await conf.load(id)).data, [id, section]);
  if (!frame.data) return <ProjectFrame screenId={SECTION_SCREEN[section]} data={frame} />;
  const list = Array.isArray(body.data) ? body.data : null;
  const needsLogin = body.state === 'Error' && body.status === 401;
  const state = list ? (list.length ? 'Ideal' : 'Empty') : body.state;
  return (
    <ProjectFrame screenId={SECTION_SCREEN[section]} tab="" tabLabel={conf.title()} data={frame} state={state}>
      <div className="rb-code-area">
        <div className="rb-detail-head">
          <h2 className="krds-text-heading-medium">
            {list ? t.fn.countLabel(conf.title(), t.fn.items(list.length)) : conf.title()}
          </h2>
          <p className="krds-text-body-medium rb-subtle">{conf.hint()}</p>
        </div>
        {needsLogin ? (
          <EmptyState title={t.P22_loginNeeded} action={<Link className="krds-btn medium primary" to={`/login?returnTo=${encodeURIComponent(`/projects/${id}/${section}`)}`}>{t.Header_login}</Link>} />
        ) : !list ? (
          <Status {...body} />
        ) : list.length ? (
          <ul className="rb-plain-list">
            {list.map((item) => {
              const r = conf.row(item);
              return (
                <li className="rb-plain-row" key={r.key}>
                  <span className="rb-plain-main">{r.main}</span>
                  {r.sub ? <span className="rb-plain-sub rb-ellipsis">{r.sub}</span> : null}
                  {r.meta ? <span className="rb-plain-meta rb-subtle">{r.meta}</span> : null}
                </li>
              );
            })}
          </ul>
        ) : (
          <EmptyState title={conf.empty()} />
        )}
      </div>
    </ProjectFrame>
  );
}
