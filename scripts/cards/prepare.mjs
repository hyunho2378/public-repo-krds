// AI 정리 대상을 줄 번호 붙여 출력. 읽기 규칙: README만 근거(CLAUDE.md, AGENTS.md 등 AI 작업 문서 제외). 한계 칸은 '현재 범위(되는 것, 안 되는 것)' 문단이 있으면 우선 근거.
// 범위 지정(동시 작업자용):
//   --batch N        N번 묶음(전체 목록을 id 오름차순으로 20개씩 자른 N번째, 0부터)
//   --from ID --to ID  id 범위(포함)
//   --lines 70       README 앞 몇 줄까지 보일지   --all  이미 처리한 것도 보임
// 결과 파일은 묶음별로 따로 저장한다: data/cards/_ai/batch-NNN.json (apply.mjs). _progress.json 은 progress.mjs 가 모은다.
import path from 'node:path';
import {CARDS,RAW,rj,rt,loadCards}from'./lib.mjs';
import fs from 'node:fs/promises';
const arg=(k,d)=>{const i=process.argv.indexOf('--'+k);return i<0?d:process.argv[i+1]};
const maxL=Number(arg('lines',70));
export const BATCH=20;
const list=(await rj(path.join(RAW,'_list.json'))).map(p=>p.id).sort((a,b)=>a-b);
let ids;
if(arg('batch')!=null){const b=Number(arg('batch'));ids=list.slice(b*BATCH,b*BATCH+BATCH)}
else if(arg('from')!=null||arg('to')!=null){const f=Number(arg('from',0)),t=Number(arg('to',1e9));ids=list.filter(i=>i>=f&&i<=t)}
else ids=list;
const set=new Set(ids);
const done=new Set();try{for(const f of await fs.readdir(path.join(CARDS,'_progress')))for(const i of (await rj(path.join(CARDS,'_progress',f)))?.done||[])done.add(i)}catch{}
const all=await loadCards();const inRange=all.filter(c=>set.has(c.id));
const notFetched=ids.length-inRange.length;
const todo=inRange.filter(c=>c.readmeStatus.value==='present'&&(process.argv.includes('--all')||!done.has(c.id)));
const batchNo=arg('batch')!=null?arg('batch'):'x';
console.log(`# 범위 id ${ids[0]}~${ids.at(-1)} (${ids.length}개) | 수집 안 됨 ${notFetched} | README 있음·미처리 ${todo.length} | 묶음 ${batchNo}`);
for(const c of todo){const rd=(await rt(path.join(RAW,String(c.id),'README.md')))||'';const ls=rd.split('\n');
 console.log(`\n=== #${c.id} ${c.name} | ${c.organization.value} | 줄수 ${ls.length} | 형태 ${c.executionForm.label} | 주제 ${c.topics.join(',')}`);
 ls.slice(0,maxL).forEach((l,i)=>{if(l.trim())console.log((i+1)+'| '+l.slice(0,160))})}
