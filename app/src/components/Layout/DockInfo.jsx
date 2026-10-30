// D-18 4장: 도킹 패널의 정보 요약. 소개 한 줄(원문), 개수, 사용 전 확인 4줄과 이용 조건. 소개와 사용 방법 탭의 설명을 다시 쓰지 않는다.
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';
import { useData } from '../../api/useData';
import { cleanDescription } from './description';
import { decisionRows, loadDecision } from './DecisionPanel';

export function DockInfo({ id, project, readme, totals, stats }) {
  const d = useData(() => loadDecision(id), [id]);
  const p = `/projects/${id}`;
  const intro = cleanDescription(project.description);
  const counts = [
    stats?.commits != null ? [t.fn.nCommits(stats.commits, stats.more), `${p}/changes`] : null,
    totals?.branches != null ? [t.fn.nBranches(totals.branches), `${p}/branches`] : null,
    totals?.tags != null ? [t.fn.nTags(totals.tags), `${p}/branches`] : null,
    totals?.releases != null ? [t.fn.nReleases(totals.releases), `${p}/releases`] : null,
  ].filter(Boolean);
  const rows = d.data ? decisionRows(id, readme, d.data).slice(0, 5) : [];
  return (
    <div className="rb-dock-info">
      {intro ? <p className="rb-dock-intro">{intro}</p> : null}
      {counts.length ? (
        <ul className="rb-dock-counts">
          {counts.map(([label, to]) => <li key={to + label}><Link className="krds-link" to={to}>{label}</Link></li>)}
        </ul>
      ) : null}
      {d.data ? (
        <dl className="rb-dock-list">
          {rows.map(([label, value, [action, to]]) => (
            <div className="rb-dock-row" key={label}>
              <dt>{label}</dt>
              <dd className="rb-dock-value">{value}</dd>
              <dd className="rb-dock-link"><Link className="krds-link" to={to || '?reuse=1'}>{action}</Link></dd>
            </div>
          ))}
        </dl>
      ) : <p className="krds-text-body-xsmall rb-subtle" role="status">{d.state === 'Error' ? d.error : t.P10_1}</p>}
    </div>
  );
}
