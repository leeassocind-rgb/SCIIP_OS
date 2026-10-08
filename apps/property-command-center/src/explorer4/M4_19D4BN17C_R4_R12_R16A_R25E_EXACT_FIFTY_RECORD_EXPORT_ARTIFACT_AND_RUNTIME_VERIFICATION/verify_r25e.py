#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,hashlib,sys

R3="M4_19D4BN17C_R4_R12_R16A_R25D_R3_BOUNDED_EXPLORER_SETTLE_AND_EXACT_FIFTY_EXPORT_RECERTIFICATION"
R3_STATE="M419D4BN17C_R4_R12_R16A_R25D_R3_EXACT_FIFTY_RECORD_GUARDED_EXPORT_RECERTIFICATION_CERTIFIED"
R3_CLASS="BOUNDED_EXPLORER_SETTLE_PARITY_CERTIFIED_EXACT_FIFTY_RECORD_GUARDED_EXPORT_RECERTIFICATION_PASSED"
M="M4_19D4BN17C_R4_R12_R16A_R25E_EXACT_FIFTY_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    evid=repo/"apps/property-command-center/evidence/explorer4"
    src=evid/R3/"bounded_explorer_settle_and_exact_fifty_export_recertification.json"
    print("="*116)
    print("SCIIP Explorer 4.0 — R25E Exact Fifty Record Export Artifact + Runtime Verification")
    print("="*116)
    print("Mode: READ_ONLY_POST_EXECUTION_EVIDENCE_VERIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    if not src.exists():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R25D_R3_EVIDENCE_REQUIRED"); return 4
    d=loadj(src)
    if d.get("status")!="PASSED" or d.get("state")!=R3_STATE or d.get("classification")!=R3_CLASS:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: R25D_R3_EXACT_FIFTY_CERTIFICATION_REQUIRED"); return 5
    outcomes=d.get("outcomes") or []
    cohort=d.get("cohort") or []
    rows=[]
    for o in outcomes:
        a=o.get("artifact") or {}
        rows.append({
          "ordinal":o.get("ordinal"),"target":o.get("target"),
          "certified":o.get("certified") is True,
          "pdfDownloadCount":a.get("pdfDownloadCount"),
          "pdfObjectUrlEventCount":a.get("pdfObjectUrlEventCount"),
          "pdfFilename":a.get("pdfFilename"),
          "pdfMimeType":a.get("pdfMimeType"),
          "pdfSizeBytes":a.get("pdfSizeBytes"),
          "runtimeErrorCount":o.get("runtimeErrorCount"),
          "unhandledRejectionCount":o.get("unhandledRejectionCount"),
          "postPublishReportReviewUnmountCertified":o.get("postPublishReportReviewUnmountCertified"),
          "explorerContinuity":o.get("explorerContinuity"),
          "sameOrigin":o.get("sameOrigin")
        })
    exact50=len(rows)==50 and len(cohort)==50
    unique=len({str(x.get("target","")).lower() for x in rows})==50
    artifact_ok=all(x["certified"] and x["pdfDownloadCount"]==1 and x["pdfObjectUrlEventCount"]==1 and
                    x["pdfMimeType"]=="application/pdf" and isinstance(x["pdfSizeBytes"],(int,float)) and x["pdfSizeBytes"]>0 and
                    isinstance(x["pdfFilename"],str) and x["pdfFilename"].lower().endswith(".pdf") for x in rows)
    runtime_ok=all(x["runtimeErrorCount"]==0 and x["unhandledRejectionCount"]==0 and
                   x["postPublishReportReviewUnmountCertified"] is True and
                   x["explorerContinuity"] is True and x["sameOrigin"] is True for x in rows)
    checks={
      "r25dR3Passed":True,
      "exactFiftyOutcomeCount":exact50,
      "exactFiftyUniqueTargets":unique,
      "allFiftyRecordCertificationsPresent":all(x["certified"] for x in rows) if rows else False,
      "singlePdfDownloadPerRecord":all(x["pdfDownloadCount"]==1 for x in rows) if rows else False,
      "singlePdfObjectUrlEventPerRecord":all(x["pdfObjectUrlEventCount"]==1 for x in rows) if rows else False,
      "pdfMimeApplicationPdfPerRecord":all(x["pdfMimeType"]=="application/pdf" for x in rows) if rows else False,
      "positivePdfSizePerRecord":all(isinstance(x["pdfSizeBytes"],(int,float)) and x["pdfSizeBytes"]>0 for x in rows) if rows else False,
      "pdfFilenamePerRecord":all(isinstance(x["pdfFilename"],str) and x["pdfFilename"].lower().endswith(".pdf") for x in rows) if rows else False,
      "zeroRuntimeErrorsPerRecord":all(x["runtimeErrorCount"]==0 for x in rows) if rows else False,
      "zeroUnhandledRejectionsPerRecord":all(x["unhandledRejectionCount"]==0 for x in rows) if rows else False,
      "postPublishUnmountPerRecord":all(x["postPublishReportReviewUnmountCertified"] is True for x in rows) if rows else False,
      "explorerContinuityPerRecord":all(x["explorerContinuity"] is True for x in rows) if rows else False,
      "sameOriginPerRecord":all(x["sameOrigin"] is True for x in rows) if rows else False,
      "artifactVerificationCertified":artifact_ok,
      "runtimeVerificationCertified":runtime_ok,
      "noLiveUiInteraction":True,
      "noExportInvocation":True,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state="M419D4BN17C_R4_R12_R16A_R25E_EXACT_FIFTY_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION_CERTIFIED" if passed else "M419D4BN17C_R4_R12_R16A_R25E_EXACT_FIFTY_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION_INCOMPLETE"
    classification="EXACT_FIFTY_EXPORT_ARTIFACT_AND_RUNTIME_EVIDENCE_VERIFIED" if passed else "EXACT_FIFTY_EXPORT_ARTIFACT_OR_RUNTIME_VERIFICATION_GAP_REMAINS"
    nxt="M4_19D4BN17C_R4_R12_R16A_R25F_EXACT_FIFTY_RECORD_EXPORT_LIFECYCLE_CLOSURE_AND_NEXT_SCALE_READINESS" if passed else "M4_19D4BN17C_R4_R12_R16A_R25E_R1_ARTIFACT_RUNTIME_RESIDUAL_CAUSAL_DIAGNOSIS"
    out={"framework":"SCIIP_EXPLORER_4_R25E_EXACT_FIFTY_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"state":state,"classification":classification,
         "verifiedRecordCount":len(rows),"records":rows,"checks":checks,
         "authority":{"liveUiInteraction":False,"exportInvocation":False,"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
         "sourceEvidence":{"path":str(src),"sha256":hashlib.sha256(src.read_bytes()).hexdigest()},
         "nextMilestone":nxt}
    od=evid/M;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_fifty_record_export_artifact_and_runtime_verification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")
    print("VERIFIED_RECORDS:",len(rows),"/50")
    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("CLASSIFICATION:",classification);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
    return 0
if __name__=="__main__": raise SystemExit(main())
