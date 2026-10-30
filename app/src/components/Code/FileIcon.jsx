// 공공 깃랩과 같은 파일 종류 아이콘(@gitlab/svgs file_icons, MIT). 원본 색 그대로(D-15 팔레트 예외: app/public/icons/file/만).
// 크기 16, 글자 줄 가운데. 폴더는 확장 folder 아이콘(Icon name="ext/folder")을 쓴다.
import { fileIconName } from '../../lib/fileIcon';

const BASE = import.meta.env.BASE_URL || '/';

export function FileIcon({ name, label }) {
  const icon = fileIconName(name);
  return <img className="rb-file-icon" src={`${BASE}icons/file/${icon}.svg`} width="16" height="16" alt={label || ''} aria-hidden={label ? undefined : true} data-icon={icon} loading="lazy" />;
}
