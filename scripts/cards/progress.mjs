// 묶음별 진행 파일(data/cards/_progress/*.json)을 모아 data/cards/_progress.json 한 개로 합친다(작업자 한 명이 마지막에 실행).
import fs from 'node:fs/promises';import path from 'node:path';
import {CARDS,rj}from'./lib.mjs';
const dir=path.join(CARDS,'_progress');const files=(await fs.readdir(dir).catch(()=>[])).sort();
const done=new Set(),batches=[];for(const f of files){const j=await rj(path.join(dir,f));if(!j)continue;j.done.forEach(i=>done.add(i));batches.push({file:j.file,count:j.done.length,errors:j.errors.length,at:j.at})}
const out={done:[...done].sort((a,b)=>a-b),count:done.size,batches,updatedAt:new Date().toISOString()};
await fs.writeFile(path.join(CARDS,'_progress.json'),JSON.stringify(out));console.log('AI 정리 완료',out.count,'묶음',batches.length);
