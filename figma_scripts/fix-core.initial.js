async(ids)=>{
const f=window.figma,vs=await f.variables.getLocalVariablesAsync(),vm=Object.fromEntries(vs.map(v=>[v.name,v])),sty=(await f.getLocalTextStylesAsync()).find(s=>s.name==='body/medium');
await f.loadFontAsync({family:'Pretendard GOV',style:'Regular'});let cnt=0;
for(const a of ids){
 const n=await f.getNodeByIdAsync(a.id),mob=a.name.includes('/ 360 /');
 for(const par of n.findAllWithCriteria({types:['FRAME']})){
  if(['Filters','Environment selection'].includes(par.name)){
   const labels=par.name==='Filters'?['인터넷망에서 사용','설치 없이 사용','기준 날짜 있음']:['인터넷망 PC','업무망 PC','잘 모르겠어요'];
   const inds=par.children.filter(c=>c.type==='INSTANCE'&&['checkbox__item','radio_button__item'].includes(c.name));
   for(let i=0;i<inds.length;i++){
    const ins=inds[i],idx=par.children.indexOf(ins),row=f.createFrame();row.name='Selection option';row.layoutMode='HORIZONTAL';row.primaryAxisSizingMode='AUTO';row.counterAxisSizingMode='AUTO';row.counterAxisAlignItems='CENTER';row.fills=[];row.setBoundVariable('itemSpacing',vm['gap/3']);par.insertChild(idx,row);row.appendChild(ins);
    const t=f.createText();t.name='Option label';await t.setTextStyleIdAsync(sty.id);t.characters=labels[i];t.fills=[f.variables.setBoundVariableForPaint({type:'SOLID',color:{r:0,g:0,b:0}},'color',vm['color/text/basic'])];row.appendChild(t);cnt++;
   }
  }
  if(par.name==='Result row'&&mob){for(const ins of par.children.filter(c=>c.type==='INSTANCE')){ins.layoutSizingHorizontal='FILL';for(const t of ins.findAllWithCriteria({types:['TEXT']})){if(t.characters.length>12){try{t.textAutoResize='HEIGHT';t.layoutSizingHorizontal='FILL';}catch(e){}}}}}
 }
 for(const ins of n.findAllWithCriteria({types:['INSTANCE']})){
  const c=await ins.getMainComponentAsync();if(c?.parent?.name==='text_input'){
   const ts=ins.findAllWithCriteria({types:['TEXT']});if(ts.length>1){await f.loadFontAsync(ts[1].fontName);ts[1].characters=a.name.startsWith('P-01')?'예: 출장비를 계산하고 싶어요':'출장 여비';}
  }
 }
}
return cnt;
}
