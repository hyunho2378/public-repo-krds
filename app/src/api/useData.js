import { useEffect, useState } from 'react';
import { devState, shapeList } from './devState';

/**
 * 데이터 상태(PRD 6.3): Loading, Ideal, Min, Max, Empty, Error.
 * isEmpty로 Empty 판단 기준을 화면이 정한다. shape는 시험용 상태 보기(개발 모드 ?state=)에서 자료를 바꾸는 함수(기본: 목록 모양).
 */
const LIMIT_MS = 60000;

/** 자료 요청이 끝나지 않을 때 로딩에 머물지 않도록 제한 시간 뒤 오류로 넘긴다. */
function withLimit(promise) {
  let timer;
  const limit = new Promise((_, reject) => {
    timer = setTimeout(() => reject(Object.assign(new Error('응답 시간 초과'), { status: 408 })), LIMIT_MS);
  });
  return Promise.race([promise, limit]).finally(() => clearTimeout(timer));
}

export function useData(load, deps, isEmpty = () => false, shape = shapeList) {
  const [result, setResult] = useState({ state: 'Loading' });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    let live = true;
    const forced = devState();
    // 같은 화면에서 조건만 바뀌면(탭, 필터, 정렬, 쪽) 이전 내용을 그대로 두고 새 자료가 오면 바꾼다(화면이 비었다 채워지며 튀지 않게)
    setResult((prev) => (prev.data !== undefined && !forced ? { ...prev, refreshing: true } : { state: 'Loading' }));
    if (forced === 'Loading') return () => { live = false; };
    const run = forced === 'Error' ? Promise.reject(new Error('시험용 오류 상태')) : load();
    withLimit(run)
      .then((raw) => {
        if (!live) return;
        const data = forced ? shape(raw, forced) : raw;
        setResult({ state: isEmpty(data) ? 'Empty' : forced === 'Min' || forced === 'Max' ? forced : 'Ideal', data });
      })
      .catch((error) => live && setResult({ state: 'Error', error: error.message, status: error.status, code: error.code }));
    return () => {
      live = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [...deps, version]);

  return { ...result, retry: () => setVersion((v) => v + 1) };
}
