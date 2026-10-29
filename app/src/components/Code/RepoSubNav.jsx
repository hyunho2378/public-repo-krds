// Figma: Repo/SubNav. 코드 탭 안 하위 메뉴(D-04). KRDS 탭(fill) 마크업.
import { Link } from 'react-router-dom';
import { t } from '../../copy/ko';

const ITEMS = [
  ['files', '/code', t.RepoSub_files],
  ['mr', '/merge-requests', t.RepoSub_mr],
  ['branches', '/branches', t.RepoSub_branches],
  ['releases', '/releases', t.RepoSub_releases],
  ['people', '/contributors', t.RepoSub_people],
];

export function RepoSubNav({ id, active }) {
  return (
    <nav className="krds-tab-area rb-subnav" aria-label={t.RepoSub_label}>
      <div className="tab fill">
        <ul>
          {ITEMS.map(([key, to, label]) => (
            <li key={key} className={key === active ? 'active' : ''}>
              <Link className="btn-tab" to={`/projects/${id}${to}`} aria-current={key === active ? 'page' : undefined}>{label}</Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
