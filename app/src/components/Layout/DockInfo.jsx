// D-18 4장 + UX-007 14장: 도킹 패널의 정보 요약. 소개(4줄까지), 개수, 사용 전 확인(라벨 위/값 아래 쌍, 값은 3줄까지 접기).
// 행마다 있던 링크는 두지 않고 맨 아래 한 줄('사용 방법 전체 보기')로 모은다. 공개 준비 점검의 점검 항목은 펼침 안에서 보인다.
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { useData } from '../../api/useData';
import { cleanDescription } from './description';
import { decisionRows, loadDecision } from './DecisionPanel';
import { FoldText, InfoPair } from './FoldText';
import { CHECK_LABEL } from '../../screens/parts/checkLabels';

export function DockInfo({ id, project, readme, totals, stats }) {
  const d = useData(() => loadDecision(id), [id]);
  const p = `/projects/${id}`;
  const intro = cleanDescription(project.description);
  const counts = [
    stats?.commits != null ? [t.fn.nCommits(stats.commits, stats.more), `${p}/changes`] : null,
    totals?.branches != null ? [t.fn.nBranches(totals.branches), `${p}/branches`] : null,
    totals?.tags != null ? [t.fn.nTags(totals.tags), `${p}/tags`] : null,
    totals?.releases != null ? [t.fn.nReleases(totals.releases), `${p}/releases`] : null,
  ].filter(Boolean);
  const rows = d.data ? decisionRows(id, readme, d.data).slice(0, 5) : [];
  return (
    <div className="rb-dock-info">
      {intro ? <FoldText lines={4} className="rb-dock-intro">{intro}</FoldText> : null}
      {counts.length ? (
        <ul className="rb-dock-counts">
          {counts.map(([label, to]) => <li key={to + label}><Link className="krds-link" to={to}>{label}</Link></li>)}
        </ul>
      ) : null}
      {d.data ? (
        <>
          <dl className="rb-dock-list">
            {rows.map(([label, value]) => (
              <InfoPair key={label} label={label}>
                <FoldText
                  extra={label === t.P04_10 ? (
                    <ul className="rb-fold-checks">
                      {d.data.check.checks.map((c) => <li key={c.id}>{CHECK_LABEL[c.id] || c.id} {c.pass ? t.P09_26 : t.P09_27}</li>)}
                    </ul>
                  ) : null}
                >{value}</FoldText>
              </InfoPair>
            ))}
          </dl>
          <p className="rb-dock-more"><Link className="krds-link" to={`${p}/use`}>{u.Dock_allUsage}</Link></p>
        </>
      ) : <p className="krds-text-body-xsmall rb-subtle" role="status">{d.state === 'Error' ? d.error : t.P10_1}</p>}
    </div>
  );
}
