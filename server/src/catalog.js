import fs from 'node:fs';import{parseCsv,createCatalog,synonyms,synonymSource}from'./catalog-core.js';
const csvText=fs.readFileSync(new URL('../data/projects.csv',import.meta.url),'utf8');const snapshot=JSON.parse(fs.readFileSync(new URL('../data/gitlab-public-snapshot.json',import.meta.url),'utf8'));
export const{projects,search}=createCatalog({csvText,snapshot});export{parseCsv,synonyms,synonymSource};
