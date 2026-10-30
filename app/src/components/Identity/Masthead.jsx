// D-21 시스템 머리 띠: 공공 깃랩 맨 위 한 줄을 그대로 둔다(높이 24, primary 채움, 흰 글자 13). 건너뛰기 링크는 그 앞.
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { newWindow } from '../Layout/newWindow';

export function Masthead() {
  return (
    <>
      <a className="rb-skip" href="#main">{t.Header_skip}</a>
      <div className="rb-sysband" data-figma="system-band">
        <span>{u.Sys_band} ( {u.Sys_bandBoard} <a href={`https://${u.Sys_bandBoardUrl}`} {...newWindow(u.Sys_bandBoard)}>{u.Sys_bandBoardUrl}</a> )</span>
      </div>
    </>
  );
}
