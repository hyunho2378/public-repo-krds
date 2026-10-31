// G-02 전역 검색 = 공공 깃랩 /search(캡처 44): 검색칸, 왼쪽 범위(프로젝트 n, 작업 항목, 머지 리퀘스트, 마일스톤, 사용자들), 아카이빙됨, 결과 목록(탐색 목록과 같은 행).
// 덧붙임(UX/14 3): 문장형 질의일 때만 결과 맨 위 '업무로 찾기' 3개 + 더보기(소개 카드 자료). 자료가 없으면 묶음 없음.
import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { u } from '../copy/ui';
import { request } from '../api/client';
import { useData } from '../api/useData';
import { isSentence, taskSearch } from '../api/cards';
import { Page } from '../components/Layout/Page';
import { Status } from '../components/Feedback/Status';
import { Icon } from '../components/Code/Icon';
import { ProjectRow } from '../components/Layout/ProjectRow';
import { newWindow } from '../components/Layout/newWindow';

const PER = 20;
const GITLAB = 'https://gitlab.aigov.go.kr';

function TaskFind({ q }) {
  const [more, setMore] = useState(false);
  const res = useData(() => (isSentence(q) ? taskSearch(q, more ? 10 : 3) : Promise.resolve([])), [q, more]);
  const hits = res.data || [];
  if (!hits.length) return null;
  return (
    <section className="rb-taskfind" data-figma="task-search" aria-labelledby="rb-taskfind">
      <h2 id="rb-taskfind" className="krds-text-body-small-bold">{u.C_task}</h2>
      {/* Figma A-01: 업무로 찾기 안 행은 탐색 행(project-row) 간단형(설명·주제 없음) 3개 + 더보기 */}
      <ul className="rb-taskfind-list rb-prow-list">
        {hits.map((c) => (c.p ? <ProjectRow key={c.id} p={c.p} compact /> : (
          <li key={c.id}>
            <Link className="rb-plain-link krds-text-body-small-bold" to={`/projects/${c.id}`}>{c.name}</Link>
            <span className="krds-text-body-xsmall rb-subtle">{c.sub}</span>
          </li>
        )))}
      </ul>
      {!more ? <button type="button" className="rb-fold-btn krds-text-body-xsmall" onClick={() => setMore(true)}>{u.C_taskMore}</button> : null}
    </section>
  );
}

