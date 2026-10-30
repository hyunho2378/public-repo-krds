// D-22 토스트: 작업 결과 알림(복사 등)을 오른쪽 아래에 4초 보인다. 어디서나 toast('문구')로 부른다. 화면 낭독기에는 role=status로 읽힌다.
import { useEffect, useState } from 'react';

const EVENT = 'rb-toast';
export function toast(text) {
  window.dispatchEvent(new CustomEvent(EVENT, { detail: text }));
}

export function Toasts() {
  const [list, setList] = useState([]);
  useEffect(() => {
    let n = 0;
    const on = (e) => {
      const id = ++n;
      setList((l) => [...l.slice(-2), { id, text: e.detail }]);
      setTimeout(() => setList((l) => l.filter((x) => x.id !== id)), 4000);
    };
    window.addEventListener(EVENT, on);
    return () => window.removeEventListener(EVENT, on);
  }, []);
  return (
    <div className="rb-toasts" role="status" aria-live="polite">
      {list.map((x) => <div key={x.id} className="rb-toast">{x.text}</div>)}
    </div>
  );
}
