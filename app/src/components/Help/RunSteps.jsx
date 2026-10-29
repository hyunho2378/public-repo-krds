// R-30 따라 하기. README에 실제로 적힌 명령만 단계로 만든다.
// 명령을 지어내지 않는다. 단계마다 README 몇 행에서 가져왔는지 밝힌다.
import { useState } from 'react';
import { t } from '../../copy/ko';
import { readmeCommands } from './Readme';
import { Icon } from '../Code/Icon';

/** 첫 단계는 내려받기(저장소 주소). 그다음은 README 명령을 제목 묶음 순서대로. */
export function buildSteps(readme, cloneUrl) {
  const steps = [];
  if (cloneUrl) {
    steps.push({ title: t.Run_download, hint: t.Run_downloadHint, command: cloneUrl, source: t.Run_sourceRepo });
  }
  const seen = new Set();
  let lastHeading = '';
  for (const c of readmeCommands(readme)) {
    if (seen.has(c.command) || steps.length >= 6) continue;
    seen.add(c.command);
    // 같은 묶음이 이어지면 제목을 되풀이하지 않는다
    const title = c.heading && c.heading !== lastHeading ? c.heading : t.Run_command;
    lastHeading = c.heading || lastHeading;
    steps.push({
      title,
      hint: '',
      command: c.command,
      source: t.fn.readmeLine(c.line),
    });
  }
  return steps;
}

function Copy({ value }) {
  const [done, setDone] = useState(false);
  return (
    <button
      type="button"
      className="rb-run-copy"
      onClick={async () => { await navigator.clipboard.writeText(value); setDone(true); }}
    >
      <Icon name="copy" />
      <span className="sr-only">{done ? t.P16_copied : t.P16_copy}</span>
    </button>
  );
}

export function RunSteps({ readme, cloneUrl }) {
  const steps = buildSteps(readme, cloneUrl);
  if (!steps.length) return null;
  return (
    <section className="rb-run" aria-labelledby="run-title">
      <div className="rb-run-head">
        <h3 id="run-title" className="krds-text-heading-small">{t.Run_title}</h3>
        <p className="krds-text-body-small rb-subtle">{t.Run_from}</p>
      </div>
      <ol className="rb-run-list">
        {steps.map((s, i) => (
          <li key={s.command}>
            <p className="krds-text-body-medium-bold">{t.fn.stepNo(i + 1)} {s.title}</p>
            {s.hint ? <p className="krds-text-body-small rb-subtle">{s.hint}</p> : null}
            <div className="rb-run-cmd">
              <code>{s.command}</code>
              <Copy value={s.command} />
            </div>
            <p className="krds-text-body-small rb-subtle">{s.source}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
