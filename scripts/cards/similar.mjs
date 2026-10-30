// F-04 중복 묶음. 이름 + 하는 일 + 분야 + 주제의 2글자 n-gram 유사도. 같은 기관의 포크/복제도 묶인다.
import fs from 'node:fs/promises';import path from 'node:path';
import {CARDS,loadCards,ngrams,jaccard,mapName,rt,RAW}from'./lib.mjs';
const cards=await loadCards();
const text=async c=>{const rd=await rt(path.join(RAW,String(c.id),'README.md'));const head=(rd||'').split('\n').filter(l=>l.trim()).slice(0,6).join(' ').slice(0,300);return[c.name,c.name,c.ai?.oneLine?.value,c.ai?.targetTask?.value,(c.ai?.fields?.value||[]).join(' '),(c.topics||[]).join(' '),head].filter(Boolean).join(' ')};
const vec=new Map(),nm=new Map();
for(const c of cards){vec.set(c.id,ngrams(await text(c)));nm.set(c.id,ngrams(c.name))}
const par=new Map(cards.map(c=>[c.id,c.id]));const find=x=>{while(par.get(x)!==x){par.set(x,par.get(par.get(x)));x=par.get(x)}return x};
const TH_NAME=0.6,TH_ALL=0.45;const pairs=[];
for(let i=0;i<cards.length;i++)for(let j=i+1;j<cards.length;j++){const a=cards[i],b=cards[j];
  const sn=jaccard(nm.get(a.id),nm.get(b.id)),sa=jaccard(vec.get(a.id),vec.get(b.id));
  if(sn>=TH_NAME||sa>=TH_ALL){par.set(find(a.id),find(b.id));pairs.push([a.id,b.id,+sn.toFixed(2),+sa.toFixed(2)])}}
const gm=new Map();for(const c of cards){const r=find(c.id);(gm.get(r)||gm.set(r,[]).get(r)).push(c)}
const groups=[...gm.values()].filter(g=>g.length>=2).sort((a,b)=>b.length-a.length).map((g,i)=>{
  const ids=new Set(g.map(c=>c.id));const ps=pairs.filter(p=>ids.has(p[0])&&ids.has(p[1]));
  const common=[...g.map(c=>[...nm.get(c.id).keys()]).reduce((a,b)=>a.filter(x=>b.includes(x)))].slice(0,6);
  const orgs=new Set(g.map(c=>c.organization?.value));
  const avgN=ps.reduce((s,p)=>s+p[2],0)/(ps.length||1);
  const reason=`이름·소개 글이 비슷함(이름 유사도 평균 ${avgN.toFixed(2)}, 기관 ${orgs.size}곳${common.length?', 공통 낱말 조각: '+common.join(' '):''})`;
  return{id:'g'+String(i+1).padStart(3,'0'),title:g.slice().sort((a,b)=>a.name.length-b.name.length)[0].name,size:g.length,organizations:orgs.size,projects:g.map(c=>({id:c.id,name:c.name,organization:c.organization?.value??null})),reason,method:'규칙(n-gram 유사도, 임계값 이름 '+TH_NAME+' / 전체 '+TH_ALL+')',needsReview:true}});
await fs.writeFile(path.join(CARDS,'_similar.json'),JSON.stringify({note:'F-04 중복 묶음 초안. 사람 확인 전',computedAt:new Date().toISOString(),groupCount:groups.length,groups},null,1));
console.log('groups',groups.length,groups.slice(0,10).map(g=>g.size+' '+g.title));
