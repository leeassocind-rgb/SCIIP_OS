#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys

M26D="M4_19D4BN17C_R4_R12_R16A_R26D_EXACT_ONE_HUNDRED_RECORD_GUARDED_EXPORT_LIVE_EXECUTION"
R25="M4_19D4BN17C_R4_R12_R16A_R25D_R3_BOUNDED_EXPLORER_SETTLE_AND_EXACT_FIFTY_EXPORT_RECERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R26E_EXACT_ONE_HUNDRED_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION"

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    eroot=repo/"apps/property-command-center/evidence/explorer4"
    d26=eroot/M26D/"exact_one_hundred_record_guarded_export_live_execution.json"
    r25=eroot/R25/"bounded_explorer_settle_and_exact_fifty_export_recertification.json"
    print("="*120)
    print("SCIIP Explorer 4.0 — R26E Exact One Hundred Record Export Artifact + Runtime Verification")
    print("="*120)
    print("Mode: READ_ONLY_POST_EXECUTION_VERIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    if not d26.exists():
        print("STATUS: BLOCKED"); print("REASON: R26D execution evidence missing"); return 4
    d=loadj(d26)
    checks={}
    checks["r26dEvidencePresent"]=True
    checks["r26dDelegatedExecutionComplete"]=d.get("status")=="DELEGATED_EXECUTION_COMPLETE"
    checks["r26dRunnerExitZero"]=d.get("runnerExitCode")==0
    checks["r26dTargetCountExactOneHundred"]=d.get("targetCount")==100
    checks["r26dAuthorizationConsumed"]=d.get("authorizationConsumed") is True
    checks["r25dR3EvidencePresent"]=r25.exists()
    detail=loadj(r25) if r25.exists() else {}
    # R26D reused R25D-R3; verify the execution evidence actually reports all fifty delegated executions certified.
    checks["delegatedRunnerStatusPassed"]=detail.get("status")=="PASSED"
    # tolerate schema variants while requiring the certified exact-fifty evidence surface
    txt=r25.read_text(errors="ignore") if r25.exists() else ""
    required=[
      '"pdfDownloadCount": 1','"pdfObjectUrlEventCount": 1',
      '"pdfMimeType": "application/pdf"','"runtimeErrorCount": 0',
      '"unhandledRejectionCount": 0'
    ]
    for i,s in enumerate(required,1): checks[f"artifactRuntimeInvariant{i}Observed"]=s in txt

    # Critical truthfulness guard: R26D's delegated runner was an exact-50 implementation.
    # Therefore R26E must not certify 100 exports unless evidence proves 100 distinct executions.
    certified_count=txt.count('"certified": true') + txt.count('"certified": True')
    checks["delegatedCertifiedRecordCountObserved"]=certified_count
    checks["exactOneHundredDistinctExportsProven"]=certified_count==100

    print("----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    exact100=checks["exactOneHundredDistinctExportsProven"]
    if exact100:
        status="PASSED"
        state="M419D4BN17C_R4_R12_R16A_R26E_EXACT_ONE_HUNDRED_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION_CERTIFIED"
        cls="EXACT_ONE_HUNDRED_DISTINCT_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION_CERTIFIED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26F_EXACT_ONE_HUNDRED_RECORD_EXPORT_LIFECYCLE_CLOSURE"
    else:
        status="DIAGNOSTIC_COMPLETE"
        state="M419D4BN17C_R4_R12_R16A_R26E_EXACT_ONE_HUNDRED_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION_INCOMPLETE"
        cls="R26D_DECLARED_EXACT_ONE_HUNDRED_BUT_DELEGATED_RUNNER_EVIDENCE_DOES_NOT_PROVE_ONE_HUNDRED_DISTINCT_EXPORTS"
        nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R1_EXACT_ONE_HUNDRED_EXECUTION_COHORT_HANDOFF_CAUSAL_DIAGNOSIS"
    out={"framework":"SCIIP_EXPLORER_4_R26E_EXACT_ONE_HUNDRED_RECORD_EXPORT_ARTIFACT_AND_RUNTIME_VERIFICATION",
         "generatedAt":datetime.now(timezone.utc).isoformat(),"checks":checks,
         "status":status,"state":state,"classification":cls,"nextMilestone":nxt}
    od=eroot/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_one_hundred_record_export_artifact_and_runtime_verification.json"
    ef.write_text(json.dumps(out,indent=2)+"\n")
    print("STATUS:",status);print("STATE:",state);print("CLASSIFICATION:",cls);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ef)
    print("\nR26E EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0
if __name__=="__main__": raise SystemExit(main())
