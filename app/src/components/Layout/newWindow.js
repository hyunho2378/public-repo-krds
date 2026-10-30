// 새 창으로 열리는 링크 속성(UX-007 12장). 외부 링크 아이콘은 쓰지 않는다. 새 창임은 aria-label로만 알린다.
import { u } from '../../copy/ui';

export const newWindow = (label) => ({ target: '_blank', rel: 'noopener noreferrer', 'aria-label': `${label}, ${u.Ext_newWindow}` });
