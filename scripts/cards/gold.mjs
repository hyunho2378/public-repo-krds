// M-01 정확도 표본 50개: 분야별 비례(최대 잔여법), README 있는 카드 중에서 고정 시드 추출. 정답은 팀이 채운다.
import fs from 'node:fs/promises';import path from 'node:path';
import {CARDS,RAW,loadCards,mapName,rt}from'./lib.mjs';
const N=50;const cards=(await loadCards()).filter(c=>c.readmeStatus.value==='present');
let seed=20261030;const rnd=()=>{seed=(seed*1664525+1013904223)%4294967296;return seed/4294967296};
const fieldOf=async c=>{const f=c.ai?.fields?.value?.[0];if(f)return{field:f,by:'ai'};const rd=(await rt(path.join(RAW,String(c.id),'README.md')))||'';const g=mapName(c.name+' '+(c.topics||[]).join(' '))||mapName(rd.slice(0,600));return{field:g||'기타',by:'rule-keyword'}};
const by=new Map();for(const c of cards){const {field,by:how}=await fieldOf(c);(by.get(field)||by.set(field,[]).get(field)).push({c,how})}
const total=cards.length;const q=[...by].map(([f,a])=>({f,a,exact:a.length*N/total}));
q.forEach(x=>x.n=Math.floor(x.exact));let left=N-q.reduce((s,x)=>s+x.n,0);
q.sort((a,b)=>(b.exact-b.n)-(a.exact-a.n));for(let i=0;left>0&&i<q.length;i++,left--)q[i].n++;
const sample=[];for(const x of q){const a=x.a.slice().sort(()=>rnd()-.5);for(const {c,how} of a.slice(0,x.n))sample.push({id:c.id,name:c.name,path:c.path,webUrl:c.webUrl,field:x.f,fieldBy:how,readmeStatus:c.readmeStatus.value})}
sample.sort((a,b)=>a.id-b.id);
await fs.writeFile(path.join(CARDS,'_gold_sample.json'),JSON.stringify({note:'M-01 정확도 측정 표본. 분야별 비례 추출, 고정 시드 20261030, README 있는 카드만. 분야 열은 표본 추출용 구분이며 정답이 아님. 정답은 팀이 UX/15 양식으로 채운다',size:sample.length,population:total,perField:q.map(x=>({field:x.f,population:x.a.length,sampled:x.n})).sort((a,b)=>b.population-a.population),sample},null,1));
console.log(sample.length,total);
