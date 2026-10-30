import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
export const ROOT=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
export const RAW=path.join(ROOT,'data/raw'),CARDS=path.join(ROOT,'data/cards');
export const rj=async p=>{try{return JSON.parse(await fs.readFile(p,'utf8'))}catch{return null}};
export const rt=async p=>{try{return await fs.readFile(p,'utf8')}catch{return null}};
// 통합 분야(상위 12). 패턴은 기존 분야 이름에 쓰인 낱말 기준(taxonomy.mjs가 실제 빈도로 검증).
export const GROUPS=[
 ['문서·보고서','문서|한글|hwp|pdf|요약|회의록|보고|공문|기안|서식|번역|문서화|ocr'],
 ['회계·예산·출장','여비|출장|정산|급여|회계|예산|지출|수당|세금|재정|계약|조달|구매|결산'],
 ['민원·복지·상담','민원|복지|주민|상담|지원금|고객|콜센터|서비스 안내|안내'],
 ['인사·교육','인사|근무|교육|연수|학습|채용|평가|훈련|인재'],
 ['시설·안전·재난','시설|안전|소방|재난|점검|건설|건축|국토|도로|환경|기상|교통|물류'],
 ['데이터·통계·분석','데이터|통계|시각화|분석|대시보드|dashboard|bi|예측|모델|머신러닝|딥러닝|ml'],
 ['법령·규제·감사','법령|규제|법률|법규|감사|규정|조례|판례|입법|표준'],
 ['엑셀·사무 자동화','엑셀|excel|xlsx|csv|자동화|rpa|매크로|일괄|사무|스크립트|업무 자동|automation'],
 ['생성형 AI·챗봇·검색','챗봇|chatbot|llm|rag|gpt|생성형|검색|질의|에이전트|agent|mcp|프롬프트|질문|ai 비서|어시스턴트|임베딩|벡터'],
 ['영상·이미지·음성','영상|이미지|음성|stt|tts|비전|사진|영상처리|cctv|이미지|음성인식|vision'],
 ['개발·보안·인프라','개발|보안|인프라|api|서버|배포|devops|ci|cd|도커|docker|라이브러리|프레임워크|sdk|테스트|오픈소스|템플릿|연동|웹'],
 ['기타','^$']];
export function mapName(name){const s=String(name).toLowerCase();for(const [g,pat] of GROUPS.slice(0,-1))if(new RegExp(pat,'i').test(s))return g;return null}
export function ngrams(s,n=2){const t=String(s).toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();const out=new Map();for(const w of t.split(' ')){if(!w)continue;if(w.length<n){out.set(w,(out.get(w)||0)+1);continue}for(let i=0;i<=w.length-n;i++){const g=w.slice(i,i+n);out.set(g,(out.get(g)||0)+1)}}return out}
export function jaccard(a,b){let i=0;for(const k of a.keys())if(b.has(k))i++;const u=a.size+b.size-i;return u?i/u:0}
export async function loadCards(){const files=(await fs.readdir(CARDS)).filter(f=>/^\d+\.json$/.test(f));const out=[];for(const f of files)out.push(JSON.parse(await fs.readFile(path.join(CARDS,f),'utf8')));return out.sort((a,b)=>a.id-b.id)}
