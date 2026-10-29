async ({keys,maps,ids})=>{
const f=window.figma;await f.loadFontAsync({family:'Pretendard GOV',style:'Regular'});await f.loadFontAsync({family:'Pretendard GOV',style:'Bold'});
const vs=await f.variables.getLocalVariablesAsync(),cols=await f.variables.getLocalVariableCollectionsAsync(),styles=await f.getLocalTextStylesAsync();const vm=Object.fromEntries(vs.map(v=>[v.name,v])),sm=Object.fromEntries(styles.map(s=>[s.name,s]));const mc=cols.find(c=>c.name==='mode'),rc=cols.find(c=>c.name==='responsive');vm['color/button/secondary-fill-pressed'].setValueForMode(mc.modes.find(m=>m.name==='dark').modeId,{type:'VARIABLE_ALIAS',id:vm['color/high-contrast/primary/70'].id});
const paint=n=>f.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',vm[n]);
const bind=(n,p,v)=>n.setBoundVariable(p,vm[v]);
const box=(p,name,dir='VERTICAL',gap='gap/7',pad=null,fill=null)=>{const n=f.createFrame();n.name=name;n.layoutMode=dir;n.primaryAxisSizingMode='AUTO';n.counterAxisSizingMode='AUTO';n.fills=fill?[paint(fill)]:[];n.strokes=[];bind(n,'itemSpacing',gap);if(pad)for(const k of ['paddingTop','paddingRight','paddingBottom','paddingLeft'])bind(n,k,pad);p.appendChild(n);return n;};
const text=async(p,chars,sty='body/medium',col='color/text/basic',wrap=false)=>{const t=f.createText();t.name='Copy / '+chars.slice(0,32);await t.setTextStyleIdAsync(sm[sty].id);t.characters=chars;t.fills=[paint(col)];p.appendChild(t);if(wrap){t.textAutoResize='HEIGHT';t.layoutSizingHorizontal='FILL'}return t;};
const comps={};const inst=async(p,k,labels=[],fill=false)=>{const id=keys[maps.comp[k]]?.id;if(!id)throw Error('Missing '+k);const c=comps[id]||(comps[id]=await f.getNodeByIdAsync(id));const n=c.createInstance();p.appendChild(n);const ts=n.findAllWithCriteria({types:['TEXT']}).filter(t=>{for(let q=t;q&&q!==n;q=q.parent)if(!q.visible)return false;return true});for(let i=0;i<labels.length&&i<ts.length;i++){for(const fn of ts[i].getRangeAllFontNames(0,ts[i].characters.length))await f.loadFontAsync(fn);ts[i].characters=labels[i];}if(fill)n.layoutSizingHorizontal='FILL';return n;};
const button=(p,label,type='primary')=>inst(p,`button|Type=${type}, Size=medium, State=default`,[label]);
const link=(p,label)=>inst(p,'button_text|Size=medium, State=default',[label]);
const list=async(p,title,sub)=>{const n=box(p,'Result row','VERTICAL','gap/3','padding/8');n.layoutSizingHorizontal='FILL';await link(n,title);await text(n,sub,'body/small','color/text/subtle',true);return n;};
const txt=async(t,s)=>{for(const font of t.getRangeAllFontNames(0,t.characters.length))await f.loadFontAsync(font);t.characters=s;};
const visible=(n,root)=>{for(let q=n;q&&q!==root;q=q.parent)if(!q.visible)return false;return true;};
const all=(n,name)=>n.findAll(c=>c.name===name);
const setAll=async(n,labels)=>{let ts=n.findAllWithCriteria({types:['TEXT']}).filter(t=>visible(t,n));for(let i=0;i<labels.length&&i<ts.length;i++)await txt(ts[i],labels[i]);};
const header=async(root,mob)=>{
 const shell=box(root,'Official KRDS header','VERTICAL','gap/1');shell.resize(mob?360:1200,100);shell.layoutSizingVertical='HUG';
 if(!mob){await inst(shell,'masthead__pc|masthead__pc',[],true);const hd=await inst(shell,'header__pc|Type=horizontal',[],true);
  for(const n of all(hd,'slogan'))n.visible=false;
  const us=all(hd,'Utility-small')[0];let utility=us.children.filter(n=>n.type==='INSTANCE');for(const [i,n]of utility.entries()){if(i>1)n.visible=false;else await setAll(n,[i===0?'화면 설정':'도움말']);}for(const n of us.children.filter(n=>n.type!=='INSTANCE'))n.visible=false;
  const um=all(hd,'Utility-medium')[0];const menu=um.children.filter(n=>n.type==='INSTANCE');for(const[i,n]of menu.entries()){if(i>1)n.visible=false;else await setAll(n,[i===0?'로그인':'내 프로젝트']);}
  const mm=await inst(shell,'main_menu|main_menu',[],true);for(const n of mm.children.filter(n=>n.name==='main_menu_open'))n.visible=false;const its=all(mm,'main_menu_bar__atomic__pc');for(const[i,n]of its.entries()){if(i>3)n.visible=false;else await setAll(n,[['도구 찾기','요청 보드','도구 올리기','도움말'][i]]);}mm.layoutSizingVertical='HUG';
 }else {const hd=await inst(shell,'header__mo|Type=horizontal',[],true);const ts=hd.findAllWithCriteria({types:['TEXT']}).filter(t=>visible(t,hd));for(const t of ts){if(t.characters==='메뉴명')await txt(t,'로그인');} }
 root.insertChild(0,shell);return shell;
};
const footer=async(root,mob)=>{
 const ft=await inst(root,mob?'footer__mo|Type=basic':'footer__pc|footer__pc',[],false);ft.resize(mob?360:1200,ft.height);ft.layoutSizingVertical='HUG';
 for(const n of all(ft,'Related Site'))n.visible=false;
 if(mob){const content=ft.children.find(n=>n.name==='content');for(const n of content.children){if(n.name==='content'||n.name==='identifier__mo')n.visible=false;}for(const n of ft.children.filter(n=>n.name==='identifier__mo'))n.visible=false;content.layoutSizingVertical='HUG';}
 else{for(const n of all(ft,'grid'))n.visible=false;for(const n of all(ft,'fixed-con'))n.layoutSizingVertical='HUG';}
 for(const policy of all(ft,'정책')){let its=policy.children.filter(n=>n.type==='INSTANCE');for(const[i,n]of its.entries()){if(i>1)n.visible=false;else await setAll(n,[i===0?'개인정보처리방침':'이용약관']);}}
 for(const n of ft.findAllWithCriteria({types:['TEXT']})){if(n.characters.startsWith('©'))await txt(n,'본 화면은 행정안전부 KRDS를 이용하였습니다.');}
 for(const n of all(ft,'surface'))n.layoutSizingVertical='HUG';return ft;
};
const breadcrumb=async(p,mob,title)=>{const n=await inst(p,'breadcrumb|Type=up to 4',[],false);const kids=n.children;let count=0;for(let i=0;i<kids.length;i++){const c=kids[i];if(c.type==='INSTANCE'&&c.name.includes('breadcrumb')){const labels=['홈','도구 찾기',title];if(count<labels.length){await setAll(c,[labels[count]]);}else c.visible=false;count++;}else if(i>=5)c.visible=false;}if(mob){for(let i=1;i<kids.length;i++)if(i<4)kids[i].visible=false;}return n;};
const tabs=async(p,mob,active)=>{const n=box(p,'Project tabs','HORIZONTAL','gap/1');n.layoutSizingHorizontal='FILL';n.clipsContent=true;for(const t of ['소개','사용 방법','파일','변경 기록','의견']){const k=`${mob?'tab__atomic__mo':'tab__atomic'}|Type=${mob?'secondary':'primary'}, State=${t===active?'active':'default'}, Style=line`;const ins=await inst(n,k,[t]);if(!mob)ins.layoutSizingHorizontal='FILL';}return n;};
const structured=async(p,title,description,meta,mob)=>{
 const n=await inst(p,mob?'card|Type=vertical, Image=off':'card|Type=horizontal, Image=off',[],true);n.strokes=[];n.fills=[];n.layoutSizingVertical='HUG';for(const c of n.children.filter(c=>c.name==='checkbox__item'))c.visible=false;
 for(const name of ['top','tag','period'])for(const z of all(n,name))z.visible=false;
 const ct=all(n,'card-title')[0];const heading=ct.findAllWithCriteria({types:['TEXT']}).find(t=>t.name==='타이틀 영역');if(heading)await txt(heading,title);
 const desc=ct.children.find(c=>c.type==='TEXT');if(desc){await txt(desc,description);desc.textAutoResize='HEIGHT';}
 const m=all(n,'meta')[0];if(m){const ms=m.children.filter(c=>c.type==='TEXT');for(const[i,t]of ms.entries()){if(i===0){await txt(t,meta);t.textAutoResize='HEIGHT';t.layoutSizingHorizontal='FILL';}else t.visible=false;}for(const z of m.children.filter(c=>c.type!=='TEXT'))z.visible=false;}
 for(const z of n.findAll(c=>c.type==='INSTANCE'&&c.name==='button'))z.visible=false;
 return n;
};
const screen=ids[0].screen,states=ids[0].states;const pg=f.root.children.find(p=>p.name.startsWith('Screens / '+screen));await pg.loadAsync();await f.setCurrentPageAsync(pg);const sec=f.createSection();sec.name=screen+' / task and exception states';sec.strokes=[];pg.appendChild(sec);const created=[];
const field=async(p,label,placeholder,multi=false)=>{await text(p,label,'label/medium');let n=await inst(p,multi?'text_area|State=default':'text_input|Size=large, State=default',[],true);const ts=n.findAllWithCriteria({types:['TEXT']}).filter(t=>visible(t,n));if(ts.length)await txt(ts[ts.length-1],placeholder);return n;};
const note=async(p,title,copy)=>{let b=box(p,'Context guidance','VERTICAL','gap/3','padding/8','color/surface/gray-subtler');b.layoutSizingHorizontal='FILL';await text(b,title,'heading/small','color/text/basic',true);await text(b,copy,'body/medium','color/text/subtle',true);return b;};
const titles={'P-03':'업무 분야로 둘러보기','P-05':'파일과 설명','P-06':'변경 기록','P-08':'의견과 개선 요청','P-09':'도구 올리기','P-10':'내 프로젝트','P-11':'기관별 둘러보기','P-12':'로그인','P-13':'이용 안내','P-14':'도움말','P-15':'필요한 도구 요청'};
for(let si=0;si<states.length;si++)for(const width of [1920,360]){
const mob=width===360,state=states[si];const source=await f.getNodeByIdAsync(mob?'11038:907':'11038:686');const root=source.clone();sec.appendChild(root);root.name=`${screen} / ${state} / ${width} / light`;root.x=width===1920?0:4048;root.y=si*3000;const main=root.children.find(n=>n.name==='Main content');for(const n of [...main.children])n.remove();await breadcrumb(main,mob,titles[screen]);await text(main,titles[screen],'heading/xlarge','color/text/basic',true);
if(['P-05','P-06','P-08'].includes(screen)){await text(main,'국외여비계산기','heading/medium');await tabs(main,mob,screen==='P-05'?'파일':screen==='P-06'?'변경 기록':'의견');}
if(screen==='P-03'){
await text(main,'일하는 분야를 고르면 관련 도구를 찾아볼 수 있습니다.','body/medium','color/text/subtle',true);await note(main,'분야 분류 확인 안내','프로젝트 이름과 설명을 바탕으로 자동 분류한 초안입니다. 제작자가 정한 분야와 다를 수 있습니다.');for(const [t,d]of [['문서와 자료 정리','문서 작성과 엑셀 자료 정리에 쓰는 도구'],['출장과 여비','출장 경로와 여비 계산에 쓰는 도구'],['민원 업무','민원 내용 정리와 응답을 돕는 도구']])await structured(main,t,d,'분류 초안 / 도구 목록으로 이동',mob);await link(main,'원하는 도구가 없으면 요청하기');
}else if(screen==='P-05'){
await note(main,'파일을 실행하기 전에','처음 이용한다면 파일 목록보다 사용 방법을 먼저 확인하세요.');await button(main,'사용 방법 확인');await text(main,'파일 목록','heading/medium');await list(main,'README.md','제작자가 작성한 설명');await list(main,'2026_공무원_국외여비계산기_사용안내추가.html','브라우저로 여는 계산기 파일');await text(main,'제작자가 작성한 설명','heading/medium');await text(main,'공무원이 국외출장 여비(일비, 숙박비, 식비, 운임, 준비금)를 직접 계산해 볼 수 있는 단일 HTML 웹 계산기입니다.','body/medium','color/text/basic',true);await inst(main,'disclosure|State=default',['개발자용 정보 펼치기']);await text(main,'가져오기 주소, 브랜치와 자동 점검 설정은 펼친 뒤 확인할 수 있습니다.','body/small','color/text/subtle',true);
}else if(screen==='P-06'){
await text(main,'어떤 내용이 달라졌는지 확인하세요.','body/medium','color/text/subtle',true);await note(main,'아직 쉬운 설명이 등록되지 않았습니다.','변경 내용을 불러오면 제작자가 남긴 원문과 기준 날짜를 함께 표시합니다. 자동 설명은 확인이 필요한 초안으로 구분합니다.');await button(main,'변경 기록 불러오기','secondary');await link(main,'제작자에게 변경 내용 문의');
}else if(screen==='P-08'){
if(state==='Choose'){await text(main,'어떤 의견을 보내시겠어요?','heading/medium','color/text/basic',true);for(const [t,d]of [['오류 신고','잘되지 않는 단계와 화면을 알려 주세요.'],['기능 요청','필요한 기능과 업무 상황을 알려 주세요.'],['도입 문의','기관에서 사용하려면 확인할 사항을 물어보세요.']])await structured(main,t,d,'선택하고 작성하기',mob);}
else if(state==='Write'){await note(main,'제작자에게 보낼 오류 신고','개인정보, 실제 민원 내용이나 비밀번호는 올리지 마세요.');await field(main,'제목','예: 계산 결과가 저장되지 않습니다.');await field(main,'어느 단계에서 문제가 생겼나요?','문제가 생기기 전 한 일과 보이는 안내를 적어 주세요.',true);await field(main,'예상했던 결과','어떤 결과를 원했는지 적어 주세요.',true);await text(main,'현재 의견은 서비스에 저장됩니다. GitLab 제작자에게 자동 전송되지는 않습니다.','body/small','color/text/subtle',true);await button(main,'로그인하고 의견 남기기');}
else{await text(main,'아직 등록된 의견이 없습니다.','heading/medium','color/text/basic',true);await text(main,'사용 중 궁금한 점이나 개선할 점을 남겨 주세요.','body/medium','color/text/subtle',true);await button(main,'의견 작성');}
}else if(screen==='P-09'){
await note(main,'공개 전 확인','파일명과 설명에서 확인하는 1차 점검입니다. 보안 검사나 기관의 공개 승인을 대신하지 않습니다.');
if(state==='Upload'){await field(main,'도구 이름','업무에서 하는 일이 드러나는 이름');await field(main,'이 도구가 하는 일','어떤 업무에서 어떻게 쓰는지 적어 주세요.',true);await button(main,'비슷한 도구 먼저 확인','secondary');await inst(main,mob?'file_upload__atomic__mo|State=upload':'file_upload__atomic__pc|State=upload',[],true);await button(main,'공개 준비 점검');}
else {const blocked=state==='Blocked';await note(main,blocked?'공개를 진행할 수 없습니다.':'자동 점검 항목 모두 통과','자동 점검 항목의 통과는 공개 승인이 아닙니다. 실제 공개 여부는 전체 보안 점검과 기관 확인 뒤 판단해야 합니다.');for(const [t,v]of [['제외할 파일 설정(.gitignore)','확인'],['설명 파일(README)','확인'],['하는 일과 사용 방법','확인'],['실행 환경과 이용 조건','확인'],['테스트와 자동 점검 설정','확인']])await list(main,t,v);await note(main,'보안 항목',blocked?'제작자만 볼 수 있는 점검에서 주의 항목이 발견된 상태입니다. 파일 이름과 키 값은 공개 화면에 표시하지 않습니다.':'공개 화면에는 보안 상세를 표시하지 않습니다. 제작자 전용 결과를 함께 확인하세요.');await button(main,blocked?'비공개 점검 결과 확인':'기관 확인 후 공개 준비','secondary');if(blocked)await text(main,'주의 항목을 처리하기 전에는 공개할 수 없습니다.','body/medium','color/text/danger',true);}
}else if(screen==='P-10'){
await text(main,'내가 올린 도구와 받은 의견을 확인합니다.','body/medium','color/text/subtle',true);await note(main,'로그인이 필요합니다.','공공 깃랩 계정으로 로그인하면 내 도구와 제작자 전용 알림을 볼 수 있습니다.');await button(main,'공공 깃랩 계정으로 로그인');await link(main,'로그인 없이 도구 둘러보기');
}else if(screen==='P-11'){
await field(main,'기관 찾기','기관 이름을 입력하세요.');await button(main,'검색');for(const [t,d]of [['통일부','북한통계 온-ON'],['전남광주통합특별시 서구청','국외여비계산기'],['서울시교육청 대청중학교','관내여비 콕검']])await structured(main,t,d,'공개 프로젝트의 기관 표기 기준',mob);
}else if(screen==='P-12'){
await text(main,'공공 깃랩 계정으로 이용합니다.','heading/medium','color/text/basic',true);await text(main,'도구 둘러보기는 로그인 없이 가능합니다. 의견 남기기, 사용 기록과 도구 올리기에는 로그인이 필요합니다.','body/medium','color/text/subtle',true);await button(main,'공공 깃랩 계정으로 로그인');await note(main,'로그인 화면으로 이동합니다.','이 서비스에서 비밀번호를 직접 입력받지 않습니다. 공공 깃랩에서 로그인한 뒤 원래 화면으로 돌아옵니다.');await link(main,'계정이 없으신가요?');await link(main,'로그인 없이 둘러보기');
}else if(screen==='P-13'){
const copy=state==='NotFound'?['요청한 화면을 찾을 수 없습니다.','주소가 바뀌었거나 삭제된 화면입니다. 주소를 확인하거나 도구를 다시 찾아보세요.','도구 찾기']:state==='Forbidden'?['이 화면을 볼 수 있는 권한이 없습니다.','로그인한 계정에 권한이 없거나 비공개 프로젝트일 수 있습니다. 만든 기관에 접근 권한을 요청하세요.','로그인 상태 확인']:['점검 중입니다.','서비스 점검이 끝난 뒤 다시 이용해 주세요. 확인된 점검 일정이 없으므로 종료 시각을 임의로 표시하지 않습니다.','공지 확인'];await text(main,copy[0],'heading/large','color/text/basic',true);await text(main,copy[1],'body/medium','color/text/subtle',true);await button(main,copy[2]);await link(main,'첫 화면으로');
}else if(screen==='P-14'){
await text(main,'처음 쓰는 분 안내','heading/medium');for(const [t,d]of [['내 업무에 쓸 도구 찾기','업무를 문장으로 검색하고 분야와 실행 환경으로 좁혀 보세요.'],['사용하기 전에 확인','소개에서 실행 환경, 적용 기준과 이용 조건을 확인하세요.'],['내 PC에서 열어 보기','사용 방법에서 필요한 프로그램과 기관 보안 기준을 확인하세요.'],['의견과 사용 기록 남기기','로그인한 뒤 오류, 기능 요청 또는 도입 문의를 남길 수 있습니다.']])await structured(main,t,d,'안내 열기',mob);await inst(main,mob?'accordion__mo|Size=medium, State=close, Type=line':'accordion|Size=medium, State=close, Type=line',['업무망에서 쓸 수 있나요?']);await inst(main,mob?'accordion__mo|Size=medium, State=close, Type=line':'accordion|Size=medium, State=close, Type=line',['개인정보가 담긴 파일을 올려도 되나요?']);
}else if(screen==='P-15'){
if(state==='Write'){await note(main,'필요한 업무 도구를 알려 주세요.','개인정보나 내부 비공개 자료는 적지 마세요.');await field(main,'어떤 도구가 필요한가요?','업무와 원하는 결과를 적어 주세요.');await field(main,'지금은 어떻게 처리하나요?','반복하는 일과 어려운 점을 알려 주세요.',true);await field(main,'어떻게 달라지면 좋을까요?','필요한 기능을 적어 주세요.',true);await button(main,'로그인하고 요청 등록');}
else {await text(main,'아직 등록된 요청이 없습니다.','heading/medium','color/text/basic',true);await text(main,'필요한 도구가 없다면 업무 상황과 원하는 기능을 남겨 주세요. 다른 공무원도 같은 필요에 공감할 수 있습니다.','body/medium','color/text/subtle',true);await button(main,'필요한 도구 요청');await link(main,'기존 도구 먼저 찾아보기');}
}
root.layoutSizingVertical='HUG';created.push({id:root.id,name:root.name});const dark=root.clone();dark.name=root.name.replace('/ light','/ dark');dark.x=width===1920?2000:4488;dark.setExplicitVariableModeForCollection(mc,mc.modes.find(m=>m.name==='dark').modeId);created.push({id:dark.id,name:dark.name});
}sec.resizeWithoutConstraints(5000,states.length*3000);return {screen,section:sec.id,created};}
