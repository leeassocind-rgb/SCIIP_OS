#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib

SRC="M4_19D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION"
SRC_STATE="M419D4BN17C_R4_R12_R16A_R24D_EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_CERTIFIED"
M="M4_19D4BN17C_R4_R12_R16A_R24E_EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    e=repo/"apps/property-command-center/evidence/explorer4"
    sp=e/SRC/"exact_twenty_five_record_guarded_export_execution.json"
    print("="*112)
    print("SCIIP Explorer 4.0 — R24E Exact Twenty-Five Record Export Artifact + Runtime Verification")
    print("="*112)
    print("Mode: READ_ONLY_EVIDENCE_VERIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Export retry: OFF")
    if not sp.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R24D_CERTIFIED_EXECUTION_EVIDENCE_REQUIRED");return 4
    s=loadj(sp)
    outcomes=s.get("outcomes") or []
    cohort=s.get("cohort") or []
    src_ok=(s.get("status")=="PASSED" and s.get("state")==SRC_STATE and
            s.get("classification")=="EXACT_TWENTY_FIVE_RECORD_GUARDED_EXPORT_EXECUTION_CERTIFIED")
    rows=[]
    for i,(target,o) in enumerate(zip(cohort,outcomes),1):
        a=o.get("artifact") or {}
        checks={
          "recordCertified":o.get("certified") is True,
          "freshPageCertified":o.get("freshTargetCreated") is True,
          "explorerSettleCertified":o.get("explorerSettleCertified") is True,
          "targetBindingSettleCertified":o.get("targetBindingSettleCertified") is True,
          "selectionCertified":o.get("selectedPropertyCertified") is True,
          "assignmentsCertified":o.get("assignmentsEntryCertified") is True,
          "reportReviewCertified":o.get("reportReviewEntryCertified") is True,
          "exportControlCertified":o.get("exportControlCertified") is True,
          "liveHandlerCertified":o.get("liveHandlerCertified") is True,
          "singlePdfDownload":a.get("pdfDownloadCount")==1,
          "singlePdfObjectUrlEvent":a.get("pdfObjectUrlEventCount")==1,
          "pdfFilenameCertified":isinstance(a.get("pdfFilename"),str) and a["pdfFilename"].lower().endswith(".pdf"),
          "pdfMimeCertified":a.get("pdfMimeType")=="application/pdf",
          "positivePdfSize":isinstance(a.get("pdfSizeBytes"),int) and a["pdfSizeBytes"]>0,
          "runtimeErrorsZero":o.get("runtimeErrorCount")==0,
          "unhandledRejectionsZero":o.get("unhandledRejectionCount")==0,
          "postPublishUnmountCertified":o.get("postPublishReportReviewUnmountCertified") is True,
          "explorerContinuityCertified":o.get("explorerContinuity") is True,
          "sameOriginCertified":o.get("sameOrigin") is True
        }
        cert=all(checks.values())
        r={"ordinal":i,"target":target,"artifactAndRuntimeCertified":cert,
           "pdfFilename":a.get("pdfFilename"),"pdfMimeType":a.get("pdfMimeType"),
           "pdfSizeBytes":a.get("pdfSizeBytes"),"runtimeErrorCount":o.get("runtimeErrorCount"),
           "unhandledRejectionCount":o.get("unhandledRejectionCount"),
           "postPublishReportReviewUnmountCertified":o.get("postPublishReportReviewUnmountCertified"),
           "explorerContinuityCertified":o.get("explorerContinuity"),
           "sameOriginCertified":o.get("sameOrigin"),"checks":checks}
        rows.append(r)

    exact25=(len(cohort)==25 and len(outcomes)==25 and len({x.lower() for x in cohort})==25)
    all25=src_ok and exact25 and len(rows)==25 and all(x["artifactAndRuntimeCertified"] for x in rows)
    checks={
      "r24dPassed":src_ok,
      "exactTwentyFiveCohortConsumed":len(cohort)==25,
      "exactTwentyFiveUniqueTargetsVerified":len(cohort)==25 and len({x.lower() for x in cohort})==25,
      "allTwentyFiveRecordCertificationsVerified":len(rows)==25 and all(r["checks"]["recordCertified"] for r in rows),
      "allTwentyFiveFreshPagesVerified":len(rows)==25 and all(r["checks"]["freshPageCertified"] for r in rows),
      "allTwentyFiveExplorerSettlesVerified":len(rows)==25 and all(r["checks"]["explorerSettleCertified"] for r in rows),
      "allTwentyFiveTargetBindingSettlesVerified":len(rows)==25 and all(r["checks"]["targetBindingSettleCertified"] for r in rows),
      "allTwentyFiveSelectionsVerified":len(rows)==25 and all(r["checks"]["selectionCertified"] for r in rows),
      "allTwentyFiveAssignmentsVerified":len(rows)==25 and all(r["checks"]["assignmentsCertified"] for r in rows),
      "allTwentyFiveReportReviewsVerified":len(rows)==25 and all(r["checks"]["reportReviewCertified"] for r in rows),
      "allTwentyFiveExportControlsVerified":len(rows)==25 and all(r["checks"]["exportControlCertified"] for r in rows),
      "allTwentyFiveLiveHandlersVerified":len(rows)==25 and all(r["checks"]["liveHandlerCertified"] for r in rows),
      "allTwentyFiveSinglePdfDownloadsVerified":len(rows)==25 and all(r["checks"]["singlePdfDownload"] for r in rows),
      "allTwentyFiveSinglePdfEventsVerified":len(rows)==25 and all(r["checks"]["singlePdfObjectUrlEvent"] for r in rows),
      "allTwentyFivePdfFilenamesVerified":len(rows)==25 and all(r["checks"]["pdfFilenameCertified"] for r in rows),
      "allTwentyFivePdfMimeTypesVerified":len(rows)==25 and all(r["checks"]["pdfMimeCertified"] for r in rows),
      "allTwentyFivePositivePdfSizesVerified":len(rows)==25 and all(r["checks"]["positivePdfSize"] for r in rows),
      "allTwentyFiveRuntimeErrorCountsZero":len(rows)==25 and all(r["checks"]["runtimeErrorsZero"] for r in rows),
      "allTwentyFiveUnhandledRejectionCountsZero":len(rows)==25 and all(r["checks"]["unhandledRejectionsZero"] for r in rows),
      "allTwentyFivePostPublishUnmountsVerified":len(rows)==25 and all(r["checks"]["postPublishUnmountCertified"] for r in rows),
      "allTwentyFiveExplorerContinuityVerified":len(rows)==25 and all(r["checks"]["explorerContinuityCertified"] for r in rows),
      "allTwentyFiveSameOriginVerified":len(rows)==25 and all(r["checks"]["sameOriginCertified"] for r in rows),
      "allTwentyFiveArtifactAndRuntimeVerificationsCertified":all25,
      "noRetryPerformed":True,"liveUiInteractionOff":True,"exportInvocationOff":True,
      "applicationMutationOff":True,"governedMutationOff":True,"networkAuthorityOff":True,"pixelEvidenceOff":True
    }
    status="PASSED" if all25 else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R24E_EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFIED"
           if all25 else "M419D4BN17C_R4_R12_R16A_R24E_EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION_INCOMPLETE")
    classification=("EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_EVIDENCE_CERTIFIED"
                    if all25 else "EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_EVIDENCE_GAP_REMAINS")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R24F_EXACT_TWENTY_FIVE_RECORD_EXPORT_LIFECYCLE_CLOSURE"
         if all25 else "M4_19D4BN17C_R4_R12_R16A_R24E_R1_ARTIFACT_AND_RUNTIME_VERIFICATION_RESIDUAL_DIAGNOSIS")
    print("\n----- RECORD VERIFICATION -----")
    for r in rows:
        print(f"[{r['ordinal']}/25] {r['target']}")
        for k in ["artifactAndRuntimeCertified","pdfFilename","pdfMimeType","pdfSizeBytes","runtimeErrorCount",
                  "unhandledRejectionCount","postPublishReportReviewUnmountCertified","explorerContinuityCertified",
                  "sameOriginCertified"]: print(f"{k}: {r.get(k)}")
        print()
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    out={"framework":"SCIIP_EXPLORER_4_R24E_EXACT_TWENTY_FIVE_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,
         "classification":classification,"cohort":cohort,"recordVerification":rows,"checks":checks,
         "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                      "pixelEvidence":False,"liveUiInteraction":False,"exportInvocation":False,"exportRetry":False},
         "sourceEvidence":{"r24dPath":str(sp),"r24dSha256":hashlib.sha256(sp.read_bytes()).hexdigest()},
         "nextMilestone":nxt}
    od=e/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_twenty_five_record_export_artifact_and_runtime_verification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")
    print("STATUS:",status);print("STATE:",state);print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
    return 0
if __name__=="__main__":raise SystemExit(main())
