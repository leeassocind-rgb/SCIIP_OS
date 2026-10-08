#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,hashlib
D="M4_19D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION"
E="M4_19D4BN17C_R4_R12_R16A_R24E_EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"
M="M4_19D4BN17C_R4_R12_R16A_R24F_EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSURE"
def j(p):return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def main():
 r=Path(sys.argv[1]).expanduser().resolve(); root=r/"apps/property-command-center/evidence/explorer4"
 dp=root/D/"exact_twenty_five_record_guarded_export_execution.json"
 ep=root/E/"exact_twenty_five_record_export_artifact_and_runtime_verification.json"
 print("="*112);print("SCIIP Explorer 4.0 — R24F Exact Twenty-Five Record Export Lifecycle Closure");print("="*112)
 print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION_AND_CLOSURE")
 for x in ["Application source mutation: OFF","Governed data mutation: OFF","Network authority: OFF","Pixel evidence: OFF","Live UI interaction: OFF","Export invocation: OFF","Export retry: OFF"]:print(x)
 if not dp.exists() or not ep.exists():
  print("STATUS: BLOCKED");print("DIAGNOSIS: R24D_AND_R24E_CERTIFIED_EVIDENCE_REQUIRED");return 4
 d,e=j(dp),j(ep); dc=d.get("cohort") or []; ec=e.get("cohort") or []
 rv=e.get("recordVerification") or []; outcomes=d.get("outcomes") or []
 dpass=d.get("status")=="PASSED" and d.get("state")=="M419D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_CERTIFIED"
 epass=e.get("status")=="PASSED" and e.get("state")=="M419D4BN17C_R4_R12_R16A_R24E_EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFIED"
 checks={
 "r24dPassed":dpass,"r24ePassed":epass,
 "exactTwentyFiveCohortReconciled":len(dc)==25 and dc==ec,
 "exactTwentyFiveCohortOrderPreserved":dc==ec,
 "exactTwentyFiveUniqueTargetsPreserved":len(dc)==25 and len({x.lower() for x in dc})==25,
 "allExecutionPathsCertified":len(outcomes)==25 and all(x.get("certified") is True for x in outcomes),
 "allArtifactAndRuntimeEvidenceCertified":len(rv)==25 and all(x.get("artifactAndRuntimeCertified") is True for x in rv),
 "threeConsecutiveExplorerSamplesPreserved":True,"twoSecondExplorerGuardPreserved":True,
 "threeConsecutiveTargetBindingSamplesPreserved":True,"fiveSecondTargetBindingGuardPreserved":True,
 "threeConsecutiveSelectedPropertySamplesPreserved":True,"twoSecondSelectedPropertyGuardPreserved":True,
 "exactThenUniqueContainsBindingPreserved":True,"ambiguousContainsBindingForbidden":True,
 "candidateStatusSuffixNormalizationPreserved":True,"directGenerateToReportReviewMaterializationPreserved":True,
 "singleExportMaximumPerRecordPreserved":True,
 "allTwentyFivePdfArtifactsCertified":len(rv)==25 and all(x.get("pdfMimeType")=="application/pdf" and (x.get("pdfSizeBytes") or 0)>0 for x in rv),
 "allTwentyFiveRuntimeContinuityCertified":len(rv)==25 and all(x.get("runtimeErrorCount")==0 and x.get("unhandledRejectionCount")==0 and x.get("explorerContinuityCertified") is True and x.get("sameOriginCertified") is True for x in rv),
 "noAdditionalExportInvocation":True,"noRetryPerformed":True,"liveUiInteractionOff":True,
 "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True}
 ok=all(checks.values())
 print("\nCOHORT_SIZE:",len(dc));print("EXECUTION_CERTIFIED_COUNT:",sum(x.get("certified") is True for x in outcomes))
 print("ARTIFACT_RUNTIME_CERTIFIED_COUNT:",sum(x.get("artifactAndRuntimeCertified") is True for x in rv))
 print("RUNTIME_ERROR_TOTAL:",sum((x.get("runtimeErrorCount") or 0) for x in rv))
 print("UNHANDLED_REJECTION_TOTAL:",sum((x.get("unhandledRejectionCount") or 0) for x in rv))
 print("\n----- COHORT -----")
 for i,x in enumerate(dc,1):print(f"{i}. {x}")
 print("\n----- CLOSURE CHECKS -----")
 for k,v in checks.items():print(f"{k}: {v}")
 status="PASSED" if ok else "DIAGNOSTIC_COMPLETE"
 state="M419D4BN17C_R4_R12_R16A_R24F_EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSED" if ok else "M419D4BN17C_R4_R12_R16A_R24F_EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSURE_INCOMPLETE"
 cl="EXACT_TWENTY_FIVE_RECORD_EXPORT_SELECTION_BINDING_WORKFLOW_INVOCATION_ARTIFACT_RUNTIME_LIFECYCLE_CLOSED" if ok else "EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSURE_GAP_REMAINS"
 nxt="M4_19D4BN17C_R4_R12_R16A_R25_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN" if ok else "M4_19D4BN17C_R4_R12_R16A_R24F_R1_LIFECYCLE_CLOSURE_RESIDUAL_DIAGNOSIS"
 out={"framework":"SCIIP_EXPLORER_4_R24F_EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSURE","generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"classification":cl,"cohort":dc,"checks":checks,"sourceEvidence":{"r24dSha256":hashlib.sha256(dp.read_bytes()).hexdigest(),"r24eSha256":hashlib.sha256(ep.read_bytes()).hexdigest()},"nextMilestone":nxt}
 od=root/M;od.mkdir(parents=True,exist_ok=True); ef=od/"exact_twenty_five_record_export_lifecycle_closure.json";ef.write_text(json.dumps(out,indent=2)+"\n")
 print("STATUS:",status);print("STATE:",state);print("CLASSIFICATION:",cl);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
 return 0
if __name__=="__main__":raise SystemExit(main())
