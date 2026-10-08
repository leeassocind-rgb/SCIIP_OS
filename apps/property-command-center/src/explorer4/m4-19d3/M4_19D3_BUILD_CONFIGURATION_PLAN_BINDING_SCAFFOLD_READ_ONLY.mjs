#!/usr/bin/env node
// SCIIP_G2Q_RUNTIME_SHADOW_SIDECAR_IMPORT
import { evaluateRuntimeShadow as sciipEvaluateRuntimeShadow } from "../runtime/MarketAvailabilityRuntimeShadowSidecar.mjs";
import fs from "node:fs";
import path from "node:path";
import {
  CONTRACT,VERSION,APPROVED_FIELD,LIGHTBOX_RELATIVE_CANDIDATES,
  inspectSourceText,scoreSemanticFit,sha
} from "./M419D3BindingRuntime.js";

const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center");
const ev=path.join(app,"evidence");

const d2=path.join(ev,"m4-19d2-existing-external-source-capability-discovery-audit.json");
const preauth=path.join(ev,"m4-18-next-observation-refresh-preauthorization-manifest.json");

const planPath=path.join(ev,"m4-19d3-external-source-configuration-binding-plan.json");
const scaffoldPath=path.join(ev,"m4-19d3-lightbox-refresh-source-binding-scaffold.json");
const resultPath=path.join(ev,"m4-19d3-external-source-configuration-plan-binding-scaffold.json");

const read=p=>JSON.parse(fs.readFileSync(p,"utf8"));
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
const block=(state,extra={})=>{
  const out={contract:CONTRACT,version:VERSION,status:"BLOCKED",state,certifiedAt:new Date().toISOString(),...extra};
  write(resultPath,out); console.log(JSON.stringify(out,null,2)); process.exit(3);
};

for(const p of [d2,preauth]){
  if(!fs.existsSync(p)) block("M419D3_PREREQUISITE_MISSING",{path:p});
}

const d2doc=read(d2);
if(
  d2doc?.status!=="PASSED" ||
  d2doc?.state!=="M419D2_EXISTING_EXTERNAL_SOURCE_CAPABILITIES_AUDITED_CONFIGURATION_STILL_REQUIRED"
){
  block("M419D3_M419D2_CONFIGURATION_STILL_REQUIRED_STATE_EXPECTED",{observed:d2doc?.state??null});
}

const pre=read(preauth);
const preRows=pre?.rows||[];
if(preRows.length!==400) block("M419D3_EXACT_400_PREAUTHORIZED_ROWS_REQUIRED",{observed:preRows.length});

const inspected=[];
for(const rel of LIGHTBOX_RELATIVE_CANDIDATES){
  const p=path.join(repo,rel);
  if(!fs.existsSync(p)){
    inspected.push({relativePath:rel,exists:false});
    continue;
  }
  let text="";
  try{text=fs.readFileSync(p,"utf8")}catch{}
  const semantic=inspectSourceText(text);
// SCIIP_G2U_RUNTIME_SHADOW_ACTIVATION
const sciipG2UShadowInput={canonicalPropertyId:null,availableSf:null,observationSemantics:"SOURCE_QUALIFICATION_SHADOW"};
const sciipG2UShadowResult=sciipEvaluateRuntimeShadow(sciipG2UShadowInput,(input)=>({decision:"OBSERVE_SOURCE_QUALIFICATION",availableSf:input.availableSf,canonicalPropertyId:input.canonicalPropertyId,observationSemantics:input.observationSemantics}));
void sciipG2UShadowResult; // NON_AUTHORITATIVE: evidence/control-flow isolation certification follows in G2V
  inspected.push({
    relativePath:rel,
    exists:true,
    fileSha:sha(text),
    ...semantic,
    semanticFitScore:scoreSemanticFit(semantic)
  });
}

const existing=inspected.filter(x=>x.exists);
const exactAvailableFiles=existing.filter(x=>x.exactAvailableSf || x.normalizedAvailable);
const provenanceFiles=existing.filter(x=>x.provenanceTerms);
const timestampFiles=existing.filter(x=>x.timestampTerms);
const networkFiles=existing.filter(x=>x.networkTerms);

