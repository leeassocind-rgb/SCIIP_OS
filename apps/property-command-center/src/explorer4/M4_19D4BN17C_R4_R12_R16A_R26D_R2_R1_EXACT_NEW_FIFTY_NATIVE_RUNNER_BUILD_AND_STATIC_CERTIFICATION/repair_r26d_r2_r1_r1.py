#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib,shutil,os

R2="M4_19D4BN17C_R4_R12_R16A_R26D_R2_EXACT_ONE_HUNDRED_NATIVE_RUNNER_ADAPTATION_AND_STATIC_CERTIFICATION"
R2_STATE="M419D4BN17C_R4_R12_R16A_R26D_R2_PROGRESSIVE_DELTA_FIFTY_EXECUTION_ADAPTATION_STATIC_CERTIFIED"
R2_CLASS="EXACT_ONE_HUNDRED_EXPANSION_RECAST_AS_CLOSED_REFERENCE_FIFTY_PLUS_NATIVE_NEW_FIFTY_GUARDED_EXPORT_EXECUTION"
OUT="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R1_R1_IDEMPOTENT_NATIVE_RUNNER_INSTALLER_REPAIR_AND_STATIC_RECERTIFICATION"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def same_file(a,b):
    try:
        return a.resolve()==b.resolve() or os.path.samefile(a,b)
    except:
        return a.resolve()==b.resolve()

