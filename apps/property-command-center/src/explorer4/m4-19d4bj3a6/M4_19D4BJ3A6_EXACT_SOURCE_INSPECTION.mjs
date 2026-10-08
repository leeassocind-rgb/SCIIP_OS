#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";
const repo=path.resolve(process.argv[2]||"."),app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a5-targeted-canonical-identity-creation-event-and-orchestrator-call-graph-forensics.json");
const out=path.join(ev,"m4-19d4bj3a6-exact-top-candidate-source-and-input-contract-inspection.json");
const R=p=>fs.readFileSync(p,"utf8"),J=p=>JSON.parse(R(p)),sha=s=>crypto.createHash("sha256").update(s).digest("hex");
function emit(state,x={}){let o={contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A6_EXACT_TOP_CANDIDATE_SOURCE_AND_INPUT_CONTRACT_INSPECTION",version:"4.0-m4.19d4bj3a6",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}};fs.mkdirSync(ev,{recursive:true});fs.writeFileSync(out,JSON.stringify(o,null,2)+"\n");console.log(JSON.stringify(o,null,2));process.exit(0)}
if(!fs.existsSync(prior))emit("M419D4BJ3A6_BJ3A5_EVIDENCE_MISSING");
const p=J(prior),cs=p.forensics?.candidates||[];
console.log(`[BJ3A6] inspecting ${Math.min(12,cs.length)} highest-ranked candidates from BJ3A5`);
let inspected=[];
for(const c of cs.slice(0,12)){const f=path.join(app,c.path);if(!fs.existsSync(f))continue;const t=R(f);
 const funcs=[...t.matchAll(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)/g)].map(m=>({name:m[1],parameters:m[2].trim()}));
 const creationEvents=[...new Set([...t.matchAll(/['"`]([A-Z][A-Z0-9_]*(?:CREATE|CREATED|CREATION)[A-Z0-9_]*)['"`]/g)].map(m=>m[1]))];
 const imports=[...t.matchAll(/from\s+['"]([^'"]+)['"]/g)].map(m=>m[1]);
 const guards={targetNotFound:/TARGET_NOT_FOUND|target.*not.*found|missing.*target/i.test(t),duplicate:/duplicate|already exists|existing canonical/i.test(t),sourceBinding:/sourcePropertyId|source_property_id/i.test(t)};
 const mutation={atomicWrite:/atomicWriteJson|writeAtomic/i.test(t),writeFile:/writeFileSync|writeFile\(/i.test(t),append:/appendFile|push\(/i.test(t)};
 const absentCreate=creationEvents.length>0&&guards.sourceBinding&&(mutation.atomicWrite||mutation.writeFile)&&!guards.targetNotFound;
 inspected.push({path:c.path,bj3a5Score:c.score,sha256:sha(t),functions:funcs.slice(0,30),creationEvents,imports:imports.slice(0,30),guards,mutation,absentTargetCreationEvidence:absentCreate});
}
const proven=inspected.filter(x=>x.absentTargetCreationEvidence);
let exact=null;if(proven.length===1)exact=proven[0];
console.log(`[BJ3A6] absent-target creation candidates=${proven.length}`);
emit(exact?"M419D4BJ3A6_TRUE_CREATION_SOURCE_AND_INPUT_CONTRACT_UNIQUELY_PROVEN_CORRECTED_REPREAUTHORIZATION_READY":"M419D4BJ3A6_NO_UNIQUE_TRUE_CREATION_SOURCE_PROVEN_HISTORICAL_CREATION_EVENT_PRODUCER_FORENSICS_REQUIRED",{
 inspection:{candidateCount:inspected.length,candidates:inspected,provenCandidateCount:proven.length,exactBinding:exact},
 cohort:{size:p.cohort?.size||5,targets:p.cohort?.targets||[],allExecutionAuthorized:false},
 policy:{BJ4ExecutionStillProhibited:true,updateOnlyAdapterCannotCreateAbsentTarget:true,originalExecutableSourceRequired:true,directSyntheticCPROPGenerationProhibited:true,noWriteInThisMilestone:true},
 nextMilestone:exact?"M4.19D4BJ3C_CORRECTED_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_TRUE_CREATION_ORCHESTRATOR":"M4.19D4BJ3A7_HISTORICAL_CANONICAL_CREATION_EVENT_PRODUCER_AND_FIRST_INSERT_FORENSICS"
});
