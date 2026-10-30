// 제작자 설명(README) 그리기는 Markdown.jsx. 이 파일은 README에서 명령과 구역만 뽑는 도우미(RunSteps, 사용 방법 화면)와 Readme 껍데기다.
import { Markdown } from './Markdown';
export function splitReadme(source) {
  const lines = (source || '').split(/\r?\n/);
  const text = [];
  const code = [];
  let inCode = false;
  for (const line of lines) {
    if (line.trim().startsWith('```')) {
      inCode = !inCode;
      continue;
    }
    (inCode ? code : text).push(line);
  }
  return { text, code };
}

/**
 * README에 적힌 명령만 뽑는다. 줄 번호를 함께 돌려줘 출처를 밝힌다(없는 명령을 만들지 않는다).
 * 돌려주는 값: [{ command, line, heading }]
 */
export function readmeCommands(source) {
  const lines = (source || '').split(/\r?\n/);
  const out = [];
  let inCode = false;
  let heading = '';
  for (let i = 0; i < lines.length; i += 1) {
    const line = lines[i];
    if (line.trim().startsWith('```')) { inCode = !inCode; continue; }
    if (!inCode && /^#{1,4}\s/.test(line)) { heading = line.replace(/^#+\s*/, '').trim(); continue; }
    if (!inCode) continue;
    const cmd = line.trim();
    if (!cmd || cmd.startsWith('#')) continue;
    out.push({ command: cmd, line: i + 1, heading });
  }
  return out;
}

export function sectionLines(source, pattern) {
  const out = [];
  let on = false;
  for (const line of splitReadme(source).text) {
    if (/^#{1,4}\s/.test(line)) on = pattern.test(line);
    if (on) out.push(line);
  }
  return out.join('\n');
}

/** README와 이슈 본문 그리기. base({ id, rawBase })가 있으면 저장소 안 그림과 링크가 열린다. */
export function Readme({ source, base }) {
  return <Markdown source={source} base={base} />;
}
