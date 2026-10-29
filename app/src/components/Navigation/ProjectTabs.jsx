// Figma: KRDS tab(line). 프로젝트 안 탭 순서는 UX-002 1.2.
import { t } from '../../copy/ko';
import { Link } from 'react-router-dom';

const TABS = [
  ['', t.Tab_code],
  ['/about', t.ProjectTabs_1],
  ['/use', t.ProjectTabs_2],
  ['/changes', t.ProjectTabs_4],
  ['/feedback', t.ProjectTabs_5],
];

export function ProjectTabs({ id, active }) {
  return (
    <nav className="krds-tab-area rb-tabs" aria-label={t.ProjectTabs_6}>
      <div className="tab line">
        <ul>
          {TABS.map(([suffix, label]) => (
            <li key={suffix} className={suffix === active ? 'active' : ''}>
              <Link className="btn-tab" to={`/projects/${id}${suffix}`} aria-current={suffix === active ? 'page' : undefined}>
                {label}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </nav>
  );
}
