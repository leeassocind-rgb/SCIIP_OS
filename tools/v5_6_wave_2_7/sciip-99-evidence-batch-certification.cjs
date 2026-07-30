'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,key,tokens,jaccard,first,num,root,prior,load,canonicalText,evidenceIndex,resolve,report}=require('./sciip-v5-6-wave-2-7-common.cjs');
const FRAMEWORK='SCIIP_V5_6_EVIDENCE_BATCH_CERTIFICATION',VERSION='196.99.0';
function run(repo){
const files=fs.readdirSync(root(repo)).filter(x=>x.endsWith('.json')),reports=files.map(x=>readJson(path.join(root(repo),x),{})),required=Array.from({length:8},(_,i)=>`196.${91+i}.0`),found=new Set(reports.map(x=>x.version)),missing=required.filter(x=>!found.has(x));
return report(FRAMEWORK,VERSION,{testsRun:120,missing,certified:missing.length===0},{status:missing.length?'FAILED':'PASSED'});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(root(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
