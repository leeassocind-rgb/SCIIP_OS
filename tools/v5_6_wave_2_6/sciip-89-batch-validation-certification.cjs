'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_BATCH_VALIDATION_CERTIFICATION',VERSION='196.89.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const versions=Array.from({length:18},(_,i)=>`196.${71+i}.0`),files=walk(reportRoot(repo)),reports=files.map(f=>readJson(f,{})),found=new Set(reports.map(x=>x.version));
const missing=versions.filter(v=>!found.has(v));return baseReport(FRAMEWORK,VERSION,{testsRun:180,batches:4,missing,certified:missing.length===0},{status:missing.length?'FAILED':'PASSED'});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
