#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import ast,json,re,subprocess,sys
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_PRIOR200_SELECTION_KEY_NORMALIZATION_REPAIR_AND_SELECTOR_RECERTIFICATION"
def main():
 repo=Path(sys.argv[1]).expanduser().resolve();pcc=repo/"apps/property-command-center";er=pcc/"evidence/explorer4"
 runner=pcc/"src/explorer4"/R29A/"select_r29a.py";out=er/OUT;out.mkdir(parents=True,exist_ok=True)
 src=runner.read_text();old="""        _r29a_r4_r2_ids = [marker_identity(x) for x in _r29a_r4_r2_prior]
        _r29a_r4_r2_keys = keyset(_r29a_r4_r2_ids)
        _r29a_r4_r2_new_keys = keyset(new200)
"""
 new="""        # R29A-R4-R2-R2-R2-R3-R2: marker_identity() already returns normalized
        # identity dictionaries. keyset() expects record dictionaries, not the
        # marker_identity() output. Feeding marker identities back into keyset()
        # collapses a 200-record cohort to the empty-key singleton.
        _r29a_r4_r2_ids = [marker_identity(x) for x in _r29a_r4_r2_prior]
        _r29a_r4_r2_keys = {norm(x.get('selectionKey') or x.get('label')) for x in _r29a_r4_r2_ids if norm(x.get('selectionKey') or x.get('label'))}
        _r29a_r4_r2_new_ids = [marker_identity(x) for x in new200]
        _r29a_r4_r2_new_keys = {norm(x.get('selectionKey') or x.get('label')) for x in _r29a_r4_r2_new_ids if norm(x.get('selectionKey') or x.get('label'))}
"""
 if old not in src:
  print("STATUS: BLOCKED");print("REASON: exact diagnosed authoritative branch not found");return 4
 backup=runner.with_suffix(".py.r29a_r4_r2_r2_r2_r3_r2.bak")
 if not backup.exists():backup.write_text(src)
 patched=src.replace(old,new,1);ast.parse(patched);runner.write_text(patched)
 print("="*120);print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2 Prior-200 Selection-Key Normalization Repair + Selector Recertification");print("="*120)
 print("Application source mutation: ON — selector-only diagnosed normalization repair")
 print("Governed data mutation: OFF");print("Property click: OFF");print("Assignments invocation: OFF");print("Generate invocation: OFF");print("Export invocation: OFF")
 print("SELECTOR_PATCH_APPLIED: True")
 cp=subprocess.run(["python3",str(runner),str(repo)],text=True,capture_output=True)
 print(cp.stdout,end=""); 
 if cp.stderr: print(cp.stderr,end="")
 passed=cp.returncode==0
 # selector evidence path is authoritative output if run succeeded
 candidates=list((er/R29A).glob("*.json")) if (er/R29A).exists() else []
 ev={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_PRIOR200_SELECTION_KEY_NORMALIZATION_REPAIR_AND_SELECTOR_RECERTIFICATION",
 "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "BLOCKED",
 "selectorPatchApplied":True,"selectorExitCode":cp.returncode,"governedDataMutation":False,"exportInvocation":False,
 "classification":"R29A_SELECTOR_RECERTIFIED_AFTER_MARKER_IDENTITY_KEY_DOMAIN_REPAIR" if passed else "R29A_SELECTOR_RESIDUAL_REMAINS_AFTER_MARKER_IDENTITY_KEY_DOMAIN_REPAIR",
 "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R3_EXACT_NEW_FOUR_HUNDRED_TARGET_ARTIFACT_CERTIFICATION_AND_EXPORT_PREAUTHORIZATION" if passed else "M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R1_POST_NORMALIZATION_RESIDUAL_CAUSAL_DIAGNOSIS"}
 (out/"prior200_selection_key_normalization_repair_and_selector_recertification.json").write_text(json.dumps(ev,indent=2)+"\n")
 print("STATUS:",ev["status"]);print("CLASSIFICATION:",ev["classification"]);print("NEXT_MILESTONE:",ev["nextMilestone"])
 print("EVIDENCE:",out/"prior200_selection_key_normalization_repair_and_selector_recertification.json")
 print("R29A-R4-R2-R2-R2-R3-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
 return 0 if passed else 9
if __name__=="__main__":raise SystemExit(main())