export default function Search() {
  const [params, setParams] = useSearchParams();
  const q = params.get('q') || params.get('search') || '';
  const topic = params.get('topic') || '';
  const archived = params.get('archived') === 'true';
  const page = Math.max(1, Number(params.get('page')) || 1);
  const [text, setText] = useState(q);
  const [showScopes, setShowScopes] = useState(false);
  const [arch, setArch] = useState(archived);
  useEffect(() => setText(q), [q]);
  const list = useData(
    () => (q || topic ? request(`/api/gitlab/projects?${q ? `search=${encodeURIComponent(q)}&` : ''}${topic ? `topic=${encodeURIComponent(topic)}&` : ''}order_by=last_activity_at&per_page=${PER}&page=${page}${archived ? '' : '&archived=false'}`) : Promise.resolve({ data: [], pagination: {} })),
    [q, topic, archived, page],
    (d) => !d.data?.length,
  );
  const items = list.data?.data || [];
  const total = list.data?.pagination?.total;
  const set = (patch) => {
    const next = new URLSearchParams(params);
    Object.entries(patch).forEach(([k, v]) => (v ? next.set(k, v) : next.delete(k)));
    if (!('page' in patch)) next.delete('page');
    setParams(next);
  };
  const gl = (scope) => `${GITLAB}/search?search=${encodeURIComponent(q)}&scope=${scope}`;
  const scopes = [
    [u.S_projects, 'ext/project', null, total],
    [u.S_issues, 'ext/issues', gl('issues')],
    [u.S_mrs, 'ext/merge-request', gl('merge_requests')],
    [u.S_milestones, 'calendar', gl('milestones')],
    [u.S_users, 'ext/users', gl('users')],
  ];
  return (
    <Page id="G-02" title={q ? t.fn.searchTitle(q) : u.S_title} state={list.state}>
      <h1 className="sr-only">{q ? t.fn.searchTitle(q) : u.S_title}</h1>
      <form className="rb-s-input" role="search" onSubmit={(e) => { e.preventDefault(); set({ q: text.trim(), search: '' }); }}>
        <Icon name="search" />
        <label className="sr-only" htmlFor="s-q">{u.S_input}</label>
        <input id="s-q" type="search" value={text} placeholder={u.S_hint} onChange={(e) => setText(e.target.value)} />
        {text ? <button type="button" className="rb-s-clear" aria-label={u.S_clear} title={u.S_clear} onClick={() => { setText(''); set({ q: '', search: '' }); }}><Icon name="close" /></button> : null}
      </form>
      {/* 공공 깃랩: 1024 미만은 왼쪽 범위 열 대신 검색칸 아래 오른쪽 '필터' 단추(눌러 범위 패널 열기, search_breakpoints.md) */}
      <div className="rb-s-filterbar"><button type="button" className="krds-btn small tertiary rb-s-filterbtn" data-figma="search-filter" aria-expanded={showScopes} aria-controls="rb-s-side" onClick={() => setShowScopes(!showScopes)}><Icon name="ext/filter" /><span>{u.S_filter}</span></button></div>
      <div className="rb-s-body">
        <aside id="rb-s-side" className={'rb-s-side' + (showScopes ? ' is-open' : '')} aria-label={u.S_scopes}>
          <ul className="rb-s-scopes">
            {scopes.map(([label, icon, href, n]) => (
              <li key={label}>
                {href ? (
                  <a className="rb-s-scope" href={href} {...newWindow(label)}><Icon name={icon} /><span>{label}</span></a>
                ) : (
                  <span className="rb-s-scope is-current" aria-current="true"><Icon name={icon} /><span>{label}</span><b>{n ?? ''}</b></span>
                )}
              </li>
            ))}
          </ul>
          <fieldset className="rb-s-arch">
            <legend className="krds-text-body-xsmall-bold">{u.S_archived}</legend>
            <div className="krds-form-check">
              <input id="s-arch" type="checkbox" checked={arch} onChange={(e) => setArch(e.target.checked)} />
              <label htmlFor="s-arch">{u.S_archivedInclude}</label>
            </div>
          </fieldset>
          <button type="button" className="krds-btn small tertiary" onClick={() => set({ archived: arch ? 'true' : '' })}>{u.S_apply}</button>
        </aside>
        <section className="rb-s-results" aria-label={u.S_projects}>
          {q ? <TaskFind q={q} /> : null}
          {q || topic ? <Status {...list} /> : null}
          {topic ? <p className="krds-text-body-small-bold">{u.G_topics}: {topic}</p> : null}
          {q && list.state === 'Empty' ? <p className="krds-text-body-small rb-subtle">{u.S_none(q)}</p> : null}
          {items.length ? <ul className="rb-prows">{items.map((p) => <ProjectRow key={p.id} p={p} />)}</ul> : null}
          {items.length && (page > 1 || list.data?.pagination?.nextPage) ? (
            <nav className="rb-x-pager" aria-label={t.Pagination_1}>
              <button type="button" className="krds-btn small tertiary" disabled={page <= 1} onClick={() => set({ page: String(page - 1) })}>{t.Pagination_2}</button>
              <span className="krds-text-body-xsmall rb-subtle">{page}</span>
              <button type="button" className="krds-btn small tertiary" disabled={!list.data?.pagination?.nextPage} onClick={() => set({ page: String(page + 1) })}>{t.Pagination_3}</button>
            </nav>
          ) : null}
        </section>
      </div>
    </Page>
  );
}
