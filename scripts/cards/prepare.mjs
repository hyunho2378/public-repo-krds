// AI 정리 대상 20개를 줄 번호 붙여 출력. 사용: node scripts/cards/prepare.mjs [시작 오프셋=0] [개수=20] [줄수=70]
import path from 'node:path';
import {CARDS,RAW,rj,rt,loadCards}from'./lib.mjs';
const n=Number(process.argv[3]||20),maxL=Number(process.argv[4]||70);
const prog=(await rj(path.join(CARDS,'_progress.json')))||{done:[]};const done=new Set(prog.done);
const todo=(await loadCards()).filter(c=>c.readmeStatus.value==='present'&&!done.has(c.id)).slice(0,n);
for(const c of todo){const rd=(await rt(path.join(RAW,String(c.id),'README.md')))||'';const ls=rd.split('\n');
 console.log(`\n=== #${c.id} ${c.name} | ${c.organization.value} | 줄수 ${ls.length} | 형태 ${c.executionForm.label} | 주제 ${c.topics.join(',')}`);
 ls.slice(0,maxL).forEach((l,i)=>{if(l.trim())console.log((i+1)+'| '+l.slice(0,160))})}
console.log('\nremaining present-README cards:',(await loadCards()).filter(c=>c.readmeStatus.value==='present'&&!done.has(c.id)).length);
