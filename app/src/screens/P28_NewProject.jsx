// G-04 새 프로젝트 만들기. 공공 깃랩 /projects/new, GitHub /new 양식을 그대로 옮긴다.
// 이름, 주소 경로, 설명, 공개 범위, 처음 파일(README, .gitignore, 라이선스).
// 만들기 전에 비슷한 도구가 있는지 먼저 보여 준다(F-04). 시험판에서는 마지막 단계에서 사실대로 알린다.
import { useEffect, useState } from 'react';
import { cleanDescription } from '../components/Layout/description';
import { Link } from 'react-router-dom';
import { t } from '../copy/ko';
import { product, STATIC_MODE as isStatic } from '../api/client';
import { Page } from '../components/Layout/Page';
import { FormField } from '../components/Input/FormField';
import { cardValue, loadCards } from '../api/cards';
import { newWindow } from '../components/Layout/newWindow';
import '../components/Write/write.css';

/** 이름에서 주소 경로를 만든다(GitLab과 같은 규칙: 소문자, 공백은 -). */
function toPath(name) {
  return String(name)
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9가-힣\s-]/g, '')
    .replace(/\s+/g, '-')
    .slice(0, 60);
}

export default function NewProject() {
  const [name, setName] = useState('');
  const [path, setPath] = useState('');
  const [desc, setDesc] = useState('');
  const [visibility, setVisibility] = useState('public');
  const [initReadme, setInitReadme] = useState(true);
  const [similar, setSimilar] = useState([]);
  const [done, setDone] = useState(false);

  useEffect(() => setPath(toPath(name)), [name]);

  // F-04 비슷한 도구 안내. 이름을 적는 동안 먼저 보여 준다.
  useEffect(() => {
    const q = name.trim();
    if (q.length < 2) {
      setSimilar([]);
      return undefined;
    }
    const timer = setTimeout(async () => {
      try {
        // UX/14 4: 소개 카드 자료가 있으면 이름과 하는 일로 비슷한 프로젝트 3개, 없으면 검색 색인
        const cards = await loadCards();
        const hits = cards ? cards.similarToName(`${q} ${desc}`, 3) : [];
        if (hits.length) {
          setSimilar(hits.map((c) => ({ id: c.id, name: c.name, description: cardValue(c.oneLine) || '', organization: cardValue(c.org) || '', owner: c.url ? c.url.replace(/\/[^/]+$/, '') : null })));
        } else {
          const res = await product.post('/duplicates', { name: q, description: desc });
          setSimilar(res.data?.items?.slice(0, 3) || []);
        }
      } catch {
        setSimilar([]);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [name, desc]);

  return (
    <Page id="G-05" title={t.NewProject_title} state="Ideal">
      <div className="rb-write rb-narrow">
        <div className="rb-write-head">
          <h1 className="krds-text-heading-small" data-figma="page-head">{t.NewProject_title}</h1>
          <p className="krds-text-body-xsmall rb-subtle">{t.NewProject_hint}</p>
        </div>

        <FormField id="np-name" label={t.NewProject_name} required value={name} onChange={(e) => setName(e.target.value)} hint={t.NewProject_nameHint} />

        {similar.length ? (
          <section className="rb-compare-pick" aria-labelledby="np-similar" data-figma="extra-similar">
            <h2 id="np-similar" className="krds-text-body-small-bold">{t.NewProject_similar}</h2>
            <p className="krds-text-body-xsmall rb-subtle">{t.NewProject_similarHint}</p>
            <ul className="rb-plain-list">
              {similar.map((p) => (
                <li className="rb-plain-row" key={p.id}>
                  <Link className="rb-plain-main krds-link" to={`/projects/${p.id}`}>{p.name}</Link>
                  <span className="rb-plain-sub rb-subtle rb-ellipsis">{cleanDescription(p.description)}</span>
                  <span className="rb-plain-meta rb-subtle">{p.owner ? <a className="rb-plain-link" href={p.owner} {...newWindow(p.organization || p.name)}>{p.organization || ''}</a> : p.organization || ''}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <FormField id="np-path" label={t.NewProject_path} required value={path} onChange={(e) => setPath(e.target.value)} hint={t.NewProject_pathHint} />
        <FormField id="np-desc" label={t.NewProject_desc} multiline value={desc} onChange={(e) => setDesc(e.target.value)} hint={t.NewProject_descHint} />

        <fieldset className="rb-commit-target">
          <legend className="krds-text-body-small-bold">{t.NewProject_visibility}</legend>
          <div className="krds-form-check">
            <input id="np-public" type="radio" name="np-visibility" checked={visibility === 'public'} onChange={() => setVisibility('public')} aria-describedby="np-public-hint" />
            <label htmlFor="np-public">{t.NewProject_public}</label>
          </div>
          <p id="np-public-hint" className="rb-side-hint">{t.NewProject_publicHint}</p>
          <div className="krds-form-check">
            <input id="np-private" type="radio" name="np-visibility" checked={visibility === 'private'} onChange={() => setVisibility('private')} aria-describedby="np-private-hint" />
            <label htmlFor="np-private">{t.NewProject_private}</label>
          </div>
          <p id="np-private-hint" className="rb-side-hint">{t.NewProject_privateHint}</p>
        </fieldset>

        <div className="krds-form-check">
          <input id="np-readme" type="checkbox" checked={initReadme} onChange={(e) => setInitReadme(e.target.checked)} aria-describedby="np-readme-hint" />
          <label htmlFor="np-readme">{t.NewProject_readme}</label>
        </div>
        <p id="np-readme-hint" className="rb-side-hint">{t.NewProject_readmeHint}</p>

        <div className="rb-write-actions">
          <Link className="krds-btn small tertiary" to="/">{t.Commit_cancel}</Link>
          <button type="button" className="krds-btn small primary" disabled={!name.trim() || !path.trim()} onClick={() => setDone(true)}>{t.NewProject_create}</button>
        </div>
        <p className="krds-text-body-xsmall rb-subtle">
          <Link className="krds-link" to="/publish">{t.NewProject_toPublish}</Link>
        </p>
      </div>

      {done ? (
        <div className="rb-modal-dim" role="presentation">
          <div className="rb-modal" role="dialog" aria-modal="true" aria-labelledby="np-result">
            <h2 id="np-result" className="krds-text-body-small-bold">{t.Write_cannotTitle}</h2>
            <p className="krds-text-body-small">{isStatic ? t.Write_cannotStatic : t.Write_cannotLogin}</p>
            <p className="krds-text-body-xsmall rb-subtle">{t.fn.writeKind(t.NewProject_title)}</p>
            <div className="rb-modal-actions">
              <button type="button" className="krds-btn small tertiary" onClick={() => setDone(false)}>{t.Commit_cancel}</button>
              {!isStatic ? <Link className="krds-btn small primary" to="/login?returnTo=%2Fprojects%2Fnew">{t.Header_login}</Link> : null}
            </div>
          </div>
        </div>
      ) : null}
    </Page>
  );
}
