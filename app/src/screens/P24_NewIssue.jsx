// R-12 새 이슈와 R-17 새 변경 제안. 공공 깃랩과 GitHub의 작성 양식을 그대로 옮긴다.
// 이슈는 제목과 설명(작성/미리보기 전환, 서식 도구), 변경 제안은 비교(어디로 → 어디서)와 양식.
// 시험판에서는 마지막 단계에서 사실대로 알리고 저장하지 않는다.
import { useEffect, useState } from 'react';
import { Link, useParams, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab, STATIC_MODE as isStatic } from '../api/client';
import { useData } from '../api/useData';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { FormField } from '../components/Input/FormField';
import { Readme } from '../components/Help/Readme';
import { Status } from '../components/Feedback/Status';
import { day } from './parts/repoCommon';
import '../components/Write/write.css';

/** 마크다운 서식 도구. GitHub 작성 칸 위 도구 모음과 같은 기능만 둔다. */
const TOOLS = [
  ['heading', '### ', ''],
  ['bold', '**', '**'],
  ['italic', '_', '_'],
  ['code', '`', '`'],
  ['link', '[', `](${t.Issue_linkPlaceholder})`],
  ['bullet', '- ', ''],
  ['numbered', '1. ', ''],
  ['quote', '> ', ''],
  ['task', '- [ ] ', ''],
];

function MarkdownField({ id, label, value, onChange, required, hint }) {
  const [view, setView] = useState('write');
  const wrap = (before, after) => {
    const el = document.getElementById(id);
    if (!el) return;
    const { selectionStart: a, selectionEnd: b } = el;
    const next = value.slice(0, a) + before + value.slice(a, b) + after + value.slice(b);
    onChange(next);
    requestAnimationFrame(() => {
      el.focus();
      el.setSelectionRange(a + before.length, b + before.length);
    });
  };
  return (
    <div className="rb-md-field">
      <div className="rb-editor-tabs" role="tablist" aria-label={t.Write_editorLabel}>
        <button type="button" role="tab" aria-selected={view === 'write'} className={'rb-code-view' + (view === 'write' ? ' active' : '')} onClick={() => setView('write')}>{t.Write_write}</button>
        <button type="button" role="tab" aria-selected={view === 'preview'} className={'rb-code-view' + (view === 'preview' ? ' active' : '')} onClick={() => setView('preview')}>{t.P16_viewPreview}</button>
      </div>
      {view === 'write' ? (
        <>
          <div className="rb-md-tools" role="toolbar" aria-label={t.Issue_toolbar}>
            {TOOLS.map(([key, before, after]) => (
              <button key={key} type="button" className="krds-btn xsmall text" onClick={() => wrap(before, after)}>{t.Issue_tool[key]}</button>
            ))}
          </div>
          <FormField id={id} label={label} required={required} hint={hint} multiline value={value} onChange={(e) => onChange(e.target.value)} />
        </>
      ) : (
        <div className="rb-code-preview"><Readme source={value || t.Issue_nothingToPreview} /></div>
      )}
    </div>
  );
}

function Result({ kind, onClose }) {
  return (
    <div className="rb-modal-dim" role="presentation">
      <div className="rb-modal" role="dialog" aria-modal="true" aria-labelledby="issue-result">
        <h2 id="issue-result" className="krds-text-body-small-bold">{t.Write_cannotTitle}</h2>
        <p className="krds-text-body-small">{isStatic ? t.Write_cannotStatic : t.Write_cannotLogin}</p>
        <p className="krds-text-body-small rb-subtle">{t.fn.writeKind(kind)}</p>
        <div className="rb-modal-actions">
          <button type="button" className="krds-btn medium tertiary" onClick={onClose}>{t.Commit_cancel}</button>
          {!isStatic ? <Link className="krds-btn medium primary" to={`/login?returnTo=${encodeURIComponent(window.location.pathname)}`}>{t.Header_login}</Link> : null}
        </div>
      </div>
    </div>
  );
}

