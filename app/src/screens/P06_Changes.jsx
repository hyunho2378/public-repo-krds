// P-06 변경 기록(F-36, UX-004). GitHub 커밋 목록처럼 날짜별로 묶고 메시지, 작성 기관, 변경 번호, 이 시점 파일 보기를 둔다.
import { useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { EmptyState, Status } from '../components/Feedback/Status';
import { Icon } from '../components/Code/Icon';
import { orgLabel } from '../components/Layout/orgLabel';
import { day, enc, groupByDay } from './parts/repoCommon';
import '../components/Code/code.css';

export default function Changes() {
  const [params] = useSearchParams();
  const path = params.get('path') || '';
  const frame = useProject();
  const [page, setPage] = useState(1);
  const [extra, setExtra] = useState([]);
  const [next, setNext] = useState(null);
  const list = useData(async () => {
    const r = await gitlab.commits(frame.id, { path });
    setExtra([]);
    setPage(1);
    setNext(r.pagination?.nextPage || null);
    return r.data;
  }, [frame.id, path]);
  const more = async () => {
    const r = await gitlab.commits(frame.id, { path, page: page + 1 });
    setExtra((x) => [...x, ...r.data]);
    setPage(page + 1);
    setNext(r.pagination?.nextPage || null);
  };
  const copy = (sha) => navigator.clipboard.writeText(sha);

  if (!frame.data) return <ProjectFrame screenId="R-04" data={frame} />;
  const items = list.data ? [...list.data, ...extra] : [];
  const state = list.data ? (items.length ? (items.length === 1 ? 'Min' : 'Ideal') : 'Empty') : list.state;
  return (
    <ProjectFrame screenId="R-04" tab="/changes" tabLabel={t.ProjectTabs_4} data={frame} state={state}>
      <div className="rb-code-area">
        <div className="rb-diff-bar">
          <h2 className="krds-text-heading-medium">{path ? t.P06_filter : t.P06_title}</h2>
          {path ? <Link className="krds-link" to={`/projects/${frame.id}/changes`}>{t.P06_clearFilter}</Link> : null}
        </div>
        {path ? <p className="krds-text-body-small rb-subtle rb-break-any"><code>{path}</code></p> : null}
        {!list.data ? (
          <Status {...list} />
        ) : !items.length ? (
          <EmptyState title={t.P06_4} />
        ) : (
          <div className="rb-commit-groups">
            {groupByDay(items, 'committed_date').map((g) => (
              <section key={g.day} className="rb-commit-group" aria-label={`${t.P06_dayGroup} ${g.day}`}>
                <h3 className="krds-text-body-medium-bold">
                  <Icon name="time" /> {g.day} <span className="rb-subtle krds-text-body-small">{t.fn.commitsOn(g.items.length)}</span>
                </h3>
                <ul className="rb-row-list">
                  {g.items.map((c) => (
                    <li className="rb-row" key={c.id}>
                      <div className="rb-row-main">
                        <Link className="krds-link krds-text-body-large rb-ellipsis" to={`/projects/${frame.id}/changes/${c.id}`}>{c.title}</Link>
                        <p className="krds-text-body-small rb-row-meta">
                          <span>{orgLabel(c.author_name)}</span>
                          <span>{day(c.committed_date)}</span>
                        </p>
                      </div>
                      <div className="rb-row-side">
                        <code className="krds-text-body-small">{c.short_id}</code>
                        <button type="button" className="krds-btn small tertiary" onClick={() => copy(c.id)}>
                          <Icon name="copy" />
                          <span className="sr-only">{t.P06_copySha}</span>
                        </button>
                        <Link className="krds-btn small tertiary" to={`/projects/${frame.id}/code${path ? '/' + path.split('/').map(enc).join('/') : ''}`} title={t.P06_viewCode}>
                          <span className="sr-only">{t.P06_viewCode}</span>
                          <Icon name="document" />
                        </Link>
                      </div>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
            {next ? <button type="button" className="krds-btn medium tertiary" onClick={more}>{t.P06_more}</button> : null}
          </div>
        )}
      </div>
    </ProjectFrame>
  );
}
