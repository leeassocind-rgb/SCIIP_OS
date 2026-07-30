'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,key,tokens,jaccard,first,num,root,prior,load,canonicalText,evidenceIndex,resolve,report}=require('./sciip-v5-6-wave-2-7-common.cjs');
const FRAMEWORK='SCIIP_V5_6_MULTI_STRATEGY_EVIDENCE_RESOLVER',VERSION='196.92.0';
function run(repo){
const u=load(repo),idx=evidenceIndex(u),links=[];
for(const r of u.recommendations||[]){const hit=resolve(r,idx);links.push({...r,resolvedEvidence:hit.evidence?{evidenceId:hit.evidence.evidenceId,sourceFile:hit.evidence.sourceFile||null}:null,resolutionMethod:hit.method,resolutionConfidence:hit.confidence})}
writeJson(path.join(root(repo),'semantic-recommendation-evidence-links.json'),{generatedAt:now(),links});
const linked=links.filter(x=>x.resolvedEvidence).length;
const byMethod={};for(const x of links)byMethod[x.resolutionMethod]=(byMethod[x.resolutionMethod]||0)+1;
return report(FRAMEWORK,VERSION,{recommendations:links.length,linked,unlinked:links.length-linked,coveragePct:links.length?Number((linked/links.length*100).toFixed(2)):100},{byMethod});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(root(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
