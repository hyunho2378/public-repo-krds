// GitHub 목록 구조: 검색칸, 상태 전환(개수 표시)과 정렬이 한 줄인 머리, 그 아래 구분선 행. 이슈와 변경 제안 목록이 함께 쓴다.
import { u } from '../../copy/ui';
import { Icon } from './Icon';
import { Drop } from './Drop';

export const SORTS = [['newest', u.Sort_newest], ['oldest', u.Sort_oldest], ['comments', u.Sort_comments]];

const time = (x) => new Date(x.created_at || 0).getTime();

export function sortItems(list, sort) {
  const out = [...list];
  if (sort === 'oldest') out.sort((a, b) => time(a) - time(b));
  else if (sort === 'comments') out.sort((a, b) => (b.user_notes_count || 0) - (a.user_notes_count || 0) || time(b) - time(a));
  else out.sort((a, b) => time(b) - time(a));
  return out;
}

export function matchTitle(list, query) {
  const q = query.trim().toLowerCase();
  return q ? list.filter((x) => (x.title || x.name || '').toLowerCase().includes(q)) : list;
}

export function SearchBox({ value, onChange, label = u.List_searchLabel, placeholder = u.List_search }) {
  return (
    <div className="rb-listsearch">
      <Icon name="search" />
      <input type="search" className="rb-listsearch-input" value={value} placeholder={placeholder} aria-label={label} onChange={(e) => onChange(e.target.value)} />
    </div>
  );
}

// states: [[키, 이름, 개수]]
export function ListBox({ label, states, value, onChange, sort, onSort, children }) {
  return (
    <div className="rb-listbox">
      <div className="rb-listbox-head">
        <div className="rb-statetabs" role="tablist" aria-label={label}>
          {states.map(([key, name, count]) => (
            <button key={key} type="button" role="tab" aria-selected={key === value} className={'rb-statetab' + (key === value ? ' active' : '')} onClick={() => onChange(key)}>
              <span>{name}</span>
              {count != null ? <span className="rb-statetab-count">{count}</span> : null}
            </button>
          ))}
        </div>
        {onSort ? (
          <Drop label={u.List_sort} align="right" button={<span>{u.List_sort}: {SORTS.find(([k]) => k === sort)?.[1]}</span>}>
            {(close) => (
              <ul className="drop-list" aria-label={u.List_sort}>
                {SORTS.map(([k, n]) => (
                  <li key={k}>
                    <button type="button" className={'item-link' + (k === sort ? ' active' : '')} aria-current={k === sort ? 'true' : undefined} onClick={() => { close(); onSort(k); }}>{n}</button>
                  </li>
                ))}
              </ul>
            )}
          </Drop>
        ) : null}
      </div>
      {children}
    </div>
  );
}
