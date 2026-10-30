// AI 정리 결과 합치기. 입력: data/cards/_ai/batch-XXX.json = [{id,oneLine,targetTask,fields:[],runSummary,rawCommands,limitations,lines:{oneLine:[a,b],...}}]
// 규칙: 근거 줄 번호 없으면 해당 칸은 null. 분야는 taxonomy 통합 이름만. 끊겨도 _progress.json 으로 이어서.
import fs from 'node:fs/promises';import path from 'node:path';
import {CARDS,RAW,rj,rt,GROUPS}from'./lib.mjs';
const file=process.argv[2];const batch=await rj(file);const valid=new Set(GROUPS.map(g=>g[0]));
const prog=(await rj(path.join(CARDS,'_progress.json')))||{done:[],batches:[]};
let ok=0;const errs=[];
for(const b of batch){
  const cp=path.join(CARDS,b.id+'.json');const c=await rj(cp);if(!c){errs.push(b.id+' 카드 없음');continue}
  const rd=(await rt(path.join(RAW,String(b.id),'README.md')))||'';const total=rd.split('\n').length;
  const cell=(k,val,extra={})=>{const ln=b.lines?.[k];const good=val!=null&&val!==''&&Array.isArray(ln)&&ln.length===2&&ln[0]>=1&&ln[1]<=total&&ln[0]<=ln[1];
    if(val!=null&&val!==''&&!good)errs.push(`${b.id}.${k} 근거 줄 이상 ${JSON.stringify(ln)}/${total}`);
    return good?{value:val,evidence:{lines:ln},source:'ai',...extra}:{value:null,evidence:null,source:'ai',...extra}};
  const fl=(b.fields||[]).filter(f=>valid.has(f)).slice(0,2);
  if((b.fields||[]).some(f=>!valid.has(f)))errs.push(b.id+' 분야 이름 이상 '+b.fields);
  c.ai={oneLine:cell('oneLine',b.oneLine),targetTask:cell('targetTask',b.targetTask),fields:cell('fields',fl.length?fl:null),runSummary:cell('runSummary',b.runSummary,{rawCommands:b.rawCommands||null}),limitations:cell('limitations',b.limitations)};
  c.aiGeneratedAt=new Date().toISOString();
  await fs.writeFile(cp,JSON.stringify(c,null,1));ok++;if(!prog.done.includes(b.id))prog.done.push(b.id);
}
prog.batches.push({file:path.basename(file),count:ok,at:new Date().toISOString()});prog.updatedAt=new Date().toISOString();
await fs.writeFile(path.join(CARDS,'_progress.json'),JSON.stringify(prog));
console.log('applied',ok,'errors',errs);
