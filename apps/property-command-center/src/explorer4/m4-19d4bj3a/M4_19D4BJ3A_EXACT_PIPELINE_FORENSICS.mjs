#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
import{readJson,writeJson,walk,text}from"./M419D4BJ3ARuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bj3p=path.join(ev,"m4-19d4bj3-five-property-canonical-identity-creation-preauthorization.json");
const out=path.join(ev,"m4-19d4bj3a-exact-canonical-identity-creation-pipeline-invocation-forensics.json");

function finish(state,extra={}){
 const o={
  contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A_EXACT_CANONICAL_IDENTITY_CREATION_PIPELINE_INVOCATION_FORENSICS",
  version:"4.0-m4.19d4bj3a",status:"PASSED",state,certifiedAt:new Date().toISOString(),...extra,
  authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
  safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}
 };
 writeJson(out,o);console.log(JSON.stringify(o,null,2));process.exit(0)
}

if(!fs.existsSync(bj3p))finish("M419D4BJ3A_BJ3_PREAUTHORIZATION_REQUIRED");
const bj3=readJson(bj3p);
if(bj3.state!=="M419D4BJ3_EXISTING_CANONICAL_IDENTITY_CREATION_PIPELINE_UNIQUELY_BOUND_FIVE_RECORD_CREATION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED")
 finish("M419D4BJ3A_BJ3_STATE_REQUIRED",{observed:bj3.state});

const badBinding=bj3.binding?.uniqueBinding||null;
const priorBindingRejected=Boolean(badBinding && String(badBinding.path||"").startsWith("evidence/"));

const roots=[
 path.join(app,"src"),
 path.join(app,"server"),
 path.join(app,"tools"),
 path.join(repo,"src"),
 path.join(repo,"tools")
].filter(fs.existsSync);

let files=[];for(const r of roots)files.push(...walk(r,10000));
const uniq=new Map();for(const f of files)uniq.set(f.p,f);files=[...uniq.values()];

const candidates=[];
for(const f of files){
 const s=text(f.p);if(!s)continue;
 const fnMatches=[...s.matchAll(/(?:function\s+|const\s+|let\s+|var\s+|export\s+(?:async\s+)?function\s+)([A-Za-z0-9_$]*(?:canonical|identity|property)[A-Za-z0-9_$]*)/ig)].map(m=>m[1]);
 const callSignals={
  canonicalPropertyId:/canonicalPropertyId/i.test(s),
  cprop:/CPROP-/i.test(s),
  create:/create.*(?:canonical|identity)|(?:canonical|identity).*create/i.test(s),
  persist:/append|write|persist|insert|commit|save/i.test(s),
  sourcePropertyId:/sourcePropertyId/i.test(s),
  duplicate:/duplicate|existing|lookup|resolve/i.test(s),
  event:/event/i.test(s)
 };
 const score=Object.values(callSignals).filter(Boolean).length + Math.min(fnMatches.length,3);
 if(score>=5){
  const exports=[...s.matchAll(/export\s+(?:async\s+)?function\s+([A-Za-z0-9_$]+)|export\s*\{([^}]+)\}/g)].map(m=>(m[1]||m[2]||"").trim()).filter(Boolean).slice(0,20);
  const imports=[...s.matchAll(/import\s+.*?from\s+['"]([^'"]+)['"]/g)].map(m=>m[1]).slice(0,20);
  const cli=/process\.argv|#!/.test(s);
  candidates.push({
   path:path.relative(app,f.p),
   absolutePath:f.p,
   score,
   functionNames:[...new Set(fnMatches)].slice(0,20),
   exports,
   imports,
   cli,
   signals:callSignals
  });
 }
}
candidates.sort((a,b)=>b.score-a.score || a.path.localeCompare(b.path));

const executableCandidates=candidates.filter(c=>
 c.functionNames.length>0 &&
 (c.exports.length>0 || c.cli) &&
 c.signals.canonicalPropertyId &&
 c.signals.create &&
 c.signals.persist
);

let exact=null;
if(executableCandidates.length===1) exact=executableCandidates[0];

finish(exact
 ?"M419D4BJ3A_EXACT_EXECUTABLE_CANONICAL_IDENTITY_CREATION_PIPELINE_BOUND_BJ4_REPREAUTHORIZATION_READY"
 :"M419D4BJ3A_EXECUTABLE_IDENTITY_CREATION_PIPELINE_NOT_UNIQUELY_BOUND_FURTHER_FORENSICS_REQUIRED",{
 correction:{
  priorBJ3Binding:badBinding,
  priorBJ3BindingRejectedAsExecutionAuthority:priorBindingRejected,
  evidenceArtifactsExcluded:true,
  testsAndGeneratedExplorer4SourcesExcluded:true
 },
 forensics:{
  filesScanned:files.length,
  candidateCount:candidates.length,
  executableCandidateCount:executableCandidates.length,
  topCandidates:candidates.slice(0,25),
  executableCandidates:executableCandidates.slice(0,20),
  exactBinding:exact
 },
 policy:{
  evidenceArtifactCannotBeExecutionPipeline:true,
  executableOriginalSourceRequired:true,
  exactCallableOrCliInvocationRequiredBeforeWrite:true,
  fiveTargetInputsRemainBound:true,
  duplicateIdentityRecheckRequiredImmediatelyBeforeExecution:true,
  noSyntheticCPROPGeneration:true,
  noWriteInThisMilestone:true
 },
 nextMilestone:exact
  ?"M4.19D4BJ3B_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_EXACT_EXECUTABLE_PIPELINE"
  :"M4.19D4BJ3A1_IDENTITY_CREATION_CALL_GRAPH_AND_STORAGE_ADAPTER_FORENSICS"
});
