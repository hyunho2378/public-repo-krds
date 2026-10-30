// 카드 읽기 API용 모듈. 파일은 data/cards/*.json(서버) 또는 cards.min.json(정적)에서 읽는다. 형태소 분석 없이 2글자 n-gram 점수.
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const DIR=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../../../data/cards');
export function ngramSet(s,n=2){const t=String(s??'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();const out=new Set();for(const w of t.split(' ')){if(!w)continue;if(w.length<n){out.add(w);continue}for(let i=0;i<=w.length-n;i++)out.add(w.slice(i,i+n))}return out}
const WEIGHTS={fields:3,oneLine:3,task:2,name:2};
function parts(c){return{fields:[].concat(c.ai?.fields?.value??[]).join(' '),oneLine:c.ai?.oneLine?.value??'',task:c.ai?.targetTask?.value??'',name:c.name??''}}
export function scoreCard(queryGrams,c){if(!queryGrams.size)return 0;const p=parts(c);let s=0;for(const [k,w] of Object.entries(WEIGHTS)){const g=ngramSet(p[k]);if(!g.size)continue;let hit=0;for(const q of queryGrams)if(g.has(q))hit++;s+=w*hit/queryGrams.size}return +s.toFixed(4)}
export function createCardStore({cards,similar=[],taxonomy=null}){
  const byId=new Map(cards.map(c=>[c.id,c]));
  return{
    count:()=>cards.length,
    get:id=>byId.get(Number(id))??null,
    list({field,limit=50,offset=0}={}){let a=cards;if(field)a=a.filter(c=>[].concat(c.ai?.fields?.value??[]).includes(field));return{total:a.length,items:a.slice(offset,offset+limit)}},
    fields(){const m=new Map();for(const c of cards)for(const f of [].concat(c.ai?.fields?.value??[]))m.set(f,(m.get(f)||0)+1);return[...m].map(([name,count])=>({name,count})).sort((a,b)=>b.count-a.count)},
    search(q,{field,limit=10}={}){const g=ngramSet(q);return cards.filter(c=>!field||[].concat(c.ai?.fields?.value??[]).includes(field)).map(c=>({card:c,score:scoreCard(g,c)})).filter(x=>x.score>0).sort((a,b)=>b.score-a.score||a.card.id-b.card.id).slice(0,limit)},
    similarTo(id){const n=Number(id);const gs=similar.filter(g=>(g.projects||g.ids||[]).some(p=>(p.id??p)===n));return gs.map(g=>({id:g.id,title:g.title,reason:g.reason,projects:(g.projects||g.ids.map(i=>({id:i}))).filter(p=>(p.id??p)!==n)}))},
    similarGroups:()=>similar,
    taxonomy:()=>taxonomy
  };
}
function readJson(p,fb){try{return JSON.parse(fs.readFileSync(p,'utf8'))}catch{return fb}}
export function loadCardStore(dir=DIR){
  const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(f=>/^\d+\.json$/.test(f)):[];
  const cards=files.map(f=>readJson(path.join(dir,f))).filter(Boolean).sort((a,b)=>a.id-b.id);
  return createCardStore({cards,similar:readJson(path.join(dir,'_similar.json'),{groups:[]}).groups,taxonomy:readJson(path.join(dir,'taxonomy.json'),null)});
}
