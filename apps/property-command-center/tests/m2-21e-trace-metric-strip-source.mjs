import fs from'node:fs';
import path from'node:path';

const root=path.resolve('src');
const out=[];
function walk(dir){
  for(const name of fs.readdirSync(dir)){
    const p=path.join(dir,name);
    const st=fs.statSync(p);
    if(st.isDirectory()){ if(name!=='node_modules'&&name!=='dist')walk(p); continue; }
    if(!/\.(jsx?|tsx?)$/.test(name))continue;
    const s=fs.readFileSync(p,'utf8');
    const hits=['CLEAR','POWER','BUILDING','LAND','PARCEL','clearHeight','powerAmps']
      .filter(x=>s.includes(x));
    if(hits.length>=3)out.push({file:p,hits});
  }
}
walk(root);
console.log(JSON.stringify({framework:'M2.21E_METRIC_STRIP_SOURCE_TRACE',matches:out},null,2));
