'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,normKey,num,first,reportRoot,priorRoot,walk,flatten,uniqueBy,loadPrior,normalizeAddress,canonicalPropertyKey,buildCanonical,collectCoordinateIndex,baseReport}=require('./sciip-v5-6-wave-2-6-common.cjs');
const FRAMEWORK='SCIIP_V5_6_EVIDENCE_KEY_NORMALIZATION',VERSION='196.77.0';
function run(repo){if(!repo)throw new Error('Repository path required');
const u=loadPrior(repo);const evidence=(u.evidence||[]).map(e=>({...e,normalizedEvidenceKey:normKey(e.evidenceId||e.sourceFile||stableId('EVIDENCE',e))}));
writeJson(path.join(reportRoot(repo),'normalized-evidence-registry.json'),{generatedAt:now(),evidence});
return baseReport(FRAMEWORK,VERSION,{evidence:evidence.length,normalized:evidence.filter(x=>x.normalizedEvidenceKey).length});
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const r=run(repo);writeJson(path.join(reportRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),r);console.log(JSON.stringify(r,null,2));if(r.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
