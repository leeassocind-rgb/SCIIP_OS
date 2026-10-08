#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys
def loadj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def main():
 repo=Path(sys.argv[1]).expanduser().resolve();er=repo/"apps/property-command-center/evidence/explorer4"
 src=er/"M4_19D4BN17C_R4_R12_R16A_R27B_ONE_HUNDRED_NEW_RECORD_NON_EXPORT_LIVE_QUALIFICATION"/"one_hundred_new_record_non_export_live_qualification.json"
 print("="*120);print("SCIIP Explorer 4.0 — R27B-R1 Non-Export Qualification Residual Causal Diagnosis");print("="*120)
 print("Mode: READ_ONLY_STRUCTURED_EXECUTION_EVIDENCE_DIAGNOSIS\nLive UI interaction: OFF\nAssignments invocation: OFF\nExport invocation: OFF\nApplication source mutation: OFF\nGoverned data mutation: OFF")
 if not src.exists(): print("STATUS: BLOCKED\nREASON: R27B evidence required");return 4
 x=loadj(src);outs=x.get("outcomes") or [];f=next((o for o in outs if not o.get("certified")),None)
 if not f: print("STATUS: BLOCKED\nREASON: no failed R27B outcome found");return 5
 stages=["explorerSettleCertified","explorerEntryCertified","targetBindingSettleCertified","selectionCertified","selectedPropertySettleCertified","assignmentsEntryCertified","generateControlCertified","reportReviewEntryCertified","exportControlCertified","sameOrigin"]
 first=next((s for s in stages if not f.get(s)),None)
 print("CERTIFIED_BEFORE_FAILURE:",sum(1 for o in outs if o.get("certified")))
 print("FIRST_FAILURE_ORDINAL:",f.get("ordinal"));print("FIRST_FAILURE_TARGET:",f.get("target"));print("FIRST_FAILED_STAGE:",first);print("BINDING_MODE:",f.get("bindingMode"))
 print("\n----- STAGE READBACK -----")
 for s in stages: print(f"{s}: {f.get(s)}")
 print("exportInvocation:",f.get("exportInvocation"))
 # classify exact cause without retrying live UI
 cls={
 "explorerSettleCertified":"EXPLORER_ENTRY_SETTLE_FAILED",
 "explorerEntryCertified":"EXPLORER_ENTRY_CLICK_FAILED",
 "targetBindingSettleCertified":"TARGET_BINDING_SETTLE_FAILED",
 "selectionCertified":"TARGET_SELECTION_FAILED",
 "selectedPropertySettleCertified":"SELECTED_PROPERTY_SETTLE_GUARD_FAILED",
 "assignmentsEntryCertified":"ASSIGNMENTS_ENTRY_FAILED",
 "generateControlCertified":"GENERATE_CONTROL_RESOLUTION_FAILED",
 "reportReviewEntryCertified":"REPORT_REVIEW_MATERIALIZATION_FAILED",
 "exportControlCertified":"EXPORT_CONTROL_NON_EXPORT_BINDING_FAILED",
 "sameOrigin":"SAME_ORIGIN_CONTINUITY_FAILED"}.get(first,"UNKNOWN_STAGE_FAILURE")
 out={"framework":"SCIIP_EXPLORER_4_R27B_R1_NON_EXPORT_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS","generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED","sourceStatus":x.get("status"),"certifiedBeforeFailure":sum(1 for o in outs if o.get("certified")),"firstFailureOrdinal":f.get("ordinal"),"firstFailureTarget":f.get("target"),"firstFailedStage":first,"classification":cls,"stageReadback":{s:f.get(s) for s in stages},"bindingMode":f.get("bindingMode"),"exportInvocation":f.get("exportInvocation"),"noRetryPerformed":True}
 od=er/"M4_19D4BN17C_R4_R12_R16A_R27B_R1_NON_EXPORT_QUALIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS";od.mkdir(parents=True,exist_ok=True);ef=od/"non_export_qualification_residual_causal_diagnosis.json";ef.write_text(json.dumps(out,indent=2)+"\n")
 print("\nCLASSIFICATION:",cls);print("STATUS: PASSED");print("STATE: M419D4BN17C_R4_R12_R16A_R27B_R1_RESIDUAL_CAUSE_DIAGNOSED")
 print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R27B_R2_FIRST_RECORD_NON_EXPORT_QUALIFICATION_REPAIR")
 print("EVIDENCE:",ef);print("\nR27B-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.");return 0
if __name__=="__main__":raise SystemExit(main())
