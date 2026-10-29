// D-05 가벼운 구문 강조. 외부 라이브러리 없이 역할만 나눈다(예약어, 문자열, 숫자, 주석, 태그).
const KEYWORDS = new Set(
  'abstract as async await break case catch class const continue def default del elif else export extends false final finally for from function if import in instanceof interface is let new None null of pass private protected public raise return self static super switch this throw true try type typeof undefined var void while with yield'.split(' '),
);
const LANG = {
  js: 'c', jsx: 'c', ts: 'c', tsx: 'c', mjs: 'c', cjs: 'c', java: 'c', c: 'c', cpp: 'c', cs: 'c', go: 'c', css: 'c', scss: 'c',
  py: 'hash', sh: 'hash', yml: 'hash', yaml: 'hash', rb: 'hash', toml: 'hash',
  html: 'tag', htm: 'tag', xml: 'tag', vue: 'tag', svg: 'tag',
};

export function languageOf(path = '') {
  return LANG[path.split('.').pop()?.toLowerCase()] || 'plain';
}

const RULES = {
  c: [['comment', /\/\/.*|\/\*.*?\*\//y], ['string', /(["'`])(?:\\.|(?!\1).)*\1/y], ['number', /\b\d+(?:\.\d+)?\b/y], ['word', /[A-Za-z_$][\w$]*/y]],
  hash: [['comment', /#.*/y], ['string', /(["'])(?:\\.|(?!\1).)*\1/y], ['number', /\b\d+(?:\.\d+)?\b/y], ['word', /[A-Za-z_][\w]*/y]],
  tag: [['comment', /<!--.*?-->/y], ['tag', /<\/?[A-Za-z][\w-]*/y], ['string', /(["'])(?:\\.|(?!\1).)*\1/y], ['word', /[A-Za-z_][\w-]*/y]],
};

/** 한 줄을 [역할, 글자] 조각으로 나눈다. 여러 줄 주석은 줄 단위로만 처리한다. */
export function tokenize(line, lang) {
  const rules = RULES[lang];
  if (!rules) return [['plain', line]];
  const out = [];
  let i = 0;
  let plain = '';
  while (i < line.length) {
    let hit = null;
    for (const [role, re] of rules) {
      re.lastIndex = i;
      const m = re.exec(line);
      if (m && m[0]) {
        hit = [role, m[0]];
        break;
      }
    }
    if (!hit) {
      plain += line[i];
      i += 1;
      continue;
    }
    if (plain) out.push(['plain', plain]);
    plain = '';
    let [role, text] = hit;
    if (role === 'word') role = KEYWORDS.has(text) ? 'keyword' : line[i + text.length] === '(' ? 'function' : 'plain';
    out.push([role, text]);
    i += text.length;
  }
  if (plain) out.push(['plain', plain]);
  return out;
}
