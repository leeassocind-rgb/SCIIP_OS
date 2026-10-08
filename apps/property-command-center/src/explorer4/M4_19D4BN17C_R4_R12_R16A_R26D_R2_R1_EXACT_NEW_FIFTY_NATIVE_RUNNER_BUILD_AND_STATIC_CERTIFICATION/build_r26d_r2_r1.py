#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib,shutil

R2="M4_19D4BN17C_R4_R12_R16A_R26D_R2_EXACT_ONE_HUNDRED_NATIVE_RUNNER_ADAPTATION_AND_STATIC_CERTIFICATION"
R2_STATE="M419D4BN17C_R4_R12_R16A_R26D_R2_PROGRESSIVE_DELTA_FIFTY_EXECUTION_ADAPTATION_STATIC_CERTIFIED"
R2_CLASS="EXACT_ONE_HUNDRED_EXPANSION_RECAST_AS_CLOSED_REFERENCE_FIFTY_PLUS_NATIVE_NEW_FIFTY_GUARDED_EXPORT_EXECUTION"
OUT="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R1_EXACT_NEW_FIFTY_NATIVE_RUNNER_BUILD_AND_STATIC_CERTIFICATION"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pkg=Path(__file__).resolve().parent
    eroot=repo/"apps/property-command-center/evidence/explorer4"
    p2=eroot/R2/"exact_one_hundred_native_runner_adaptation_and_static_certification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26D-R2-R1 Exact New-Fifty Native Runner Build + Static Certification")
    print("="*120)
    print("Mode: RUNNER_INSTALL_AND_STATIC_CERTIFICATION")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: RUNNER_INSTALL_ONLY")
    print("Governed data mutation: OFF")

    if not p2.exists():
        print("STATUS: BLOCKED"); print("REASON: R26D-R2 evidence required"); return 4
    d2=loadj(p2)
    if d2.get("status")!="PASSED" or d2.get("state")!=R2_STATE or d2.get("classification")!=R2_CLASS:
        print("STATUS: BLOCKED");print("REASON: certified R26D-R2 adaptation required");return 5

    new_targets=Path(d2.get("artifacts",{}).get("newTargets",""))
    if not new_targets.exists():
        print("STATUS: BLOCKED");print("REASON: exact_new_fifty_targets.json missing");return 6
    targets=loadj(new_targets)
    if len(targets)!=50 or len(set(targets))!=50:
        print("STATUS: BLOCKED");print("REASON: exact unique new-50 target set required");return 7

    src=pkg/"native_new_fifty_runner.py"
    text=src.read_text()
    forbidden=["R25C_EXACT_FIFTY","R25C_","exact_fifty_cohort","REFERENCE_CERTIFIED_RECORDS: 50"]
    required=[
      'TARGET_ENV="SCIIP_R26_NEW_FIFTY_TARGET_FILE"',
      "EXPECTED_COUNT=50",
      "MAX_EXPORT_CLICKS_PER_RECORD=1",
      "STRICT_SEQUENTIAL=True",
      "HALT_ON_FIRST_FAILURE=True",
      "EXPLORER_SETTLE_SAMPLES=3",
      "EXPLORER_SETTLE_MAX_SECONDS=2.0",
      "TARGET_BINDING_SETTLE_SAMPLES=3",
      "TARGET_BINDING_SETTLE_MAX_SECONDS=5.0",
      "SELECTED_PROPERTY_SETTLE_SAMPLES=3",
      "SELECTED_PROPERTY_SETTLE_MAX_SECONDS=2.0",
      "exportReport",
      "application/pdf",
      "pdfDownloadCount",
      "pdfObjectUrlEventCount",
      "postPublishReportReviewUnmountCertified",
      "runtimeErrorCount",
      "unhandledRejectionCount",
      "SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED"
    ]
    checks={
      "r26dR2Passed":True,
      "exactNewFiftyTargetFilePresent":True,
      "exactNewFiftyTargetCount":len(targets)==50,
      "exactNewFiftyTargetsUnique":len(set(targets))==50,
      "runnerReadsExternalTargetArgument":"target_file=Path(sys.argv[2])" in text,
      "runnerRejectsWrongCardinality":"target cardinality must equal" in text,
      "runnerHasExplicitLiveAuthorizationGate":"SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED" in text,
      "runnerNoR25CExactFiftyCoupling":not any(x in text for x in forbidden),
      "allRequiredGuardTokensPresent":all(x in text for x in required),
      "singleExportMaximumCertified":"MAX_EXPORT_CLICKS_PER_RECORD=1" in text,
      "strictSequentialCertified":"STRICT_SEQUENTIAL=True" in text,
      "haltOnFirstFailureCertified":"HALT_ON_FIRST_FAILURE=True" in text,
      "artifactPdfContractCertified":"application/pdf" in text and "pdfDownloadCount" in text and "pdfObjectUrlEventCount" in text,
      "runtimeZeroContractCertified":"runtimeErrorCount" in text and "unhandledRejectionCount" in text,
      "postPublishUnmountContractCertified":"postPublishReportReviewUnmountCertified" in text,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "governedMutationOff":True
    }
    if not all(checks.values()):
        print("STATUS: BLOCKED")
        for k,v in checks.items():print(f"{k}: {v}")
        return 8

    install_dir=repo/"apps/property-command-center/src/explorer4"/OUT
    install_dir.mkdir(parents=True,exist_ok=True)
    installed=install_dir/"native_new_fifty_runner.py"
    shutil.copy2(src,installed)
    shutil.copy2(new_targets,install_dir/"exact_new_fifty_targets.json")

    efdir=eroot/OUT;efdir.mkdir(parents=True,exist_ok=True)
    ef=efdir/"exact_new_fifty_native_runner_build_and_static_certification.json"
    state="M419D4BN17C_R4_R12_R16A_R26D_R2_R1_EXACT_NEW_FIFTY_NATIVE_RUNNER_STATIC_CERTIFIED"
    classification="DEDICATED_EXTERNAL_TARGET_NEW_FIFTY_NATIVE_GUARDED_EXPORT_RUNNER_BUILT_AND_STATIC_CERTIFIED"
    nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION"
    out={
      "framework":"SCIIP_EXPLORER_4_R26D_R2_R1_EXACT_NEW_FIFTY_NATIVE_RUNNER_BUILD_AND_STATIC_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED","state":state,"classification":classification,
      "runner":{"path":str(installed),"sha256":sha(installed)},
      "targetFile":{"path":str(install_dir/"exact_new_fifty_targets.json"),"count":50,"sha256":sha(install_dir/"exact_new_fifty_targets.json")},
      "checks":checks,
      "authority":{"liveUiInteraction":False,"exportInvocation":False,"applicationSourceMutation":"RUNNER_INSTALL_ONLY","governedDataMutation":False},
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("RUNNER_INSTALLED:",installed)
    print("TARGET_FILE_INSTALLED:",install_dir/"exact_new_fifty_targets.json")
    print("NEW_TARGET_COUNT: 50")
    print("LIVE_EXPORT_AUTHORIZATION_GATE: SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED=YES")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS: PASSED")
    print("STATE:",state)
    print("CLASSIFICATION:",classification)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR26D-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
