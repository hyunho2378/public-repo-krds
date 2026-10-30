// D-21 시스템 머리 띠: 공공 깃랩 맨 위 한 줄을 그대로 둔다(높이 24, primary 채움, 흰 글자 13). 건너뛰기 링크는 그 앞.
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { newWindow } from '../Layout/newWindow';
import { useEffect, useState } from 'react';
import { snapshotState } from '../../api/snapshot';

/** 공공 깃랩이 응답하지 않아 저장된 자료를 보여 줄 때만 머리 띠 아래 한 줄. 실제 응답이 돌아오면 사라진다 */
function SnapshotBand() {
  const [s, setS] = useState({ ...snapshotState });
  useEffect(() => {
    const on = (e) => setS(e.detail);
    window.addEventListener('rb-snapshot', on);
    return () => window.removeEventListener('rb-snapshot', on);
  }, []);
  useEffect(() => { document.documentElement.classList.toggle('rb-snap-on', s.on); }, [s.on]);
  if (!s.on) return null;
  const d = s.date ? s.date.split('-').map(Number).join('. ') + '.' : '';
  return <div className="rb-snapband" role="status" data-figma="snapshot-band">{u.Snap_band(d)}</div>;
}

export function Masthead() {
  return (
    <>
      <a className="rb-skip" href="#main">{t.Header_skip}</a>
      <div className="rb-sysband" data-figma="system-band">
        <span>{u.Sys_band} ( {u.Sys_bandBoard} <a href={`https://${u.Sys_bandBoardUrl}`} {...newWindow(u.Sys_bandBoard)}>{u.Sys_bandBoardUrl}</a> )</span>
      </div>
      <SnapshotBand />
    </>
  );
}
