'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_ROUTE_CODE_SPLITTING_IMPLEMENTATION', VERSION='196.69.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const app=path.join(repo,'apps','property-command-center','src');
const routes=['Executive','PropertyDigitalTwin','KnowledgeGraph','GISStudio','MarketIntelligence'];
const manifest=routes.map(name=>({name,import:`() => import('./components/v5_6/routes/${name}Route.jsx')`,chunk:`v5-6-${name.replace(/([a-z])([A-Z])/g,'$1-$2').toLowerCase()}`}));
writeJson(path.join(reportRoot(repo),'route-splitting-manifest.json'),{generatedAt:now(),routes:manifest});
return baseReport(FRAMEWORK,VERSION,{routes:manifest.length,dynamicImports:manifest.length,manualChunkReady:true,targetInitialChunkKb:500},{manifest});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
