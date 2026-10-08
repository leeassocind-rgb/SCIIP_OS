#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf} from "./M419D4BBCRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bbPath=path.join(ev,"m4-19d4bb-downstream-materialization-and-explorer-visibility-preauthorization.json");
const prePath=path.join(ev,"m4-19d4bb-downstream-materialization-preauthorization-manifest.json");
const result=path.join(ev,"m4-19d4bc-explorer-visibility-parity-simulation.json");
const audit=path.join(ev,"m4-19d4bc-explorer-visibility-parity-simulation-audit.json");
const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};

function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BC_EXPLORER_VISIBILITY_PARITY_SIMULATION",
 version:"4.0-m4.19d4bc",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,downstreamMaterializationPerformed:false,explorerMutationPerformed:false,
 currentStateMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [bbPath,prePath]) if(!fs.existsSync(p)) done("BLOCKED","M419D4BC_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const bb=JSON.parse(fs.readFileSync(bbPath,"utf8")), pre=JSON.parse(fs.readFileSync(prePath,"utf8"));
if(bb.state!=="M419D4BB_DOWNSTREAM_MATERIALIZATION_AND_EXPLORER_VISIBILITY_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED")
 done("BLOCKED","M419D4BC_BB_PREAUTHORIZATION_STATE_REQUIRED",{observed:bb.state},3);

const invText=fs.readFileSync(pre.sourceInventoryPath,"utf8");
if(sha(invText)!==pre.sourceInventorySha256) done("BLOCKED","M419D4BC_SOURCE_INVENTORY_CHANGED_AFTER_BB",{},3);
const {records}=recordsOf(JSON.parse(invText)), source=records[pre.sourceRecordIndex];
if(!source||sha(source)!==pre.sourceRecordHash) done("BLOCKED","M419D4BC_SOURCE_RECORD_HASH_MISMATCH",{},3);

/* No-write projection: construct the minimum Explorer-visible shape directly
   from the governed source record, then validate parity. This is a simulation,
   not a mutation and not proof that a particular production materializer has run. */
const projected={
 id:source.id??source.sourcePropertyId,
 canonicalPropertyId:source.canonicalPropertyId,
 sourcePropertyId:source.sourcePropertyId,
 address:source.address,
 latitude:source.latitude,
 longitude:source.longitude,
 availableSf:source.availableSf,
 availabilityStatus:source.availabilityStatus,
 provenance:source.provenance
};

const checks={
 canonicalIdentityParity:norm(projected.canonicalPropertyId)===norm(source.canonicalPropertyId),
 sourceIdentityParity:norm(projected.sourcePropertyId)===norm(source.sourcePropertyId),
 addressParity:norm(projected.address)===norm(source.address),
 latitudeParity:Number(projected.latitude)===Number(source.latitude),
 longitudeParity:Number(projected.longitude)===Number(source.longitude),
 availableSfParity:Number(projected.availableSf)===Number(source.availableSf),
 nonZeroCoordinates:!(Number(projected.latitude)===0&&Number(projected.longitude)===0),
 expectedAvailableSf:Number(projected.availableSf)===4904
};
const passed=Object.values(checks).every(Boolean);
write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BC_EXPLORER_VISIBILITY_PARITY_SIMULATION_AUDIT",
 version:"4.0-m4.19d4bc",generatedAt:new Date().toISOString(),
 simulationOnly:true,productionMaterializationExecuted:false,sourceRecordHash:pre.sourceRecordHash,
 projectedExplorerRecord:projected,checks,passed
});
if(!passed) done("BLOCKED","M419D4BC_EXPLORER_VISIBILITY_PARITY_SIMULATION_FAILED",{checks},3);

done("PASSED","M419D4BC_EXPLORER_VISIBILITY_PARITY_SIMULATION_CERTIFIED_PROPAGATION_EXECUTION_NOT_AUTHORIZED",{
 simulation:{
  canonicalPropertyId:projected.canonicalPropertyId,address:projected.address,
  latitude:projected.latitude,longitude:projected.longitude,availableSf:projected.availableSf,
  checks,productionMaterializationExecuted:false
 },
 policy:{simulationIsNotPropagationProof:true,productionPropagationRequiresExplicitAuthorization:true,
 postPropagationParityCertificationRequired:true},
 artifacts:{visibilityParitySimulationAudit:audit},
 nextMilestone:"M4.19D4BD_CONTROLLED_DOWNSTREAM_MATERIALIZATION_EXECUTION"
});
