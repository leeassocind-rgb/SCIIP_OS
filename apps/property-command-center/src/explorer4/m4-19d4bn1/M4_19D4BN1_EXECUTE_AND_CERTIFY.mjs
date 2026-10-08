#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";

const repo=path.resolve(process.argv[2]||".");
const token=process.argv[3]||"";
const EXPECTED_TOKEN="AUTHORIZE_M419D4BN1_CONTROLLED_TEN_PROPERTY_RUNTIME_MIRROR_PROPAGATION_EXECUTION";
if(token!==EXPECTED_TOKEN) throw new Error("fresh explicit BN1 authorization token required");

const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");
function need(p){if(!fs.existsSync(p))throw new Error("required input missing: "+p);return p;}
function sha(p){return crypto.createHash("sha256").update(fs.readFileSync(p)).digest("hex");}
function readJson(p){return JSON.parse(fs.readFileSync(p,"utf8"));}
function atomicCopy(src,dst){
 const tmp=dst+".tmp-"+process.pid+"-"+Date.now();
 fs.copyFileSync(src,tmp);
 fs.renameSync(tmp,dst);
}

const bnPath=need(path.join(ev,"m4-19d4bn-ten-property-runtime-mirror-propagation-and-browser-visibility-preauthorization.json"));
const canonicalPath=need(path.join(app,"src/production-validation/canonical-property-identity-data.json"));
const runtimePath=need(path.join(app,"public/production-validation-data/canonical-property-identity-data.json"));
const eventPath=need(path.join(app,"src/production-validation/canonical-identity-creation-events.jsonl"));
const inventoryPath=need(path.join(app,"public/explorer/governed-base-inventory.json"));
const out=path.join(ev,"m4-19d4bn1-controlled-ten-property-runtime-mirror-propagation-execution-and-parity-certification.json");
const backupDir=path.join(ev,"m4-19d4bn1-backups");
fs.mkdirSync(backupDir,{recursive:true});

const BN=readJson(bnPath);
const expectedState="M419D4BN_EXACT_TEN_PROPERTY_RUNTIME_MIRROR_DELTA_CERTIFIED_PROPAGATION_AND_BROWSER_VISIBILITY_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED";
if(BN.status!=="PASSED"||BN.state!==expectedState) throw new Error("BN prerequisite not certified");

const P=BN.propagationPreauthorization;
if(!P?.preauthorized||P.executionAuthorized!==false) throw new Error("BN propagation preauthorization invalid");
if(P.maximumRuntimeBindings!==10) throw new Error("BN maximum runtime bindings mismatch");
const manifest=P.propagationManifest;
if(!manifest||manifest.recordCount!==10) throw new Error("BN exact-ten propagation manifest unresolved");

const before={
 canonical:sha(canonicalPath),
 runtime:sha(runtimePath),
 events:sha(eventPath),
 inventory:sha(inventoryPath)
};

if(before.canonical!==manifest.sourceCanonicalStore.sha256) throw new Error("canonical drift since BN");
if(before.runtime!==manifest.targetRuntimeMirror.sha256Before) throw new Error("runtime drift since BN");
if(before.events!==manifest.externalCreationEventStore.sha256) throw new Error("event store drift since BN");
if(before.inventory!==manifest.governedInventory.sha256) throw new Error("inventory drift since BN");
if(before.canonical===before.runtime) throw new Error("runtime already at canonical parity; refusing unexpected reexecution");

const canonical=readJson(canonicalPath);
const runtimeBefore=readJson(runtimePath);
for(const [name,obj] of [["canonical",canonical],["runtime",runtimeBefore]]){
 if(!obj||typeof obj!=="object"||Array.isArray(obj)) throw new Error(name+" store must be structured object");
 for(const k of ["identities","aliasLedger","events"]) if(!Array.isArray(obj[k])) throw new Error(name+" missing "+k);
}

function counts(store,r){
 return {
  identities:store.identities.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId).length,
  aliases:store.aliasLedger.filter(x=>x?.canonicalPropertyId===r.canonicalPropertyId&&x?.sourcePropertyId===r.sourcePropertyId).length,
  events:store.events.filter(x=>x?.eventType==="CANONICAL_IDENTITY_CREATED"&&x?.canonicalPropertyId===r.canonicalPropertyId&&x?.sourcePropertyId===r.sourcePropertyId).length
 };
}
const records=manifest.exactTenRecords;
if(!Array.isArray(records)||records.length!==10) throw new Error("exact ten records unresolved");
for(const r of records){
 const c=counts(canonical,r), m=counts(runtimeBefore,r);
 if(!(c.identities===1&&c.aliases===1&&c.events===1)) throw new Error("canonical exact-once preflight failed: "+r.sourcePropertyId);
 if(!(m.identities===0&&m.aliases===0&&m.events===0)) throw new Error("runtime absence preflight failed: "+r.sourcePropertyId);
}

