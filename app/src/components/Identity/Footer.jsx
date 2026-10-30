// D-20: 공공기관 하단 형식(KRDS 푸터 지침: 로고, 연락처, 유틸리티 링크, 정책 링크, 저작권). 값은 행정안전부 누리집에 실제로 있는 것만.
// 출처 표시(공공누리 제1유형)는 바닥글에 두지 않고 도움말 '이 서비스에 대해'의 '출처' 절과 README에 둔다.
import { u } from '../../copy/ui';
import { newWindow } from '../Layout/newWindow';
import { MoisLogoHorizontal } from './MoisLogo';
import { SERVICE_NAME } from './Header';

const MOIS = 'https://www.mois.go.kr/frt/sub/a08';
const LINKS = {
  use: `${MOIS}/useInfo/screen.do`,
  map: `${MOIS}/sitemap/screen.do`,
  copyright: `${MOIS}/copyrightPolicy/screen.do`,
  privacy: `${MOIS}/personalInfo/screen.do`,
};

export { SERVICE_NAME };

export function Footer() {
  return (
    <footer data-figma="footer" id="krds-footer" data-krds="footer">
      <div className="inner rb-foot">
        <div className="rb-foot-top">
          <MoisLogoHorizontal label={u.Login_moisAlt} />
          <div className="rb-foot-info">
            <address className="rb-foot-contact">
              <p>{u.Foot_addr}</p>
              <p>{u.Foot_tel}</p>
              <p>{u.Foot_call}</p>
            </address>
            <ul className="rb-foot-links">
              <li><a href={LINKS.use} {...newWindow(u.Foot_use)}>{u.Foot_use}</a></li>
              <li><a href={LINKS.map} {...newWindow(u.Foot_map)}>{u.Foot_map}</a></li>
            </ul>
          </div>
        </div>
        <div className="rb-foot-bottom">
          <ul className="rb-foot-links rb-foot-policy">
            <li><a className="is-strong" href={LINKS.privacy} {...newWindow(u.Foot_privacy)}>{u.Foot_privacy}</a></li>
            <li><a href={LINKS.copyright} {...newWindow(u.Foot_copyright)}>{u.Foot_copyright}</a></li>
          </ul>
          <p className="rb-foot-copy">{u.Foot_copy}</p>
        </div>
      </div>
    </footer>
  );
}
