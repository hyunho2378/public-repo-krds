// 공공 깃랩 공개 프로젝트 수집. 공개 읽기 API만 사용, 요청 간격 1초 이상, 실패 재시도 2회, data/raw/{id}/ 캐시.
// 사용: node scripts/cards/fetch.mjs [--list-only]
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const BASE='https://gitlab.aigov.go.kr/api/v4';
const RAW=path.join(ROOT,'data/raw'),CARDS=path.join(ROOT,'data/cards');
const GAP=1100;let last=0;
const sleep=ms=>new Promise(r=>setTimeout(r,ms));
async function get(url,{text=false}={}){
  for(let a=0;a<=2;a++){
    const wait=GAP-(Date.now()-last);if(wait>0)await sleep(wait);last=Date.now();
    try{
      const r=await fetch(url,{headers:{'user-agent':'ax-supporters-card-fetch/1.0 (public read-only)'}});
      if(r.status===404||r.status===403)return{status:r.status,body:null,headers:r.headers};
      if(!r.ok)throw new Error('HTTP '+r.status);
      return{status:200,body:text?await r.text():await r.json(),headers:r.headers};
    }catch(e){if(a===2)return{status:'error',error:String(e),body:null};await sleep(2000*(a+1));}
  }
}
const exists=p=>fs.access(p).then(()=>true,()=>false);
await fs.mkdir(RAW,{recursive:true});await fs.mkdir(CARDS,{recursive:true});
// 1) 목록
let list;const listPath=path.join(RAW,'_list.json');
if(await exists(listPath)&&!process.argv.includes('--refresh'))list=JSON.parse(await fs.readFile(listPath,'utf8'));
else{list=[];for(let page=1;;page++){
  const r=await get(`${BASE}/projects?visibility=public&per_page=100&page=${page}&order_by=id&sort=asc`);
  if(!r.body)throw new Error('목록 실패 '+page+' '+r.status);
  list.push(...r.body);console.error('list page',page,list.length);
  if(!r.headers.get('x-next-page'))break;
}
await fs.writeFile(listPath,JSON.stringify(list));
await fs.writeFile(path.join(CARDS,'_meta.json'),JSON.stringify({source:BASE+'/projects?visibility=public',fetchedAt:new Date().toISOString(),fetchedDate:new Date().toLocaleDateString('sv-SE',{timeZone:'Asia/Seoul'}),projectCount:list.length,note:'조회 날짜 기준 공개 프로젝트 전수. 원문은 data/raw/에 캐시(커밋 제외)'},null,2));}
console.error('projects',list.length);
if(process.argv.includes('--list-only'))process.exit(0);
// 2) 프로젝트별
let n=0;
for(const p of list){
  n++;const dir=path.join(RAW,String(p.id));
  if(await exists(path.join(dir,'done.json')))continue;
  await fs.mkdir(dir,{recursive:true});
  await fs.writeFile(path.join(dir,'project.json'),JSON.stringify(p));
  const id=p.id,ref=encodeURIComponent(p.default_branch||'main');
  const out={};
  const tree=p.default_branch?await get(`${BASE}/projects/${id}/repository/tree?per_page=100&ref=${ref}`):{status:'no-branch',body:null};
  out.tree=tree.status;if(tree.body)await fs.writeFile(path.join(dir,'tree.json'),JSON.stringify(tree.body));
  const lang=await get(`${BASE}/projects/${id}/languages`);
  out.languages=lang.status;if(lang.body)await fs.writeFile(path.join(dir,'languages.json'),JSON.stringify(lang.body));
  const rd=(tree.body||[]).find(f=>f.type==='blob'&&/^readme(\.(md|markdown|txt|rst|adoc))?$/i.test(f.name));
  out.readmePath=rd?.path||null;
  if(rd){const r=await get(`${BASE}/projects/${id}/repository/files/${encodeURIComponent(rd.path)}/raw?ref=${ref}`,{text:true});out.readme=r.status;if(r.body!=null)await fs.writeFile(path.join(dir,'README.md'),r.body);}
  // 하위 1단계 목록은 받지 않는다(트리 1단계 + 주요 파일 존재만)
  const names=(tree.body||[]).map(f=>f.name);
  out.markers={gitignore:names.includes('.gitignore'),envLike:names.filter(x=>/^\.env/i.test(x)),packageJson:names.includes('package.json'),requirements:names.includes('requirements.txt'),pyproject:names.includes('pyproject.toml'),exe:names.filter(x=>/\.exe$/i.test(x))};
  out.fetchedAt=new Date().toISOString();
  await fs.writeFile(path.join(dir,'done.json'),JSON.stringify(out));
  if(n%25===0)console.error('done',n,'/',list.length);
}
console.error('ALL DONE');
