import fs from "node:fs"; import path from "node:path"; import {stageEvidence,loadJson,sha} from "./M419DExternalAdapterRuntime.js";
const repo=process.argv[2]; if(!repo) throw new Error("repository path required");
const ev=path.join(repo,"apps/property-command-center/evidence");
const source=path.join(ev,"m4-19-refresh-observation-source-evidence.json");
const out=path.join(ev,"m4-19d-external-refresh-source-evidence-staging-manifest.json");
let records=[]; let present=false;
if(fs.existsSync(source)){present=true; const x=loadJson(source); records=Array.isArray(x)?x:(x.records||x.observations||[])}
const staged=stageEvidence(records);
const all400=present&&records.length===400&&staged.ready===400;
const manifest={contract:"SCIIP_EXPLORER_4_M4_19D_EXTERNAL_REFRESH_SOURCE_ADAPTER_AND_EVIDENCE_STAGING_GATE",version:"4.0-m4.19d",status:all400?"PASSED":"BLOCKED",state:all400?"M419D_400_EXTERNAL_REFRESH_OBSERVATIONS_STAGED_VALIDATED_REBINDING_READY":"M419D_EXTERNAL_REFRESH_EVIDENCE_STAGING_INCOMPLETE",certifiedAt:new Date().toISOString(),staging:{evidenceSourcePath:present?source:null,receivedRecords:records.length,stagedReadyRecords:staged.ready,stagedBlockedRecords:staged.blocked,all400Staged:all400,sourceNativeEvidenceRequired:true,canonicalValuesAsEvidenceProhibited:true,priorTemporalValuesAsFreshEvidenceProhibited:true,syntheticEvidenceProhibited:true,readOnlyStaging:true},authorityClosure:{temporalWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},safety:{canonicalMutationPerformed:false,publicMutationPerformed:false,temporalMutationPerformed:false,identityMutationPerformed:false,externalObservationIngestionPerformed:false,temporalObservationsCreated:0},artifacts:{stagingManifest:out},nextMilestone:all400?"M4.19E_STAGED_REFRESH_EVIDENCE_REBINDING_AND_EXECUTION_READINESS_CERTIFICATION":"M4.19D_EXTERNAL_REFRESH_SOURCE_ADAPTER_AND_EVIDENCE_STAGING_GATE"};
fs.writeFileSync(out,JSON.stringify(manifest,null,2)); console.log(JSON.stringify(manifest,null,2));
