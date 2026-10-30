// UX-007 2장: 시제품 배너는 화면 맨 위에 두지 않는다(모든 화면). 시제품 고지는 도움말 "이 서비스에 대해"와 README에만. 건너뛰기 링크는 남겨 둔다.
import { t } from '../../copy/ko';

export function Masthead() {
  return <a className="rb-skip" href="#main">{t.Header_skip}</a>;
}
