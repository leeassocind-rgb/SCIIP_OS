'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,key,tokens,jaccard,first,num,root,prior,load,canonicalText,evidenceIndex,resolve,report}=require('./sciip-v5-6-wave-2-7-common.cjs');
const FRAMEWORK='SCIIP_V5_6_DATA_FIDELITY_SCORECARD_V2',VERSION='196.97.0';
function run(repo){
const links=readJson(path.join(root(repo),'semantic-recommendation-evidence-links.json'),{links:[]}),g=readJson(path.join(root(repo),'provenance-graph-rebuilt.json'),{edges:[]}),sp=readJson(path.join(repo,'reports','release-5.6','wave-2.6','canonical-spatial-properties.json'),{properties:[]}),joins=readJson(path.join(repo,'reports','release-5.6','wave-2.6','cross-domain-canonical-joins.json'),{domains:{}});
const totalJoin=Object.values(joins.domains||{}).reduce((a,x)=>a+x.length,0),joined=Object.values(joins.domains||{}).flat().filter(x=>x.canonicalPropertyId||x.fromCanonicalPropertyId||x.toCanonicalPropertyId).length;
const metrics={spatialCoveragePct:sp.properties.length?Number((sp.properties.filter(x=>x.latitude!=null&&x.longitude!=null).length/sp.properties.length*100).toFixed(2)):100,evidenceLinkagePct:links.links.length?Number((links.links.filter(x=>x.resolvedEvidence).length/links.links.length*100).toFixed(2)):100,provenanceCoveragePct:links.links.length?Number((g.edges.length/links.links.length*100).toFixed(2)):100,crossDomainJoinPct:totalJoin?Number((joined/totalJoin*100).toFixed(2)):100};
metrics.overallPct=Number((Object.values(metrics).reduce((a,b)=>a+b,0)/4).toFixed(2));
writeJson(path.join(root(repo),'data-fidelity-scorecard-v2.json'),{generatedAt:now(),metrics});
return report(FRAMEWORK,VERSION,{metrics:Object.keys(metrics).length,overallPct:metrics.overallPct},{metrics});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(root(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
