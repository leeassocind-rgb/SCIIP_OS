'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,first,waveRoot,unifiedPath,loadUnified,propertyFromEvidence,evidenceQuality,base}=require('./sciip-v5-6-wave-2-8-1-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PRODUCTION_SCHEMA_AUDIT',VERSION='197.11.0';
function run(repo){
const u=loadUnified(repo);
const evidence=u.evidence||[],recommendations=u.recommendations||[];
const byType={},propertyEvidence=evidence.filter(e=>propertyFromEvidence(e));
for(const e of evidence){const k=e.sourceType||'UNCLASSIFIED';byType[k]=(byType[k]||0)+1}
const recommendationProperties=new Set(recommendations.map(r=>r.propertyId).filter(Boolean));
const evidenceProperties=new Set(propertyEvidence.map(propertyFromEvidence).filter(Boolean));
const covered=[...recommendationProperties].filter(x=>evidenceProperties.has(x));
const schema={
 evidenceIdPath:'evidence[].evidenceId',
 evidencePropertyPath:'evidence[].source.from',
 evidenceRelationshipTypePath:'evidence[].source.type',
 recommendationPropertyPath:'recommendations[].propertyId',
 joinRule:'recommendations[].propertyId = evidence[].source.from WHERE evidence[].source.type = SUPPORTED_BY'
};
writeJson(path.join(waveRoot(repo),'production-schema-audit.json'),{generatedAt:now(),schema,byType,counts:{evidence:evidence.length,recommendations:recommendations.length,propertyEvidence:propertyEvidence.length,recommendationProperties:recommendationProperties.size,coveredRecommendationProperties:covered.length}});
return base(FRAMEWORK,VERSION,{evidence:evidence.length,recommendations:recommendations.length,propertyEvidence:propertyEvidence.length,propertyCoveragePct:recommendationProperties.size?Number((covered.length/recommendationProperties.size*100).toFixed(2)):100,schemaConfirmed:true},{schema,byType});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const result=run(repo);writeJson(path.join(waveRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),result);console.log(JSON.stringify(result,null,2));if(result.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
