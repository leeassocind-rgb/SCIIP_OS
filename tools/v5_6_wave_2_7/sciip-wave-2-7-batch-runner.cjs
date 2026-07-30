
'use strict';
const fs=require('fs'),path=require('path');
function run(repo){
 const files=fs.readdirSync(__dirname).filter(x=>/^sciip-(9[1-9]|100)-.*\.cjs$/.test(x)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
 const results=[];
 for(const f of files){const m=require(path.join(__dirname,f));const r=m.run(repo);const out=path.join(repo,'reports','release-5.6','wave-2.7',`${r.version}-${r.framework.toLowerCase()}.json`);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')throw new Error(`${f} failed`);results.push(r)}
 return results;
}
if(require.main===module)run(process.argv[2]||process.cwd());
module.exports={run};
