// G-01 탐색 하위 화면(공공 깃랩 41 주제, 42 스니펫). /explore는 탐색 > 프로젝트(첫 화면)로 보낸다.
// CI/CD 카탈로그(43), AI 카탈로그(73)는 공공 깃랩 GraphQL 전용이라 사이드바에서 원본을 새 창으로 연다.
import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { u } from '../copy/ui';
import { request } from '../api/client';
import { useData } from '../api/useData';
import { Page } from '../components/Layout/Page';
import { Status } from '../components/Feedback/Status';
import { Icon } from '../components/Code/Icon';
import { Avatar } from '../components/Layout/Avatar';

export default function Explore() {
  return <Navigate to="/" replace />;
}

/** 공공 깃랩 /explore/projects/topics: 제목, '이름으로 필터링', '주제 n' 상자 안 행(머리글자, 이름, 프로젝트 수) */
export function Topics() {
  const [q, setQ] = useState('');
  const list = useData(() => request(`/api/gitlab/topics?per_page=100${q.length >= 1 ? `&search=${encodeURIComponent(q)}` : ''}`), [q], (d) => !d.data?.length);
  const items = list.data?.data || [];
  return (
    <Page id="G-01t" title={u.T_title} state={list.state}>
      <h1 className="rb-x-title" data-figma="page-head">{u.T_title}</h1>
      <label className="sr-only" htmlFor="tp-q">{u.T_filter}</label>
      <div className="rb-s-input"><input id="tp-q" type="search" value={q} placeholder={u.T_filter} onChange={(e) => setQ(e.target.value)} /></div>
      <Status {...list} />
      {items.length ? (
        <section className="rb-box" aria-labelledby="tp-box">
          <h2 id="tp-box" className="rb-box-head krds-text-body-small-bold">{u.T_box} <span className="rb-subtle"><Icon name="view_all" /> {list.data?.pagination?.total ?? items.length}</span></h2>
          <ul className="rb-box-list">
            {items.map((tp) => (
              <li key={tp.id}>
                <Link className="rb-box-row" to={`/search?topic=${encodeURIComponent(tp.name)}`}>
                  <Avatar src={tp.avatar_url} name={tp.title || tp.name} seed={tp.id} className="is-32" />
                  <span className="krds-text-body-small-bold">{tp.title || tp.name}</span>
                  <span className="rb-box-n rb-subtle" title={u.T_projects}><Icon name="analytics" />{tp.total_projects_count}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </Page>
  );
}

/** 공공 깃랩 /explore/snippets: 비로그인에는 공개 스니펫이 보이지 않는다(공공 깃랩도 같은 빈 상태) */
export function Snippets() {
  return (
    <Page id="G-01s" title={u.Sn_title} state="Empty">
      <h1 className="rb-x-title" data-figma="page-head">{u.Sn_title}</h1>
      <div className="rb-empty-center">
        <Icon name="ext/snippet" />
        <p className="krds-text-body-medium-bold">{u.Sn_none}</p>
      </div>
    </Page>
  );
}
