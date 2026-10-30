// 기존 분야 표시 수집: ① 프로젝트 주제(topics) ② README의 '분야/업무 분야/카테고리/분류' 문구. 빈도표와 통합 대응표를 data/cards/taxonomy.json에.
import fs from 'node:fs/promises';import path from 'node:path';
import {RAW,CARDS,rj,rt,GROUPS,mapName}from'./lib.mjs';
const list=await rj(path.join(RAW,'_list.json'));
const topics=new Map(),readmeF=new Map();let withTopic=0,withReadmeField=0,total=0,withAny=0;
const add=(m,k,id)=>{const o=m.get(k)||{count:0,ids:[]};o.count++;if(o.ids.length<5)o.ids.push(id);m.set(k,o)};
const FIELD_RE=/^[\s>*\-|]*\**\s*(?:업무\s*)?(?:분야|카테고리|분류|도메인)\s*\**\s*[:：|]\s*\**\s*(.{1,60}?)\s*\**\s*\|?\s*$/;
for(const p of list){
  if(!(await rj(path.join(RAW,String(p.id),'done.json'))))continue;total++;
  let any=false;
  const tp=[...new Set([...(p.topics||[]),...(p.tag_list||[])].map(s=>s.trim()).filter(Boolean))];
  if(tp.length){withTopic++;any=true;tp.forEach(t=>add(topics,t,p.id))}
  const rd=await rt(path.join(RAW,String(p.id),'README.md'));
  if(rd){const found=new Set();for(const l of rd.split('\n')){const m=l.match(FIELD_RE);if(m){m[1].split(/[,，、/·]/).map(s=>s.replace(/[*_`]/g,'').trim()).filter(s=>s&&s.length<=30).forEach(s=>found.add(s))}}
    if(found.size){withReadmeField++;any=true;found.forEach(t=>add(readmeF,t,p.id))}}
  if(any)withAny++;
}
const merged=new Map();
for(const [m,src] of [[topics,'topics'],[readmeF,'readme']])for(const [k,v] of m){const o=merged.get(k)||{name:k,count:0,topics:0,readme:0,examples:[]};o.count+=v.count;o[src]+=v.count;o.examples=[...new Set([...o.examples,...v.ids])].slice(0,5);merged.set(k,o)}
const names=[...merged.values()].sort((a,b)=>b.count-a.count||a.name.localeCompare(b.name,'ko'));
const mapping={};const groupCount={};
for(const n of names){const g=mapName(n.name)||'기타';mapping[n.name]=g;groupCount[g]=(groupCount[g]||0)+n.count}
const groups=GROUPS.map(([name,pat])=>({name,pattern:pat==='^$'?null:pat,evidenceCount:groupCount[name]||0,members:names.filter(n=>mapping[n.name]===name).map(n=>n.name)}));
await fs.writeFile(path.join(CARDS,'taxonomy.json'),JSON.stringify({note:'원래 이름 → 통합 이름 대응표. 이름 목록과 빈도는 조회 날짜 기준 공개 프로젝트에서 직접 계산. 통합 패턴은 사람이 검토해 고친다',computedAt:new Date().toISOString(),projects:total,projectsWithAnyFieldMark:withAny,projectsWithTopics:withTopic,projectsWithReadmeFieldLine:withReadmeField,distinctNames:names.length,names,mapping,groups},null,1));
console.log({total,withAny,withTopic,withReadmeField,distinct:names.length,top:names.slice(0,15).map(n=>n.name+':'+n.count)});
