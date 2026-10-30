// Figma: KRDS footer. 공식 마크업(code/html/code/footer.html): #krds-footer > .inner > .f-logo, .f-cnt(.f-info, .f-link), .f-btm(.f-menu, .f-copy)
// 로고 자리는 서비스명 글자(정부 상징 미사용, D-04). 주소, 전화 칸은 운영 기관이 정해지면 채운다.
import { Link } from 'react-router-dom';
import { phrase } from '../Help/Phrase';
import { t } from '../../copy/ko';
import { newWindow } from '../Layout/newWindow';
import { SERVICE_NAME } from './Header';
import { Logo } from './Logo';

export function Footer() {
  return (
    <footer data-figma="footer" id="krds-footer" data-krds="footer">
      <div className="inner">
        <div className="f-logo rb-f-logo"><Logo size={20} /><span>{SERVICE_NAME}</span></div>
        {/* UX-007 2장: 시제품 문구는 바닥글에서 빼고 도움말 "이 서비스에 대해"에만 둔다 */}
        <div className="f-cnt">
          <div className="f-link">
            <div className="link-go">
              <Link className="krds-btn small text" to="/help">{t.Footer_2}</Link>
              <a className="krds-btn small text" href="https://www.krds.go.kr/" {...newWindow(t.Footer_5)}>{t.Footer_5}</a>
            </div>
          </div>
        </div>
        <div className="f-btm">
          <div className="f-btm-text">
            <p className="f-copy">{phrase(t.Footer_4)}</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
