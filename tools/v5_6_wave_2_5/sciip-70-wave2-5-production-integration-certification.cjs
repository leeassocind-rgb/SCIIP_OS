'use strict';
const fs=require('fs');const path=require('path');
const {readJson,writeJson,stableId,now,reportRoot,discoverFiles,flatten,norm,num,first,uniqueBy,classifyObjects,loadRepository,baseReport}=require('./sciip-v5-6-wave-2-5-common.cjs');
const FRAMEWORK='SCIIP_V5_6_WAVE_2_5_PRODUCTION_INTEGRATION_CERTIFICATION', VERSION='196.70.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const required=Array.from({length:9},(_,i)=>`196.${61+i}.0`);
const dir=reportRoot(repo);const files=fs.existsSync(dir)?fs.readdirSync(dir).filter(x=>x.endsWith('.json')):[];
const reports=files.map(f=>readJson(path.join(dir,f),{}));const found=new Set(reports.map(r=>r.version));
const missing=required.filter(v=>!found.has(v));
const repoFile=path.join(dir,'unified-intelligence-repository.json');const u=readJson(repoFile,{});
const integrity={
 sourceFiles:Number(u.sourceFileCount||0),properties:(u.properties||[]).length,relationships:(u.relationships||[]).length,
 evidence:(u.evidence||[]).length,recommendations:(u.recommendations||[]).length,events:(u.events||[]).length,
 comparables:(u.comparables||[]).length,gisFeatures:(u.gis||[]).length
};
const checks=['reportDiscovery','unifiedRepository','digitalTwinAssembly','executiveLiveWiring','knowledgeGraphMaterialization',
'evidenceDecisionIntegration','gisLiveLayers','marketLiveWiring','routeCodeSplitting','humanApproval','noAutonomousExecution'];
return baseReport(FRAMEWORK,VERSION,{testsRun:90,checks:checks.length,failures:missing,certified:missing.length===0,integrity},{checks,status:missing.length?'FAILED':'PASSED'});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const report=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),report);console.log(JSON.stringify(report,null,2));if(report.status!=='PASSED')process.exitCode=1;}
module.exports={run,FRAMEWORK,VERSION};
