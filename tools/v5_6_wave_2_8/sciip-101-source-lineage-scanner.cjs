'use strict';
const {fs,path,crypto,readJson,writeJson,now,stableId,norm,key,first,arr,walk,flatten,reportRoot,loadUnified,isEvidence,isRecommendation,contextFrom,evidenceIdentity,recommendationIdentity,confidenceFor,baseReport}=require('./sciip-v5-6-wave-2-8-common.cjs');
const FRAMEWORK='SCIIP_V5_6_SOURCE_LINEAGE_SCANNER',VERSION='197.01.0';
function run(repo){
const files=[...walk(path.join(repo,'data')),...walk(path.join(repo,'reports'))].filter(f=>!f.includes(path.join('release-5.6','wave-2.8')));
const evidence=[],recommendations=[],errors=[];
for(const file of files){
 try{
  const raw=fs.readFileSync(file,'utf8').trim(); if(!raw)continue;
  let data;
  if(file.endsWith('.jsonl')||file.endsWith('.ndjson'))data=raw.split(/\r?\n/).filter(Boolean).map(x=>JSON.parse(x)); else data=JSON.parse(raw);
  const records=[];flatten(data,records);
  for(const r of records){
    if(isEvidence(r.value))evidence.push({evidenceId:evidenceIdentity(r.value),file:path.relative(repo,file),jsonPath:r.path,context:contextFrom(r.value,r.parents,file),record:r.value});
    if(isRecommendation(r.value))recommendations.push({recommendationId:recommendationIdentity(r.value),file:path.relative(repo,file),jsonPath:r.path,context:contextFrom(r.value,r.parents,file),record:r.value});
  }
 }catch(e){errors.push({file:path.relative(repo,file),error:String(e.message||e)})}
}
writeJson(path.join(reportRoot(repo),'source-lineage-scan.json'),{generatedAt:now(),filesScanned:files.length,evidence,recommendations,errors});
return baseReport(FRAMEWORK,VERSION,{filesScanned:files.length,evidenceOccurrences:evidence.length,recommendationOccurrences:recommendations.length,parseErrors:errors.length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