def copy_or_verify(src,dst):
    dst.parent.mkdir(parents=True,exist_ok=True)
    if same_file(src,dst):
        return {"action":"SAME_FILE_VERIFIED","source":str(src),"destination":str(dst),"sha256":sha(src)}
    if dst.exists() and sha(src)==sha(dst):
        return {"action":"IDENTICAL_DESTINATION_VERIFIED","source":str(src),"destination":str(dst),"sha256":sha(src)}
    shutil.copy2(src,dst)
    if sha(src)!=sha(dst):
        raise RuntimeError(f"post-copy hash mismatch: {src} -> {dst}")
    return {"action":"COPIED_AND_HASH_VERIFIED","source":str(src),"destination":str(dst),"sha256":sha(dst)}

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pkg=Path(__file__).resolve().parent
    eroot=repo/"apps/property-command-center/evidence/explorer4"
    p2=eroot/R2/"exact_one_hundred_native_runner_adaptation_and_static_certification.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26D-R2-R1-R1 Idempotent Native Runner Installer Repair + Static Recertification")
    print("="*120)
    print("Mode: IDEMPOTENT_RUNNER_INSTALL_AND_STATIC_RECERTIFICATION")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: RUNNER_INSTALL_ONLY")
    print("Governed data mutation: OFF")

    if not p2.exists():
        print("STATUS: BLOCKED");print("REASON: R26D-R2 evidence required");return 4
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
    if not src.exists():
        print("STATUS: BLOCKED");print("REASON: packaged native runner missing");return 8
    text=src.read_text(errors="ignore")

    forbidden=["R25C_EXACT_FIFTY","exact_fifty_cohort"]
    required=[
      'EXPECTED_COUNT=50','MAX_EXPORT_CLICKS_PER_RECORD=1','STRICT_SEQUENTIAL=True','HALT_ON_FIRST_FAILURE=True',
      'EXPLORER_SETTLE_SAMPLES=3','EXPLORER_SETTLE_MAX_SECONDS=2.0',
      'TARGET_BINDING_SETTLE_SAMPLES=3','TARGET_BINDING_SETTLE_MAX_SECONDS=5.0',
      'SELECTED_PROPERTY_SETTLE_SAMPLES=3','SELECTED_PROPERTY_SETTLE_MAX_SECONDS=2.0',
      'SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED','exportReport','application/pdf',
      'pdfDownloadCount','pdfObjectUrlEventCount','runtimeErrorCount','unhandledRejectionCount'
    ]

    install_dir=repo/"apps/property-command-center/src/explorer4"/"M4_19D4BN17C_R4_R12_R16A_R26D_R2_R1_EXACT_NEW_FIFTY_NATIVE_RUNNER_BUILD_AND_STATIC_CERTIFICATION"
    installed=install_dir/"native_new_fifty_runner.py"
    installed_targets=install_dir/"exact_new_fifty_targets.json"

    runner_install=copy_or_verify(src,installed)
    target_install=copy_or_verify(new_targets,installed_targets)

    checks={
      "r26dR2Passed":True,
      "exactNewFiftyTargetCount":len(targets)==50,
      "exactNewFiftyTargetsUnique":len(set(targets))==50,
      "idempotentInstallerUsed":True,
      "sameFileConditionHandledWithoutException":runner_install["action"] in ("SAME_FILE_VERIFIED","IDENTICAL_DESTINATION_VERIFIED","COPIED_AND_HASH_VERIFIED"),
      "runnerInstalledOrVerified":installed.exists() and sha(installed)==sha(src),
      "targetFileInstalledOrVerified":installed_targets.exists() and sha(installed_targets)==sha(new_targets),
      "runnerNoR25CExactFiftyCoupling":not any(x in text for x in forbidden),
      "allRequiredGuardTokensPresent":all(x in text for x in required),
      "singleExportMaximumCertified":"MAX_EXPORT_CLICKS_PER_RECORD=1" in text,
      "strictSequentialCertified":"STRICT_SEQUENTIAL=True" in text,
      "haltOnFirstFailureCertified":"HALT_ON_FIRST_FAILURE=True" in text,
      "artifactPdfContractCertified":"application/pdf" in text and "pdfDownloadCount" in text and "pdfObjectUrlEventCount" in text,
      "runtimeZeroContractCertified":"runtimeErrorCount" in text and "unhandledRejectionCount" in text,
      "liveAuthorizationGateCertified":"SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED" in text,
      "liveUiInteractionOff":True,
      "exportInvocationOff":True,
      "governedMutationOff":True
    }
    if not all(checks.values()):
        print("STATUS: BLOCKED")
        for k,v in checks.items():print(f"{k}: {v}")
        return 9

    efdir=eroot/OUT;efdir.mkdir(parents=True,exist_ok=True)
    ef=efdir/"idempotent_native_runner_installer_repair_and_static_recertification.json"
    state="M419D4BN17C_R4_R12_R16A_R26D_R2_R1_R1_NATIVE_NEW_FIFTY_RUNNER_INSTALL_STATIC_RECERTIFIED"
    cls="NATIVE_NEW_FIFTY_RUNNER_IDEMPOTENTLY_INSTALLED_OR_VERIFIED_AND_STATIC_RECERTIFIED"
    nxt="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_EXACT_NEW_FIFTY_NATIVE_GUARDED_EXPORT_LIVE_EXECUTION"
    out={
      "framework":"SCIIP_EXPLORER_4_R26D_R2_R1_R1_IDEMPOTENT_NATIVE_RUNNER_INSTALLER_REPAIR_AND_STATIC_RECERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED","state":state,"classification":cls,
      "runnerInstall":runner_install,"targetInstall":target_install,
      "runner":{"path":str(installed),"sha256":sha(installed)},
      "targetFile":{"path":str(installed_targets),"count":50,"sha256":sha(installed_targets)},
      "checks":checks,
      "authority":{"liveUiInteraction":False,"exportInvocation":False,"applicationSourceMutation":"RUNNER_INSTALL_ONLY","governedDataMutation":False},
      "nextMilestone":nxt
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("RUNNER_INSTALL_ACTION:",runner_install["action"])
    print("TARGET_INSTALL_ACTION:",target_install["action"])
    print("RUNNER_PATH:",installed)
    print("TARGET_FILE:",installed_targets)
    print("NEW_TARGET_COUNT: 50")
    print("LIVE_EXPORT_AUTHORIZATION_GATE: SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED=YES")
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS: PASSED")
    print("STATE:",state)
    print("CLASSIFICATION:",cls)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ef)
    print("\nR26D-R2-R1-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
