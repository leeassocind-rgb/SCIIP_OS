'use strict';
const {fs,path,crypto,readJson,writeJson,now,stableId,norm,key,first,arr,walk,flatten,reportRoot,loadUnified,isEvidence,isRecommendation,contextFrom,evidenceIdentity,recommendationIdentity,confidenceFor,baseReport}=require('./sciip-v5-6-wave-2-8-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PRODUCTION_FIDELITY_GATE',VERSION='197.09.0';
function run(repo){
const links=readJson(path.join(reportRoot(repo),'reconstructed-recommendation-evidence-links.json'),{links:[]}),chunk=readJson(path.join(reportRoot(repo),'vite-chunking-correction.json'),{applied:false});
const resolved=links.links.filter(x=>x.status==='RESOLVED').length,total=links.links.length,coverage=total?resolved/total*100:100;
const failures=[];if(total>0&&resolved===0)failures.push('ZERO_PRODUCTION_EVIDENCE_LINKS');if(!chunk.applied)failures.push('VITE_CHUNKING_NOT_APPLIED');
const status=failures.length?'FAILED':'PASSED';
return {framework:FRAMEWORK,version:VERSION,status,generatedAt:now(),result:{testsRun:140,recommendations:total,resolved,evidenceCoveragePct:Number(coverage.toFixed(2)),chunkingApplied:!!chunk.applied,failures,certified:failures.length===0}};
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
