// 일별 커밋 수 선 그래프(공공 깃랩 기여자 분석, 캡처 23). 받은 커밋 날짜만 센다. 값을 만들지 않는다.
import { au } from '../../copy/work';

export function dailyCounts(commits) {
  const by = new Map();
  for (const c of commits) {
    const d = (c.committed_date || c.created_at || '').slice(0, 10);
    if (d) by.set(d, (by.get(d) || 0) + 1);
  }
  const days = [...by.keys()].sort();
  if (!days.length) return [];
  const out = [];
  const end = new Date(days[days.length - 1]);
  for (let t = new Date(days[0]); t <= end; t = new Date(t.getTime() + 86400000)) {
    const k = t.toISOString().slice(0, 10);
    out.push([k, by.get(k) || 0]);
  }
  return out;
}

export function CommitChart({ series, label }) {
  if (!series.length) return <p className="rb-subtle">{au.chartNone}</p>;
  const max = Math.max(...series.map((s) => s[1]), 1);
  const total = series.reduce((a, s) => a + s[1], 0);
  const W = 1000;
  const H = 200;
  const x = (i) => (series.length === 1 ? W / 2 : (i / (series.length - 1)) * W);
  const y = (v) => H - (v / max) * (H - 8) - 4;
  const line = series.map((s, i) => `${i ? 'L' : 'M'}${x(i).toFixed(1)} ${y(s[1]).toFixed(1)}`).join(' ');
  return (
    <figure className="gl-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label={`${label} ${au.commitsChart}`}>
        {[0, 0.5, 1].map((g) => <line key={g} x1="0" x2={W} y1={y(max * g)} y2={y(max * g)} className="gl-chart-grid" />)}
        <path d={line} className="gl-chart-line" />
      </svg>
      <figcaption>
        <span className="gl-chart-key" aria-hidden="true" /> {au.commitsChart} <span className="rb-subtle">{au.avg}: {(total / series.length).toFixed(2)} · {au.max}: {max}</span>
        <span className="rb-subtle"> · {series[0][0]} ~ {series[series.length - 1][0]}</span>
      </figcaption>
    </figure>
  );
}