const envAudit=d2doc?.discovery?.environmentAudit||[];
const envNames=envAudit.map(x=>x.name);
const refreshEnvConfigured=envAudit.some(x=>
  ["SCIIP_REFRESH_SOURCE_URL","SCIIP_REFRESH_SOURCE_API_KEY","SCIIP_REFRESH_SOURCE_METHOD"].includes(x.name)
  && x.configuredInCurrentProcess===true
);

const lightboxEnvNames=envNames.filter(n=>/LIGHTBOX/i.test(n));
const directAvailableSfSupport=exactAvailableFiles.length>0;

/*
Read-only semantic conclusion:
- Existing LightBox infrastructure can be reused as transport/provenance scaffolding.
- It must NOT be declared a refresh source unless the actual response can produce
  source-native availableSf + timestamp + snapshot/evidence for the selected source ID.
*/
const bindingState=directAvailableSfSupport
  ? "LIGHTBOX_SEMANTIC_AVAILABLE_SF_PATH_DISCOVERED_DRY_RUN_REQUIRED"
  : "LIGHTBOX_TRANSPORT_PROVENANCE_CAPABILITY_PRESENT_AVAILABLE_SF_SEMANTIC_PATH_NOT_PROVEN";

const configurationPlan={
  contract:"SCIIP_EXPLORER_4_M4_19D3_EXTERNAL_SOURCE_CONFIGURATION_BINDING_PLAN",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  approvedField:APPROVED_FIELD,
  selectedArchitecture:"REUSE_EXISTING_LIGHTBOX_STACK_IF_AND_ONLY_IF_SOURCE_NATIVE_AVAILABLE_SF_CAN_BE_PROVEN",
  currentState:{
    preauthorizedRefreshRows:preRows.length,
    lightboxCandidateFilesPresent:existing.length,
    lightboxFilesWithAvailableSfSemantics:exactAvailableFiles.map(x=>x.relativePath),
    lightboxFilesWithProvenanceSemantics:provenanceFiles.map(x=>x.relativePath),
    lightboxFilesWithTimestampSemantics:timestampFiles.map(x=>x.relativePath),
    lightboxNetworkCapableFiles:networkFiles.map(x=>x.relativePath),
    discoveredLightBoxEnvironmentNames:lightboxEnvNames,
    genericRefreshEnvironmentConfigured:refreshEnvConfigured,
    directAvailableSfSupportProven:false
  },
  requiredBindingContract:{
    input:{
      canonicalPropertyId:true,
      sourcePropertyId:true
    },
    output:{
      canonicalPropertyId:true,
      sourcePropertyId:true,
      observationId:true,
      observationTimestamp:true,
      observedAvailableSf:true,
      sourceProvenance:true,
      sourceSnapshotEvidence:true
    },
    semantics:{
      observedAvailableSfMustComeFromExternalSource:true,
      canonicalAvailableSfMayNotBeSubstituted:true,
      priorTemporalAvailableSfMayNotBeRelabeledFresh:true,
      observationTimestampMustRepresentSourceObservation:true,
      sourceSnapshotEvidenceMustBeHashBindable:true
    }
  },
  executionPlan:[
    "Bind to existing LightBox transport/service layer without modifying canonical or temporal state.",
    "Run a single-record dry run against one preauthorized source/canonical pair.",
    "Capture raw source response and hash it before normalization.",
    "Verify whether a source-native field can deterministically map to observedAvailableSf.",
    "Verify timestamp semantics and stable source identity.",
    "Verify source provenance and snapshot/evidence reference.",
    "Only after one-record semantic proof, expand to bounded multi-record dry-run qualification.",
    "Do not authorize temporal append until all 400 observations are independently evidenced and rebound."
  ],
  prohibited:[
    "ASSUME_LIGHTBOX_AVAILABILITY_EQUALS_AVAILABLE_SF_WITHOUT_FIELD_PROOF",
    "COPY_CANONICAL_AVAILABLE_SF",
    "COPY_PRIOR_TEMPORAL_AVAILABLE_SF",
    "INFER_AVAILABLE_SF_FROM_BUILDING_SIZE",
    "INFER_AVAILABLE_SF_FROM_OCCUPANCY_WITHOUT_SOURCE_FIELD",
    "FABRICATE_SOURCE_TIMESTAMP",
    "FABRICATE_SOURCE_SNAPSHOT"
  ]
};
write(planPath,configurationPlan);

