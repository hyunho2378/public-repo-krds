// P-17 변경 내용 보기(F-36). 변경 설명, 작성 기관, 날짜, 이전 변경, 바뀐 파일 비교(DiffView).
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { DiffView, diffStat } from '../components/Code/DiffView';
import { orgLabel } from '../components/Layout/orgLabel';
import { day } from './parts/repoCommon';
import '../components/Code/code.css';

export default function Commit() {
  const { sha } = useParams();
  const frame = useProject();
  const body = useData(async () => {
    const commit = (await gitlab.commit(frame.id, sha)).data;
    const files = (await gitlab.diff(frame.id, sha)).data;
    return { commit, files };
  }, [frame.id, sha]);
  if (!frame.data) return <ProjectFrame screenId="R-05" data={frame} />;
  const b = body.data;
  const stat = b ? diffStat(b.files) : null;
  return (
    <ProjectFrame screenId="R-05" tab="/changes" tabLabel={t.P17_title} crumbs={[[t.Side_hintCommit, `/projects/${frame.id}/changes`], [sha.slice(0, 8)]]} data={frame} state={b ? (b.files.length ? 'Ideal' : 'Empty') : body.state}>
      {!b ? (
        <Status {...body} />
      ) : (
        <div className="rb-code-area">
          <div className="rb-detail-head">
            <h2 className="krds-text-heading-medium rb-break-any">{b.commit.title}</h2>
            {b.commit.message && b.commit.message.trim() !== b.commit.title ? (
              <pre className="rb-detail-body krds-text-body-medium rb-pre">{b.commit.message.trim()}</pre>
            ) : null}
            <p className="krds-text-body-small rb-row-meta">
              <span>{t.P17_author} {orgLabel(b.commit.author_name)}</span>
              <span>{day(b.commit.committed_date)}</span>
              <code>{b.commit.short_id}</code>
              <span>{t.fn.diffStat(stat.add, stat.del)}</span>
              {b.commit.parent_ids?.[0] ? (
                <Link className="krds-link" to={`/projects/${frame.id}/changes/${b.commit.parent_ids[0]}`}>{t.P17_parent} {b.commit.parent_ids[0].slice(0, 8)}</Link>
              ) : null}
            </p>
          </div>
          {b.files.length ? <DiffView files={b.files} /> : <EmptyState title={t.P17_noDiff} />}
        </div>
      )}
    </ProjectFrame>
  );
}
