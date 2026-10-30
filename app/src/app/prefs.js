// 이용자별 화면 선택 기억(D-17 5장). localStorage는 이 파일과 화면 모드(ScreenMode.jsx)에서만 쓴다(audit:code 예외).
// 값 없음은 null이라 호출하는 쪽이 화면 종류와 폭으로 기본값을 정한다.
import { useEffect, useState } from 'react';

export function readPref(key) {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function writePref(key, value) {
  try {
    localStorage.setItem(key, value);
  } catch {
    /* 저장이 막힌 브라우저는 이번 화면에서만 적용한다 */
  }
}

/** layout.tokens.css의 단위 없는 폭 변수(예: --rb-bp-side-open)를 읽는다. */
export function breakpoint(name) {
  return Number.parseInt(getComputedStyle(document.documentElement).getPropertyValue(name), 10);
}

/** 화면 폭이 min 이상이면 true. 폭이 바뀌면 다시 계산한다. */
export function useMinWidth(min) {
  const query = `(min-width: ${min}px)`;
  const [matches, setMatches] = useState(() => matchMedia(query).matches);
  useEffect(() => {
    const mq = matchMedia(query);
    const on = () => setMatches(mq.matches);
    mq.addEventListener('change', on);
    on();
    return () => mq.removeEventListener('change', on);
  }, [query]);
  return matches;
}

/** 저장된 값이 있으면 그것, 없으면 기본값. 바꾸면 저장한다. 값은 '1'(true) 또는 '0'(false). */
export function useBoolPref(key, fallback) {
  const [saved, setSaved] = useState(() => readPref(key));
  useEffect(() => { setSaved(readPref(key)); }, [key]);
  const value = saved === null ? fallback : saved === '1';
  const set = (next) => {
    writePref(key, next ? '1' : '0');
    setSaved(next ? '1' : '0');
  };
  return [value, set];
}
