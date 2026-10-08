#!/usr/bin/env node
import fs from "node:fs";
import path from "node:path";
import {sha,norm,recordsOf} from "./M419D4BD12Runtime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"),ev=path.join(app,"evidence");
const bd1Path=path.join(ev,"m4-19d4bd1-production-consumption-path-forensics.json");
const bd1Audit=path.join(ev,"m4-19d4bd1-production-consumption-path-audit.json");
const bbPre=path.join(ev,"m4-19d4bb-downstream-materialization-preauthorization-manifest.json");
const result=path.join(ev,"m4-19d4bd2-correct-production-path-certification.json");
const manifest=path.join(ev,"m4-19d4bd2-production-consumption-path-certification-manifest.json");
const write=(p,x)=>{fs.mkdirSync(path.dirname(p),{recursive:true});fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");};

function done(status,state,extra={},code=0){
 const o={contract:"SCIIP_EXPLORER_4_M4_19D4BD2_PRODUCTION_CONSUMPTION_PATH_CERTIFICATION",
 version:"4.0-m4.19d4bd2",status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,
 externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,
 syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,downstreamMaterializationPerformed:false,explorerMutationPerformed:false,
 currentStateMutationPerformed:false,canonicalMutationPerformed:false,identityMutationPerformed:false,automaticRetry:false}};
 write(result,o);console.log(JSON.stringify(o,null,2));process.exit(code);
}
for(const p of [bd1Path,bd1Audit,bbPre]) if(!fs.existsSync(p)) done("BLOCKED","M419D4BD2_REQUIRED_ARTIFACT_MISSING",{missing:p},3);
const bd1=JSON.parse(fs.readFileSync(bd1Path,"utf8"));
const audit=JSON.parse(fs.readFileSync(bd1Audit,"utf8"));
const pre=JSON.parse(fs.readFileSync(bbPre,"utf8"));
const cls=bd1.forensics?.classification;

const sourceText=fs.readFileSync(pre.sourceInventoryPath,"utf8");
if(sha(sourceText)!==pre.sourceInventorySha256) done("BLOCKED","M419D4BD2_SOURCE_INVENTORY_CHANGED_AFTER_BB",{},3);
const {records}=recordsOf(JSON.parse(sourceText));
const r=records[pre.sourceRecordIndex];
if(!r||sha(r)!==pre.sourceRecordHash) done("BLOCKED","M419D4BD2_SOURCE_RECORD_HASH_MISMATCH",{},3);

if(cls==="DIRECT_RUNTIME_CONSUMPTION"){
 const consumers=audit.runtimeConsumers??[];
 const uiConsumers=consumers.filter(x=>x.ui);
 const manifestObj={
  contract:"SCIIP_EXPLORER_4_M4_19D4BD2_PRODUCTION_CONSUMPTION_PATH_CERTIFICATION_MANIFEST",
  version:"4.0-m4.19d4bd2",generatedAt:new Date().toISOString(),
  classification:"DIRECT_RUNTIME_CONSUMPTION",
  sourceInventoryPath:pre.sourceInventoryPath,sourceInventorySha256:pre.sourceInventorySha256,
  sourceRecordIndex:pre.sourceRecordIndex,sourceRecordHash:pre.sourceRecordHash,
  canonicalPropertyId:pre.canonicalPropertyId,address:pre.address,availableSf:pre.availableSf,
  runtimeConsumers:consumers,uiConsumerCount:uiConsumers.length,
  propagationMutationRequired:false,materializationExecutionRequired:false,
  runtimeVisibilityCertificationRequired:true,executionAuthorized:false
 };
 write(manifest,manifestObj);
 done("PASSED","M419D4BD2_DIRECT_RUNTIME_CONSUMPTION_CERTIFIED_PROPAGATION_MUTATION_NOT_REQUIRED_RUNTIME_VISIBILITY_PREAUTHORIZED",{
  certification:{classification:"DIRECT_RUNTIME_CONSUMPTION",runtimeConsumerCount:consumers.length,
   uiConsumerCount:uiConsumers.length,propagationMutationRequired:false,
   canonicalPropertyId:pre.canonicalPropertyId,address:pre.address,availableSf:pre.availableSf},
  policy:{inventedMaterializerProhibited:true,sourceInventoryIsRuntimeAuthority:true,
   runtimeVisibilityMustBeCertifiedSeparately:true},
  artifacts:{productionConsumptionPathCertificationManifest:manifest},
  nextMilestone:"M4.19D4BF_RUNTIME_EXPLORER_VISIBILITY_AND_UI_BINDING_CERTIFICATION"
 });
}

if(cls==="BUILD_TIME_OR_GENERATED_MATERIALIZATION"){
 const producers=audit.buildProducers??[];
 const pkg=audit.packageScripts??[];
 const exact=(producers.length===1)?producers[0]:null;
 write(manifest,{
  contract:"SCIIP_EXPLORER_4_M4_19D4BD2_PRODUCTION_CONSUMPTION_PATH_CERTIFICATION_MANIFEST",
  version:"4.0-m4.19d4bd2",generatedAt:new Date().toISOString(),
  classification:"BUILD_TIME_OR_GENERATED_MATERIALIZATION",buildProducers:producers,packageScripts:pkg,
  uniqueBuildProducer:exact,executionAuthorized:false
 });
 if(exact) done("PASSED","M419D4BD2_UNIQUE_BUILD_MATERIALIZATION_TARGET_CERTIFIED_EXECUTION_PREAUTHORIZATION_REQUIRED",{
  certification:{classification:"BUILD_TIME_OR_GENERATED_MATERIALIZATION",uniqueBuildProducer:exact},
  artifacts:{productionConsumptionPathCertificationManifest:manifest},
  nextMilestone:"M4.19D4BD3_CONTROLLED_BOUND_BUILD_MATERIALIZATION_EXECUTION"
 });
 done("PASSED","M419D4BD2_MULTIPLE_BUILD_MATERIALIZATION_TARGETS_REQUIRE_EXACT_INVOCATION_RECONCILIATION",{
  certification:{classification:"BUILD_TIME_OR_GENERATED_MATERIALIZATION",buildProducerCount:producers.length},
  artifacts:{productionConsumptionPathCertificationManifest:manifest},
  nextMilestone:"M4.19D4BD3_BUILD_MATERIALIZER_INVOCATION_RECONCILIATION"
 });
}

write(manifest,{
 contract:"SCIIP_EXPLORER_4_M4_19D4BD2_PRODUCTION_CONSUMPTION_PATH_CERTIFICATION_MANIFEST",
 version:"4.0-m4.19d4bd2",generatedAt:new Date().toISOString(),
 classification:cls??"UNRESOLVED",executionAuthorized:false
});
done("PASSED","M419D4BD2_PRODUCTION_CONSUMPTION_PATH_REMAINS_UNRESOLVED_NO_PROPAGATION_AUTHORIZED",{
 certification:{classification:cls??"UNRESOLVED"},
 policy:{blindPropagationProhibited:true,runtimeOrBuildAuthorityMustBeProven:true},
 artifacts:{productionConsumptionPathCertificationManifest:manifest},
 nextMilestone:"M4.19D4BD3_RUNTIME_LOADER_AND_UI_DATAFLOW_FORENSICS"
});
