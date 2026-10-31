// P-13 오류 3종. 없는 주소, 권한 없음, 점검. 이유와 다음 행동(U6).
import { t } from '../copy/ko';
import { useSearchParams } from 'react-router-dom';
import { phrase } from '../components/Help/Phrase';
import { Page } from '../components/Layout/Page';
import { LinkButton } from '../components/Action/Button';

const KINDS = {
  'not-found': [t.P13_1, t.P13_2],
  forbidden: [t.P13_3, t.P13_4],
  maintenance: [t.P13_5, t.P13_6],
};

export default function ErrorScreen({ kind: fixed }) {
  const [params] = useSearchParams();
  const kind = fixed || params.get('kind') || 'not-found';
  const [title, text] = KINDS[kind] || KINDS['not-found'];
  return (
    <Page id="G-09" title={title} state={kind}>
      <div className="rb-narrow rb-stack">
        <h1 className="krds-text-heading-small" data-figma="page-head">{title}</h1>
        <p className="krds-text-body-small">{phrase(text)}</p>
        <div className="rb-actions">
          <LinkButton to="/">{t.P13_7}</LinkButton>
          {kind === 'forbidden' && <LinkButton Type="tertiary" to={`/login?returnTo=${encodeURIComponent(params.get('from') || '/')}`}>{t.P10_2}</LinkButton>}
          <LinkButton Type="text" to="/help">{t.Header_5}</LinkButton>
        </div>
      </div>
    </Page>
  );
}
