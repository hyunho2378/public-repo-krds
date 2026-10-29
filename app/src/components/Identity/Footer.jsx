// Figma: KRDS footer. 배경은 화면 전체 폭, 내용은 콘텐츠 폭.
import { phrase } from '../Help/Phrase';
import { t } from '../../copy/ko';
import { Link } from 'react-router-dom';
import { SERVICE_NAME } from './Header';

export function Footer() {
  return (
    <footer id="krds-footer" data-krds="footer" className="rb-footer">
      <div className="inner rb-stack">
        <p className="krds-text-heading-small">{SERVICE_NAME}</p>
        <p className="krds-text-body-small rb-subtle">{phrase(t.Footer_1)}</p>
        <ul className="rb-footer-links">
          <li><Link to="/help">{t.Footer_2}</Link></li>
          <li>
            <a href="https://www.krds.go.kr/" target="_blank" rel="noreferrer">
              {t.Footer_5}<span className="sr-only"> {t.Footer_3}</span>
            </a>
          </li>
        </ul>
        <p className="krds-text-body-xsmall rb-subtle">{phrase(t.Footer_4)}</p>
      </div>
    </footer>
  );
}
