#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

R27="M4_19D4BN17C_R4_R12_R16A_R27_EXPORT_NEXT_PROGRESSIVE_EXPANSION_READINESS_AND_POLICY_DESIGN"
R27B_FINAL="M4_19D4BN17C_R4_R12_R16A_R27B_R4_R3_R3_RECORD_200_BOUNDED_EXPLORER_SETTLE_REPAIR_AND_FINAL_NON_EXPORT_RECERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p27=er/R27/"export_next_progressive_expansion_readiness_and_policy_design.json"
    pf=er/R27B_FINAL/"record_200_bounded_explorer_settle_repair_and_final_non_export_recertification.json"
    print("="*120)
    print("SCIIP Explorer 4.0 — R27C Exact Two-Hundred Guarded Export Execution Readiness + Authorization")
    print("="*120)
    print("Mode: READ_ONLY_EXECUTION_AUTHORIZATION_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    if not p27.exists() or not pf.exists():
        print("STATUS: BLOCKED"); print("REASON: prerequisite evidence missing"); return 4
    r27=loadj(p27); fin=loadj(pf)

    checks={
      "r27PolicyPassed":r27.get("status")=="PASSED",
      "r27ExactTwoHundredPolicyCertified":r27.get("nextCohortSize")==200 or r27.get("checks",{}).get("exactTwoHundredRecordNextCohort") is True,
      "r27ProgressiveDeltaOneHundredRequired":r27.get("executionStrategy")=="PROGRESSIVE_DELTA_ONE_HUNDRED" or r27.get("checks",{}).get("progressiveDeltaExecutionRequired") is True,
      "referenceOneHundredReexportForbidden":r27.get("checks",{}).get("referenceOneHundredWillNotBeReexported") is True,
      "newOneHundredNonExportQualificationClosed":fin.get("status")=="PASSED",
      "newOneHundredCertifiedCountExactly100":fin.get("exactNewOneHundredCertifiedCount")==100,
      "record200Certified":fin.get("record200Certified") is True,
      "priorNinetyNinePreserved":fin.get("checks",{}).get("priorNinetyNineCertifiedPreserved") is True,
      "freshPagePerRecordRequired":True,
      "strictSequentialRequired":True,
      "haltOnFirstFailureRequired":True,
      "maxExportClicksPerRecordOne":True,
      "pdfDownloadCountPerRecordExactlyOne":True,
      "pdfObjectUrlEventCountPerRecordExactlyOne":True,
      "mimeApplicationPdfRequired":True,
      "positivePdfSizeRequired":True,
      "pdfFilenameSuffixRequired":True,
      "runtimeErrorsMustEqualZero":True,
      "unhandledRejectionsMustEqualZero":True,
      "sameOriginRequired":True,
      "postPublishReportReviewMustUnmount":True,
      "explorerMustRemainMounted":True,
      "authorizationDesignOnly":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "BLOCKED"
    state=("M419D4BN17C_R4_R12_R16A_R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_AUTHORIZED"
           if passed else "M419D4BN17C_R4_R12_R16A_R27C_AUTHORIZATION_BLOCKED")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION"
         if passed else "M4_19D4BN17C_R4_R12_R16A_R27C_R1_AUTHORIZATION_RESIDUAL_DIAGNOSIS")
    contract={
      "referenceCohortSize":100,
      "newQualifiedCohortSize":100,
      "exactCombinedCohortSize":200,
      "liveExportScope":"EXACT_NEW_ONE_HUNDRED_ONLY",
      "referenceCohortAction":"REUSE_CLOSED_EXACT_100_EXPORT_LIFECYCLE_EVIDENCE_NO_REEXPORT",
      "newCohortAction":"EXPORT_EXACT_100_PREQUALIFIED_RECORDS",
      "freshPagePerRecord":True,
      "strictSequential":True,
      "haltOnFirstFailure":True,
      "continueAfterFailure":False,
      "maxExportClicksPerRecord":1,
      "explorerSettle":{"consecutiveSamples":3,"maximumSeconds":2.0,"samplingAnchor":"DOCUMENT_COMPLETE_AND_NONZERO_BUTTON_DOM"},
      "targetBindingSettle":{"consecutiveSamples":3,"maximumSeconds":5.0},
      "selectedPropertySettle":{"consecutiveSamples":3,"maximumSeconds":2.0},
      "artifact":{"pdfDownloadCountMustEqual":1,"pdfObjectUrlEventCountMustEqual":1,"mimeMustEqual":"application/pdf","sizeMustBePositive":True,"filenameMustEndWith":".pdf"},
      "runtime":{"errorsMustEqual":0,"unhandledRejectionsMustEqual":0,"postPublishReportReviewMustUnmount":True,"explorerMustRemainMounted":True,"sameOriginMustRemain":True}
    }
    od=er/OUT; od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_two_hundred_guarded_export_execution_readiness_and_authorization.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R27C_EXACT_TWO_HUNDRED_GUARDED_EXPORT_EXECUTION_READINESS_AND_AUTHORIZATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,
      "classification":"EXACT_200_EXPORT_COHORT_AUTHORIZED_AS_CLOSED_REFERENCE100_PLUS_PREQUALIFIED_NEW100_DELTA" if passed else "AUTHORIZATION_INCOMPLETE",
      "authorizationContract":contract,
      "checks":checks,
      "exportInvocation":False,
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("REFERENCE_COHORT_SIZE: 100")
    print("NEW_PREQUALIFIED_COHORT_SIZE: 100")
    print("EXACT_COMBINED_COHORT_SIZE: 200")
    print("LIVE_EXPORT_SCOPE: EXACT_NEW_ONE_HUNDRED_ONLY")
    print("REFERENCE_ONE_HUNDRED_REEXPORT: FORBIDDEN")
    print("EXECUTION_MODE: STRICT_SEQUENTIAL_FRESH_PAGE_HALT_ON_FIRST_FAILURE")
    print("MAX_EXPORT_CLICKS_PER_RECORD: 1")
    print("EXPORT_INVOCATION: OFF")
    print("\n----- AUTHORIZATION CONTRACT -----")
    print(json.dumps(contract,indent=2))
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR27C EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if passed else 10

if __name__=="__main__": raise SystemExit(main())
