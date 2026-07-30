'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PRODUCTION_REPORT_DISCOVERY', VERSION='196.62.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const files=discoverFiles(repo);
const byRoot={};
for(const f of files){const root=f.relativePath.split(path.sep)[0];byRoot[root]=(byRoot[root]||0)+1;}
return baseReport(FRAMEWORK,VERSION,{filesDiscovered:files.length,roots:Object.keys(byRoot).length,recursive:true,release55Compatible:true},{byRoot,files:files.map(f=>f.relativePath)});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
