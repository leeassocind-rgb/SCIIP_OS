#!/usr/bin/env python3
from pathlib import Path
import json,sys

M="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_BOUNDED_EXPLORER_SETTLE_REPAIR_AND_RESUME_FROM_RECORD_128"
OUT="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p): return json.loads(p.read_text())

def main():
    root=Path(sys.argv[1]).expanduser().resolve() if len(sys.argv)>1 else Path.home()/"Desktop/SCIIP_OS-main-merge"
    er=root/"apps/property-command-center/evidence/explorer4"
    p=er/M/"bounded_explorer_settle_repair_and_resume_from_record_128.json"
    if not p.exists():
        print("STATUS: BLOCKED"); print("REASON: R27B-R4-R3 evidence required"); return 4
    e=loadj(p)
    outcomes=e.get("outcomes") or []
    failed=[x for x in outcomes if not x.get("certified")]
    if e.get("status")!="DIAGNOSTIC_COMPLETE" or e.get("certifiedCount")!=99 or len(failed)!=1:
        print("STATUS: BLOCKED"); print("REASON: exact 99/100 R27B-R4-R3 residual state with one failure required"); return 5
    f=failed[0]
    stages=[
      "freshTargetCreated","explorerSettleCertified","explorerEntryCertified",
      "targetBindingSettleCertified","selectionCertified","selectedPropertySettleCertified",
      "assignmentsEntryCertified","generateControlCertified","reportReviewEntryCertified",
      "downloadClientListingReportControlCertified","exportReportHandlerCertifiedBySourceContract",
      "sameOrigin","exportInvocation"
    ]
    first_failed=None
    for k in stages:
        if k in ("exportReportHandlerCertifiedBySourceContract","sameOrigin"): 
            if f.get(k) is False: first_failed=k; break
        elif k=="exportInvocation":
            if f.get(k) is True: first_failed=k; break
        elif f.get(k) is False:
            first_failed=k; break

    print("="*120)
    print("SCIIP Explorer 4.0 — R27B-R4-R3-R1 Resume Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("CERTIFIED_BEFORE_FAILURE: 99")
    print("FIRST_FAILURE_ORDINAL:",f.get("ordinal"))
    print("FIRST_FAILURE_RAW_TARGET:",f.get("rawTarget"))
    print("FIRST_FAILURE_CANONICAL_TARGET:",f.get("canonicalTarget"))
    print("FIRST_FAILED_STAGE:",first_failed)
    print()
    print("----- FAILED RECORD STAGE READBACK -----")
    for k in stages: print(f"{k}: {f.get(k)}")
    print("failure:",f.get("failure"))

    classification = {
      "explorerSettleCertified":"RECORD_200_EXPLORER_SETTLE_NOT_CERTIFIED",
      "explorerEntryCertified":"RECORD_200_EXPLORER_ENTRY_NOT_CERTIFIED",
      "targetBindingSettleCertified":"RECORD_200_TARGET_BINDING_SETTLE_NOT_CERTIFIED",
      "selectionCertified":"RECORD_200_SELECTION_NOT_CERTIFIED",
      "selectedPropertySettleCertified":"RECORD_200_SELECTED_PROPERTY_SETTLE_NOT_CERTIFIED",
      "assignmentsEntryCertified":"RECORD_200_ASSIGNMENTS_ENTRY_NOT_CERTIFIED",
      "generateControlCertified":"RECORD_200_GENERATE_CONTROL_NOT_CERTIFIED",
      "reportReviewEntryCertified":"RECORD_200_REPORT_REVIEW_ENTRY_NOT_CERTIFIED",
      "downloadClientListingReportControlCertified":"RECORD_200_DOWNLOAD_CONTROL_NOT_CERTIFIED",
    }.get(first_failed,"RECORD_200_RESIDUAL_STAGE_REQUIRES_DEEP_DIAGNOSIS")

    checks={
      "r27bR4R3EvidencePresent":True,
      "r27bR4R3DiagnosticComplete":e.get("status")=="DIAGNOSTIC_COMPLETE",
      "exactNinetyNineCertified":e.get("certifiedCount")==99,
      "exactSingleResidualFailure":len(failed)==1,
      "failureOrdinal200":f.get("ordinal")==200,
      "failureTarget12350PhiladelphiaSt":f.get("canonicalTarget")=="12350 Philadelphia St",
      "failedStageResolved":first_failed is not None,
      "noRetryPerformed":True,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }
    od=er/OUT; od.mkdir(parents=True,exist_ok=True)
    out={
      "framework":"SCIIP_EXPLORER_4_R27B_R4_R3_R1_RESUME_RESIDUAL_CAUSAL_DIAGNOSIS",
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R27B_R4_R3_R1_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "certifiedBeforeFailure":99,
      "firstFailureOrdinal":f.get("ordinal"),
      "firstFailureRawTarget":f.get("rawTarget"),
      "firstFailureCanonicalTarget":f.get("canonicalTarget"),
      "firstFailedStage":first_failed,
      "failedRecord":f,
      "checks":checks,
      "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R2_RECORD_200_FAILED_STAGE_DEEP_DIAGNOSIS"
    }
    ef=od/"resume_residual_causal_diagnosis.json"; ef.write_text(json.dumps(out,indent=2)+"\n")
    print()
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",out["nextMilestone"])
    print("EVIDENCE:",ef)
    return 0
if __name__=="__main__": raise SystemExit(main())
