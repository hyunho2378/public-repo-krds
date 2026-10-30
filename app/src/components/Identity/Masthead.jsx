// D-06 시제품 표기. KRDS 공식 배너(masthead) 부품 모양을 쓰되, 공식 누리집이 아니므로 태극기와 정부 상징은 쓰지 않는다.
import { t } from '../../copy/ko';
import { phrase } from '../Help/Phrase';

export function Masthead() {
  return (
    <>
      <a className="rb-skip" href="#main">{t.Header_skip}</a>
      <div id="krds-masthead" className="rb-masthead" data-figma="masthead">
        <div className="toggle-wrap">
          <div className="toggle-head">
            <div className="inner">
              <span className="nuri-txt">{phrase(t.Header_masthead)}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
