// P-03 분야별 둘러보기. 분야별 도구 수(F-02, F-39). 분류는 규칙 기반이라 검토 필요 표시.
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { Link } from 'react-router-dom';
import { product } from '../api/client';
import { useData } from '../api/useData';
import { hasData } from '../api/devState';
import { Page } from '../components/Layout/Page';
import { Status } from '../components/Feedback/Status';

export default function Fields() {
  const map = useData(() => product.get('/coverage-map'), []);
  return (
    <Page id="G-03" title={t.P03_1} state={map.state}>
      <h1 className="krds-text-heading-small" data-figma="section-title">{phrase(t.P03_1)}</h1>
      <p className="rb-subtle">{phrase(t.P03_2)}</p>
      <Status {...map} />
      {hasData(map.state) && (
        <>
          <ul className="krds-structured-list rb-list">
            {map.data.data.fields.map((f) => (
              <li className="structured-item" key={f.name}>
                <Link className="rb-list-link rb-row" to={`/search?field=${encodeURIComponent(f.name)}`}>
                  <span className="krds-text-body-small-bold">{f.name}</span>
                  <span className="krds-text-body-xsmall rb-subtle">{t.fn.toolCount(f.count)}</span>
                </Link>
              </li>
            ))}
          </ul>
          {map.data.data.notice ? <p className="krds-text-body-xsmall rb-subtle">{map.data.data.notice}</p> : null}
        </>
      )}
    </Page>
  );
}
