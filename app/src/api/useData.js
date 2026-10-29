import { useEffect, useState } from 'react';
import { devState, shapeList } from './devState';

/**
 * 데이터 상태(PRD 6.3): Loading, Ideal, Min, Max, Empty, Error.
 * isEmpty로 Empty 판단 기준을 화면이 정한다. shape는 시험용 상태 보기(개발 모드 ?state=)에서 자료를 바꾸는 함수(기본: 목록 모양).
 */
export function useData(load, deps, isEmpty = () => false, shape = shapeList) {
  const [result, setResult] = useState({ state: 'Loading' });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let live = true;
    const forced = devState();
    setResult({ state: 'Loading' });
    if (forced === 'Loading') return () => { live = false; };
    const run = forced === 'Error' ? Promise.reject(new Error('시험용 오류 상태')) : load();
    run
      .then((raw) => {
        if (!live) return;
        const data = forced ? shape(raw, forced) : raw;
        setResult({ state: isEmpty(data) ? 'Empty' : forced === 'Min' || forced === 'Max' ? forced : 'Ideal', data });
      })
      .catch((error) => live && setResult({ state: 'Error', error: error.message, status: error.status }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  return { ...result, retry: () => setVersion((v) => v + 1) };
}
