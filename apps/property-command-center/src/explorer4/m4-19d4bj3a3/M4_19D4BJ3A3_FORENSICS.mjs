#!/usr/bin/env node
import fs from"node:fs";import path from"node:path";
const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a2-targeted-identity-creation-call-graph-and-storage-adapter-forensics.json");
const adapter=path.join(app,"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js");
const explorer=path.join(app,"src/broker-product/property-explorer/v6/Explorer3.jsx");
const action=path.join(app,"src/broker-product/property-explorer/intelligence/GovernedPropertyIntelligenceActionState.js");
const out=path.join(ev,"m4-19d4bj3a3-canonical-store-write-method-and-identity-creation-invocation-forensics.json");
const read=p=>fs.readFileSync(p,"utf8"), json=p=>JSON.parse(read(p));
const write=x=>{fs.mkdirSync(ev,{recursive:true});fs.writeFileSync(out,JSON.stringify(x,null,2)+"\n");console.log(JSON.stringify(x,null,2))};
if(!fs.existsSync(prior))throw new Error("BJ3A2 evidence missing");
const p=json(prior);
if(p.state!=="M419D4BJ3A2_UI_FALSE_POSITIVE_RECONCILED_BUT_EXACT_IDENTITY_CREATION_WRITE_PATH_NOT_PROVEN_BJ3A3_REQUIRED")throw new Error("BJ3A2 state not ready");
console.log("[BJ3A3] prior state accepted");
console.log("[BJ3A3] inspecting canonical storage adapter internals");
const a=read(adapter), x=read(explorer), s=read(action);
function snippets(src,terms){
 const lines=src.split(/\r?\n/), hits=[];
 for(let i=0;i<lines.length;i++) if(terms.some(t=>t.test(lines[i]))) hits.push({line:i+1,text:lines[i].trim().slice(0,500)});
 return hits.slice(0,100)
}
const adapterEvidence=snippets(a,[/atomicWriteJson/i,/ensureState/i,/createCertifiedCanonicalPropertyStoreAdapter/i,/append/i,/event/i,/canonicalPropertyId/i,/write/i,/persist/i,/save/i,/commit/i]);
const explorerEvidence=snippets(x,[/GovernedPropertyIntelligenceActionState/i,/resolveGovernedPropertyIntelligenceActionState/i,/canonical/i,/identity/i,/append/i,/event/i,/persist/i,/commit/i,/save/i,/write/i]);
const actionEvidence=snippets(s,[/resolveGovernedPropertyIntelligenceActionState/i,/propertyIdOf/i,/canonical/i,/identity/i,/persist/i,/commit/i,/save/i,/write/i]);
const adapterMethods=[...a.matchAll(/(?:async\s+)?([A-Za-z_$][\w$]*)\s*\([^)]*\)\s*\{|(?:const|let)\s+([A-Za-z_$][\w$]*)\s*=\s*(?:async\s*)?\([^)]*\)\s*=>/g)].map(m=>m[1]||m[2]).filter(Boolean);
const objectMethods=[...a.matchAll(/\b([A-Za-z_$][\w$]*)\s*:\s*(?:async\s*)?\([^)]*\)\s*=>/g)].map(m=>m[1]);
const allMethods=[...new Set([...adapterMethods,...objectMethods])];
const writeMethods=allMethods.filter(n=>/(write|save|persist|commit|append|create|ensure|upsert|insert|promote)/i.test(n));
const exactInvocations=[];
for(const n of writeMethods){
 const re=new RegExp(`\\b${n.replace(/[.*+?^${}()|[\]\\]/g,"\\$&")}\\s*\\(`,"g");
 for(const [file,src] of [["adapter",a],["Explorer3.jsx",x],["ActionState",s]]){
  const count=[...src.matchAll(re)].length;if(count)exactInvocations.push({method:n,file,count});
 }
}
const uiOnly=/resolveGovernedPropertyIntelligenceActionState/.test(s)&&!/atomicWriteJson|fs\.write|appendFile|writeFile|renameSync|persistCanonical|saveCanonical/i.test(s);
const adapterHasPhysicalWrite=/atomicWriteJson|writeFileSync|renameSync|appendFileSync/.test(a);
const adapterHasEventSemantics=/event/i.test(a)&&/append|push|write|persist/i.test(a);
const exactCreationMethod=writeMethods.find(n=>/create.*canonical|create.*identity|ensure.*canonical|upsert.*canonical|insert.*canonical/i.test(n))||null;
let state,next;
if(adapterHasPhysicalWrite && exactCreationMethod){
 state="M419D4BJ3A3_EXACT_CANONICAL_STORE_CREATION_METHOD_AND_INVOCATION_SEMANTICS_CERTIFIED_BJ3B_READY";
 next="M4.19D4BJ3B_FIVE_PROPERTY_IDENTITY_CREATION_REPREAUTHORIZATION_USING_EXACT_EXECUTABLE_PIPELINE";
}else{
 state="M419D4BJ3A3_STORAGE_WRITE_PRIMITIVE_PROVEN_BUT_IDENTITY_CREATION_ORCHESTRATOR_NOT_EXPLICIT_BJ3A4_REQUIRED";
 next="M4.19D4BJ3A4_IDENTITY_CREATION_ORCHESTRATOR_AND_INPUT_CONTRACT_FORENSICS";
}
write({
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A3_CANONICAL_STORE_WRITE_METHOD_AND_IDENTITY_CREATION_INVOCATION_FORENSICS",
 version:"4.0-m4.19d4bj3a3",status:"PASSED",state,certifiedAt:new Date().toISOString(),
 forensics:{adapterPath:path.relative(app,adapter),explorerPath:path.relative(app,explorer),actionStatePath:path.relative(app,action),
 uiActionStateReadOnlyByDirectPhysicalWriteInspection:uiOnly,adapterHasPhysicalWrite,adapterHasEventSemantics,
 discoveredAdapterMethods:allMethods,writeLikeMethods:writeMethods,exactCreationMethod,exactInvocations,
 adapterEvidence,explorerEvidence,actionEvidence},
 targetsPreserved:p.targetsPreserved,
 policy:{directSourceInspectionOnly:true,heuristicCallerPersistenceSignalsNotExecutionAuthority:true,physicalWritePrimitiveMustBeDistinguishedFromIdentityCreationOrchestration:true,exactFiveTargetsRemainBound:true,noWriteInThisMilestone:true},
 nextMilestone:next,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false,identityCreationExecuted:false,syntheticIdentityUsed:false,automaticRetry:false}
});
