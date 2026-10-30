// 규칙으로 채우는 칸(source:'rule'). analysis.js 함수를 재사용한다. AI 칸은 apply.mjs가 합친다.
// 사용: node scripts/cards/rules.mjs  → data/cards/{id}.json (기존 AI 칸은 보존), _private_alerts.json
import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {execution,referenceDates,licenseName,publication} from '../../server/src/analysis.js';
import {organizationName} from '../../server/src/catalog-core.js';
const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const RAW=path.join(ROOT,'data/raw'),CARDS=path.join(ROOT,'data/cards');
const rj=async p=>{try{return JSON.parse(await fs.readFile(p,'utf8'))}catch{return null}};
const rt=async p=>{try{return await fs.readFile(p,'utf8')}catch{return null}};
export const FORM_LABEL={open:'바로 열림',download:'내려받아 실행(exe)',install:'설치 필요(파이썬 등)',check:'확인 필요'};
export function readmeStatus(text){
  if(text==null||!text.trim())return'none';
  if(/To make it easy for you to get started with GitLab|Getting started\s*\n/i.test(text)&&/Add your files|Integrate with your tools/i.test(text))return'template';
  if(text.replace(/\s/g,'').length<40)return'template';
  return'present';
}
const field=(value,evidence,source='rule',extra={})=>({value:value??null,evidence:value==null&&!evidence?null:(evidence??null),source,...extra});
function lineOf(lines,re){const out=[];lines.forEach((l,i)=>{if(re.test(l))out.push(i+1)});return out}
function range(nums){if(!nums.length)return null;return[nums[0],nums[nums.length-1]]}
export function ruleFields(p,tree,languages,readme,done){
  const lines=(readme||'').split('\n');const status=readmeStatus(readme);
  const files=(tree||[]).map(f=>({path:f.path,type:f.type}));
  const exec=execution(files,readme||'');
  let form='check',ev=null;
  const map={download:'download',install:'install'};
  if(map[exec.form]){form=map[exec.form];ev=exec.evidence.map(e=>e.path)}
  else if(exec.form==='web-candidate'){form='check';ev=exec.evidence.map(e=>e.path)}
  const lic=licenseName(readme||'');
  const licFile=files.find(f=>/^licen[cs]e/i.test(path.basename(f.path)));
  const licLine=lic?lineOf(lines,new RegExp(lic.replace(/[.*+?^${}()|[\]\\]/g,'\\$&'),'i'))[0]:null;
  const refs=referenceDates(readme||'').references.map(r=>{const idx=lines.findIndex(l=>l.slice(0,800)===r.original);return{quote:r.original.trim().slice(0,300),lines:idx<0?null:[idx+1,idx+1],dates:r.dates,identifiers:r.identifiers}});
  const langs=Object.keys(languages||{});
  const mk=[];const names=files.map(f=>f.path);
  for(const [re,label] of [[/^package\.json$/,'Node.js(package.json)'],[/^requirements\.txt$/,'Python(requirements.txt)'],[/^pyproject\.toml$/,'Python(pyproject.toml)'],[/^Dockerfile$/,'Docker'],[/^pom\.xml$/,'Java(Maven)'],[/^build\.gradle/,'Java(Gradle)']])if(names.some(n=>re.test(n)))mk.push({label,path:names.find(n=>re.test(n))});
  const techVals=[...langs.map(l=>l),...mk.map(m=>m.label)];
  const org=organizationName((p.name_with_namespace||'').split(' / ')[0]);
  const AIDOC=/^(CLAUDE|AGENTS|SESSION_HEADER|PROGRESS|DESIGN|IA|GEMINI|CURSOR)\.md$/i;
  const aiDocs=names.filter(n=>!n.includes('/')&&AIDOC.test(n));
  const urlRe=/https?:\/\/[^\s)>\]"'`]+(?:vercel\.app|github\.io|netlify\.app|pages\.dev|onrender\.com|streamlit\.app|hf\.space|herokuapp\.com)[^\s)>\]"'`]*/i;
  const ul=lines.findIndex(l=>urlRe.test(l));const openUrl=ul>=0?lines[ul].match(urlRe)[0]:null;
  const wl=lines.findIndex(l=>/(서버.{0,20}(켜지|준비|깨어|기동|대기).{0,20}[분초]|cold start|첫 접속.{0,15}(느|지연))/i.test(l));
  const rightsL=lines.findIndex(l=>/(이용 허락|콘텐츠 권리|이미지 출처|사진 출처|서면 확인|저작권자)/.test(l));
  const baseL=[];lines.forEach((l,i)=>{if(/(복제|기반으로|바탕으로|참고하여|참고해|포크|fork|원본 저장소|based on|forked from)/i.test(l)&&/(https?:\/\/|[`\[][\w.\-/]+[`\]])/.test(l))baseL.push(i+1)});
  const pub=publication(files,readme||'',false);
  return{
    rule:{
      executionForm:field(form,ev,'rule',{label:FORM_LABEL[form],note:'파일 구성 기준. 안전성, 운영체제, 망 정책은 확인 필요'}),
      license:field(lic,lic?{lines:licLine?[licLine,licLine]:null}:(licFile?{paths:[licFile.path]}:null),'rule',licFile&&!lic?{note:'LICENSE 파일은 있으나 이름은 README에 없음'}:{}),
      readmeStatus:field(status,status==='none'?null:{lines:[1,Math.max(1,lines.length)]},'rule',{label:{none:'없음',template:'기본 템플릿',present:'있음'}[status]}),
      referenceDates:field(refs.length?refs:null,refs.length?{lines:range(refs.map(r=>r.lines?.[0]).filter(Boolean))}:null,'rule',{note:'README 추출 후보, 현행 여부 미확인'}),
      updatedAt:field(p.last_activity_at||null,null,'rule',{evidence:'API last_activity_at'}),
      organization:field(org,'API name_with_namespace','rule'),
      openUrl:field(openUrl,ul>=0?{lines:[ul+1,ul+1]}:null,'rule',{note:'README 안 배포 주소. 프로젝트 web_url이 아님'}),
      startupNote:field(wl>=0?lines[wl].trim().slice(0,200):null,wl>=0?{lines:[wl+1,wl+1]}:null,'rule'),
      contentRights:field(rightsL>=0?lines[rightsL].trim().slice(0,200):null,rightsL>=0?{lines:[rightsL+1,rightsL+1]}:null,'rule',{note:'코드 라이선스(license)와 별도'}),
      baseProjects:field(baseL.length||p.forked_from_project?[...baseL.map(n=>({quote:lines[n-1].trim().slice(0,240),line:n})),...(p.forked_from_project?[{fork:p.forked_from_project.path_with_namespace}]:[])]:null,baseL.length?{lines:[baseL[0],baseL[baseL.length-1]]}:null,'rule',{note:'README 문구 기반 재사용 계보 후보. 사람 확인 필요'}),
      docComposition:field(aiDocs.length?{aiWorkDocs:aiDocs.length}:null,aiDocs.length?{paths:aiDocs}:null,'rule',{note:'AI 작업 문서는 카드 근거에서 제외, 개수만 표시'}),
      techStack:field(techVals.length?techVals:null,techVals.length?{api:'languages',paths:mk.map(m=>m.path)}:null,'rule')
    },
    publicChecks:pub.publicResult.checks,
    privateItems:pub.privateResult.items.filter(i=>i.type==='sensitive-filename').map(i=>i.path).concat((done?.markers?.envLike||[]).filter(x=>!/\.(example|sample|template)$/.test(x)))
  };
}
export function blankAI(){const n=()=>({value:null,evidence:null,source:'ai'});return{oneLine:n(),targetTask:n(),fields:n(),runSummary:{...n(),rawCommands:null},limitations:n()}}
async function main(){
  const list=await rj(path.join(RAW,'_list.json'));const meta=await rj(path.join(CARDS,'_meta.json'));
  const alerts=[];let made=0;
  for(const p of list){
    const dir=path.join(RAW,String(p.id));const done=await rj(path.join(dir,'done.json'));if(!done)continue;
    const tree=await rj(path.join(dir,'tree.json'));const langs=await rj(path.join(dir,'languages.json'));const readme=await rt(path.join(dir,'README.md'));
    const r=ruleFields(p,tree,langs,readme,done);
    const cp=path.join(CARDS,p.id+'.json');const old=await rj(cp);
    const ai=old?.ai||blankAI();
    const status=r.rule.readmeStatus.value;
    if(status!=='present'){ // README 없음/기본 템플릿이면 쉬운 말 칸은 null 고정
      for(const k of Object.keys(ai)){ai[k].value=null;ai[k].evidence=null;if('rawCommands' in ai[k])ai[k].rawCommands=null}}
    const card={id:p.id,name:p.name,path:p.path_with_namespace,webUrl:p.web_url,topics:p.topics||[],
      ...r.rule,ai,checks:r.publicChecks,generatedAt:old?.generatedAt||new Date().toISOString(),rulesAt:new Date().toISOString(),sourceDate:meta?.fetchedDate};
    await fs.writeFile(cp,JSON.stringify(card,null,1));made++;
    if(r.privateItems.length)alerts.push({id:p.id,path:p.path_with_namespace,items:[...new Set(r.privateItems)].map(x=>({path:x,type:'sensitive-filename'}))});
  }
  await fs.writeFile(path.join(CARDS,'_private_alerts.json'),JSON.stringify({note:'경로 존재만. 값 없음. 제작자 전용, 커밋 제외',count:alerts.length,items:alerts},null,1));
  console.log('rule cards',made,'alerts',alerts.length);
}
if(process.argv[1]===fileURLToPath(import.meta.url))await main();
