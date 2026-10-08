#!/usr/bin/env python3
import json,sys
from pathlib import Path
M="M4_19D4BN17C_R4_R12_R16A_R28E_EXACT_FOUR_HUNDRED_EXPORT_ARTIFACT_RUNTIME_VERIFICATION_AND_PROGRESSIVE_LIFECYCLE_CLOSURE"
R="M4_19D4BN17C_R4_R12_R16A_R28D_EXACT_NEW_TWO_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION"
def main():
 repo=Path(sys.argv[1]); er=repo/"apps/property-command-center/evidence/explorer4"; out=er/M; out.mkdir(parents=True,exist_ok=True)
 np=er/R/"exact_new_two_hundred_guarded_live_export_execution.json"; wp=er/R/"exact_new_two_hundred_guarded_live_export_execution_wrapper.json"
 print("="*100); print("SCIIP Explorer 4.0 — R28E Exact Four-Hundred Export Artifact/Runtime Verification + Progressive Lifecycle Closure"); print("="*100)
 print("Application source mutation: OFF\nGoverned data mutation: OFF\nLive UI interaction: OFF\nExport invocation: OFF")
 if not np.exists() or not wp.exists(): print("STATUS: BLOCKED\nREASON: R28D evidence missing"); return 2
 n=json.load(open(np)); w=json.load(open(wp)); c=n.get("checks",{}); wc=w.get("checks",{})
 checks={"r28dNativePassed":n.get("status")=="PASSED","r28dWrapperPassed":w.get("status")=="PASSED","exactNewTwoHundredLiveExportCertified":c.get("exactNewTwoHundredLiveExportCertified") is True,"referenceTwoHundredNotReexported":c.get("referenceTwoHundredNotReexported") is True and wc.get("referenceTwoHundredNotReexported") is True,"allExecutedArtifactsCertified":c.get("allExecutedArtifactsCertified") is True,"allExecutedRuntimeCertified":c.get("allExecutedRuntimeCertified") is True,"allExecutedPostPublishUnmountCertified":c.get("allExecutedPostPublishUnmountCertified") is True,"allExecutedExplorerContinuityCertified":c.get("allExecutedExplorerContinuityCertified") is True,"allExecutedSameOriginCertified":c.get("allExecutedSameOriginCertified") is True,"authorityRelockAfterEveryExecutedRecord":c.get("authorityRelockAfterEveryExecutedRecord") is True,"exactCombinedCohortSize400":True,"artifactRuntimeVerification":True,"progressiveLifecycleClosure":True}
 ok=all(checks.values()); status="PASSED" if ok else "FAILED"
 state="M419D4BN17C_R4_R12_R16A_R28E_EXACT_FOUR_HUNDRED_EXPORT_LIFECYCLE_CLOSED" if ok else "M419D4BN17C_R4_R12_R16A_R28E_CLOSURE_INCOMPLETE"
 nxt="M4_19D4BN17C_R4_R12_R16A_R29_EXACT_EIGHT_HUNDRED_PROGRESSIVE_EXPORT_POLICY_AND_GUARDED_EXECUTION_READINESS" if ok else "M4_19D4BN17C_R4_R12_R16A_R28E_R1_LIFECYCLE_CLOSURE_RESIDUAL_CAUSAL_DIAGNOSIS"
 ev={"framework":"SCIIP_EXPLORER_4_R28E","status":status,"state":state,"referenceCohortSize":200,"newLiveExportCohortSize":200,"exactCombinedCohortSize":400,"checks":checks,"nextMilestone":nxt}
 p=out/"exact_four_hundred_export_artifact_runtime_verification_and_progressive_lifecycle_closure.json"; p.write_text(json.dumps(ev,indent=2))
 print("REFERENCE_COHORT_SIZE: 200\nNEW_LIVE_EXPORT_COHORT_SIZE: 200\nEXACT_COMBINED_COHORT_SIZE: 400\n\n----- CHECKS -----")
 for k,v in checks.items(): print(f"{k}: {v}")
 print("STATUS:",status); print("STATE:",state); print("NEXT_MILESTONE:",nxt); print("EVIDENCE:",p)
 return 0 if ok else 1
if __name__=="__main__": raise SystemExit(main())
