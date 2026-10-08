#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import ast,json,re,sys
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R1_POST_NORMALIZATION_RESIDUAL_CAUSAL_DIAGNOSIS"
def lines(src,a,b):
 s=src.splitlines(); return "\n".join(f"{i+1:5}: {s[i]}" for i in range(max(0,a-1),min(len(s),b)))
def main():
 repo=Path(sys.argv[1]).expanduser().resolve(); pcc=repo/"apps/property-command-center"; er=pcc/"evidence/explorer4"
 runner=pcc/"src/explorer4"/R29A/"select_r29a.py"; out=er/OUT; out.mkdir(parents=True,exist_ok=True)
 src=runner.read_text(); ast.parse(src)
 print("="*120);print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2-R1 Post-Normalization Residual Causal Diagnosis");print("="*120)
 print("Application source mutation: OFF");print("Governed data mutation: OFF");print("Live UI interaction: OFF");print("Explorer click: OFF");print("Export invocation: OFF")
 # prove normalization patch survived
 patch=("marker_identity() already returns normalized" in src and "_r29a_r4_r2_new_ids" in src)
 # inspect live_inventory and main without executing either
 li=re.search(r"(?ms)^def live_inventory\(\):.*?(?=^def |\Z)",src)
 mainm=re.search(r"(?ms)^def main\(\):.*?(?=^if __name__|\Z)",src)
 lit=li.group(0) if li else ""; mt=mainm.group(0) if mainm else ""
 settle_call="settle_explorer(w)" in lit
 live_before_prior=bool(re.search(r"raw,origin=live_inventory\(\).*?choose_prior200",mt,re.S))
 # locate line numbers
 ss=src.splitlines()
 def first(term):
  return next((i+1 for i,x in enumerate(ss) if term in x),None)
 settle_ln=first("settle_explorer(w)")
 live_ln=first("raw,origin=live_inventory()")
 choose_ln=first("choose_prior200(er,new200,livekeys)")
 print("NORMALIZATION_PATCH_PRESENT:",patch)
 print("LIVE_INVENTORY_CONTAINS_SETTLE_EXPLORER:",settle_call)
 print("MAIN_CALLS_LIVE_INVENTORY_BEFORE_CHOOSE_PRIOR200:",live_before_prior)
 print("SETTLE_EXPLORER_LINE:",settle_ln);print("LIVE_INVENTORY_CALL_LINE:",live_ln);print("CHOOSE_PRIOR200_LINE:",choose_ln)
 if settle_ln: print("\n----- LIVE INVENTORY SETTLE SOURCE -----\n"+lines(src,max(1,settle_ln-12),settle_ln+8))
 if live_ln: print("\n----- MAIN ORDERING SOURCE -----\n"+lines(src,max(1,live_ln-5),live_ln+8))
 classification=("R29A_SELECTOR_RECERTIFICATION_BLOCKED_BEFORE_PRIOR200_BRANCH_BY_LIVE_EXPLORER_SETTLE_DEPENDENCY"
                 if patch and settle_call and live_before_prior else
                 "R29A_POST_NORMALIZATION_RESIDUAL_CAUSE_NOT_YET_ISOLATED")
 passed=classification.startswith("R29A_SELECTOR_RECERTIFICATION_BLOCKED")
 ev={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R1_POST_NORMALIZATION_RESIDUAL_CAUSAL_DIAGNOSIS",
 "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "BLOCKED",
 "normalizationPatchPresent":patch,"liveInventoryContainsSettleExplorer":settle_call,
 "mainCallsLiveInventoryBeforeChoosePrior200":live_before_prior,"settleExplorerLine":settle_ln,
 "liveInventoryCallLine":live_ln,"choosePrior200Line":choose_ln,"applicationMutation":False,
 "governedMutation":False,"liveUiInteraction":False,"exportInvocation":False,"classification":classification,
 "nextMilestone":("M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_AUTHORITATIVE_PRIOR200_BRANCH_PRELIVE_RESOLUTION_REPAIR_AND_SELECTOR_RECERTIFICATION"
 if passed else "M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R1_R1_DEEP_RESIDUAL_DIAGNOSIS")}
 ep=out/"post_normalization_residual_causal_diagnosis.json";ep.write_text(json.dumps(ev,indent=2)+"\n")
 print("\nCLASSIFICATION:",classification);print("STATUS:",ev["status"]);print("NEXT_MILESTONE:",ev["nextMilestone"]);print("EVIDENCE:",ep)
 print("R29A-R4-R2-R2-R2-R3-R2-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
 return 0 if passed else 9
if __name__=="__main__":raise SystemExit(main())