export default function NewIssue({ kind = 'issue' }) {
  const { id } = useParams();
  const [search] = useSearchParams();
  const frame = useProject();
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [source, setSource] = useState(search.get('source') || '');
  const [target, setTarget] = useState('');
  const [done, setDone] = useState(false);

  const branches = useData(async () => (await gitlab.branches(id)).data, [id]);
  useEffect(() => {
    const list = branches.data;
    if (!list?.length) return;
    const def = frame.data?.project.default_branch || 'main';
    setTarget((v) => v || def);
    setSource((v) => v || list.find((b) => b.name !== def)?.name || def);
  }, [branches.data, frame.data]);

  // 변경 제안은 고른 두 지점의 차이를 미리 보여 준다(GitHub 비교 화면과 같다).
  const compare = useData(
    async () => (kind === 'merge' && source && target && source !== target
      ? (await gitlab.compare(id, target, source)).data
      : null),
    [kind, id, source, target],
  );

  if (!frame.data) return <ProjectFrame screenId={kind === 'merge' ? 'R-16' : 'R-11'} data={frame} />;
  const list = branches.data || [];
  const screenTitle = kind === 'merge' ? t.Issue_newMerge : t.Issue_newIssue;
  const diffs = compare.data?.diffs || [];

  return (
    <ProjectFrame screenId={kind === 'merge' ? 'R-16' : 'R-11'} tab="" tabLabel={screenTitle} data={frame} state="Ideal">
      <div className="rb-write">
        <h2 className="krds-text-body-small-bold">{screenTitle}</h2>

        {kind === 'merge' ? (
          <section className="rb-compare-pick" aria-label={t.Issue_comparePick}>
            <div className="krds-form-check rb-compare-field">
              <label className="krds-text-body-small-bold" htmlFor="mr-target">{t.Issue_into}</label>
              <ul className="rb-branch-pick" id="mr-target">
                {list.map((b) => (
                  <li key={b.name}>
                    <button type="button" className={'krds-btn xsmall ' + (target === b.name ? 'primary' : 'tertiary')} onClick={() => setTarget(b.name)}>{b.name}</button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="krds-form-check rb-compare-field">
              <label className="krds-text-body-small-bold" htmlFor="mr-source">{t.Issue_from}</label>
              <ul className="rb-branch-pick" id="mr-source">
                {list.map((b) => (
                  <li key={b.name}>
                    <button type="button" className={'krds-btn xsmall ' + (source === b.name ? 'primary' : 'tertiary')} onClick={() => setSource(b.name)}>{b.name}</button>
                  </li>
                ))}
              </ul>
            </div>
            {source === target ? (
              <p className="krds-text-body-small rb-subtle">{t.Issue_sameBranch}</p>
            ) : compare.state === 'Loading' ? (
              <Status {...compare} />
            ) : (
              <p className="krds-text-body-small rb-subtle">{t.fn.compareSummary(compare.data?.commits?.length || 0, diffs.length)}</p>
            )}
            {diffs.length ? (
              <ul className="rb-plain-list">
                {diffs.slice(0, 20).map((d) => (
                  <li className="rb-plain-row" key={d.new_path}>
                    <span className="rb-plain-main rb-ellipsis">{d.new_path}</span>
                    <span className="rb-plain-meta rb-subtle">{d.new_file ? t.Issue_added : d.deleted_file ? t.Issue_deleted : t.Issue_changed}</span>
                  </li>
                ))}
              </ul>
            ) : null}
          </section>
        ) : null}

        <FormField id="issue-title" label={t.Issue_titleLabel} required value={title} onChange={(e) => setTitle(e.target.value)} hint={t.Issue_titleHint} />
        <MarkdownField id="issue-body" label={t.Issue_bodyLabel} value={body} onChange={setBody} hint={t.Issue_bodyHint} />

        <div className="rb-write-actions">
          <Link className="krds-btn medium tertiary" to={`/projects/${id}/${kind === 'merge' ? 'merge-requests' : 'issues'}`}>{t.Commit_cancel}</Link>
          <button type="button" className="krds-btn medium primary" disabled={!title.trim()} onClick={() => setDone(true)}>
            {kind === 'merge' ? t.Issue_submitMerge : t.Issue_submitIssue}
          </button>
        </div>
        {kind === 'issue' && frame.data.project.created_at ? (
          <p className="krds-text-body-small rb-subtle">{t.fn.issueSince(day(frame.data.project.created_at))}</p>
        ) : null}
      </div>
      {done ? <Result kind={screenTitle} onClose={() => setDone(false)} /> : null}
    </ProjectFrame>
  );
}
