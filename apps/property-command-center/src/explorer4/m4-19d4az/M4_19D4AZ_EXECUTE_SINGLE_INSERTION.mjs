#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,recordsOf,setRecords,duplicateMatches} from "./M419D4AZBARuntime.js";

const repo=path.resolve(process.argv[2]||".");
const authorization=process.argv[3]||"";
const REQUIRED_AUTH="AUTHORIZE_M419D4AZ_SINGLE_GOVERNED_BASE_INVENTORY_RECORD_INSERTION";

const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const ayPath=path.join(ev,"m4-19d4ay-governed-base-inventory-single-record-insertion-preauthorization.json");
const preauthPath=path.join(ev,"m4-19d4ay-single-record-insertion-preauthorization-manifest.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const resultPath=path.join(ev,"m4-19d4az-controlled-single-governed-base-inventory-record-insertion.json");
const auditPath=path.join(ev,"m4-19d4az-single-record-insertion-audit.json");
const backupPath=path.join(ev,"m4-19d4az-governed-base-inventory-pre-insertion-backup.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4AZ_CONTROLLED_SINGLE_GOVERNED_BASE_INVENTORY_RECORD_INSERTION",
 version:"4.0-m4.19d4az",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:true,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,maximumInsertions:1,currentStateInsertionPerformed:state.includes("INSERTION_EXECUTED"),
 temporalMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,
 downstreamPropagationPerformed:false,automaticRetry:false}};
 write(resultPath,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}

for(const p of [ayPath,preauthPath,invPath]) if(!fs.existsSync(p)) done("BLOCKED","M419D4AZ_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const ay=JSON.parse(fs.readFileSync(ayPath,"utf8"));
if(ay.state!=="M419D4AY_SINGLE_GOVERNED_BASE_INVENTORY_RECORD_INSERTION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED")
 done("BLOCKED","M419D4AZ_AY_PREAUTHORIZATION_STATE_REQUIRED",{observed:ay.state},3);

if(authorization!==REQUIRED_AUTH)
 done("BLOCKED","M419D4AZ_EXPLICIT_INSERTION_AUTHORIZATION_REQUIRED",{
  requiredAuthorizationToken:REQUIRED_AUTH,
  insertionPerformed:false
 },3);

const pre=JSON.parse(fs.readFileSync(preauthPath,"utf8"));
if(pre.maximumInsertions!==1 || pre.executionAuthorized!==false)
 done("BLOCKED","M419D4AZ_PREAUTHORIZATION_POLICY_INVALID",{},3);

const beforeText=fs.readFileSync(invPath,"utf8");
const beforeHash=sha(beforeText);
if(beforeHash!==pre.inventorySha256Before)
 done("BLOCKED","M419D4AZ_INVENTORY_CHANGED_SINCE_PREAUTHORIZATION",{
  expectedInventorySha256:pre.inventorySha256Before,actualInventorySha256:beforeHash
 },3);

const doc=JSON.parse(beforeText), {records,container}=recordsOf(doc);
if(!records.length) done("BLOCKED","M419D4AZ_INVENTORY_RECORD_CONTAINER_NOT_RECOVERED",{},3);
if(records.length!==pre.inventoryRecordCountBefore)
 done("BLOCKED","M419D4AZ_INVENTORY_COUNT_CHANGED_SINCE_PREAUTHORIZATION",{
  expected:pre.inventoryRecordCountBefore,actual:records.length
 },3);

const c=pre.insertionRecord;
if(sha(c)!==pre.insertionRecordHash)
 done("BLOCKED","M419D4AZ_INSERTION_RECORD_HASH_MISMATCH",{expected:pre.insertionRecordHash,actual:sha(c)},3);

const dups=duplicateMatches(records,c);
if(dups.length) done("BLOCKED","M419D4AZ_DUPLICATE_RECORD_DETECTED_AT_EXECUTION",{duplicateIndices:dups.map(x=>x.i)},3);

fs.writeFileSync(backupPath,beforeText);
const newRecords=[...records,c];
const newDoc=setRecords(doc,container,newRecords);
const afterText=JSON.stringify(newDoc,null,2)+"\n";
const tempPath=invPath+".m419d4az.tmp";
fs.writeFileSync(tempPath,afterText);
fs.renameSync(tempPath,invPath);

const afterHash=sha(afterText);
const insertedIndex=newRecords.length-1;
write(auditPath,{
 contract:"SCIIP_EXPLORER_4_M4_19D4AZ_SINGLE_RECORD_INSERTION_AUDIT",
 version:"4.0-m4.19d4az",executedAt:new Date().toISOString(),
 inventoryPath:invPath,backupPath,
 inventorySha256Before:beforeHash,inventorySha256After:afterHash,
 recordCountBefore:records.length,recordCountAfter:newRecords.length,
 insertedRecordIndex:insertedIndex,insertedRecordHash:sha(c),
 canonicalPropertyId:c.canonicalPropertyId,sourcePropertyId:c.sourcePropertyId,address:c.address,
 availableSf:c.availableSf,authorizationTokenMatched:true,
 downstreamPropagationPerformed:false
});

done("PASSED","M419D4AZ_SINGLE_GOVERNED_BASE_INVENTORY_RECORD_INSERTION_EXECUTED_POST_INSERTION_CERTIFICATION_REQUIRED",{
 execution:{
  insertionsPerformed:1,inventoryRecordCountBefore:records.length,inventoryRecordCountAfter:newRecords.length,
  insertedRecordIndex:insertedIndex,insertedRecordHash:sha(c),inventorySha256Before:beforeHash,
  inventorySha256After:afterHash,canonicalPropertyId:c.canonicalPropertyId,address:c.address,availableSf:c.availableSf
 },
 policy:{oneInsertionMaximum:true,duplicateCheckImmediatelyBeforeWrite:true,atomicReplaceUsed:true,
 backupCreated:true,downstreamPropagationNotAuthorized:true},
 artifacts:{insertionAudit:auditPath,preInsertionBackup:backupPath},
 nextMilestone:"M4.19D4BA_POST_INSERTION_CURRENT_STATE_CERTIFICATION"
});
