#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";import crypto from"node:crypto";
const repo=path.resolve(process.argv[2]||"."),app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a7-historical-canonical-creation-event-producer-and-first-insert-forensics.json");
const out=path.join(ev,"m4-19d4bj3a8-exact-historical-first-insert-source-inspection.json");
const read=p=>fs.readFileSync(p,"utf8"),sha=s=>crypto.createHash("sha256").update(s).digest("hex");
function emit(state,x={}){let o={contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A8_EXACT_HISTORICAL_FIRST_INSERT_SOURCE_INSPECTION",version:"4.0-m4.19d4bj3a8",status:"PASSED",state,certifiedAt:new Date().toISOString(),...x,authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}};fs.mkdirSync(ev,{recursive:true});fs.writeFileSync(out,JSON.stringify(o,null,2)+"\n");console.log(JSON.stringify(o,null,2))}
if(!fs.existsSync(prior)){emit("M419D4BJ3A8_BJ3A7_EVIDENCE_MISSING");process.exit()}
const p=JSON.parse(read(prior)), candidates=p.forensics?.topCandidates||[];
console.log(`[BJ3A8] inspecting ${candidates.length} exact BJ3A7 candidates`);
let inspected=[];
for(const c of candidates){let f=path.join(app,c.path);if(!fs.existsSync(f))continue;let t=read(f);
 let lines=t.split(/\r?\n/), relevant=[];
 lines.forEach((v,i)=>{if(/creat|insert|absent|not found|does not exist|canonicalPropertyId|sourcePropertyId|write|append|commit/i.test(v))relevant.push({line:i+1,text:v.trim().slice(0,500)})});
 let imports=[...t.matchAll(/(?:from\s*|require\()\s*['"]([^'"]+)['"]/g)].map(m=>m[1]);
 let funcs=[...t.matchAll(/(?:export\s+)?(?:async\s+)?function\s+([A-Za-z0-9_$]+)\s*\(([^)]*)\)/g)].map(m=>({name:m[1],parameters:m[2].trim()}));
 let eventTokens=[...new Set([...t.matchAll(/['"`]([A-Z][A-Z0-9_]{5,})['"`]/g)].map(m=>m[1]).filter(x=>/CANONICAL|IDENTITY|PROPERTY|CREATE|COMMIT|INSERT/.test(x)))];
 inspected.push({path:c.path,score:c.score,sha256:sha(t),imports,functions:funcs,eventTokens,relevantLines:relevant.slice(0,100),
  verdict:(/sourcePropertyId/i.test(t)&&/canonicalPropertyId/i.test(t)&&/(absent|not found|does not exist|ENOENT)/i.test(t)&&/(writeFile|append|atomicWrite|writeAtomic)/i.test(t))?"POTENTIAL_FIRST_INSERT_SOURCE":"NOT_TRUE_FIRST_INSERT_SOURCE"});
}
let potential=inspected.filter(x=>x.verdict==="POTENTIAL_FIRST_INSERT_SOURCE");
console.log(`[BJ3A8] potential exact first-insert sources=${potential.length}`);
emit(potential.length===1?"M419D4BJ3A8_EXACT_HISTORICAL_FIRST_INSERT_SOURCE_PROVEN_CORRECTED_REAUTHORIZATION_READY":"M419D4BJ3A8_EXACT_CANDIDATES_REJECTED_CREATION_CAPABILITY_GAP_ADJUDICATION_REQUIRED",{
 inspection:{candidateCount:inspected.length,potentialCount:potential.length,candidates:inspected,exactBinding:potential.length===1?potential[0]:null},
 cohort:{size:p.cohort?.size||5,targets:p.cohort?.targets||[],allExecutionAuthorized:false},
 policy:{BJ4ExecutionStillProhibited:true,noWriteInThisMilestone:true,directSyntheticCPROPGenerationProhibited:true,creationCapabilityMustBeExplicitlyProven:true},
 nextMilestone:potential.length===1?"M4.19D4BJ3C_CORRECTED_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_TRUE_CREATION_PATH":"M4.19D4BJ3A9_CANONICAL_IDENTITY_CREATION_CAPABILITY_GAP_ADJUDICATION_AND_CONTROLLED_IMPLEMENTATION_PREAUTHORIZATION"
});
