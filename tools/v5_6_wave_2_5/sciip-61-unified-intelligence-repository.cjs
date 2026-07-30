'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_UNIFIED_INTELLIGENCE_REPOSITORY', VERSION='196.61.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const repository=loadRepository(repo);
const out=path.join(reportRoot(repo),'unified-intelligence-repository.json');
writeJson(out,repository);
return baseReport(FRAMEWORK,VERSION,{
 sourceFiles:repository.sourceFileCount,rawObjects:repository.rawObjectCount,
 properties:repository.properties.length,relationships:repository.relationships.length,
 evidence:repository.evidence.length,recommendations:repository.recommendations.length,
 events:repository.events.length,comparables:repository.comparables.length,gisFeatures:repository.gis.length,
 repositoryStatus:'OPERATIONAL'
},{repositoryPath:out});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
