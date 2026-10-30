// P-14 도움말. 처음 쓰는 공무원 안내, 용어 풀이(U4), 설명서 표준 양식(F-24). KRDS 아코디언.
import { phrase } from '../components/Help/Phrase';
import { t } from '../copy/ko';
import { product } from '../api/client';
import { useData } from '../api/useData';
import { Page } from '../components/Layout/Page';
import { Breadcrumb } from '../components/Navigation/Breadcrumb';

const FAQ = [
  [t.P14_1, t.P14_2],
  [t.P14_3, t.P14_4],
  [t.P14_5, t.P14_6],
  [t.P14_7, t.P14_8],
];
const TERMS = [
  [t.P14_9, t.P14_10],
  [t.P14_11, t.P14_12],
  [t.P09_4, t.P14_13],
  [t.P09_8, t.P14_14],
];

export default function Help() {
  const tpl = useData(() => product.get('/templates/readme'), []);
  return (
    <Page id="G-10" title={t.Header_5}>
      <h1 className="krds-text-heading-xlarge" data-figma="section-title">{phrase(t.Header_5)}</h1>
      <section className="rb-stack" aria-labelledby="start-title">
        <h2 id="start-title" className="krds-text-heading-medium">{phrase(t.P14_15)}</h2>
        <ol className="rb-ordered">
          <li>{t.P14_16}</li>
          <li>{t.P14_17}</li>
          <li>{t.P14_18}</li>
          <li>{t.P14_19}</li>
        </ol>
      </section>
      <section className="rb-stack" aria-labelledby="faq-title">
        <h2 id="faq-title" className="krds-text-heading-medium">{phrase(t.P14_20)}</h2>
        <div className="krds-accordion">
          {FAQ.map(([q, a]) => (
            <details className="accordion-item" key={q}>
              <summary className="btn-accordion krds-text-body-large-bold">{q}</summary>
              <div className="accordion-body"><p>{a}</p></div>
            </details>
          ))}
        </div>
      </section>
      <section className="rb-stack" aria-labelledby="terms-title">
        <h2 id="terms-title" className="krds-text-heading-medium">{phrase(t.P14_21)}</h2>
        <dl className="rb-terms">
          {TERMS.map(([t, d]) => (
            <div key={t}><dt className="krds-text-body-medium-bold">{t}</dt><dd>{d}</dd></div>
          ))}
        </dl>
      </section>
      <section className="rb-stack" id="readme" aria-labelledby="tpl-title">
        <h2 id="tpl-title" className="krds-text-heading-medium">{phrase(t.P14_22)}</h2>
        {tpl.state === 'Ideal' && (
          <>
            <pre className="rb-code">{tpl.data.data.markdown}</pre>
            <p className="krds-text-body-small rb-subtle">{tpl.data.data.notice}</p>
          </>
        )}
      </section>
    </Page>
  );
}
