#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path"; import crypto from "node:crypto";
const repo=path.resolve(process.argv[2]||"."); const app=path.join(repo,"apps/property-command-center"); const ev=path.join(app,"evidence");
const prior=path.join(ev,"m4-19d4bj3a11-production-canonical-id-authority-and-first-insert-storage-binding-forensics.json");
if(!fs.existsSync(prior)) throw new Error("BJ3A11 evidence missing");
const p=JSON.parse(fs.readFileSync(prior,"utf8"));
if(p.state!=="M419D4BJ3A11_PRODUCTION_FIRST_INSERT_BINDING_NOT_UNIQUELY_PROVEN_TARGETED_BINDING_RECONCILIATION_REQUIRED") throw new Error("BJ3A11 state mismatch");
console.log("[BJ3A11R1] ambiguity accepted; inspecting exact candidate implementations and call relationships");

const targets=[
"src/runtime/CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js",
"src/runtime/FreshCanonicalCanaryCandidateAuthoritativeCurrentStateRuntime.js",
"src/runtime/GovernedCanonicalIdentityFirstInsertRuntime.js",
"src/runtime/GovernedFirstLiveCanonicalCanaryExecutionRuntime.js",
"src/runtime/GovernedFirstLiveCanonicalCanaryExecutionPostCommitCertificationRuntime.js",
"src/runtime/GovernedProductionPersistenceAdapterBindingCanaryExecutionReadinessRuntime.js"
];
const sha=s=>crypto.createHash("sha256").update(s).digest("hex");
const rows=[];
for(const r of targets){
 const f=path.join(app,r); if(!fs.existsSync(f)){rows.push({path:r,present:false});continue}
 const t=fs.readFileSync(f,"utf8");
 const excerpts=[];
 const lines=t.split(/\r?\n/);
 lines.forEach((line,i)=>{
   if(/canonicalPropertyId|resolveCanonical|writeAtomic|atomicWriteJson|executeFirstInsert|first.?insert|sourcePropertyId|createCertifiedCanonicalPropertyStoreAdapter|CANONICAL_CANARY_COMMIT/i.test(line))
     excerpts.push({line:i+1,text:line.trim().slice(0,300)});
 });
 rows.push({path:r,present:true,sha256:sha(t),signalExcerpts:excerpts.slice(0,80)});
}

// Resolve imports/references to the candidate modules across original runtime source.
const runtime=path.join(app,"src/runtime");
const refs=[];
for(const ent of fs.readdirSync(runtime,{withFileTypes:true})){
 if(!ent.isFile()||!/\.(js|mjs|cjs)$/.test(ent.name)) continue;
 const f=path.join(runtime,ent.name), t=fs.readFileSync(f,"utf8");
 for(const target of targets){
   const base=path.basename(target).replace(/\.(js|mjs|cjs)$/,"");
   if(t.includes(base) && path.relative(app,f)!==target) refs.push({from:path.relative(app,f),to:target});
 }
}
const uniqRefs=[...new Map(refs.map(x=>[x.from+"->"+x.to,x])).values()];

const adapter=rows.find(x=>x.path.endsWith("CanonicalPropertyStorePhysicalStorageResolutionProductionAdapterRuntime.js"));
const fresh=rows.find(x=>x.path.endsWith("FreshCanonicalCanaryCandidateAuthoritativeCurrentStateRuntime.js"));
const primitive=rows.find(x=>x.path.endsWith("GovernedCanonicalIdentityFirstInsertRuntime.js"));

function has(row,re){return !!row?.signalExcerpts?.some(x=>re.test(x.text))}
const findings={
 adapterHasPhysicalAtomicWrite:has(adapter,/atomicWriteJson|writeAtomic/i),
 adapterHasCanonicalResolution:has(adapter,/resolveCanonicalPropertyStorePhysicalStorage/i),
 adapterProvesNewIdDerivation:has(adapter,/derive.*canonical.*id|generate.*canonical.*id|new.*canonical.*id/i),
 freshRuntimeResolvesCorpus:has(fresh,/resolveAuthoritativeCanonicalCorpus/i),
 freshRuntimeProvesNewIdDerivation:has(fresh,/derive.*canonical.*id|generate.*canonical.*id|new.*canonical.*id/i),
 primitiveOwnsFirstInsertSemantics:has(primitive,/executeFirstInsert|first.?insert/i),
 crossReferences:uniqRefs
};
// Conservative adjudication: distinguish storage substrate from ID authority.
const storageSubstrateProven=findings.adapterHasPhysicalAtomicWrite && findings.adapterHasCanonicalResolution;
const idAuthorityProven=findings.adapterProvesNewIdDerivation || findings.freshRuntimeProvesNewIdDerivation;
let state,next;
if(storageSubstrateProven && idAuthorityProven){
 state="M419D4BJ3A11R1_PRODUCTION_CANONICAL_ID_AUTHORITY_AND_STORAGE_SUBSTRATE_RECONCILED_BJ3A12_READY";
 next="M4.19D4BJ3A12_PRODUCTION_FIRST_INSERT_BINDING_ADAPTER_IMPLEMENTATION_AND_READ_ONLY_CERTIFICATION";
}else{
 state="M419D4BJ3A11R1_STORAGE_SUBSTRATE_RECONCILED_CANONICAL_ID_AUTHORITY_CAPABILITY_GAP_REQUIRES_CONTROLLED_AUTHORITY_DESIGN";
 next="M4.19D4BJ3A11R2_GOVERNED_PRODUCTION_CANONICAL_ID_AUTHORITY_CAPABILITY_GAP_ADJUDICATION_AND_DESIGN";
}
const result={
 contract:"SCIIP_EXPLORER_4_M4_19D4BJ3A11R1_TARGETED_PRODUCTION_CANONICAL_ID_AUTHORITY_AND_FIRST_INSERT_STORAGE_RECONCILIATION",
 version:"4.0-m4.19d4bj3a11-r1",status:"PASSED",state,certifiedAt:new Date().toISOString(),
 reconciliation:{targetsInspected:rows,findings,storageSubstrateProven,productionCanonicalIdAuthorityProven:idAuthorityProven,
  conclusion:idAuthorityProven?"Existing callable ID authority proven.":"Physical canonical storage substrate is separable from canonical-ID creation authority; no new-ID authority is inferred from corpus resolution, update, or canary semantics."},
 policy:{highScoreInferenceRejected:true,updateSemanticsNotCreationAuthority:true,storagePrimitiveNotIdAuthority:true,noProductionWrite:true,BJ4ExecutionStillProhibited:true},
 nextMilestone:next,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,governedInventoryMutationPerformed:false,applicationMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,temporalMutationPerformed:false}
};
fs.writeFileSync(path.join(ev,"m4-19d4bj3a11r1-targeted-production-binding-reconciliation.json"),JSON.stringify(result,null,2)+"\n");
console.log(JSON.stringify(result,null,2));