const scaffold={
  contract:"SCIIP_EXPLORER_4_M4_19D3_LIGHTBOX_REFRESH_SOURCE_BINDING_SCAFFOLD",
  version:VERSION,
  generatedAt:new Date().toISOString(),
  mode:"READ_ONLY_BINDING_SCAFFOLD",
  adapter:{
    provider:"LIGHTBOX_EXISTING_STACK",
    approvedField:APPROVED_FIELD,
    semanticProofRequired:true,
    transportReuseAllowed:true,
    mutationAuthority:false,
    dryRunOnly:true
  },
  preauthorizedSample:{
    canonicalPropertyId:preRows[0]?.canonicalPropertyId??null,
    sourcePropertyId:preRows[0]?.sourcePropertyId??null
  },
  requiredNormalization:{
    canonicalPropertyId:"from preauthorization",
    sourcePropertyId:"from preauthorization/source identity bridge",
    observationId:"from source-native response or deterministic source request identity",
    observationTimestamp:"from source-native response",
    observedAvailableSf:"UNBOUND_UNTIL_SOURCE_NATIVE_FIELD_PROVEN",
    sourceProvenance:"LightBox endpoint/product + request/response identity",
    sourceSnapshotEvidence:"raw response hash + persisted dry-run evidence artifact"
  },
  semanticGate:{
    bindingState,
    directAvailableSfSupportProven:false,
    dryRunNetworkRequestAuthorized:false,
    dryRunMutationAuthorized:false
  }
};
write(scaffoldPath,scaffold);

const result={
  contract:CONTRACT,
  version:VERSION,
  status:"PASSED",
  state:"M419D3_EXTERNAL_SOURCE_CONFIGURATION_PLAN_BINDING_SCAFFOLD_CERTIFIED_DRY_RUN_REQUIRED",
  certifiedAt:new Date().toISOString(),
  semanticAudit:{
    inspectedLightBoxFiles:inspected.length,
    existingLightBoxFiles:existing.length,
    availableSfSemanticCandidateFiles:exactAvailableFiles.length,
    provenanceSemanticFiles:provenanceFiles.length,
    timestampSemanticFiles:timestampFiles.length,
    networkCapableFiles:networkFiles.length,
    bindingState,
    directAvailableSfSupportProven:false,
    configurationReadyForMutation:false
  },
  configuration:{
    existingLightBoxStackReusableForTransport:true,
    existingLightBoxStackReusableForProvenance:true,
    existingLightBoxAvailableSfSourceNotYetProven:true,
    freshDryRunRequired:true,
    genericRefreshEnvironmentConfigured:refreshEnvConfigured,
    networkRequestPerformed:false,
    configurationMutationPerformed:false,
    secretValuesExposed:false
  },
  authorityClosure:{
    temporalWriteAuthority:false,
    canonicalWriteAuthority:false,
    identityWriteAuthority:false,
    externalObservationIngestionAuthority:false,
    refreshExecutionAuthority:false,
    operationalIngestionAuthority:false,
    syncAuthority:false,
    propagationAuthority:false,
    automaticRetry:false
  },
  safety:{
    readOnlyConfigurationPlanning:true,
    canonicalMutationPerformed:false,
    temporalMutationPerformed:false,
    identityMutationPerformed:false,
    evidenceFabricated:false,
    networkRequestPerformed:false
  },
  artifacts:{
    configurationBindingPlan:planPath,
    lightBoxBindingScaffold:scaffoldPath
  },
  nextMilestone:"M4.19D4_LIGHTBOX_SINGLE_RECORD_SOURCE_NATIVE_AVAILABLE_SF_DRY_RUN_QUALIFICATION"
};
write(resultPath,result); console.log(JSON.stringify(result,null,2));
