// R-27 새 파일과 편집, R-28 업로드, R-29 새 브랜치. GitHub의 쓰기 흐름 구성을 그대로 옮긴다.
// 시험판(정적 배포와 비로그인)에서는 마지막 단계에서 사실대로 알리고 저장하지 않는다.
import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { gitlab, STATIC_MODE as isStatic } from '../api/client';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import { FormField } from '../components/Input/FormField';
import { CommitDialog } from '../components/Write/CommitDialog';
import { Readme } from '../components/Help/Readme';
import { Icon } from '../components/Code/Icon';
import '../components/Write/write.css';

const SCREEN = { new: 'R-27', edit: 'R-27', upload: 'R-28', branch: 'R-29' };

/** 쓰기는 로그인과 서버가 있어야 한다. 시험판에서 왜 안 되는지 그대로 알린다. */
function Result({ kind, onClose }) {
  return (
    <div className="rb-modal-dim" role="presentation">
      <div className="rb-modal" role="dialog" aria-modal="true" aria-labelledby="write-result">
        <h2 id="write-result" className="krds-text-body-small-bold">{t.Write_cannotTitle}</h2>
        <p className="krds-text-body-small">{isStatic ? t.Write_cannotStatic : t.Write_cannotLogin}</p>
        <p className="krds-text-body-xsmall rb-subtle">{t.fn.writeKind(t[`Write_kind_${kind}`])}</p>
        <div className="rb-modal-actions">
          <button type="button" className="krds-btn small tertiary" onClick={onClose}>{t.Commit_cancel}</button>
          {!isStatic ? <Link className="krds-btn small primary" to={`/login?returnTo=${encodeURIComponent(window.location.pathname)}`}>{t.Header_login}</Link> : null}
        </div>
      </div>
    </div>
  );
}

function Editor({ value, onChange, path }) {
  const [view, setView] = useState('write');
  const markdown = /\.(md|markdown)$/i.test(path || '');
  return (
    <div className="rb-editor">
      <div className="rb-editor-tabs" role="tablist" aria-label={t.Write_editorLabel}>
        <button type="button" role="tab" aria-selected={view === 'write'} className={'rb-code-view' + (view === 'write' ? ' active' : '')} onClick={() => setView('write')}>{t.Write_write}</button>
        {markdown ? <button type="button" role="tab" aria-selected={view === 'preview'} className={'rb-code-view' + (view === 'preview' ? ' active' : '')} onClick={() => setView('preview')}>{t.P16_viewPreview}</button> : null}
      </div>
      {view === 'write' ? (
        <textarea
          className="krds-input rb-editor-area"
          aria-label={t.Write_content}
          value={value}
          spellCheck={false}
          onChange={(e) => onChange(e.target.value)}
        />
      ) : (
        <div className="rb-code-preview"><Readme source={value} /></div>
      )}
    </div>
  );
}

export default function Write({ mode }) {
  const { id } = useParams();
  const params = useParams();
  const [search] = useSearchParams();
  const navigate = useNavigate();
  const frame = useProject();
  const branch = search.get('ref') || frame.data?.project.default_branch || 'main';
  const editPath = (params['*'] || '').replace(/\/$/, '');
  const [name, setName] = useState(editPath);
  const [text, setText] = useState('');
  const [files, setFiles] = useState([]);
  const [branchName, setBranchName] = useState('');
  const [commitOpen, setCommitOpen] = useState(false);
  const [done, setDone] = useState(false);

  // 편집은 지금 내용을 먼저 불러온다(GitHub와 같게 원문을 보여 주고 고친다).
  useEffect(() => {
    if (mode !== 'edit' || !editPath) return;
    gitlab.fileRaw(id, editPath, branch).then((r) => setText(r.data ?? '')).catch(() => setText(''));
  }, [mode, id, editPath, branch]);

  if (!frame.data) return <ProjectFrame screenId={SCREEN[mode]} data={frame} />;
  const { project } = frame.data;
  const title = t[`Write_title_${mode}`];
  const canCommit = mode === 'upload' ? files.length > 0 : mode === 'branch' ? branchName.trim() : name.trim();

  const submit = () => {
    setCommitOpen(false);
    setDone(true);
  };

  return (
    <ProjectFrame screenId={SCREEN[mode]} tab="" tabLabel={title} data={frame} state="Ideal">
      <div className="rb-write">
        <div className="rb-write-head">
          <h2 className="krds-text-body-small-bold">{title}</h2>
          <p className="krds-text-body-xsmall rb-subtle">{t.fn.writeTarget(project.name, branch)}</p>
        </div>

        {mode === 'branch' ? (
          <>
            <FormField
              id="branch-name"
              label={t.Write_branchName}
              required
              value={branchName}
              onChange={(e) => setBranchName(e.target.value)}
              hint={t.Write_branchHint}
            />
            <p className="krds-text-body-xsmall rb-subtle">{t.fn.branchFrom(branch)}</p>
          </>
        ) : null}

        {mode === 'new' || mode === 'edit' ? (
          <>
            <FormField
              id="file-name"
              label={t.Write_fileName}
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
              hint={t.Write_fileNameHint}
              readOnly={mode === 'edit'}
            />
            <Editor value={text} onChange={setText} path={name} />
          </>
        ) : null}

        {mode === 'upload' ? (
          <div className="rb-upload">
            <label className="rb-upload-drop" htmlFor="upload-input">
              <Icon name="upload" />
              <span className="krds-text-body-small">{t.Write_uploadDrop}</span>
              <span className="krds-text-body-xsmall rb-subtle">{t.Write_uploadHint}</span>
              <input
                id="upload-input"
                type="file"
                multiple
                className="sr-only"
                onChange={(e) => setFiles([...e.target.files].map((f) => ({ name: f.name, size: f.size })))}
              />
            </label>
            {files.length ? (
              <ul className="rb-plain-list">
                {files.map((f, i) => (
                  <li className="rb-plain-row" key={f.name}>
                    <span className="rb-plain-main rb-ellipsis">{f.name}</span>
                    <button type="button" className="krds-btn xsmall text rb-plain-meta" onClick={() => setFiles(files.filter((_, k) => k !== i))}>{t.Write_removeFile}</button>
                  </li>
                ))}
              </ul>
            ) : null}
            <p className="krds-text-body-xsmall rb-subtle">{t.Write_uploadWarn}</p>
          </div>
        ) : null}

        <div className="rb-write-actions">
          <button type="button" className="krds-btn small tertiary" onClick={() => navigate(-1)}>{t.Commit_cancel}</button>
          <button type="button" className="krds-btn small primary" disabled={!canCommit} onClick={() => setCommitOpen(true)}>
            {mode === 'branch' ? t.Write_createBranch : t.Commit_open}
          </button>
        </div>
      </div>

      <CommitDialog
        open={commitOpen && mode !== 'branch'}
        branch={branch}
        defaultMessage={t[`Write_defaultMessage_${mode}`] || ''}
        onClose={() => setCommitOpen(false)}
        onSubmit={submit}
      />
      {commitOpen && mode === 'branch' ? <Result kind={mode} onClose={() => setCommitOpen(false)} /> : null}
      {done ? <Result kind={mode} onClose={() => setDone(false)} /> : null}
    </ProjectFrame>
  );
}
