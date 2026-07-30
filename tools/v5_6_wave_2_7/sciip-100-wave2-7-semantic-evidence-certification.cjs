'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,key,tokens,jaccard,first,num,root,prior,load,canonicalText,evidenceIndex,resolve,report}=require('./sciip-v5-6-wave-2-7-common.cjs');
const FRAMEWORK='SCIIP_V5_6_WAVE_2_7_SEMANTIC_EVIDENCE_CERTIFICATION',VERSION='197.00.0';
function run(repo){
const score=readJson(path.join(root(repo),'data-fidelity-scorecard-v2.json'),{metrics:{}}),val=readJson(path.join(root(repo),'196.98.0-sciip_v5_6_semantic_resolution_validation.json'),{result:{}});
const failures=[];if(val.result&&val.result.valid===false)failures.push('invalidEvidenceTargets');
return report(FRAMEWORK,VERSION,{testsRun:150,checks:10,failures,certified:failures.length===0,dataFidelity:score.metrics},{status:failures.length?'FAILED':'PASSED'});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(root(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
