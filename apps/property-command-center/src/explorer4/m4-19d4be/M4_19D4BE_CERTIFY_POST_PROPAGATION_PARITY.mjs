#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf,flatten} from "./M419D4BDBERuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bdPath=path.join(ev,"m4-19d4bd-controlled-downstream-materialization-execution.json");
const bdAudit=path.join(ev,"m4-19d4bd-production-materializer-binding-and-execution-audit.json");
const bbPre=path.join(ev,"m4-19d4bb-downstream-materialization-preauthorization-manifest.json");
const result=path.join(ev,"m4-19d4be-post-propagation-explorer-parity-certification.json");
const audit=path.join(ev,"m4-19d4be-post-propagation-explorer-parity-audit.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BE_POST_PROPAGATION_EXPLORER_PARITY_CERTIFICATION",
 version:"4.0-m4.19d4be",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:true,automaticRetry:false},
 safety:{networkRequestsPerformed:0,additionalDownstreamMutationPerformed:false,currentStateMutationPerformed:false,
 canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [bdPath,bdAudit,bbPre]) if(!fs.existsSync(p)) done("BLOCKED","M419D4BE_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const bd=JSON.parse(fs.readFileSync(bdPath,"utf8"));
if(bd.state!=="M419D4BD_CONTROLLED_PRODUCTION_DOWNSTREAM_MATERIALIZATION_EXECUTED_POST_PROPAGATION_CERTIFICATION_REQUIRED")
 done("BLOCKED","M419D4BE_BD_EXECUTED_STATE_REQUIRED",{observed:bd.state},3);

const ba=JSON.parse(fs.readFileSync(bdAudit,"utf8")),pre=JSON.parse(fs.readFileSync(bbPre,"utf8"));
const sourceText=fs.readFileSync(pre.sourceInventoryPath,"utf8");
if(sha(sourceText)!==pre.sourceInventorySha256) done("BLOCKED","M419D4BE_SOURCE_INVENTORY_CHANGED_DURING_OR_AFTER_PROPAGATION",{},3);

const target={
 canonicalPropertyId:pre.canonicalPropertyId,address:pre.address,availableSf:Number(pre.availableSf),
 sourceRecordHash:pre.sourceRecordHash
};
const changed=ba?.execution?.changedJsonSurfaces??[];
const visible=[];
for(const c of changed){
 if(!fs.existsSync(c.path)) continue;
 let doc;try{doc=JSON.parse(fs.readFileSync(c.path,"utf8"))}catch{continue}
 const {records}=recordsOf(doc);
 for(let i=0;i<records.length;i++){
  const r=records[i];
  const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.id,r.address].map(norm).filter(Boolean);
  if(vals.includes(norm(target.canonicalPropertyId))||vals.includes(norm(target.address))){
   visible.push({path:c.path,index:i,record:r,recordHash:sha(r)});
  }
 }
}
/* If the materializer changed a JSON shape that isn't an array container, inspect nested
   objects structurally for exact target identity/address. */
for(const c of changed){
 if(!fs.existsSync(c.path)) continue;
 let doc;try{doc=JSON.parse(fs.readFileSync(c.path,"utf8"))}catch{continue}
 if(recordsOf(doc).records.length) continue;
 const flat=flatten(doc);
 const hasCid=flat.some(e=>norm(e.value)===norm(target.canonicalPropertyId));
 const hasAddr=flat.some(e=>norm(e.value)===norm(target.address));
 if(hasCid||hasAddr) visible.push({path:c.path,index:null,record:doc,recordHash:sha(doc),nested:true});
}

const parity=visible.map(v=>{
 const r=v.record;
 return {path:v.path,index:v.index,
  canonicalIdentity: norm(r.canonicalPropertyId)===norm(target.canonicalPropertyId),
  address: norm(r.address)===norm(target.address),
  availableSf: Number(r.availableSf)===target.availableSf,
  latitude:Number.isFinite(Number(r.latitude))&&Number(r.latitude)===34.1810708,
  longitude:Number.isFinite(Number(r.longitude))&&Number(r.longitude)===-118.4408537
 };
});
const qualified=parity.filter(x=>x.canonicalIdentity&&x.address&&x.availableSf&&x.latitude&&x.longitude);
const failures=[];
if(changed.length===0) failures.push("NO_DOWNSTREAM_JSON_SURFACE_CHANGED");
if(qualified.length===0) failures.push("NO_CHANGED_SURFACE_CONTAINS_FULL_BESSEMER_PARITY");
if(qualified.length>1) failures.push("MULTIPLE_CHANGED_SURFACES_CONTAIN_FULL_BESSEMER_RECORD_REVIEW_REQUIRED");

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BE_POST_PROPAGATION_EXPLORER_PARITY_AUDIT",
 version:"4.0-m4.19d4be",generatedAt:new Date().toISOString(),
 changedSurfaceCount:changed.length,visibleCandidateCount:visible.length,parity,qualified,failures
});

if(failures.length) done("BLOCKED","M419D4BE_POST_PROPAGATION_EXPLORER_PARITY_NOT_CERTIFIED",{
 certification:{failures,changedSurfaceCount:changed.length,visibleCandidateCount:visible.length,qualifiedCount:qualified.length},
 artifacts:{postPropagationParityAudit:audit},
 nextMilestone:"M4.19D4BE1_POST_PROPAGATION_VISIBILITY_RECONCILIATION"
},3);

done("PASSED","M419D4BE_PRODUCTION_DOWNSTREAM_MATERIALIZATION_AND_EXPLORER_VISIBILITY_PARITY_CERTIFIED",{
 certification:{canonicalPropertyId:target.canonicalPropertyId,address:target.address,availableSf:target.availableSf,
 explorerSurface:qualified[0].path,explorerRecordIndex:qualified[0].index,
 latitude:34.1810708,longitude:-118.4408537,sourceInventoryUnchanged:true},
 policy:{productionPropagationProven:true,fullExplorerParityCertified:true,duplicateVisibilityBlocked:true},
 artifacts:{postPropagationParityAudit:audit},
 nextMilestone:"M4.19D4BF_RUNTIME_EXPLORER_VISIBILITY_AND_UI_BINDING_CERTIFICATION"
});
