
'use strict';
const fs=require('fs'),path=require('path');
function run(repo,{strict=true}={}){
 const files=fs.readdirSync(__dirname).filter(x=>/^sciip-11[1-7]-.*\.cjs$/.test(x)).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
 const results=[];
 for(const file of files){
  const mod=require(path.join(__dirname,file)),r=mod.run(repo);
  const out=path.join(repo,'reports','release-5.6','wave-2.8.1',`${r.version}-${r.framework.toLowerCase()}.json`);
  fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r,null,2));
  results.push(r);if(strict&&r.status!=='PASSED')throw new Error(`${file} failed: ${(r.result?.failures||[]).join(', ')}`);
 }
 return results;
}
if(require.main===module)run(process.argv[2]||process.cwd(),{strict:true});
module.exports={run};
