// D-21 6장 프로젝트 홈 오른쪽 '프로젝트 정보' 열(공공 깃랩 02 그대로, 상시).
// 설명(4줄 더보기), 주제, 언어 막대, 개수 목록(아이콘 + 굵은 숫자 + 이름), README·라이선스·변경 로그, 생성 날짜.
// 덧붙임은 맨 아래 '사용 전 확인' 묶음 하나(라벨/값 세로 쌍 4개 + 더보기, UX/14 3-2).
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { useData } from '../../api/useData';
import { Icon } from '../Code/Icon';
import { cleanDescription } from './description';
import { decisionRows, loadDecision } from './DecisionPanel';
import { FoldText, InfoPair } from './FoldText';
import { cardValue, loadCards } from '../../api/cards';
import { newWindow } from './newWindow';

const LANG_KEYS = ['typescript', 'javascript', 'python', 'java', 'shell'];
const langVar = (name) => {
  const k = String(name).toLowerCase();
  return `var(--language-${LANG_KEYS.includes(k) ? k : 'other'})`;
};

function LangBar({ languages }) {
  const list = Object.entries(languages || {}).sort((a, b) => b[1] - a[1]);
  if (!list.length) return null;
  const label = list.map(([n, v]) => `${n} ${v.toFixed(1)}%`).join(', ');
  return (
    <div className="rb-lang" data-figma="language-bar">
      <p className="sr-only">{u.I_languages}: {label}</p>
      <div className="rb-lang-bar" aria-hidden="true" title={label}>
        {list.map(([n, v]) => <span key={n} style={{ width: `${v}%`, background: langVar(n) }} />)}
      </div>
      <ul className="rb-lang-list" aria-hidden="true">
        {list.slice(0, 4).map(([n, v]) => (
          <li key={n}><i style={{ background: langVar(n) }} />{n} <span className="rb-subtle">{v.toFixed(1)}%</span></li>
        ))}
      </ul>
    </div>
  );
}

const ymd = (iso) => { const d = new Date(iso); return u.I_ymd(d.getFullYear(), String(d.getMonth() + 1).padStart(2, '0'), String(d.getDate()).padStart(2, '0')); };
const fmt = (n) => (n == null ? null : Number(n).toLocaleString('ko-KR'));

