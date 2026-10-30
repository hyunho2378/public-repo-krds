import express from 'express';import{products}from './products.js';
export function createApp({upstream=process.env.GITLAB_BASE_URL||'https://gitlab.aigov.go.kr',fetchImpl=fetch,dbPath,environment,devAuth}={}){
 const app=express();app.disable('x-powered-by');app.use(express.json({limit:'128kb'}));
 const cache=new Map();let windowStart=Date.now(),calls=0,active=0;const queue=[];
 const release=()=>{active--;const next=queue.shift();if(next)next();};
 const waitTurn=()=>new Promise(resolve=>{
  if(active<2){active++;return resolve(true);}
  if(queue.length>40)return resolve(false);
  const timer=setTimeout(()=>{const i=queue.indexOf(start);if(i>=0)queue.splice(i,1);resolve(false);},15000);
  function start(){clearTimeout(timer);active++;resolve(true);}
  queue.push(start);
 });
 app.get('/api/health',(_,res)=>res.json({status:'ok',mock:false,notice:'규칙 분석/스냅샷 검색/로컬 저장 API, 외부 연동 상태는 응답별 확인'}));
 app.get('/api/gitlab/*',async(req,res)=>{
  const sub=req.path.replace(/^\/api\/gitlab\//,'');
  const allowed=/^projects(?:\/[^/]+(?:\/(?:repository\/(?:tree|compare|commits(?:\/[0-9a-f]{7,40}(?:\/diff)?)?|files\/[^/]+(?:\/(?:raw|blame))?|branches|tags|contributors)|languages|releases|events|wikis|pipelines|jobs|packages|labels|milestones|members(?:\/all)?|boards|snippets|issues(?:\/\d+(?:\/notes)?)?|merge_requests(?:\/\d+(?:\/(?:changes|notes|commits))?)?))?)?$/;
  if(!allowed.test(sub))return res.status(400).json({error:{code:'PATH_NOT_ALLOWED',message:'공개 프로젝트 읽기 전용'}});
  const u=new URL('/api/v4/'+sub,upstream);for(const k of ['search','page','per_page','ref','ref_name','path','order_by','sort','updated_after','state','archived'])if(req.query[k]!==undefined)u.searchParams.set(k,String(req.query[k]));u.searchParams.set('per_page',String(Math.min(100,Math.max(1,Number(req.query.per_page)||20))));
  if(sub==='projects')u.searchParams.set('visibility','public');
  const key=u.href,cached=cache.get(key);if(cached&&Date.now()-cached.at<60000)return res.json({...cached.body,cached:true});
  if(Date.now()-windowStart>=60000){windowStart=Date.now();calls=0;}
  // 공개 저장소에 예의를 지켜 동시 2개까지만 보낸다. 넘치면 거절하지 않고 차례를 기다린다(화면 하나가 6~8개를 부른다).
  if(calls>=120)return res.status(429).set('Retry-After','60').json({error:{code:'RATE_LIMIT',message:'잠시 후 다시 시도해 주세요.'}});
  const waited=await waitTurn();if(!waited)return res.status(429).set('Retry-After','10').json({error:{code:'RATE_LIMIT',message:'잠시 후 다시 시도해 주세요.'}});
  calls++;
  try{
   // Public-only transport deliberately does not send GITLAB_TOKEN. Never cache private data.
   const r=await fetchImpl(u,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});
   if(!r.ok){if(r.headers.get('retry-after'))res.set('Retry-After',r.headers.get('retry-after'));return res.status(r.status).json({error:{code:'GITLAB_UPSTREAM',message:'공개 저장소에서 자료를 불러오지 못했습니다.'}});}
   const raw=sub.endsWith('/raw'),data=raw?await r.text():await r.json();
   if(data?.visibility&&data.visibility!=='public')return res.status(403).json({error:{code:'NOT_PUBLIC',message:'공개 자료만 볼 수 있습니다.'}});
   const body={mock:false,source:'GitLab public REST v4',state:Array.isArray(data)&&!data.length?'Empty':'Ideal',data,pagination:{nextPage:r.headers.get('x-next-page')||null,total:r.headers.get('x-total')?Number(r.headers.get('x-total')):null}};
   if(cache.size>=100)cache.delete(cache.keys().next().value);cache.set(key,{at:Date.now(),body});res.json(body);
  }catch(e){res.status(502).json({error:{code:'UPSTREAM_UNAVAILABLE',message:'저장소 연결을 확인한 뒤 다시 시도해 주세요.'}});}finally{release();}
 });
 // 폴더 안 항목별 마지막 변경(GitHub 파일 표의 마지막 커밋 열). 공개 API를 항목마다 순서대로 한 번씩 부르고 10분 캐시한다.
 const logCache=new Map();let logBusy=0;
 app.get('/api/repo/projects/:id/tree-log',async(req,res)=>{
  const id=String(req.params.id);if(!/^\d+$/.test(id))return res.status(400).json({error:{code:'BAD_ID',message:'프로젝트 번호를 확인해 주세요.'}});
  const path=String(req.query.path||''),ref=String(req.query.ref||'HEAD');const key=id+'|'+ref+'|'+path,hit=logCache.get(key);
  if(hit&&Date.now()-hit.at<600000)return res.json({...hit.body,cached:true});
  if(logBusy>=1)return res.status(429).set('Retry-After','5').json({error:{code:'RATE_LIMIT',message:'잠시 후 다시 시도해 주세요.'}});
  logBusy++;
  try{
   const base=new URL(`/api/v4/projects/${id}/repository/`,upstream);
   const get=async(u)=>{const r=await fetchImpl(u,{headers:{Accept:'application/json'},signal:AbortSignal.timeout(10000)});if(!r.ok)throw Object.assign(new Error('upstream'),{status:r.status});return r;};
   const tu=new URL('tree',base);tu.searchParams.set('per_page','100');tu.searchParams.set('ref',ref);if(path)tu.searchParams.set('path',path);
   const items=await (await get(tu)).json();
   const one=async(p)=>{const cu=new URL('commits',base);cu.searchParams.set('per_page','1');cu.searchParams.set('ref_name',ref);if(p)cu.searchParams.set('path',p);const r=await get(cu);const c=(await r.json())[0]||null;return{commit:c&&{short_id:c.short_id,id:c.id,title:c.title,author_name:c.author_name,committed_date:c.committed_date},total:r.headers.get('x-total')?Number(r.headers.get('x-total')):null};};
   const hu=new URL('commits',base);hu.searchParams.set('per_page','100');hu.searchParams.set('ref_name',ref);if(path)hu.searchParams.set('path',path);const hr=await get(hu);const hl=await hr.json();const c0=hl[0];const head={commit:c0&&{short_id:c0.short_id,id:c0.id,title:c0.title,author_name:c0.author_name,committed_date:c0.committed_date},total:hl.length,more:!!hr.headers.get('x-next-page')};const limit=30,log={};
   for(const it of items.slice(0,limit)){try{log[it.path]=(await one(it.path)).commit;}catch{log[it.path]=null;}}
   const body={mock:false,source:'GitLab public REST v4',state:items.length?'Ideal':'Empty',data:{items,log,last:head.commit,commitCount:head.total,commitCountMore:head.more,partial:items.length>limit}};
   if(logCache.size>=50)logCache.delete(logCache.keys().next().value);logCache.set(key,{at:Date.now(),body});res.json(body);
  }catch(e){res.status(e.status===404?404:502).json({error:{code:'UPSTREAM_UNAVAILABLE',message:'저장소 자료를 불러오지 못했습니다. 잠시 후 다시 시도해 주세요.'}});}finally{logBusy--;}
 });
 products(app,{upstream,fetchImpl,dbPath,environment,devAuth});
 app.use((req,res)=>res.status(404).json({error:{code:'NOT_FOUND',message:'요청한 경로가 없습니다.'}}));
 app.use((err,req,res,next)=>res.status(err.status||500).json({error:{code:'REQUEST_ERROR',message:err.status?err.message:'요청 내용을 확인해 주세요.'}}));return app;
}
