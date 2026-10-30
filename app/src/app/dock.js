// 도킹 패널(D-18 4장) 열림 상태를 앱 전체가 나눠 쓴다. 패널 자리는 App이 만들고, 내용은 화면이 포털로 채운다.
import { createContext, useContext } from 'react';

export const DockContext = createContext({ open: false, setOpen: () => {}, slot: null, available: false });
export const useDock = () => useContext(DockContext);
