import { useEffect, useState } from 'react';

/**
 * 데이터 상태(PRD 6.3): Loading, Ideal, Empty, Error.
 * isEmpty로 Empty 판단 기준을 화면이 정한다.
 */
export function useData(load, deps, isEmpty = () => false) {
  const [result, setResult] = useState({ state: 'Loading' });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let live = true;
    setResult({ state: 'Loading' });
    load()
      .then((data) => live && setResult({ state: isEmpty(data) ? 'Empty' : 'Ideal', data }))
      .catch((error) => live && setResult({ state: 'Error', error: error.message, status: error.status }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  return { ...result, retry: () => setVersion((v) => v + 1) };
}
