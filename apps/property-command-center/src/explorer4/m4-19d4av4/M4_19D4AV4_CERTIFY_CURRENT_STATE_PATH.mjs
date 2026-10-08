#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,recordsOf} from "./M419D4AV34Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const av3Path=path.join(ev,"m4-19d4av3-authoritative-canonical-to-base-inventory-mapping-gate.json");
const mapPath=path.join(ev,"m4-19d4av3-authoritative-inventory-mapping-manifest.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4av4-current-state-path-certification.json");
const manifest=path.join(ev,"m4-19d4av4-current-state-execution-preauthorization-manifest.json");
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");

function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4AV4_CURRENT_STATE_PATH_CERTIFICATION",
 version:"4.0-m4.19d4av4",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,currentStateMutationPerformed:false,currentStateInsertionPerformed:false,
 temporalMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,
 downstreamPropagationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [av3Path,mapPath,invPath]) if(!fs.existsSync(p)) done("BLOCKED","M419D4AV4_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const av3=JSON.parse(fs.readFileSync(av3Path,"utf8")), m=JSON.parse(fs.readFileSync(mapPath,"utf8"));
const invText=fs.readFileSync(invPath,"utf8"), inv=JSON.parse(invText), records=recordsOf(inv);

if(av3.state==="M419D4AV3_UNIQUE_EXISTING_GOVERNED_INVENTORY_RECORD_CERTIFIED_AV4_READY"){
 const i=m.inventoryRecordIndex, r=records[i];
 if(!r) done("BLOCKED","M419D4AV4_CERTIFIED_RECORD_MISSING",{recordIndex:i},3);
 const current=r.availableSf??r.availableSF??r.available_sf??null;
 const field=Object.prototype.hasOwnProperty.call(r,"availableSf")?"availableSf":
             Object.prototype.hasOwnProperty.call(r,"availableSF")?"availableSF":
             Object.prototype.hasOwnProperty.call(r,"available_sf")?"available_sf":null;
 if(!field) done("BLOCKED","M419D4AV4_EXISTING_RECORD_AVAILABLE_SF_FIELD_NOT_RECOVERED",{recordIndex:i,keys:Object.keys(r)},3);
 const out={
  contract:"SCIIP_EXPLORER_4_M4_19D4AV4_CURRENT_STATE_EXECUTION_PREAUTHORIZATION_MANIFEST",
  version:"4.0-m4.19d4av4",generatedAt:new Date().toISOString(),
  operation:"UPDATE_EXISTING_RECORD",inventoryPath:invPath,inventorySha256Before:sha(invText),
  recordIndex:i,field,beforeValue:current,afterValue:m.proposedAvailableSf,
  canonicalPropertyId:m.canonicalPropertyId,observationId:m.observationId,
  maximumRecordMutations:1,executionAuthorized:false
 };
 write(manifest,out);
 done("PASSED","M419D4AV4_EXISTING_RECORD_CURRENT_STATE_PROMOTION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
  path:{operation:"UPDATE_EXISTING_RECORD",recordIndex:i,field,beforeValue:current,afterValue:m.proposedAvailableSf},
  artifacts:{executionPreauthorizationManifest:manifest},
  nextMilestone:"M4.19D4AW_CONTROLLED_SINGLE_CURRENT_STATE_AVAILABLE_SF_PROMOTION"
 });
}

if(av3.state==="M419D4AV3_CERTIFIED_PROPERTY_ABSENT_FROM_GOVERNED_BASE_INVENTORY_AV4_INSERTION_PATH_CERTIFICATION_READY"){
 const out={
  contract:"SCIIP_EXPLORER_4_M4_19D4AV4_CURRENT_STATE_EXECUTION_PREAUTHORIZATION_MANIFEST",
  version:"4.0-m4.19d4av4",generatedAt:new Date().toISOString(),
  operation:"INSERTION_REQUIRED_BUT_NOT_AUTHORIZED",inventoryPath:invPath,inventorySha256Before:sha(invText),
  canonicalPropertyId:m.canonicalPropertyId,sourcePropertyId:m.sourcePropertyId,address:m.address,
  proposedAvailableSf:m.proposedAvailableSf,observationId:m.observationId,
  reason:"Certified property is absent from governed-base-inventory; availableSf cannot be promoted into a nonexistent current-state record.",
  executionAuthorized:false
 };
 write(manifest,out);
 done("PASSED","M419D4AV4_BASE_INVENTORY_RECORD_ABSENT_CURRENT_STATE_INSERTION_CONTRACT_REQUIRED_NO_PROMOTION_AUTHORIZED",{
  path:{operation:"INSERTION_REQUIRED_BUT_NOT_AUTHORIZED",address:m.address,proposedAvailableSf:m.proposedAvailableSf},
  policy:{availabilityOnlyInsertionProhibited:true,fullGovernedRecordContractRequired:true,
    currentStatePromotionBlockedUntilRecordExists:true},
  artifacts:{executionPreauthorizationManifest:manifest},
  nextMilestone:"M4.19D4AW_GOVERNED_BASE_INVENTORY_RECORD_CREATION_CONTRACT_DEFINITION"
 });
}

done("BLOCKED","M419D4AV4_AV3_SAFE_DETERMINISTIC_OUTCOME_REQUIRED",{observed:av3.state},3);
