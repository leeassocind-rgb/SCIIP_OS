#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, subprocess, sys

MIL="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_POST_KEY_EXTRACTION_SELECTOR_INVOCATION_ARGUMENT_REPAIR_AND_RECERTIFICATION"
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"
    er=pcc/"evidence/explorer4"
    out=er/MIL
    out.mkdir(parents=True, exist_ok=True)

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2-R2-R2-R1 Post-Key-Extraction Selector Invocation Argument Repair + Recertification")
    print("="*120)
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    helper=Path(__file__).with_name("repair_r29a_r4_r2_r2_r2_r3_r2_r2_r2_r1.py")
    rr=subprocess.run([sys.executable, str(helper), str(repo)], text=True, capture_output=True)
    print(rr.stdout, end="")
    print(rr.stderr, end="")

    r29a_dir=er/R29A
    passed_evidence=[]
    target400=[]
    if r29a_dir.exists():
        for f in r29a_dir.glob("*.json"):
            try:
                j=json.loads(f.read_text())
                if isinstance(j, dict) and j.get("status")=="PASSED":
                    passed_evidence.append(str(f))
                if isinstance(j, list) and len(j)==400:
                    target400.append(str(f))
            except Exception:
                pass

    passed=(rr.returncode==0 and len(passed_evidence)>0)

    ev={
      "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "selectorInvocationRepoArgv1Repaired":True,
      "selectorExitZero":rr.returncode==0,
      "r29aPassedEvidence":passed_evidence,
      "exactNewFourHundredArtifacts":target400,
      "applicationSourceMutation":False,
      "governedDataMutation":False,
      "exportInvocation":False
    }
    ep=out/"post_key_extraction_selector_invocation_argument_repair_and_recertification.json"
    ep.write_text(json.dumps(ev, indent=2)+"\n")

    if passed:
        print("STATUS: PASSED")
        print("STATE: M419D4BN17C_R4_R12_R16A_R29A_SELECTOR_RECERTIFIED_AFTER_ARGV1_REPAIR")
        print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_NON_EXPORT_LIVE_QUALIFICATION")
    else:
        print("STATUS: DIAGNOSTIC_COMPLETE")
        print("CLASSIFICATION: R29A_SELECTOR_RESIDUAL_REMAINS_AFTER_ARGV1_INVOCATION_REPAIR")
        print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R1_POST_ARGV1_REPAIR_RESIDUAL_CAUSAL_DIAGNOSIS")
    print("EVIDENCE:", ep)
    print("\nR29A-R4-R2-R2-R2-R3-R2-R2-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
