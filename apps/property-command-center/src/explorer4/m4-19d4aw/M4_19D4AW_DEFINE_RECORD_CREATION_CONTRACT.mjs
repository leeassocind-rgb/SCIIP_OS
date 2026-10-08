#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,recordsOf} from "./M419D4AWAXRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const av4Path=path.join(ev,"m4-19d4av4-current-state-path-certification.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4aw-governed-base-inventory-record-creation-contract-definition.json");
const contractPath=path.join(ev,"m4-19d4aw-governed-base-inventory-record-creation-contract.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4AW_GOVERNED_BASE_INVENTORY_RECORD_CREATION_CONTRACT_DEFINITION",
 version:"4.0-m4.19d4aw-r1",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,currentStateInsertionPerformed:false,currentStateMutationPerformed:false,
 canonicalMutationPerformed:false,identityMutationPerformed:false,syntheticRecordUsed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [av4Path,invPath]) if(!fs.existsSync(p)) done("BLOCKED","M419D4AW_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const av4=JSON.parse(fs.readFileSync(av4Path,"utf8"));
if(av4.state!=="M419D4AV4_BASE_INVENTORY_RECORD_ABSENT_CURRENT_STATE_INSERTION_CONTRACT_REQUIRED_NO_PROMOTION_AUTHORIZED")
 done("BLOCKED","M419D4AW_AV4_ABSENT_RECORD_STATE_REQUIRED",{observed:av4.state},3);

const invText=fs.readFileSync(invPath,"utf8"), inv=JSON.parse(invText), records=recordsOf(inv);
if(!records.length) done("BLOCKED","M419D4AW_INVENTORY_RECORDS_NOT_RECOVERED",{},3);

const keyCounts={};
for(const r of records) for(const k of Object.keys(r||{})) keyCounts[k]=(keyCounts[k]||0)+1;
const commonKeys=Object.entries(keyCounts).sort((a,b)=>b[1]-a[1]).map(([k,count])=>({key:k,count,coverage:count/records.length}));
const nearUniversalKeys=commonKeys.filter(x=>x.coverage>=0.95).map(x=>x.key);

const definition={
 contract:"SCIIP_EXPLORER_4_M4_19D4AW_GOVERNED_BASE_INVENTORY_RECORD_CREATION_CONTRACT",
 version:"4.0-m4.19d4aw-r1",generatedAt:new Date().toISOString(),
 authoritativeDataset:"public/explorer/governed-base-inventory.json",
 inventoryRecordCount:records.length,
 inventorySha256:sha(invText),
 schemaObservation:{nearUniversalKeys,keyCoverage:commonKeys.slice(0,80)},
 minimumRequiredSemantics:[
  "stable inventory identity","canonical property linkage","source property linkage",
  "street address","city/state/postal context when available","latitude","longitude",
  "availability status","availableSf","provenance","observation timestamp"
 ],
 creationPolicy:{
  canonicalIdentityMustAlreadyExist:true,duplicateAddressOrIdentityBlocked:true,
  coordinatesMustBeSourceBacked:true,availabilityMustBeSourceBacked:true,
  parcelEvidenceMayEnrichButCannotCreateMarketAvailability:true,
  missingOptionalPhysicalAttributesAllowedAsNull:true,syntheticDefaultsProhibited:true,
  insertionRequiresSeparateExplicitAuthorization:true,downstreamPropagationRequiresSeparateCertification:true
 }
};
write(contractPath,definition);
done("PASSED","M419D4AW_GOVERNED_BASE_INVENTORY_RECORD_CREATION_CONTRACT_CERTIFIED_EXECUTION_NOT_AUTHORIZED",{
 definition:{inventoryRecordCount:records.length,nearUniversalKeyCount:nearUniversalKeys.length,
 minimumRequiredSemanticCount:definition.minimumRequiredSemantics.length,insertionAuthorized:false},
 artifacts:{recordCreationContract:contractPath},
 nextMilestone:"M4.19D4AX_GOVERNED_BASE_INVENTORY_RECORD_CREATION_READINESS_VALIDATION"
});
