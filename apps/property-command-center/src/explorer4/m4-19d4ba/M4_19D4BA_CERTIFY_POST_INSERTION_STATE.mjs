#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf,duplicateMatches} from "./M419D4AZBARuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const azPath=path.join(ev,"m4-19d4az-controlled-single-governed-base-inventory-record-insertion.json");
const azAuditPath=path.join(ev,"m4-19d4az-single-record-insertion-audit.json");
const ayPre=path.join(ev,"m4-19d4ay-single-record-insertion-preauthorization-manifest.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4ba-post-insertion-current-state-certification.json");
const audit=path.join(ev,"m4-19d4ba-post-insertion-certification-audit.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BA_POST_INSERTION_CURRENT_STATE_CERTIFICATION",
 version:"4.0-m4.19d4ba",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:true,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,additionalCurrentStateMutationPerformed:false,temporalMutationPerformed:false,
 canonicalMutationPerformed:false,identityMutationPerformed:false,downstreamPropagationPerformed:false,
 automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [azPath,azAuditPath,ayPre,invPath]) if(!fs.existsSync(p)) done("BLOCKED","M419D4BA_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const az=JSON.parse(fs.readFileSync(azPath,"utf8"));
if(az.state!=="M419D4AZ_SINGLE_GOVERNED_BASE_INVENTORY_RECORD_INSERTION_EXECUTED_POST_INSERTION_CERTIFICATION_REQUIRED")
 done("BLOCKED","M419D4BA_AZ_EXECUTED_STATE_REQUIRED",{observed:az.state},3);

const za=JSON.parse(fs.readFileSync(azAuditPath,"utf8"));
const pre=JSON.parse(fs.readFileSync(ayPre,"utf8"));
const invText=fs.readFileSync(invPath,"utf8"), {records}=recordsOf(JSON.parse(invText));
const c=pre.insertionRecord;
const matches=duplicateMatches(records,c);
const exactHashMatches=matches.filter(x=>sha(x.r)===pre.insertionRecordHash);

const failures=[];
if(records.length!==pre.inventoryRecordCountBefore+1) failures.push("RECORD_COUNT_NOT_INCREMENTED_BY_ONE");
if(matches.length!==1) failures.push("IDENTITY_OR_ADDRESS_MATCH_CARDINALITY_NOT_ONE");
if(exactHashMatches.length!==1) failures.push("INSERTED_RECORD_HASH_NOT_EXACTLY_ONCE");
if(Number(exactHashMatches[0]?.r?.availableSf)!==Number(c.availableSf)) failures.push("AVAILABLE_SF_MISMATCH");
if(sha(invText)!==za.inventorySha256After) failures.push("POST_INSERTION_INVENTORY_HASH_CHANGED_AFTER_AZ");
if(za.downstreamPropagationPerformed!==false) failures.push("UNEXPECTED_DOWNSTREAM_PROPAGATION_SIGNAL");

write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BA_POST_INSERTION_CERTIFICATION_AUDIT",
 version:"4.0-m4.19d4ba",generatedAt:new Date().toISOString(),
 inventoryPath:invPath,inventorySha256:sha(invText),recordCount:records.length,
 expectedRecordCount:pre.inventoryRecordCountBefore+1,
 identityMatchIndices:matches.map(x=>x.i),exactHashMatchIndices:exactHashMatches.map(x=>x.i),
 expectedInsertionRecordHash:pre.insertionRecordHash,
 canonicalPropertyId:c.canonicalPropertyId,address:c.address,availableSf:c.availableSf,
 failures
});

if(failures.length) done("BLOCKED","M419D4BA_POST_INSERTION_CERTIFICATION_FAILED_REPAIR_REQUIRED",{
 certification:{failures,recordCount:records.length,identityMatchCount:matches.length,exactHashMatchCount:exactHashMatches.length},
 artifacts:{postInsertionAudit:audit},nextMilestone:"M4.19D4BA1_POST_INSERTION_REPAIR_FORENSICS"
},3);

done("PASSED","M419D4BA_GOVERNED_BASE_INVENTORY_SINGLE_RECORD_INSERTION_CERTIFIED_DOWNSTREAM_PROPAGATION_NOT_AUTHORIZED",{
 certification:{
  inventoryRecordCountBefore:pre.inventoryRecordCountBefore,inventoryRecordCountAfter:records.length,
  insertedRecordIndex:exactHashMatches[0].i,insertedRecordHash:pre.insertionRecordHash,
  canonicalPropertyId:c.canonicalPropertyId,address:c.address,availableSf:c.availableSf,
  duplicateIdentityCount:matches.length,downstreamPropagationPerformed:false
 },
 policy:{singleInsertionCertified:true,exactRecordHashCertified:true,duplicateFree:true,
 downstreamPropagationRequiresSeparateAuthorization:true},
 artifacts:{postInsertionAudit:audit},
 nextMilestone:"M4.19D4BB_DOWNSTREAM_MATERIALIZATION_AND_EXPLORER_VISIBILITY_PREAUTHORIZATION"
});
