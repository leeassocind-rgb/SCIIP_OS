#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {pathToFileURL} from "node:url";
const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const bm=JSON.parse(fs.readFileSync(path.join(ev,"m4-19d4bm-next-controlled-ten-property-cohort-readiness-and-selection.json"),"utf8"));
const authorityPath=path.join(app,"src/runtime/GovernedProductionCanonicalIdAuthorityRuntime.js");
const canonicalPath=path.join(app,"src/production-validation/canonical-property-identity-data.json");
const mod=await import(pathToFileURL(authorityPath).href+"?r2a="+Date.now());

function collect(x,o=[]){if(Array.isArray(x))for(const v of x)collect(v,o);else if(x&&typeof x==="object"){o.push(x);for(const v of Object.values(x))if(v&&typeof v==="object")collect(v,o)}return o}
const objs=collect(JSON.parse(fs.readFileSync(canonicalPath,"utf8")));
const ids=[...new Set(objs.map(x=>x?.canonicalPropertyId).filter(x=>typeof x==="string"&&/^CPROP-[0-9A-F]{20}$/.test(x)))];
if(ids.length<1) throw new Error("canonical namespace unresolved");

const authority=mod.buildGovernedProductionCanonicalIdAuthority({existingCanonicalIds:ids});
const ns=authority.inspectNamespace();
if(!ns.namespaceHomogeneous||ns.dominantHexPrefixLength!==20) throw new Error("namespace certification failed");

const first=bm.selection.cohort[0];
function input(r){return {
 sourcePropertyId:r.sourcePropertyId,
 normalizedAddress:r.address,
 sourceProvenance:{provider:"GOVERNED_BASE_INVENTORY",inventorySha256:bm.sourceBinding.hashes.inventory,inventoryRecordIndex:r.originalIndex,cohort:"M4.19D4BM",cohortHash:bm.selection.cohortHash},
 identityEvidence:{address:r.address,city:r.city,state:r.state,buildingSf:r.buildingSf,status:r.status,sourcePropertyId:r.sourcePropertyId}
}}
const raw=authority.resolveCanonicalPropertyId(input(first));
const promiseDetected=!!raw && typeof raw.then==="function";
const resolved=await raw;
if(!resolved?.canonicalPropertyId||!/^CPROP-[0-9A-F]{20}$/.test(resolved.canonicalPropertyId)) throw new Error("awaited authority result invalid");
if(resolved.resolutionState!=="DERIVED_CANONICAL_ID_AVAILABLE") throw new Error("first derived ID unavailable: "+resolved.resolutionState);

const repeat=await authority.resolveCanonicalPropertyId(input(first));
const deterministic=repeat.canonicalPropertyId===resolved.canonicalPropertyId && repeat.derivationHash===resolved.derivationHash;
if(!deterministic) throw new Error("authority derivation not deterministic");

const R={
 contract:"SCIIP_EXPLORER_4_M4_19D4BM1_R2A_ASYNC_AUTHORITY_CONTRACT_RECONCILIATION",
 version:"4.0-m4.19d4bm1-r2a",status:"PASSED",
 state:"M419D4BM1_R2A_ASYNC_CANONICAL_ID_AUTHORITY_CONTRACT_RECONCILED_TEN_PROPERTY_DERIVATION_READY",
 certifiedAt:new Date().toISOString(),
 diagnosis:{
  r2Blocked:true,
  rootCause:"RESOLVE_CANONICAL_PROPERTY_ID_IS_ASYNC_AND_R2_INSPECTED_THE_UNAWAITED_PROMISE",
  evidence:"JSON.stringify(Promise) emitted {}, causing canonicalPropertyId to appear null although invocation shape was otherwise correct.",
  applicationDefectFound:false,
  authorityDefectFound:false,
  certifierDefectFound:true
 },
 contractReconciliation:{
  factoryInvocation:"buildGovernedProductionCanonicalIdAuthority({existingCanonicalIds})",
  methodInvocation:"await authority.resolveCanonicalPropertyId({sourcePropertyId,normalizedAddress,sourceProvenance,identityEvidence})",
  promiseDetected,
  namespace:ns,
  firstRecordCanonicalPropertyId:resolved.canonicalPropertyId,
  resolutionState:resolved.resolutionState,
  deterministicRepeat:deterministic,
  authorityReference:resolved.authorityReference,
  derivationVersion:resolved.derivationVersion
 },
 policy:{readOnly:true,tenIdsFrozen:false,productionExecutionAuthorized:false,canonicalMutation:false,eventMutation:false,runtimeMutation:false,inventoryMutation:false,networkRequests:0},
 nextMilestone:"M4.19D4BM1_R3_TEN_PROPERTY_CANONICAL_ID_DERIVATION_AND_EXECUTION_MANIFEST_FINALIZATION",
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false}
};
fs.writeFileSync(path.join(ev,"m4-19d4bm1-r2a-async-authority-contract-reconciliation.json"),JSON.stringify(R,null,2)+"\n");
console.log(JSON.stringify(R,null,2));
