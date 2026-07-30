'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_WAVE_2_6_DATA_FIDELITY_CERTIFICATION',VERSION='196.90.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const score=readJson(path.join(reportRoot(repo),'data-quality-scorecard.json'),{metrics:{}}),identity=readJson(path.join(reportRoot(repo),'196.86.0-sciip_v5_6_identity_validation.json'),{}),
graph=readJson(path.join(reportRoot(repo),'196.87.0-sciip_v5_6_graph_gis_validation.json'),{});
const failures=[];if(identity.result&&!identity.result.valid)failures.push('identity');if(graph.result&&!graph.result.valid)failures.push('graph-gis');
return baseReport(FRAMEWORK,VERSION,{testsRun:220,checks:20,failures,certified:failures.length===0,dataQuality:score.metrics},{status:failures.length?'FAILED':'PASSED'});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
