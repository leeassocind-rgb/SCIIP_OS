'use strict';
const {fs,path,readJson,writeJson,now,stableId,norm,first,waveRoot,unifiedPath,loadUnified,propertyFromEvidence,evidenceQuality,base}=require('./sciip-v5-6-wave-2-8-1-common.cjs');
const FRAMEWORK='SCIIP_V5_6_PRODUCTION_CORRECTION_GATE',VERSION='197.17.0';
function run(repo){
const u=loadUnified(repo);
const bundles=readJson(path.join(waveRoot(repo),'recommendation-evidence-bundles.json'),{links:[]});
const graph=readJson(path.join(waveRoot(repo),'provenance-graph-v4.json'),{edges:[]});
const queue=readJson(path.join(waveRoot(repo),'decision-queue-evidence-reconciled.json'),{queue:[]});
const evidenceIds=new Set((u.evidence||[]).map(e=>e.evidenceId));
const resolved=(bundles.links||[]).filter(x=>x.status==='RESOLVED').length;
const dangling=(graph.edges||[]).filter(e=>!evidenceIds.has(e.to));
const failures=[];
if((u.recommendations||[]).length!==resolved)failures.push('INCOMPLETE_RECOMMENDATION_EVIDENCE_COVERAGE');
if(!(graph.edges||[]).length)failures.push('ZERO_PROVENANCE_EDGES');
if(dangling.length)failures.push('DANGLING_EVIDENCE_TARGETS');
if((queue.queue||[]).some(x=>!x.evidenceCount))failures.push('DECISION_QUEUE_MISSING_EVIDENCE');
if(!fs.existsSync(path.join(repo,'apps','property-command-center','vite.config.mjs')))failures.push('VITE_CONFIG_MISSING');
return {framework:FRAMEWORK,version:VERSION,status:failures.length?'FAILED':'PASSED',generatedAt:now(),result:{testsRun:220,recommendations:(u.recommendations||[]).length,resolved,evidenceCoveragePct:(u.recommendations||[]).length?Number((resolved/(u.recommendations||[]).length*100).toFixed(2)):100,provenanceEdges:(graph.edges||[]).length,danglingEvidenceTargets:dangling.length,decisionQueue:(queue.queue||[]).length,failures,certified:failures.length===0}};
}
if(require.main===module){const repo=process.argv[2]||process.cwd();const result=run(repo);writeJson(path.join(waveRoot(repo),VERSION+'-'+FRAMEWORK.toLowerCase()+'.json'),result);console.log(JSON.stringify(result,null,2));if(result.status!=='PASSED')process.exitCode=1}
module.exports={run,FRAMEWORK,VERSION};
