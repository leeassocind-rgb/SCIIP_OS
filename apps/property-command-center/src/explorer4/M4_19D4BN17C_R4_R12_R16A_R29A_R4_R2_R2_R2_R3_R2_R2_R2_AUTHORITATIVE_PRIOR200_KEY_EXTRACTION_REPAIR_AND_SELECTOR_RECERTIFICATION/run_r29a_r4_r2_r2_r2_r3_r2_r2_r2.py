#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,subprocess,sys
MIL="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_AUTHORITATIVE_PRIOR200_KEY_EXTRACTION_REPAIR_AND_SELECTOR_RECERTIFICATION"
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
def main():
 repo=Path(sys.argv[1]).expanduser().resolve(); pcc=repo/"apps/property-command-center"; er=pcc/"evidence/explorer4"; out=er/MIL; out.mkdir(parents=True,exist_ok=True)
 selector=pcc/"src/explorer4"/R29A/"select_r29a.py"
 print("="*120);print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2-R2-R2 Authoritative Prior-200 Key Extraction Repair + Selector Recertification");print("="*120)
 print("Application source mutation: ON — selector-only diagnosed key-extraction repair")
 print("Governed data mutation: OFF\nProperty click: OFF\nAssignments invocation: OFF\nGenerate invocation: OFF\nExport invocation: OFF")
 r=subprocess.run([sys.executable,str(Path(__file__).with_name("repair_r29a_r4_r2_r2_r2_r3_r2_r2_r2.py")),str(repo)],text=True,capture_output=True)
 print(r.stdout,end="")
 if r.returncode: print(r.stderr,end=""); return r.returncode
 print("Re-running authoritative R29A selector...")
 rr=subprocess.run([sys.executable,str(selector)],cwd=str(selector.parent),text=True,capture_output=True)
 print(rr.stdout,end=""); print(rr.stderr,end="")
 # Evidence discovery is intentionally non-mutating except our milestone evidence.
 r29ev=None
 for f in sorted((er/R29A).glob("*.json")) if (er/R29A).exists() else []:
  try:
   j=json.loads(f.read_text())
   if j.get("status")=="PASSED": r29ev=str(f)
  except: pass
 target=None; count=None
 for f in sorted((er/R29A).glob("*.json")) if (er/R29A).exists() else []:
  try:
   j=json.loads(f.read_text())
   if isinstance(j,list) and len(j)==400: target=str(f);count=400
  except: pass
 passed=(rr.returncode==0 and r29ev is not None)
 ev={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2","generatedAt":datetime.now(timezone.utc).isoformat(),
     "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
     "selectorExitZero":rr.returncode==0,"r29aPassedEvidence":r29ev,
     "exactNewFourHundredArtifact":target,"exactNewFourHundredCount":count,
     "applicationSourceMutation":"selector-only diagnosed key extraction repair","governedDataMutation":False,
     "propertyClick":False,"assignmentsInvocation":False,"generateInvocation":False,"exportInvocation":False}
 ep=out/"authoritative_prior200_key_extraction_repair_and_selector_recertification.json";ep.write_text(json.dumps(ev,indent=2)+"\n")
 if passed:
  print("STATUS: PASSED")
  print("STATE: M419D4BN17C_R4_R12_R16A_R29A_SELECTOR_RECERTIFIED")
  print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R29B_EXACT_NEW_FOUR_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION")
 else:
  print("STATUS: DIAGNOSTIC_COMPLETE")
  print("CLASSIFICATION: R29A_SELECTOR_RESIDUAL_REMAINS_AFTER_DIRECT_RAW_KEY_EXTRACTION_REPAIR")
  print("NEXT_MILESTONE: M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_POST_KEY_EXTRACTION_RESIDUAL_CAUSAL_DIAGNOSIS")
 print("EVIDENCE:",ep)
 print("\nR29A-R4-R2-R2-R2-R3-R2-R2-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
 return 0
if __name__=="__main__":raise SystemExit(main())
