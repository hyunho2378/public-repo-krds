// A-04 운영 현황판, A-08 단계별 개발 점검표, A-05 법령과 기준 변경 알림, A-06 MCP 안내, A-07 인수인계 문서.
// GitHub Insights와 알림 목록 배치를 따르고, 자료는 서버 기능에서 받는다.
// 연결되지 않은 외부 자료는 그대로 "연결되지 않음"으로 보여 준다(없는 수치를 만들지 않는다).
import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { t } from '../copy/ko';
import { product } from '../api/client';
import { useData } from '../api/useData';
import { Page } from '../components/Layout/Page';
import { EmptyState, Status } from '../components/Feedback/Status';
import { ProjectFrame, useProject } from '../components/Layout/ProjectFrame';
import '../components/Write/write.css';
import '../components/Code/code.css';

/** A-04 운영 현황판: 분야별, 기관별 분포와 중복이 많은 분야. */
export function Insights() {
  const map = useData(async () => (await product.get('/coverage-map')).data, []);
  const orgs = useData(async () => (await product.get('/organizations')).data, []);
  const rows = map.data?.fields || [];
  const orgRows = orgs.data?.items || orgs.data || [];
  const max = Math.max(1, ...rows.map((r) => r.count || 0));
  return (
    <Page id="A-06" title={t.Insights_title} state={rows.length ? 'Ideal' : map.state}>
      <div className="rb-write">
        <div className="rb-write-head">
          <h1 className="krds-text-heading-small" data-figma="section-title">{t.Insights_title}</h1>
          <p className="krds-text-body-xsmall rb-subtle">{t.Insights_hint}</p>
        </div>
        {!rows.length ? <Status {...map} /> : (
          <section aria-labelledby="field-dist">
            <h2 id="field-dist" className="krds-text-body-small-bold">{t.Insights_byField}</h2>
            <ul className="rb-bars">
              {rows.map((r) => (
                <li key={r.name}>
                  <span className="rb-bar-label">{r.name}</span>
                  <span className="rb-bar"><span className="rb-bar-fill" style={{ inlineSize: `${Math.round((r.count / max) * 100)}%` }} /></span>
                  <span className="rb-bar-count rb-subtle">{t.fn.items(r.count)}</span>
                </li>
              ))}
            </ul>
            {map.data?.notice ? <p className="krds-text-body-xsmall rb-subtle">{map.data.notice}</p> : null}
          </section>
        )}
        {orgRows.length ? (
          <section aria-labelledby="org-dist">
            <h2 id="org-dist" className="krds-text-body-small-bold">{t.Insights_byOrg}</h2>
            <ul className="rb-plain-list">
              {orgRows.slice(0, 30).map((o) => (
                <li className="rb-plain-row" key={o.name || o.organization}>
                  <span className="rb-plain-main rb-ellipsis">{o.name || o.organization}</span>
                  <span className="rb-plain-meta rb-subtle">{t.fn.items(o.projectCount ?? o.count ?? 0)}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}
      </div>
    </Page>
  );
}

/** A-08 단계별 개발 점검표. */
export function Checklist() {
  const guide = useData(async () => (await product.get('/development-guide')).data, []);
  const steps = guide.data?.steps || [];
  const [open, setOpen] = useState(0);
  return (
    <Page id="A-11" title={t.Checklist_title} state={steps.length ? 'Ideal' : guide.state}>
      <div className="rb-write">
        <div className="rb-write-head">
          <h1 className="krds-text-heading-small">{t.Checklist_title}</h1>
          <p className="krds-text-body-xsmall rb-subtle">{t.Checklist_hint}</p>
        </div>
        {!steps.length ? <Status {...guide} /> : (
          <ul className="krds-accordion rb-steps">
            {steps.map((s, i) => (
              <li key={s.id || s.title}>
                <button type="button" className="rb-step-head" aria-expanded={open === i} onClick={() => setOpen(open === i ? -1 : i)}>
                  <span className="rb-step-no">{i + 1}</span>
                  <span className="krds-text-body-small-bold">{s.title}</span>
                </button>
                {open === i ? (
                  <div className="rb-step-body">
                    {s.summary ? <p className="krds-text-body-small">{s.summary}</p> : null}
                    <ul className="rb-check-list">
                      {(s.checks || s.items || []).map((c) => (
                        <li key={c.text || c}>{c.text || c}</li>
                      ))}
                    </ul>
                  </div>
                ) : null}
              </li>
            ))}
          </ul>
        )}
      </div>
    </Page>
  );
}

/** A-05 법령과 기준 변경 알림. 프로젝트 안에서 본다. */
export function LawAlerts() {
  const { id } = useParams();
  const frame = useProject();
  const body = useData(async () => (await product.get(`/projects/${id}/law-alerts`)).data, [id]);
  if (!frame.data) return <ProjectFrame screenId="A-10" data={frame} />;
  const items = body.data?.items || [];
  const notConnected = body.data?.status === 'not-connected';
  return (
    <ProjectFrame screenId="A-10" tab="" tabLabel={t.Law_title} data={frame} state={items.length ? 'Ideal' : 'Empty'}>
      <div className="rb-write">
        <div className="rb-write-head">
          <h2 className="krds-text-body-small-bold">{t.Law_title}</h2>
          <p className="krds-text-body-xsmall rb-subtle">{t.Law_hint}</p>
        </div>
        {notConnected ? (
          <EmptyState title={t.Law_notConnected} />
        ) : items.length ? (
          <ul className="rb-plain-list">
            {items.map((a) => (
              <li className="rb-plain-row" key={a.id || a.title}>
                <span className="rb-plain-main">{a.title}</span>
                <span className="rb-plain-sub rb-subtle">{a.summary}</span>
                <span className="rb-plain-meta rb-subtle">{a.date}</span>
              </li>
            ))}
          </ul>
        ) : <Status {...body} />}
        {body.data?.notice ? <p className="krds-text-body-xsmall rb-subtle">{body.data.notice}</p> : null}
      </div>
    </ProjectFrame>
  );
}

/** A-07 인수인계 문서 만들기. */
export function Handover() {
  const { id } = useParams();
  const frame = useProject();
  const [text, setText] = useState('');
  const [state, setState] = useState('idle');
  const make = async () => {
    setState('loading');
    try {
      const res = await product.post(`/projects/${id}/handover`, {});
      setText(res.data?.markdown || res.data?.text || '');
      setState('done');
    } catch {
      setState('error');
    }
  };
  if (!frame.data) return <ProjectFrame screenId="A-08" data={frame} />;
  return (
    <ProjectFrame screenId="A-08" tab="" tabLabel={t.Handover_title} data={frame} state={state === 'done' ? 'Ideal' : 'Empty'}>
      <div className="rb-write">
        <div className="rb-write-head">
          <h2 className="krds-text-body-small-bold">{t.Handover_title}</h2>
          <p className="krds-text-body-xsmall rb-subtle">{t.Handover_hint}</p>
        </div>
        <div className="rb-write-actions">
          <button type="button" className="krds-btn medium primary" onClick={make} disabled={state === 'loading'}>
            {state === 'loading' ? t.Handover_making : t.Handover_make}
          </button>
        </div>
        {state === 'error' ? <EmptyState title={t.Handover_error} /> : null}
        {text ? (
          <>
            <textarea className="krds-input rb-editor-area" aria-label={t.Handover_result} value={text} readOnly />
            <p className="krds-text-body-xsmall rb-subtle">{t.Handover_check}</p>
          </>
        ) : null}
      </div>
    </ProjectFrame>
  );
}

/** A-06 AI 코딩 도구 연결(MCP) 안내. */
export function Mcp() {
  // MCP 서버는 JSON-RPC다. 도구 목록을 그대로 받아 보여 준다.
  const info = useData(async () => {
    const res = await product.post('/mcp', { jsonrpc: '2.0', id: 1, method: 'tools/list' });
    return { tools: res.result?.tools || [], endpoint: '/api/v1/mcp', steps: t.Mcp_steps };
  }, []);
  const d = info.data;
  return (
    <Page id="A-07" title={t.Mcp_title} state={d ? 'Ideal' : info.state}>
      <div className="rb-write">
        <div className="rb-write-head">
          <h1 className="krds-text-heading-small">{t.Mcp_title}</h1>
          <p className="krds-text-body-xsmall rb-subtle">{t.Mcp_hint}</p>
        </div>
        {!d ? <Status {...info} /> : (
          <>
            <h2 className="krds-text-body-small-bold">{t.Mcp_how}</h2>
            <ol className="rb-check-list">
              {(d.steps || []).map((s) => <li key={s}>{s}</li>)}
            </ol>
            {d.tools?.length ? (
              <>
                <h2 className="krds-text-body-small-bold">{t.Mcp_tools}</h2>
                <ul className="rb-plain-list">
                  {d.tools.map((tool) => (
                    <li className="rb-plain-row" key={tool.name}>
                      <span className="rb-plain-main">{tool.name}</span>
                      <span className="rb-plain-sub rb-subtle">{tool.description}</span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
            {d.endpoint ? <p className="krds-text-body-xsmall rb-subtle">{t.fn.mcpEndpoint(d.endpoint)}</p> : null}
          </>
        )}
        <p className="krds-text-body-xsmall rb-subtle"><Link className="krds-link" to="/help">{t.Header_menuHelp}</Link></p>
      </div>
    </Page>
  );
}
