// R-25 리포지토리 분석 = 공공 깃랩 /-/graphs/<브랜치>/charts(캡처 30): 사용된 프로그래밍 언어 막대, 코드 커버리지 통계, 커밋 통계.
// 공개 읽기 자료만 쓴다(언어 비율 /languages, 커밋 목록 /repository/commits). 커버리지는 공개 자료가 없어 실제처럼 '데이터 없음'. 지어낸 값 없음.
import { u } from '../copy/ui';
import { request } from '../api/client';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { Icon } from '../components/Code/Icon';

const DAYS = ['월', '화', '수', '목', '금', '토', '일'];

function Bars({ rows, unit, axis }) {
  const max = Math.max(1, ...rows.map((r) => r[1]));
  return (
    <figure className="rb-ra-chart">
      <ul className="rb-ra-bars" aria-label={axis}>
        {rows.map(([k, v]) => (
          <li key={k} className="rb-ra-bar">
            <span className="rb-ra-fill" style={{ height: `${(v / max) * 100}%` }} />
            <span className="rb-ra-key">{k}</span>
            <span className="sr-only">{`${k} ${v}${unit}`}</span>
          </li>
        ))}
      </ul>
      <figcaption className="rb-ra-axis">{axis}</figcaption>
    </figure>
  );
}

export default function RepoAnalytics() {
  const frame = useProject(async (id) => {
    const [langs, commits] = await Promise.all([
      request(`/api/gitlab/projects/${encodeURIComponent(id)}/languages`).catch(() => ({ data: {} })),
      request(`/api/gitlab/projects/${encodeURIComponent(id)}/repository/commits?per_page=100`).catch(() => ({ data: [] })),
    ]);
    return { languages: langs.data || {}, commits: commits.data || [] };
  });
  const d = frame.data;
  const langs = Object.entries(d?.languages || {}).sort((a, b) => b[1] - a[1]).slice(0, 5).map(([k, v]) => [k, Math.round(v * 10) / 10]);
  const byDay = DAYS.map((name, i) => [name, (d?.commits || []).filter((c) => ((new Date(c.committed_date || c.created_at).getDay() + 6) % 7) === i).length]);
  const n = d?.commits?.length || 0;
  return (
    <ProjectFrame screenId="R-25" tab="" tabLabel={u.G_repoAnalytics} data={frame} state={langs.length ? 'Ideal' : 'Empty'}>
      <h1 className="rb-frame-title" data-figma="page-head">{u.G_repoAnalytics}</h1>
      <section className="rb-ra-sec">
        <h2 data-figma="section-title">{u.RA_langTitle}</h2>
        <p className="rb-subtle">{u.RA_langHint}</p>
        {langs.length ? <Bars rows={langs} unit="%" axis={u.RA_langAxis} /> : <p>{u.RA_none}</p>}
      </section>
      <section className="rb-ra-sec">
        <h2>{u.RA_covTitle}</h2>
        <div className="krds-alert-box rb-ra-note" role="status"><Icon name="ext/info" /><div><p className="rb-ra-note-t">{u.RA_covNone}</p><p>{u.RA_covBody}</p></div></div>
      </section>
      <section className="rb-ra-sec">
        <h2>{u.RA_commitTitle}</h2>
        <p className="rb-subtle">{u.RA_commitBasis(n)}</p>
        {n ? <Bars rows={byDay} unit={u.RA_commitUnit} axis={u.RA_dayAxis} /> : <p>{u.RA_none}</p>}
      </section>
    </ProjectFrame>
  );
}
