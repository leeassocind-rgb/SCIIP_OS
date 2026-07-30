'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,key,tokens,jaccard,first,num,root,prior,load,canonicalText,evidenceIndex,resolve,report}=require('./sciip-v5-6-wave-2-7-common.cjs');
const FRAMEWORK='SCIIP_V5_6_EXECUTIVE_EVIDENCE_KPI_REBUILD',VERSION='196.95.0';
function run(repo){
const d=readJson(path.join(root(repo),'semantic-recommendation-evidence-links.json'),{links:[]}),q=readJson(path.join(root(repo),'evidence-review-queue.json'),{queue:[]});
const linked=d.links.filter(x=>x.resolvedEvidence).length,kpis={recommendations:d.links.length,evidenceLinkedRecommendations:linked,evidenceCoveragePct:d.links.length?Number((linked/d.links.length*100).toFixed(2)):100,pendingEvidenceReviews:q.queue.length,highConfidenceLinks:d.links.filter(x=>x.resolutionConfidence>=.85).length};
writeJson(path.join(root(repo),'executive-evidence-kpis.json'),{generatedAt:now(),kpis});
return report(FRAMEWORK,VERSION,{kpis:Object.keys(kpis).length,live:true},{kpis});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(root(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
