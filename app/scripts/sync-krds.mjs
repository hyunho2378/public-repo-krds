import fs from 'node:fs/promises';
import path from 'node:path';
const kit=process.env.KRDS_KIT_PATH || path.join(process.env.HOME,'.aside/u/0/skills/user/krds-ui-kit');
await fs.mkdir('public/krds',{recursive:true});
await fs.cp(path.join(kit,'code/resources'),'public/krds/resources',{recursive:true});
await fs.cp(path.join(kit,'code/bridge'),'public/krds/bridge',{recursive:true});
const vars=JSON.parse(await fs.readFile(path.join(kit,'data/_dark_mode.json'),'utf8'));
// Dark uses the regular light component geometry. High-contrast-only borders/visual aids are never cloned.
let defs='html[data-krds-mode="dark"] {\n';
for(const [name,v] of Object.entries(vars)){
 if(name.startsWith('border-width/')&&typeof v.hex==='number'){defs+='  --krds-high-contrast-'+name.replaceAll('/','-')+': '+(v.hex/10)+'rem;\n';continue;}
 const value=typeof v.hex==='number'?(v.hex/10)+'rem':v.hex;
 if(typeof value!=='string')continue;
 const slug=name.replaceAll('/','-');
 defs+='  --krds-dark-'+slug+': '+value+';\n';
 defs+='  --krds-light-'+slug+': var(--krds-dark-'+slug+');\n';
 defs+='  --krds-'+slug+': var(--krds-dark-'+slug+');\n';
}
defs+='}\n';
await fs.mkdir('src/krds',{recursive:true});
await fs.writeFile('src/krds/dark.generated.css','/* D-01 generated from KRDS _dark_mode.json. Do not edit. */\n'+defs);
await fs.writeFile('src/krds/dark-source.json',JSON.stringify(vars,null,2));
console.log('KRDS resources copied; dark vars='+Object.keys(vars).length);
