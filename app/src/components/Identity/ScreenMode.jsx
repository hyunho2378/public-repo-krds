// 화면 설정: 시스템 따르기, 밝은 화면, 어두운 화면(D-01), 선명한 화면 모드. 머리글 유틸리티와 모바일 메뉴 양쪽에서 쓴다.
import { t } from '../../copy/ko';
import { u } from '../../copy/ui';
import { FieldsetTitle } from '../Input/FieldsetTitle';
import { useEffect, useState } from 'react';

const MODES = [
  ['theme', t.ScreenMode_1],
  ['light', t.ScreenMode_2],
  ['dark', t.ScreenMode_3],
  ['high-contrast', t.ScreenMode_4],
];

const STORAGE_KEY = 'rb-screen-mode';

function applyMode(mode) {
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  const more = matchMedia('(prefers-contrast: more)').matches;
  const root = document.documentElement;
  root.dataset.krdsPreference = mode;
  root.dataset.krdsMode = mode === 'theme' ? (more ? 'high-contrast' : dark ? 'dark' : 'light') : mode;
}

// UX-007 1장: 기본은 어두운 화면이다. 저장된 값(localStorage)이 있으면 그가만, 주소 파라미터 mode가 가장 우선
// 개발 모드(?state=&auth=&role=&mode=) 비교용 주소는 저장하지 않는다
function initialMode() {
  const fromUrl = new URLSearchParams(location.search).get('mode');
  if (fromUrl) return fromUrl;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) return saved;
  } catch { /* 개인정보보호모드등은 무시 */ }
  return 'dark';
}

export function useScreenMode() {
  const [mode, setModeState] = useState(initialMode);
  const fromUrl = typeof location !== 'undefined' && new URLSearchParams(location.search).get('mode');
  const setMode = (next) => {
    setModeState(next);
    if (!fromUrl) {
      try { localStorage.setItem(STORAGE_KEY, next); } catch { /* 무시 */ }
    }
  };
  useEffect(() => {
    applyMode(mode);
    const queries = [matchMedia('(prefers-color-scheme: dark)'), matchMedia('(prefers-contrast: more)')];
    const listener = () => applyMode(mode);
    queries.forEach((q) => q.addEventListener('change', listener));
    return () => queries.forEach((q) => q.removeEventListener('change', listener));
  }, [mode]);
  return [mode, setMode];
}

// D-14 끝절: 이용자 글자 크기(보통, 크게). 기본은 보통이고, 고른 값은 기억한다. 크게는 html 클래스로 layout.tokens.css가 받는다.
const SIZE_KEY = 'rb-font-size';
const SIZE_EVENT = 'rb-font-size-change';

function applySize(size) {
  document.documentElement.classList.toggle('rb-font-large', size === 'large');
}

function initialSize() {
  try {
    return localStorage.getItem(SIZE_KEY) === 'large' ? 'large' : 'normal';
  } catch { return 'normal'; }
}

// 화면이 처음 그려지기 전에 저장된 크기를 적용한다
if (typeof document !== 'undefined') applySize(initialSize());

export function useFontSize() {
  const [size, setSizeState] = useState(initialSize);
  useEffect(() => {
    const on = (e) => setSizeState(e.detail);
    window.addEventListener(SIZE_EVENT, on);
    return () => window.removeEventListener(SIZE_EVENT, on);
  }, []);
  const setSize = (next) => {
    try { localStorage.setItem(SIZE_KEY, next); } catch { /* 무시 */ }
    applySize(next);
    window.dispatchEvent(new CustomEvent(SIZE_EVENT, { detail: next }));
  };
  return [size, setSize];
}

const SIZES = [['normal', u.Font_normal], ['large', u.Font_large]];

export function ScreenModeOptions({ name, mode, setMode }) {
  const [size, setSize] = useFontSize();
  return (
    <>
    <fieldset className="rb-mode-options">
      <FieldsetTitle className="krds-text-body-small-bold">{t.Header_6}</FieldsetTitle>
      {MODES.map(([value, label]) => (
        <div className="krds-form-check" key={value}>
          <input type="radio" name={name} id={`${name}-${value}`} checked={mode === value} onChange={() => setMode(value)} />
          <label htmlFor={`${name}-${value}`}>{label}</label>
        </div>
      ))}
    </fieldset>
    <fieldset className="rb-mode-options">
      <FieldsetTitle className="krds-text-body-small-bold">{u.Font_title}</FieldsetTitle>
      {SIZES.map(([value, label]) => (
        <div className="krds-form-check" key={value}>
          <input type="radio" name={name + '-size'} id={`${name}-size-${value}`} checked={size === value} onChange={() => setSize(value)} />
          <label htmlFor={`${name}-size-${value}`}>{label}</label>
        </div>
      ))}
    </fieldset>
    </>
  );
}
