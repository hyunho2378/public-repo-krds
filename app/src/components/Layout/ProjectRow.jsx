// D-21 4장 탐색 목록 행(공공 깃랩 01 그대로): 유형 아이콘, 아바타, '만든 곳 / 이름' + 공개 아이콘, 설명 두 줄, 주제 3개 + 더보기,
// 오른쪽에 별표, 포크, 머지 리퀘스트, 작업 항목 개수(아이콘 + 숫자 13)와 '업데이트됨 n 전', 맨 오른쪽 점 세 개 메뉴.
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { Icon } from '../Code/Icon';
import { Avatar } from './Avatar';
import { Menu } from '../Navigation/Menu';
import { iconBtnClass } from '../Action/IconButton';
import { cleanDescription } from './description';
import { newWindow } from './newWindow';
import { FoldText } from './FoldText';

function Stat({ icon, label, n, href }) {
  return (
    <li>
      <a className="rb-prow-stat" href={href} {...newWindow(`${label} ${n ?? 0}`)} title={label}>
        <Icon name={icon} />
        <span>{n ?? '-'}</span>
      </a>
    </li>
  );
}

export function ProjectRow({ p, mrs, issues }) {
  const owner = p.namespace?.name || '';
  const topics = p.topics || p.tag_list || [];
  const { rel, full } = t.fn.relativeDate(p.last_activity_at);
  const desc = cleanDescription(p.description);
  return (
    <li className="rb-prow" data-figma="project-row">
      <Icon name="ext/project" />
      <Avatar src={p.avatar_url} name={p.name} className="is-32" />
      <div className="rb-prow-main">
        <p className="rb-prow-title">
          <Link to={`/projects/${p.id}`}>{owner ? `${owner} / ` : ''}{p.name}</Link>
          <Icon name="globe" label={u.X_public} />
        </p>
        {desc ? <FoldText lines={2} className="rb-prow-desc">{desc}</FoldText> : null}
        {topics.length ? (
          <p className="rb-prow-topics">
            <span className="rb-subtle">{u.X_topics}</span>
            <span className="krds-tag-wrap small">
              {topics.slice(0, 3).map((x) => <span key={x} className="krds-btn-tag rb-topic">{x}</span>)}
            </span>
            {topics.length > 3 ? <span className="rb-subtle">{u.X_moreTopics(topics.length - 3)}</span> : null}
          </p>
        ) : null}
      </div>
      <div className="rb-prow-side">
        <ul className="rb-prow-stats">
          <Stat icon="ext/star" label={u.X_stars} n={p.star_count} href={`${p.web_url}/-/starrers`} />
          <Stat icon="ext/fork" label={u.X_forks} n={p.forks_count} href={`${p.web_url}/-/forks`} />
          <Stat icon="ext/merge-request" label={u.X_mrs} n={mrs} href={`${p.web_url}/-/merge_requests`} />
          <Stat icon="ext/issues" label={u.X_issues} n={p.open_issues_count ?? issues} href={`${p.web_url}/-/work_items`} />
        </ul>
        <p className="rb-prow-time" title={full}>{u.X_updated(rel)}</p>
      </div>
      <Menu label={u.X_actions} align="right" toggle={false} btnClass={iconBtnClass('small')} button={<Icon name="ellipsis_vertical" />}>
        {(close) => (
          <ul className="drop-list">
            <li><Link className="item-link" to={`/projects/${p.id}`} onClick={close}>{p.name}</Link></li>
            <li><a className="item-link" href={p.web_url} {...newWindow(u.G_newWindow)} onClick={close}>{u.G_newWindow}</a></li>
          </ul>
        )}
      </Menu>
    </li>
  );
}
