// 시험용 상태 보기: 개발 모드에서만 주소 ?state=Min|Max|Empty|Loading|Error 로 Figma 상태 프레임과 같은 상태를 띄운다.
// 배포본(import.meta.env.DEV === false)에서는 항상 null이라 동작하지 않는다.
// Min, Max 자료는 실제 응답을 바탕으로 칸만 비우거나 늘린다(가짜 기관이나 수치를 새로 만들지 않는다).
export function devState() {
  if (!import.meta.env.DEV) return null;
  const s = new URLSearchParams(window.location.search).get('state');
  return ['Min', 'Max', 'Empty', 'Loading', 'Error'].includes(s) ? s : null;
}

const LONG = ' 업무 처리 기준과 서식을 함께 확인할 수 있도록 설명을 길게 적은 경우의 표시 시험 문장입니다.';

/** 목록 항목 하나를 Min(필수 칸만) 또는 Max(칸마다 길게)로 바꾼다 */
export function shapeItem(item, mode) {
  if (mode === 'Min') return { id: item.id, name: item.name, last: item.last };
  if (mode === 'Max') {
    return {
      ...item,
      name: `${item.name} ${item.name} ${item.name}`,
      description: (item.description || item.name) + LONG + LONG,
      organization: `${item.organization || ''} 기획조정실 정보화담당관 데이터정책팀`.trim(),
      topics: [...(item.topics || []), '문서', '자동화', '엑셀', '민원', '회계', '인사', '교육'],
    };
  }
  return item;
}

/** {data:{items}} 모양 응답에 상태를 입힌다 */
export function shapeList(response, mode) {
  if (!mode || !response?.data?.items) return response;
  if (mode === 'Empty') return { ...response, data: { ...response.data, items: [], total: 0 } };
  if (mode === 'Min' || mode === 'Max') return { ...response, data: { ...response.data, items: response.data.items.map((i) => shapeItem(i, mode)) } };
  return response;
}

/** 자료가 있는 상태(Ideal, Min, Max) */
export const hasData = (state) => state === 'Ideal' || state === 'Min' || state === 'Max';
