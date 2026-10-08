#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json
M="M4_19D4BN17C_R1_LIVE_WORKFLOW_ACTIVATION_AND_OBSERVATION_CONTRACT_DIAGNOSIS"
TOKENS={"search":["search","searchResults"],"selection":["selectedProperty","selectProperty","onPropertySelect","setSelected","propertyId"],"compare":["compare","comparison"],"command":["command"],"analyze_present":["analyze","present","presentation"],"export":["export","download","presentation"],"deep_link":["deepLink","URLSearchParams","searchParams","location.search"],"consumer":["property intelligence","market context","neighbor","evidence","graph","relationship"]}
EXT={".ts",".tsx",".js",".jsx",".mjs",".cjs"}
def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
def main():
 repo=Path(sys.argv[1]).expanduser().resolve(); app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
 prev=ev/"M4_19D4BN17C_50_RECORD_LIVE_GOVERNED_EXPLORER_WORKFLOW_OBSERVATION"/"fifty_record_live_governed_explorer_workflow_observation.json"
 if not prev.is_file(): print("STATUS: BLOCKED\nDIAGNOSIS: BN17C_EVIDENCE_REQUIRED"); return 4
 b=fj(prev); outcomes=b.get("outcomes") or []; counts={}
 for o in outcomes:
  for k,v in (o.get("stages") or {}).items(): counts[k]=counts.get(k,0)+int(bool(v))
 refs={k:[] for k in TOKENS}; scanned=0
 root=app/"src"
 for p in root.rglob("*") if root.exists() else []:
  if not p.is_file() or p.suffix not in EXT: continue
  scanned+=1
  try: lines=p.read_text(errors="ignore").splitlines()
  except: continue
  for fam,terms in TOKENS.items():
   hits=[]
   for i,line in enumerate(lines,1):
    if any(x.casefold() in line.casefold() for x in terms):
     hits.append({"line":i,"text":line.strip()[:240]})
     if len(hits)>=10: break
   if hits and len(refs[fam])<25: refs[fam].append({"file":str(p.relative_to(repo)),"hits":hits})
 false=[k for k,v in counts.items() if v==0 and len(outcomes)==50]; true=[k for k,v in counts.items() if v==50 and len(outcomes)==50]
 checks={"bn17cDiagnosticComplete":b.get("status")=="DIAGNOSTIC_COMPLETE","exactFiftyOutcomes":len(outcomes)==50,"selectedPropertyInvariantGap":"02_SELECTED_PROPERTY" in false,"compareInvariantGap":"06_COMPARE" in false,"commandInvariantGap":"07_COMMAND" in false,"analyzePresentInvariantGap":"09_ANALYZE_PRESENT" in false,"exportPresentationInvariantGap":"11_EXPORT_PRESENTATION" in false,"searchInvariantSuccess":"01_GLOBAL_SEARCH" in true,"sourceFilesScanned":scanned>0,"selectionContractReferencesFound":bool(refs["selection"]),"compareContractReferencesFound":bool(refs["compare"]),"commandContractReferencesFound":bool(refs["command"]),"analyzePresentContractReferencesFound":bool(refs["analyze_present"]),"exportContractReferencesFound":bool(refs["export"])}
 passed=all(checks.values())
 result={"framework":"SCIIP_EXPLORER_4_BN17C_R1_LIVE_WORKFLOW_ACTIVATION_AND_OBSERVATION_CONTRACT_DIAGNOSIS","generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE","state":"M419D4BN17C_R1_LIVE_WORKFLOW_ACTIVATION_AND_OBSERVATION_CONTRACT_DIAGNOSED" if passed else "M419D4BN17C_R1_CONTRACT_DIAGNOSIS_INCOMPLETE","diagnosis":"BN17C_PASSIVE_OBSERVER_DID_NOT_ACTIVATE_SELECTED_PROPERTY_OR_ACTION_SPECIFIC_WORKFLOW_CONTRACTS" if passed else "BN17C_GAP_CONFIRMED_SOURCE_CONTRACT_RESOLUTION_INCOMPLETE","checks":checks,"stageCounts":counts,"invariantFalseStages":false,"invariantTrueStages":true,"sourceFilesScanned":scanned,"contractReferences":refs,"authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},"next":"BN17C_R1_CERTIFIED_CONTRACT_DRIVEN_LIVE_WORKFLOW_RECERTIFICATION_READY" if passed else "BN17C_R1_REMAINS_OPEN","nextMilestone":"M4_19D4BN17C_R2_CONTRACT_DRIVEN_50_RECORD_LIVE_GOVERNED_WORKFLOW_RECERTIFICATION" if passed else None}
 out=ev/M; out.mkdir(parents=True,exist_ok=True); f=out/"live_workflow_activation_and_observation_contract_diagnosis.json"; f.write_text(json.dumps(result,indent=2)+"\n")
 print("="*110); print("SCIIP Explorer 4.0 — BN17C-R1 Live Workflow Activation + Observation Contract Diagnosis"); print("="*110)
 print("\n----- BN17C STAGE COUNTS -----")
 for k in sorted(counts): print(f"{k}: {counts[k]}/50")
 print("\n----- INVARIANT GAPS -----"); [print(x) for x in false]
 print("\n----- CONTRACT REFERENCE COUNTS -----"); [print(f"{k}: files={len(v)}") for k,v in refs.items()]
 print("\n----- CHECKS -----"); [print(f"{k}: {v}") for k,v in checks.items()]
 print("\nSTATUS:",result["status"]); print("STATE:",result["state"]); print("DIAGNOSIS:",result["diagnosis"]); print("NEXT:",result["next"]); print("NEXT_MILESTONE:",result["nextMilestone"]); print("EVIDENCE:",f)
 return 0
if __name__=="__main__": raise SystemExit(main())
