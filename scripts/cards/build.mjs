// 정적 배포용 묶음: app/public/data/cards.min.json (공개 칸만). 보안 점검 결과, 비공개 알림은 넣지 않는다.
import fs from 'node:fs/promises';import path from 'node:path';
import {ROOT,CARDS,loadCards,rj}from'./lib.mjs';
const cards=await loadCards();const meta=await rj(path.join(CARDS,'_meta.json'));const tax=await rj(path.join(CARDS,'taxonomy.json'));const sim=await rj(path.join(CARDS,'_similar.json'));
const cell=c=>c?{v:c.value,e:c.evidence,s:c.source,...(c.rawCommands?{raw:c.rawCommands}:{})}:null;
const out={meta:{fetchedDate:meta?.fetchedDate,count:cards.length,builtAt:new Date().toISOString(),note:'공개 칸만. AI 정리 칸은 s:"ai"'},
 fields:(tax?.groups||[]).map(g=>({name:g.name,count:g.evidenceCount})),
 cards:cards.map(c=>({id:c.id,name:c.name,path:c.path,url:c.webUrl,topics:c.topics,
  oneLine:cell(c.ai?.oneLine),task:cell(c.ai?.targetTask),fields:cell(c.ai?.fields),form:{...cell(c.executionForm),label:c.executionForm.label},run:cell(c.ai?.runSummary),tech:cell(c.techStack),license:cell(c.license),limits:cell(c.ai?.limitations),refs:cell(c.referenceDates),org:cell(c.organization),updated:cell(c.updatedAt),readme:{...cell(c.readmeStatus),label:c.readmeStatus.label},generatedAt:c.generatedAt})),
 similar:(sim?.groups||[]).map(g=>({id:g.id,title:g.title,reason:g.reason,ids:g.projects.map(p=>p.id)}))};
const dst=path.join(ROOT,'app/public/data');await fs.mkdir(dst,{recursive:true});
const s=JSON.stringify(out);await fs.writeFile(path.join(dst,'cards.min.json'),s);console.log('cards.min.json',cards.length,'cards',(s.length/1024).toFixed(0)+'KB');
