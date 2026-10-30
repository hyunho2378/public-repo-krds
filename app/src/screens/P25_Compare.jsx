// R-07 리비전 비교. 공공 깃랩 "비교" 화면 구성을 그대로 옮긴다.
// 두 지점을 고르고 변경 목록과 파일별 차이를 본다. 결과에서 바로 변경 제안으로 넘어간다.
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { DiffView } from '../components/Code/DiffView';
import { day } from './parts/repoCommon';
import '../components/Write/write.css';
import '../components/Code/code.css';

function Picker({ label, id, list, value, onChange }) {
  return (
    <div className="rb-compare-field">
      <span className="krds-text-body-small-bold" id={`${id}-label`}>{label}</span>
      <ul className="rb-branch-pick" aria-labelledby={`${id}-label`}>
        {list.map((name) => (
          <li key={name}>
            <button type="button" className={'krds-btn xsmall ' + (value === name ? 'primary' : 'tertiary')} onClick={() => onChange(name)}>{name}</button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default function Compare() {
  const { id } = useParams();
  const [search, setSearch] = useSearchParams();
  const frame = useProject();
  const [from, setFrom] = useState(search.get('from') || '');
  const [to, setTo] = useState(search.get('to') || '');

  const refs = useData(async () => {
    const [branches, tags] = await Promise.all([
      gitlab.branches(id).then((r) => r.data).catch(() => []),
      gitlab.tags(id).then((r) => r.data).catch(() => []),
    ]);
    return [...(branches || []).map((b) => b.name), ...(tags || []).map((x) => x.name)];
  }, [id]);

  useEffect(() => {
    const def = frame.data?.project.default_branch || 'main';
    setFrom((v) => v || def);
    setTo((v) => v || (refs.data || []).find((n) => n !== def) || def);
  }, [frame.data, refs.data]);

  // 주소에 고른 지점을 남긴다(공유와 뒤로 가기).
  useEffect(() => {
    if (!from || !to) return;
    const next = new URLSearchParams(search);
    next.set('from', from);
    next.set('to', to);
    setSearch(next, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [from, to]);

  const result = useData(
    async () => (from && to && from !== to ? (await gitlab.compare(id, from, to)).data : null),
    [id, from, to],
  );

  if (!frame.data) return <ProjectFrame screenId="R-06" data={frame} />;
  const list = refs.data || [];
  const diffs = result.data?.diffs || [];
  const commits = result.data?.commits || [];
  const same = from === to;

  return (
    <ProjectFrame screenId="R-06" tab="" tabLabel={t.Compare_title} wide data={frame} state={same ? 'Empty' : result.state}>
      <div className="rb-write">
        <div className="rb-write-head">
          <h2 className="krds-text-body-small-bold">{t.Compare_title}</h2>
          <p className="krds-text-body-xsmall rb-subtle">{t.Compare_hint}</p>
        </div>
        <section className="rb-compare-pick" aria-label={t.Issue_comparePick}>
          <Picker label={t.Compare_from} id="cmp-from" list={list} value={from} onChange={setFrom} />
          <Picker label={t.Compare_to} id="cmp-to" list={list} value={to} onChange={setTo} />
        </section>

        {same ? (
          <EmptyState title={t.Issue_sameBranch} />
        ) : !result.data ? (
          <Status {...result} />
        ) : (
          <>
            <p className="krds-text-body-small">{t.fn.compareSummary(commits.length, diffs.length)}</p>
            {commits.length ? (
              <ul className="rb-plain-list">
                {commits.map((c) => (
                  <li className="rb-plain-row" key={c.id}>
                    <span className="rb-plain-main rb-ellipsis">{c.title}</span>
                    <span className="rb-plain-sub rb-subtle">{c.author_name}</span>
                    <span className="rb-plain-meta rb-subtle">{day(c.created_at)}</span>
                  </li>
                ))}
              </ul>
            ) : null}
            {diffs.length ? <DiffView files={diffs} /> : <EmptyState title={t.Compare_noDiff} />}
            <div className="rb-write-actions">
              <Link className="krds-btn small primary" to={`/projects/${id}/merge-requests/new?source=${encodeURIComponent(to)}`}>{t.Compare_propose}</Link>
            </div>
          </>
        )}
      </div>
    </ProjectFrame>
  );
}
