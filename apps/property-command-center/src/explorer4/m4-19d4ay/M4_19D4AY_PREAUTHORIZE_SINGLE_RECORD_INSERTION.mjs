#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf} from "./M419D4AX1AYRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const ax1Path=path.join(ev,"m4-19d4ax1-creation-candidate-reconciliation.json");
const candPath=path.join(ev,"m4-19d4ax1-reconciled-governed-base-inventory-record-creation-candidate.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4ay-governed-base-inventory-single-record-insertion-preauthorization.json");
const manifest=path.join(ev,"m4-19d4ay-single-record-insertion-preauthorization-manifest.json");

const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};
function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4AY_GOVERNED_BASE_INVENTORY_SINGLE_RECORD_INSERTION_PREAUTHORIZATION",
 version:"4.0-m4.19d4ay",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,currentStateInsertionPerformed:false,currentStateMutationPerformed:false,
 canonicalMutationPerformed:false,identityMutationPerformed:false,downstreamPropagationPerformed:false,
 automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [ax1Path,candPath,invPath]) if(!fs.existsSync(p)) done("BLOCKED","M419D4AY_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const ax1=JSON.parse(fs.readFileSync(ax1Path,"utf8"));
if(ax1.state!=="M419D4AX1_RECONCILED_GOVERNED_BASE_INVENTORY_RECORD_CREATION_READY_AY_PREAUTHORIZATION_READY")
 done("BLOCKED","M419D4AY_AX1_READY_STATE_REQUIRED",{observed:ax1.state},3);

const cm=JSON.parse(fs.readFileSync(candPath,"utf8")), c=cm.candidate;
const invText=fs.readFileSync(invPath,"utf8"), records=recordsOf(JSON.parse(invText));
const dup=records.map((r,i)=>({i,r})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.propertyId,r.id,r.address,r.streetAddress,r.fullAddress].map(norm).filter(Boolean);
 return vals.includes(norm(c.canonicalPropertyId))||vals.includes(norm(c.sourcePropertyId))||vals.includes(norm(c.address));
});
if(dup.length) done("BLOCKED","M419D4AY_DUPLICATE_RECORD_APPEARED_AFTER_AX1",{duplicateIndices:dup.map(x=>x.i)},3);

const insertionRecord={
 ...c,
 id:c.sourcePropertyId,
 provenance:{...c.provenance,creationContract:"M4.19D4AW",creationCandidateHash:cm.candidateHash},
 governedState:"CURRENT",
 recordCreatedFromCertifiedEvidence:true
};
const recordHash=sha(insertionRecord);
const preauth={
 contract:"SCIIP_EXPLORER_4_M4_19D4AY_SINGLE_RECORD_INSERTION_PREAUTHORIZATION_MANIFEST",
 version:"4.0-m4.19d4ay",generatedAt:new Date().toISOString(),
 inventoryPath:invPath,inventorySha256Before:sha(invText),inventoryRecordCountBefore:records.length,
 insertionRecord,insertionRecordHash:recordHash,
 maximumInsertions:1,appendOnlyInsertion:true,identityFieldsImmutableDuringInsertion:true,
 temporalObservationMustRemainUnchanged:true,downstreamPropagationAuthorized:false,
 executionAuthorized:false,explicitAuthorizationRequired:true
};
write(manifest,preauth);
done("PASSED","M419D4AY_SINGLE_GOVERNED_BASE_INVENTORY_RECORD_INSERTION_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
 preauthorization:{canonicalPropertyId:c.canonicalPropertyId,address:c.address,latitude:c.latitude,longitude:c.longitude,
 availableSf:c.availableSf,provider:c.availabilityProvider,insertionRecordHash:recordHash,
 inventoryRecordCountBefore:records.length,maximumInsertions:1,executionAuthorized:false},
 policy:{duplicateRecheckPassed:true,oneInsertionMaximum:true,explicitAuthorizationRequired:true,
 downstreamPropagationNotAuthorized:true,automaticRetry:false},
 artifacts:{insertionPreauthorizationManifest:manifest},
 nextMilestone:"M4.19D4AZ_CONTROLLED_SINGLE_GOVERNED_BASE_INVENTORY_RECORD_INSERTION"
});
