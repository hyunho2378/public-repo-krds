// 지금 보고 있는 프로젝트를 전역 왼쪽 메뉴에 알린다(공공 깃랩처럼 사이드바가 프로젝트 메뉴로 바뀐다).
// 화면 안쪽(ProjectFrame)에서 바깥(App)으로 올려야 해서 React 문맥 대신 작은 저장소를 쓴다.
import { useSyncExternalStore } from 'react';

let current = null;
const listeners = new Set();

export function setProjectNav(next) {
  const same = current?.id === next?.id && current?.name === next?.name && current?.issues === next?.issues;
  if (same) return;
  current = next;
  listeners.forEach((fn) => fn());
}

export function useProjectNav() {
  return useSyncExternalStore(
    (fn) => {
      listeners.add(fn);
      return () => listeners.delete(fn);
    },
    () => current,
    () => null,
  );
}
