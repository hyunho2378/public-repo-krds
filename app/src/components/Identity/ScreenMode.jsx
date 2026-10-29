// 화면 설정: 시스템 따르기, 밝은 화면, 어두운 화면(D-01), 선명한 화면 모드. 머리글 유틸리티와 모바일 메뉴 양쪽에서 쓴다.
import { t } from '../../copy/ko';
import { FieldsetTitle } from '../Input/FieldsetTitle';
import { useEffect, useState } from 'react';

const MODES = [
  ['theme', t.ScreenMode_1],
  ['light', t.ScreenMode_2],
  ['dark', t.ScreenMode_3],
  ['high-contrast', t.ScreenMode_4],
];

function applyMode(mode) {
  const dark = matchMedia('(prefers-color-scheme: dark)').matches;
  const more = matchMedia('(prefers-contrast: more)').matches;
  const root = document.documentElement;
  root.dataset.krdsPreference = mode;
  root.dataset.krdsMode = mode === 'theme' ? (more ? 'high-contrast' : dark ? 'dark' : 'light') : mode;
}

export function useScreenMode() {
  const [mode, setMode] = useState(() => new URLSearchParams(location.search).get('mode') || document.documentElement.dataset.krdsPreference || 'theme');
  useEffect(() => {
    applyMode(mode);
    const queries = [matchMedia('(prefers-color-scheme: dark)'), matchMedia('(prefers-contrast: more)')];
    const listener = () => applyMode(mode);
    queries.forEach((q) => q.addEventListener('change', listener));
    return () => queries.forEach((q) => q.removeEventListener('change', listener));
  }, [mode]);
  return [mode, setMode];
}

export function ScreenModeOptions({ name, mode, setMode }) {
  return (
    <fieldset className="rb-mode-options">
      <FieldsetTitle className="krds-text-body-small-bold">{t.Header_6}</FieldsetTitle>
      {MODES.map(([value, label]) => (
        <div className="krds-form-check" key={value}>
          <input type="radio" name={name} id={`${name}-${value}`} checked={mode === value} onChange={() => setMode(value)} />
          <label htmlFor={`${name}-${value}`}>{label}</label>
        </div>
      ))}
    </fieldset>
  );
}
