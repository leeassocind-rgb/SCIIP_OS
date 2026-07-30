'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_DASHBOARD_FIDELITY_VALIDATION',VERSION='196.88.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const score=readJson(path.join(reportRoot(repo),'data-quality-scorecard.json'),{metrics:{}}),u=loadPrior(repo);
const kpis={canonicalProperties:readJson(path.join(reportRoot(repo),'canonical-property-registry.json'),{properties:[]}).properties.length,relationships:(u.relationships||[]).length,evidence:(u.evidence||[]).length,events:(u.events||[]).length,comparables:(u.comparables||[]).length,dataQualityPct:score.metrics.overallPct||0};
writeJson(path.join(reportRoot(repo),'executive-data-fidelity-kpis.json'),{generatedAt:now(),kpis});
return baseReport(FRAMEWORK,VERSION,{kpis:Object.keys(kpis).length,live:true,nonZero:Object.values(kpis).filter(x=>Number(x)>0).length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
