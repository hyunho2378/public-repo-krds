// 내려받기 메뉴. GitHub Code 버튼과 같은 자리. 공통 Menu 부품을 쓴다(UX-007 12장).
import { useState } from 'react';
import { t } from '../../copy/ko';
import { Icon } from './Icon';
import { Menu } from '../Navigation/Menu';

export function DownloadMenu({ zipUrl, cloneUrl }) {
  const [note, setNote] = useState('');
  const copy = async (close) => {
    await navigator.clipboard.writeText(cloneUrl);
    setNote(t.P16_cloneCopied);
    close();
  };
  return (
    <>
      <Menu label={t.P16_menu} btnClass="krds-btn small primary rb-drop-btn" button={<><Icon name="download" /><span className="rb-drop-full">{t.P16_menu}</span></>}>
        {(close) => (
          <ul>
            <li><a className="item-link" href={zipUrl}><span>{t.P16_download}</span></a></li>
            {cloneUrl ? <li><button type="button" className="item-link" onClick={() => copy(close)}><span>{t.P16_cloneCopy}</span></button></li> : null}
          </ul>
        )}
      </Menu>
      <p className="sr-only" role="status" aria-live="polite">{note}</p>
    </>
  );
}
