#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf,discoverMaterializationCandidates,requireShim} from "./M419D4BBCRuntime.js";
requireShim.fs=fs; requireShim.path=path;

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const baPath=path.join(ev,"m4-19d4ba-post-insertion-current-state-certification.json");
const invPath=path.join(app,"public/explorer/governed-base-inventory.json");
const result=path.join(ev,"m4-19d4bb-downstream-materialization-and-explorer-visibility-preauthorization.json");
const manifest=path.join(ev,"m4-19d4bb-downstream-materialization-preauthorization-manifest.json");
const audit=path.join(ev,"m4-19d4bb-downstream-surface-discovery-audit.json");
const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};

function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BB_DOWNSTREAM_MATERIALIZATION_AND_EXPLORER_VISIBILITY_PREAUTHORIZATION",
 version:"4.0-m4.19d4bb",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,downstreamMaterializationPerformed:false,explorerMutationPerformed:false,
 currentStateMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [baPath,invPath]) if(!fs.existsSync(p)) done("BLOCKED","M419D4BB_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const ba=JSON.parse(fs.readFileSync(baPath,"utf8"));
if(ba.state!=="M419D4BA_GOVERNED_BASE_INVENTORY_SINGLE_RECORD_INSERTION_CERTIFIED_DOWNSTREAM_PROPAGATION_NOT_AUTHORIZED")
 done("BLOCKED","M419D4BB_BA_CERTIFIED_INSERTION_STATE_REQUIRED",{observed:ba.state},3);

const invText=fs.readFileSync(invPath,"utf8"),{records}=recordsOf(JSON.parse(invText));
const cid=ba.certification.canonicalPropertyId, addr=ba.certification.address;
const matches=records.map((r,i)=>({i,r})).filter(({r})=>{
 const vals=[r.canonicalPropertyId,r.sourcePropertyId,r.id,r.address].map(norm).filter(Boolean);
 return vals.includes(norm(cid))||vals.includes(norm(addr));
});
if(matches.length!==1) done("BLOCKED","M419D4BB_INSERTED_RECORD_CARDINALITY_NOT_ONE",{matches:matches.map(x=>x.i)},3);
const rec=matches[0].r, recIndex=matches[0].i;

const candidates=discoverMaterializationCandidates(app);
const selected=candidates.slice(0,25);
write(audit,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BB_DOWNSTREAM_SURFACE_DISCOVERY_AUDIT",version:"4.0-m4.19d4bb",
 generatedAt:new Date().toISOString(),candidateCount:candidates.length,candidates:selected
});

const preauth={
 contract:"SCIIP_EXPLORER_4_M4_19D4BB_DOWNSTREAM_MATERIALIZATION_PREAUTHORIZATION_MANIFEST",
 version:"4.0-m4.19d4bb",generatedAt:new Date().toISOString(),
 sourceInventoryPath:invPath,sourceInventorySha256:sha(invText),sourceRecordIndex:recIndex,
 sourceRecordHash:sha(rec),canonicalPropertyId:cid,address:addr,availableSf:rec.availableSf,
 candidateDownstreamSurfaces:selected,
 maximumPropagationExecutions:1,automaticRetry:false,executionAuthorized:false,
 requiredPostconditions:[
  "source record remains exactly one",
  "Explorer-visible record preserves canonical identity",
  "Explorer-visible coordinates equal governed source",
  "Explorer-visible availableSf equals governed source",
  "no duplicate Explorer-visible identity",
  "source inventory remains unchanged by propagation"
 ]
};
write(manifest,preauth);

done("PASSED","M419D4BB_DOWNSTREAM_MATERIALIZATION_AND_EXPLORER_VISIBILITY_PREAUTHORIZED_EXECUTION_NOT_AUTHORIZED",{
 preauthorization:{
  canonicalPropertyId:cid,address:addr,availableSf:rec.availableSf,sourceRecordIndex:recIndex,
  sourceRecordHash:sha(rec),candidateDownstreamSurfaceCount:selected.length,executionAuthorized:false
 },
 policy:{onePropagationMaximum:true,sourceInventoryImmutableDuringPropagation:true,
 exactIdentityParityRequired:true,coordinateParityRequired:true,availableSfParityRequired:true,
 duplicateVisibilityProhibited:true,automaticRetry:false},
 artifacts:{downstreamSurfaceDiscoveryAudit:audit,downstreamPreauthorizationManifest:manifest},
 nextMilestone:"M4.19D4BC_EXPLORER_VISIBILITY_PARITY_SIMULATION"
});
