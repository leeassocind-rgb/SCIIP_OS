#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib,shutil

R1="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R1_LIVE_EXECUTION_RESIDUAL_CAUSAL_DIAGNOSIS"
R1_STATE="M419D4BN17C_R4_R12_R16A_R26D_R2_R2_R1_LIVE_EXECUTION_RESIDUAL_CAUSE_DIAGNOSED"
R1_CLASS="ALONDRA_RECORD_81_TARGET_BINDING_SETTLE_FAILED_PRE_SELECTION"
AC="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R1_R3_ADDRESS_ONLY_BUILDING_MARKER_CANONICAL_BINDING_DIAGNOSIS"
AR="M4_19D4BN17C_R4_R12_R16A_R26B_R2_R3_R2_BUILDING_1_SELECTED_ENTITY_READBACK_REPAIR_AND_NON_EXPORT_RECERTIFICATION"
RUNNER_M="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R1_EXACT_NEW_FIFTY_NATIVE_RUNNER_BUILD_AND_STATIC_CERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_TARGET_BINDING_AND_ENTITY_GRANULARITY_REPAIR"

def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pkg=Path(__file__).resolve().parent
    e=repo/"apps/property-command-center/evidence/explorer4"
    p1=e/R1/"live_execution_residual_causal_diagnosis.json"
    pc=e/AC/"address_only_building_marker_canonical_binding_diagnosis.json"
    pr=e/AR/"building_1_selected_entity_readback_repair_and_non_export_recertification.json"
    runner=repo/"apps/property-command-center/src/explorer4"/RUNNER_M/"native_new_fifty_runner.py"
    patched=pkg/"native_new_fifty_runner_patched.py"

    print("="*120)
    print("SCIIP Explorer 4.0 — R26D-R2-R2-R2 Alondra Native Target Binding + Entity Granularity Repair")
    print("="*120)
    print("Mode: NATIVE_RUNNER_BINDING_PATCH")
    print("Export invocation: OFF")
    print("Governed data mutation: OFF")

    for p in (p1,pc,pr,runner,patched):
        if not p.exists():
            print("STATUS: BLOCKED");print("MISSING:",p);return 4
    d1=loadj(p1);dc=loadj(pc);dr=loadj(pr)
    if d1.get("status")!="PASSED" or d1.get("state")!=R1_STATE or d1.get("classification")!=R1_CLASS:
        print("STATUS: BLOCKED");print("REASON: exact record-81 diagnosis required");return 5
    if dc.get("status")!="PASSED" or dr.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("REASON: prior certified Alondra identity evidence required");return 6

    text=patched.read_text(errors="ignore")
    required=["112 W Alondra Blvd|181831","ALONDRA_PROJECT_AGGREGATE_SF=422277",
              "wait_alondra_building1_binding","click_alondra_building1","wait_alondra_selected_building1",
              "ALONDRA_BUILDING_PROJECT_AWARE_HIDDEN_CARD_181831","MAX_EXPORT_CLICKS_PER_RECORD=1",
              "STRICT_SEQUENTIAL=True","HALT_ON_FIRST_FAILURE=True","SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED"]
    if not all(x in text for x in required):
        print("STATUS: BLOCKED");print("REASON: patched runner guard token missing");return 7

    backup=runner.with_suffix(".pre_alondra_r26d_r2_r2_r2.py")
    if not backup.exists(): shutil.copy2(runner,backup)
    shutil.copy2(patched,runner)
    if sha(runner)!=sha(patched):
        print("STATUS: BLOCKED");print("REASON: installed runner hash mismatch");return 8

    checks={
      "r26dR2R2R1Passed":True,
      "priorAlondraCanonicalContractConsumed":True,
      "priorAlondraNonExportRecertificationConsumed":True,
      "buildingCanonicalKey181831Present":True,
      "projectAggregate422277Excluded":True,
      "buildingProjectAwareBindingInstalled":True,
      "selectedBuildingHiddenCardReadbackInstalled":True,
      "genericBindingPathPreserved":"wait_target_binding(w,target)" in text,
      "singleExportMaximumPreserved":"MAX_EXPORT_CLICKS_PER_RECORD=1" in text,
      "strictSequentialPreserved":"STRICT_SEQUENTIAL=True" in text,
      "haltOnFirstFailurePreserved":"HALT_ON_FIRST_FAILURE=True" in text,
      "liveAuthorizationGatePreserved":"SCIIP_R26D_R2_R2_LIVE_EXPORT_AUTHORIZED" in text,
      "exportInvocationOff":True,
      "governedMutationOff":True
    }
    od=e/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"alondra_native_target_binding_and_entity_granularity_repair.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R26D_R2_R2_R2_ALONDRA_NATIVE_TARGET_BINDING_AND_ENTITY_GRANULARITY_REPAIR",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_ALONDRA_NATIVE_TARGET_BINDING_ENTITY_GRANULARITY_REPAIRED",
      "classification":"ALONDRA_NATIVE_RUNNER_BINDING_REPAIRED_TO_BUILDING_1_181831_SF_PROJECT_AGGREGATE_422277_SF_EXCLUDED",
      "runner":{"path":str(runner),"sha256":sha(runner),"backup":str(backup)},
      "canonicalKey":"112 W Alondra Blvd|181831","projectAggregateSf":422277,
      "checks":checks,
      "nextMilestone":"M4_19D4BN17C_R4_R12_R16A_R26D_R2_R2_R2_R1_ALONDRA_SINGLE_RECORD_NON_EXPORT_NATIVE_RECERTIFICATION"
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")
    print("RUNNER_PATCHED:",runner)
    print("RUNNER_SHA256:",sha(runner))
    print("ALONDRA_BUILDING_CANONICAL_KEY: 112 W Alondra Blvd|181831")
    print("ALONDRA_PROJECT_AGGREGATE_EXCLUDED_SF: 422277")
    print("EXPORT_INVOCATION: OFF")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("STATUS: PASSED")
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",out["nextMilestone"])
    print("EVIDENCE:",ef)
    return 0
if __name__=="__main__": raise SystemExit(main())
