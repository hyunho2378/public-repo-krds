// 데이터 상태 표시. Loading은 KRDS spinner, Error는 KRDS 오류 안내 구조.
import { phrase } from '../Help/Phrase';
import { t } from '../../copy/ko';
import { Button, LinkButton } from '../Action/Button';
import './skeleton.css';

const SKEL_WIDTHS = ['100%', '92%', '84%', '96%', '72%'];

/** 회색 막대 줄 스켈레톤. 글자 대신 막대를 보이고, 스크린리더에는 상태 글자만 읽힌다. */
export function Skeleton({ widths = SKEL_WIDTHS, inline = false }) {
  return widths.map((w, i) => <span key={i} className={`rb-skel${inline ? ' rb-skel-inline' : ''}`} style={{ width: w }} aria-hidden="true" />);
}

export function Status({ state, error, retry, status }) {
  if (state === 'Loading') {
    return (
      <div role="status" aria-busy="true" className="rb-skel-group" data-state="Loading">
        <span className="sr-only">{t.Status_1}</span>
        <Skeleton />
      </div>
    );
  }
  if (state === 'Error') {
    const notFound = status === 404;
    return (
      <div role="alert" className="rb-status" data-state="Error">
        <h2 className="krds-text-heading-small">{notFound ? t.Status_2 : t.Status_3}</h2>
        <p>{phrase(notFound ? t.Status_4 : error || t.Status_5)}</p>
        <div className="rb-actions">
          {!notFound && retry && (
            <Button Type="tertiary" onClick={retry}>
              {t.Status_6}
            </Button>
          )}
          <LinkButton Type="text" to="/">
            {t.Status_7}
          </LinkButton>
        </div>
      </div>
    );
  }
  return null;
}

/** 빈 상태: 이유와 다음 행동을 함께 준다(UX 원칙 U6). */
export function EmptyState({ title, children, actions }) {
  return (
    <div className="rb-status" data-state="Empty">
      <h2 className="krds-text-heading-small">{phrase(title)}</h2>
      {children && <p className="rb-subtle">{phrase(children)}</p>}
      {actions && <div className="rb-actions">{actions}</div>}
    </div>
  );
}
