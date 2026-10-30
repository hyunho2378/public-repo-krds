// Figma: KRDS search(입력칸 + 버튼 한 줄). 업무 문장 검색(F-01).
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function TaskSearch({ initial = '', keep }) {
  const [query, setQuery] = useState(initial);
  const navigate = useNavigate();
  useEffect(() => setQuery(initial), [initial]);

  function submit(e) {
    e.preventDefault();
    const params = new URLSearchParams(keep || {});
    params.delete('page');
    query.trim() ? params.set('q', query.trim()) : params.delete('q');
    navigate('/search?' + params.toString());
  }

  return (
    <form role="search" data-figma="search" className="rb-search" onSubmit={submit}>
      <label className="sr-only" htmlFor="task-search">{t.TaskSearch_2}</label>
      <div className="rb-search-row">
        <input className="krds-input small" id="task-search" type="search" placeholder={u.Task_placeholder} value={query} onChange={(e) => setQuery(e.target.value)} />
        <button className="krds-btn small primary" type="submit">
          {t.TaskSearch_3}
        </button>
      </div>
    </form>
  );
}
