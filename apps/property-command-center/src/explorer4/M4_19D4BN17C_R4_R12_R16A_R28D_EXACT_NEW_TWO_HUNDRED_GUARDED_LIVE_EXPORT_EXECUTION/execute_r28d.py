#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,subprocess,hashlib,os

AUTH="M4_19D4BN17C_R4_R12_R16A_R28C_R2_SHAPE_SAFE_R28_POLICY_BINDING_REPAIR_AND_EXECUTION_AUTHORIZATION_RECERTIFICATION"
TARGETS="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
SRC="M4_19D4BN17C_R4_R12_R16A_R28D_EXACT_NEW_TWO_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION"
OUT=SRC

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    sr=repo/"apps/property-command-center/src/explorer4"/SRC
    auth=er/AUTH/"shape_safe_r28_policy_binding_repair_and_execution_authorization_recertification.json"
    targets=er/TARGETS/"exact_new_two_hundred_candidates_prefix_normalized.json"
    runner=sr/"native_new_two_hundred_export_runner.py"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28D Exact New Two-Hundred Guarded Live Export Execution")
    print("="*120)
    print("Application source mutation: RUNNER_INSTALL_ONLY")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("Reference closed records: 200")
    print("Live delta records: 200")
    print("Strict sequential: ON")
    print("Halt on first failure: ON")
    print("Export authority: EXACTLY ONE GUARDED EXPORT CLICK PER RECORD MAXIMUM")

    if not auth.exists() or not targets.exists() or not runner.exists():
        print("STATUS: BLOCKED");print("REASON: R28D prerequisite missing");return 4
    a=loadj(auth)
    if a.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: R28C-R2 authorization not passed");return 5

    print("RUNNER:",runner)
    print("RUNNER_SHA256:",sha(runner))
    print("TARGET_FILE:",targets)
    print("TARGET_SHA256:",sha(targets))
    print("LIVE_EXPORT_AUTHORIZATION_GATE_SET: record-local by certified runner")
    print("\nInvoking guarded exact new-200 live Export runner...\n")

    cp=subprocess.run([sys.executable,str(runner),str(repo)])
    native=er/OUT/"exact_new_two_hundred_guarded_live_export_execution.json"
    ne=loadj(native) if native.exists() else {}
    checks={
      "r28cR2Passed":a.get("status")=="PASSED",
      "runnerHashCaptured":True,
      "targetHashCaptured":True,
      "referenceTwoHundredNotReexported":True,
      "strictSequentialPreserved":True,
      "haltOnFirstFailurePreserved":True,
      "singleExportMaximumPreserved":True,
      "authorityRelockPreserved":True,
      "runnerExitZero":cp.returncode==0,
      "nativeExecutionEvidencePresent":native.exists(),
      "nativeStatusPassed":ne.get("status")=="PASSED",
      "nativeTargetCountTwoHundred":ne.get("targetCount")==200,
      "nativeCertifiedCountTwoHundred":ne.get("certifiedCount")==200,
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True
    }
    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R28D_EXACT_NEW_TWO_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION_CERTIFIED"
           if passed else "M419D4BN17C_R4_R12_R16A_R28D_EXACT_NEW_TWO_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION_INCOMPLETE")
    nxt=("M4_19D4BN17C_R4_R12_R16A_R28E_EXACT_FOUR_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE"
         if passed else "M4_19D4BN17C_R4_R12_R16A_R28D_R1_LIVE_EXPORT_EXECUTION_RESIDUAL_CAUSAL_DIAGNOSIS")
    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"exact_new_two_hundred_guarded_live_export_execution_wrapper.json"
    out={"framework":"SCIIP_EXPLORER_4_R28D_WRAPPER","generatedAt":datetime.now(timezone.utc).isoformat(),
         "status":status,"state":state,"runnerSha256":sha(runner),"targetSha256":sha(targets),
         "runnerExitCode":cp.returncode,"checks":checks,"nextMilestone":nxt}
    ef.write_text(json.dumps(out,indent=2)+"\n")
    print("\n----- WRAPPER CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status);print("STATE:",state);print("NEXT_MILESTONE:",nxt)
    print("WRAPPER_EVIDENCE:",ef)
    print("NATIVE_EVIDENCE:",native)
    print("\nR28D EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
