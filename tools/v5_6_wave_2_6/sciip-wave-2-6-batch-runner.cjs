
'use strict';
const fs=require('fs'),path=require('path');
const batches=[
 {name:'IDENTITY_SPATIAL',range:[71,76]},
 {name:'EVIDENCE_PERFORMANCE',range:[77,82]},
 {name:'GOVERNANCE',range:[83,85]},
 {name:'VALIDATION_CERTIFICATION',range:[86,90]}
];
function run(repo){
 const dir=__dirname, results=[];
 for(const batch of batches){
   const files=fs.readdirSync(dir).filter(f=>{
     const m=f.match(/^sciip-(\d+)-.*\.cjs$/);if(!m)return false;const n=Number(m[1]);return n>=batch.range[0]&&n<=batch.range[1];
   }).sort((a,b)=>Number(a.match(/\d+/)[0])-Number(b.match(/\d+/)[0]));
   for(const file of files){const mod=require(path.join(dir,file));const r=mod.run(repo);const out=path.join(repo,'reports','release-5.6','wave-2.6',`${r.version}-${r.framework.toLowerCase()}.json`);fs.mkdirSync(path.dirname(out),{recursive:true});fs.writeFileSync(out,JSON.stringify(r,null,2)+'\n');console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')throw new Error(`${file} failed`);results.push(r)}
 }
 return results;
}
if(require.main===module)run(process.argv[2]||process.cwd());
module.exports={run,batches};