const backupPath=path.join(backupDir,"canonical-property-identity-data.runtime.pre-bn1.bak");
fs.copyFileSync(runtimePath,backupPath);
const backupSha=sha(backupPath);
if(backupSha!==before.runtime) throw new Error("runtime backup verification failed");

let writePerformed=false;
try{
 atomicCopy(canonicalPath,runtimePath);
 writePerformed=true;

 const afterRuntimeSha=sha(runtimePath);
 if(afterRuntimeSha!==P.exactPostWriteSha256Required) throw new Error("post-write runtime sha mismatch");
 if(afterRuntimeSha!==before.canonical) throw new Error("runtime did not reach canonical byte parity");

 const runtimeAfter=readJson(runtimePath);
 const certification=records.map(r=>{
  const m=counts(runtimeAfter,r);
  return {...r,runtimeIdentityCount:m.identities,runtimeAliasCount:m.aliases,runtimeCanonicalEventCount:m.events,
   exactRuntimeVisibility:m.identities===1&&m.aliases===1&&m.events===1};
 });
 if(!certification.every(x=>x.exactRuntimeVisibility)) throw new Error("exact-ten runtime read-after-write certification failed");

 const after={
  canonical:sha(canonicalPath),
  runtime:sha(runtimePath),
  events:sha(eventPath),
  inventory:sha(inventoryPath)
 };
 if(after.canonical!==before.canonical) throw new Error("canonical mutated during propagation");
 if(after.events!==before.events) throw new Error("event store mutated during propagation");
 if(after.inventory!==before.inventory) throw new Error("inventory mutated during propagation");

 const R={
  contract:"SCIIP_EXPLORER_4_M4_19D4BN1_CONTROLLED_TEN_PROPERTY_RUNTIME_MIRROR_PROPAGATION_EXECUTION_AND_PARITY_CERTIFICATION",
  version:"4.0-m4.19d4bn1",
  status:"PASSED",
  state:"M419D4BN1_TEN_PROPERTY_RUNTIME_MIRROR_PROPAGATION_EXECUTED_EXACT_PARITY_CERTIFIED_BROWSER_VISIBILITY_CERTIFICATION_READY",
  certifiedAt:new Date().toISOString(),
  authorization:{
   tokenAccepted:true,
   maximumRuntimeBindings:10,
   cohortHash:manifest.cohortHash,
   executionManifestHash:manifest.executionManifestHash,
   propagationManifestHash:P.propagationManifestHash
  },
  execution:{
   target:runtimePath,
   propagationMode:manifest.propagationMode,
   recordsPropagated:10,
   wholeObjectAtomicReplace:true,
   backupCreated:true,
   readAfterWriteVerified:true,
   certification
  },
  storageHashes:{before,after},
  backup:{path:backupPath,sha256:backupSha},
  checks:{
   bnPassed:true,
   exactTenManifest:true,
   exactTenAbsentBeforeWrite:true,
   runtimeMirrorChanged:before.runtime!==after.runtime,
   runtimeMatchesCanonicalByteForByte:after.runtime===after.canonical,
   exactTenVisibleAfterWrite:certification.every(x=>x.exactRuntimeVisibility),
   canonicalStoreUnchanged:before.canonical===after.canonical,
   externalCreationEventStoreUnchanged:before.events===after.events,
   governedInventoryUnchanged:before.inventory===after.inventory,
   expectedPostWriteHashMatched:after.runtime===P.exactPostWriteSha256Required
  },
  policy:{
   runtimeMirrorOnlyMutation:true,
   canonicalMutation:false,
   externalCreationEventMutation:false,
   governedInventoryMutation:false,
   temporalMutation:false,
   availabilityMutation:false,
   browserInteractionNotExecuted:true,
   browserVisibilityCertificationSeparatelyRequired:true,
   automaticRetry:false
  },
  nextMilestone:"M4.19D4BN2_TEN_PROPERTY_BROWSER_RUNTIME_VISIBILITY_AND_EXPLORER_SEARCH_SELECTION_CERTIFICATION",
  authorityClosure:{
   temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
   externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,
   operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false
  },
  safety:{
   networkRequestsPerformed:0,productionCanonicalMutationPerformed:false,productionIdentityMutationPerformed:false,
   productionEventMutationPerformed:false,temporalMutationPerformed:false,governedInventoryMutationPerformed:false,
   downstreamRuntimeMirrorMutationPerformed:true,applicationMutationPerformed:false,uiMutationPerformed:false,automaticRetry:false
  }
 };
 fs.writeFileSync(out,JSON.stringify(R,null,2)+"\n");
 console.log(JSON.stringify(R,null,2));
}catch(e){
 if(writePerformed){
  fs.copyFileSync(backupPath,runtimePath);
  if(sha(runtimePath)!==before.runtime) throw new Error("BN1 failure plus rollback verification failure: "+e.message);
 }
 throw e;
}
