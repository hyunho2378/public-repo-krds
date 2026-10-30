// 데이터 상태 표시. Loading은 KRDS spinner, Error는 KRDS 오류 안내 구조.
import { phrase } from '../Help/Phrase';
import { t } from '../../copy/ko';
import { Button, LinkButton } from '../Action/Button';

export function Status({ state, error, retry, status }) {
  if (state === 'Loading') {
    return (
      <div role="status" className="rb-status" data-state="Loading">
        <span className="krds-spinner" aria-hidden="true" />
        <p>{phrase(t.Status_1)}</p>
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