export function ProjectInfo({ id, project, readme, totals, stats, languages, root }) {
  const d = useData(() => loadDecision(id), [id]);
  const p = `/projects/${id}`;
  const intro = cleanDescription(project.description);
  const topics = project.topics || [];
  const counts = [
    ['ext/commit', fmt(stats?.commits) + (stats?.more ? '+' : ''), u.I_commits, `${p}/changes`, !!stats?.commits],
    ['ext/branch', fmt(totals?.branches), u.I_branches, `${p}/branches`, totals?.branches != null],
    ['ext/tag', fmt(totals?.tags), u.I_tags, `${p}/tags`, totals?.tags != null],
    ['ext/rocket-launch', fmt(totals?.releases), u.I_releases, `${p}/releases`, totals?.releases != null],
  ].filter((c) => c[4]);
  const file = (re) => (root || []).find((f) => f.type === 'blob' && re.test(f.name));
  const lic = file(/^(LICENSE|LICENCE|COPYING)(\.|$)/i);
  const log = file(/^CHANGELOG/i);
  const docs = [
    readme ? [u.I_readme, '#readme', true, 'ext/file-text'] : null,
    lic || project.license ? [project.license?.name || u.I_license, lic ? `${p}/code/${lic.path}` : project.license_url, !!lic, 'ext/scale'] : null,
    log ? [u.I_changelog, `${p}/code/${log.path}`, true, 'ext/file-text'] : null,
  ].filter(Boolean);
  const rows = d.data ? decisionRows(id, readme, d.data).slice(0, 4) : [];
  const cs = useData(loadCards, []);
  const card0 = cs.data ? cs.data.get(id) : null;
  // 네 칸이 모두 비면 카드 대신 사용 전 확인(빈 칸만 늘어놓지 않는다)
  const card = card0 && [card0.oneLine, card0.form, card0.license, card0.refs].some((f) => cardValue(f) != null || f?.label) ? card0 : null;
  const field = card ? [].concat(cardValue(card.fields) ?? [])[0] : null;
  return (
    <aside className="rb-repo-info" aria-labelledby="rb-info-title" data-figma="project-info">
      <h2 id="rb-info-title" className="krds-text-body-small-bold">{u.G_projectInfo}</h2>
      {intro ? <FoldText lines={4} className="rb-info-intro">{intro}</FoldText> : null}
      {topics.length || field ? (
        <div className="krds-tag-wrap small rb-info-topics">
          {topics.map((x) => <span key={x} className="krds-btn-tag">{x}</span>)}
          {/* 덧붙임(UX/14 2): 주제 옆 분야 하나 */}
          {field ? <Link className="krds-btn-tag" to={`/?field=${encodeURIComponent(field)}`} title={u.C_field} data-figma="extra-field">{u.C_field}: {field}</Link> : null}
        </div>
      ) : null}
      <LangBar languages={languages} />
      {counts.length ? (
        <ul className="rb-info-list rb-info-sep">
          {counts.map(([icon, n, label, to]) => (
            <li key={label}><Link to={to}><Icon name={icon} /><b>{n}</b> {label}</Link></li>
          ))}
        </ul>
      ) : null}
      {docs.length ? (
        <ul className="rb-info-list rb-info-sep">
          {docs.map(([label, to, inside, icon]) => (
            <li key={label}>
              {inside && to.startsWith('#') ? <a href={to}><Icon name={icon} />{label}</a> : inside ? <Link to={to}><Icon name={icon} />{label}</Link> : <a href={to}><Icon name={icon} />{label}</a>}
            </li>
          ))}
        </ul>
      ) : null}
      {project.created_at ? (
        <div className="rb-info-sep">
          <InfoPair label={u.I_created}>{ymd(project.created_at)}</InfoPair>
        </div>
      ) : null}
      {/* 덧붙임 자리(UX/14 1, 5, 6, 8): 소개 카드가 있으면 카드 4줄, 없으면 사용 전 확인 4줄. 한 묶음, 4줄 + 더보기 */}
      {card ? <IntroCard id={id} card={card} /> : (
        <section className="rb-info-sep rb-info-extra" data-figma="extra-intro-card" aria-labelledby="rb-info-extra">
          <h3 id="rb-info-extra" className="krds-text-body-small-bold">{u.I_extra}</h3>
          {d.data ? (
            <dl className="rb-dock-list">
              {rows.map(([label, value]) => (
                <InfoPair key={label} label={label}><FoldText lines={1}>{value}</FoldText></InfoPair>
              ))}
            </dl>
          ) : <p className="krds-text-body-xsmall rb-subtle" role="status">{d.state === 'Error' ? d.error : t.P10_1}</p>}
          <p className="rb-dock-more"><Link className="krds-link" to={`${p}/use`}>{u.I_more}</Link></p>
        </section>
      )}
    </aside>
  );
}

/** UX/14 1 소개 카드: 하는 일, 실행 형태 + 바로 열기, 이용 조건, 기준 날짜. 값이 없으면 '미기재', AI가 정리한 값은 'AI 정리' 표시, 근거 줄 링크 */
function IntroCard({ id, card }) {
  const p = `/projects/${id}`;
  const ai = (f) => (f?.s === 'ai' && cardValue(f) != null ? <span className="rb-card-ai">{u.C_ai}</span> : null);
  const text = (f) => { const v = cardValue(f); return v == null ? u.C_none : Array.isArray(v) ? v.join(', ') : String(v); };
  const run = cardValue(card.run);
  const lines = card.readme?.e?.lines;
  const rows = [
    [u.C_does, text(card.oneLine), ai(card.oneLine)],
    [u.C_form, card.form?.label || text(card.form), ai(card.form), typeof run === 'string' && /^https?:/.test(run) ? run : null],
    [u.C_license, text(card.license), ai(card.license)],
    [u.C_refs, text(card.refs), ai(card.refs)],
  ];
  return (
    <section className="rb-info-sep rb-info-extra" data-figma="extra-intro-card" aria-labelledby="rb-info-card">
      <h3 id="rb-info-card" className="krds-text-body-small-bold">{u.C_title}</h3>
      <dl className="rb-dock-list">
        {rows.map(([label, value, mark, open]) => (
          <InfoPair key={label} label={<>{label}{mark}</>}>
            <FoldText lines={1}>{value}</FoldText>
            {open ? <a className="krds-link" href={open} {...newWindow(u.C_open)}>{u.C_open}</a> : null}
          </InfoPair>
        ))}
      </dl>
      <p className="rb-dock-more">
        <Link className="krds-link" to={`${p}/use`}>{u.I_more}</Link>
        {Array.isArray(lines) && lines.length === 2 ? <> · <Link className="rb-plain-link rb-subtle" to={`${p}/code/README.md#L${lines[0]}-${lines[1]}`}>{u.C_evidence(lines[0], lines[1])}</Link></> : null}
      </p>
    </section>
  );
}
