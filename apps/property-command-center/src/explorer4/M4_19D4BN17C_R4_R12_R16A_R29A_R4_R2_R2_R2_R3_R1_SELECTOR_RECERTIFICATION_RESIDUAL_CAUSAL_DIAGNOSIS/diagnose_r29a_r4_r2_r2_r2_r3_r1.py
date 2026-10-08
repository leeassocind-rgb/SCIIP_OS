#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import ast,importlib.util,json,re,sys,traceback

R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
PRIOR_RUN="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_SCIIP_APP_RUNTIME_REVALIDATION_CDP_FRESH_PAGE_REATTACHMENT_AND_SELECTOR_RECERTIFICATION"
R28PRIOR="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
R28NEW="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R1_SELECTOR_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS"

def loadj(p):
 try:return json.loads(p.read_text())
 except:return None

def main():
 repo=Path(sys.argv[1]).expanduser().resolve()
 pcc=repo/"apps/property-command-center";er=pcc/"evidence/explorer4"
 runner=pcc/"src/explorer4"/R29A/"select_r29a.py"
 prior_ev=er/PRIOR_RUN/"sciip_app_runtime_revalidation_cdp_fresh_page_reattachment_and_selector_recertification.json"
 prior200=er/R28PRIOR/"exact_new_two_hundred_candidates.json"
 new200=er/R28NEW/"exact_new_two_hundred_candidates_prefix_normalized.json"
 out=er/OUT;out.mkdir(parents=True,exist_ok=True)
 ep=out/"selector_recertification_residual_causal_diagnosis.json"

 print("="*120)
 print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R1 Selector Recertification Residual Causal Diagnosis")
 print("="*120)
 print("Mode: READ_ONLY_SELECTOR_HELPER_AND_AUTHORITATIVE_BRANCH_DIAGNOSIS")
 print("Live UI interaction: OFF");print("Explorer click: OFF");print("Property click: OFF")
 print("Assignments invocation: OFF");print("Generate invocation: OFF");print("Export invocation: OFF")
 print("Application source mutation: OFF");print("Governed data mutation: OFF")

 pe=loadj(prior_ev)
 if not isinstance(pe,dict) or pe.get("status")!="DIAGNOSTIC_COMPLETE":
  print("STATUS: BLOCKED");print("REASON: prior selector-recertification evidence missing/unexpected");return 4
 if not runner.exists() or not prior200.exists() or not new200.exists():
  print("STATUS: BLOCKED");print("REASON: selector or authoritative cohort artifacts missing");return 5

 src=runner.read_text()
 try:ast.parse(src);syntax_ok=True
 except SyntaxError:syntax_ok=False

 # Import the selector as a module so we use its exact current marker_identity/keyset/choose_prior200 semantics.
 spec=importlib.util.spec_from_file_location("r29a_selector_diag",runner)
 mod=importlib.util.module_from_spec(spec)
 import_error=None
 try:spec.loader.exec_module(mod)
 except Exception as e:
  import_error={"type":type(e).__name__,"message":str(e),"traceback":traceback.format_exc()}

 if import_error:
  print("STATUS: BLOCKED");print("REASON: selector module import failed",json.dumps(import_error));return 6

 p200=loadj(prior200);n200=loadj(new200)
 if not isinstance(p200,list) or not isinstance(n200,list):
  print("STATUS: BLOCKED");print("REASON: authoritative cohort artifacts are not top-level lists");return 7

 marker_identity=getattr(mod,"marker_identity",None);keyset=getattr(mod,"keyset",None);choose=getattr(mod,"choose_prior200",None)
 if not callable(marker_identity) or not callable(keyset) or not callable(choose):
  print("STATUS: BLOCKED");print("REASON: selector helpers unavailable after import");return 8

 pids=[marker_identity(x) for x in p200]
 nids=[marker_identity(x) for x in n200]
 pkeys=keyset(pids)
 nkeys=keyset(nids)

 # Execute the authoritative branch with an empty live inventory keyset.
 # The repaired authoritative branch must not depend on livekeys anymore.
 choose_result=None;choose_error=None
 try:
  choose_result=choose(er,n200,set())
 except Exception as e:
  choose_error={"type":type(e).__name__,"message":str(e),"traceback":traceback.format_exc()}

 chose_prior=None;diag=None
 if isinstance(choose_result,tuple) and len(choose_result)>=2:
  chose_prior,diag=choose_result[0],choose_result[1]

 chose_count=len(chose_prior) if isinstance(chose_prior,list) else None
 diag_source=diag.get("source") if isinstance(diag,dict) else None
 authoritative_selected=(chose_count==200 and diag_source=="R28A_R3_AUTHORITATIVE_EXACT_PRIOR_200")

 # Extract exact current authoritative branch source.
 lines=src.splitlines();branch_start=None
 for i,line in enumerate(lines,1):
  if "R29A-R4-R2: authoritative closed prior-200 binding" in line:
   branch_start=i;break
 branch=[]
 if branch_start:
  for i in range(branch_start,min(len(lines),branch_start+14)+1):
   branch.append({"line":i,"text":lines[i-1]})

 const_path=getattr(mod,"R29A_R4_R2_AUTHORITATIVE_PRIOR200",None)
 configured_path=str(const_path) if const_path is not None else None
 configured_matches=(Path(configured_path).resolve()==prior200.resolve()) if configured_path else False

 print("SELECTOR_SYNTAX_OK:",syntax_ok)
 print("CONFIGURED_AUTHORITATIVE_PRIOR200_PATH:",configured_path)
 print("EXPECTED_AUTHORITATIVE_PRIOR200_PATH:",prior200)
 print("CONFIGURED_PATH_MATCHES_EXPECTED:",configured_matches)
 print("AUTHORITATIVE_PRIOR200_RAW_COUNT:",len(p200))
 print("AUTHORITATIVE_PRIOR200_MARKER_IDENTITY_COUNT:",len(pids))
 print("AUTHORITATIVE_PRIOR200_KEYSET_COUNT:",len(pkeys))
 print("R28_NEW200_RAW_COUNT:",len(n200))
 print("R28_NEW200_MARKER_IDENTITY_COUNT:",len(nids))
 print("R28_NEW200_KEYSET_COUNT:",len(nkeys))
 print("PRIOR200_VS_NEW200_OVERLAP:",len(pkeys & nkeys))
 print("CHOOSE_PRIOR200_ERROR:",json.dumps(choose_error) if choose_error else None)
 print("CHOOSE_PRIOR200_RETURN_COUNT:",chose_count)
 print("CHOOSE_PRIOR200_DIAG:",json.dumps(diag,sort_keys=True,default=str) if diag is not None else None)
 print("AUTHORITATIVE_BRANCH_SELECTED:",authoritative_selected)

 print("\n----- CURRENT AUTHORITATIVE BRANCH SOURCE -----")
 for x in branch:print(f"{x['line']:>5}: {x['text']}")

 # Causal classification.
 if not configured_matches:
  classification="R29A_AUTHORITATIVE_PRIOR200_CONSTANT_PATH_DOES_NOT_MATCH_CERTIFIED_R28A_R3_SOURCE"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_AUTHORITATIVE_PRIOR200_CONSTANT_PATH_REPAIR_AND_SELECTOR_RECERTIFICATION"
 elif len(pkeys)!=200:
  classification="R29A_SELECTOR_MARKER_IDENTITY_KEYSET_COLLAPSES_AUTHORITATIVE_PRIOR200_BELOW_200"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_PRIOR200_SELECTION_KEY_NORMALIZATION_REPAIR_AND_SELECTOR_RECERTIFICATION"
 elif len(nkeys)!=200:
  classification="R29A_SELECTOR_MARKER_IDENTITY_KEYSET_COLLAPSES_R28_NEW200_BELOW_200"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_NEW200_SELECTION_KEY_NORMALIZATION_REPAIR_AND_SELECTOR_RECERTIFICATION"
 elif len(pkeys & nkeys)!=0:
  classification="R29A_CURRENT_SELECTOR_HELPERS_REPORT_PRIOR200_NEW200_OVERLAP"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_REFERENCE400_KEY_DOMAIN_RECONCILIATION"
 elif choose_error:
  classification="R29A_CHOOSE_PRIOR200_AUTHORITATIVE_BRANCH_RAISES_RUNTIME_EXCEPTION"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_CHOOSE_PRIOR200_EXCEPTION_REPAIR_AND_SELECTOR_RECERTIFICATION"
 elif not authoritative_selected:
  classification="R29A_AUTHORITATIVE_BRANCH_INVARIANTS_PASS_BUT_BRANCH_FALLS_THROUGH_OR_RETURN_CONTRACT_MISMATCH"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_AUTHORITATIVE_BRANCH_RETURN_CONTRACT_REPAIR_AND_SELECTOR_RECERTIFICATION"
 else:
  classification="R29A_AUTHORITATIVE_PRIOR200_BRANCH_CERTIFIES_IN_ISOLATION_FAILURE_OCCURS_IN_MAIN_ARGUMENT_OR_PRE_BRANCH_STATE"
  nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_MAIN_NEW200_ARGUMENT_AND_PRE_BRANCH_STATE_DEEP_DIAGNOSIS"

 checks={
  "priorRuntimeAndCdpRepairConsumed":True,
  "selectorPresent":True,
  "selectorSyntaxCertified":syntax_ok,
  "selectorImportedWithoutMainExecution":import_error is None,
  "markerIdentityHelperResolved":callable(marker_identity),
  "keysetHelperResolved":callable(keyset),
  "choosePrior200HelperResolved":callable(choose),
  "authoritativePrior200ArtifactLoaded":len(p200)==200,
  "r28New200ArtifactLoaded":len(n200)==200,
  "configuredPrior200PathCaptured":configured_path is not None,
  "prior200CurrentHelperKeyCountCaptured":True,
  "new200CurrentHelperKeyCountCaptured":True,
  "priorNewOverlapCaptured":True,
  "choosePrior200DirectReadbackCaptured":True,
  "authoritativeBranchSourceCaptured":len(branch)>0,
  "noLiveInventoryRequiredForAuthoritativeBranchTest":True,
  "liveUiInteractionOff":True,"explorerClickOff":True,"propertyClickOff":True,
  "assignmentsInvocationOff":True,"generateInvocationOff":True,"exportInvocationOff":True,
  "applicationMutationOff":True,"governedMutationOff":True
 }
 ev={
  "framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R1_SELECTOR_RECERTIFICATION_RESIDUAL_CAUSAL_DIAGNOSIS",
  "generatedAt":datetime.now(timezone.utc).isoformat(),
  "status":"PASSED",
  "state":"M419D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R1_SELECTOR_RECERTIFICATION_RESIDUAL_CAUSE_DIAGNOSED",
  "classification":classification,
  "configuredAuthoritativePrior200Path":configured_path,
  "expectedAuthoritativePrior200Path":str(prior200),
  "configuredPathMatchesExpected":configured_matches,
  "counts":{"priorRaw":len(p200),"priorKeyset":len(pkeys),"newRaw":len(n200),"newKeyset":len(nkeys),"overlap":len(pkeys&nkeys)},
  "choosePrior200":{"error":choose_error,"returnCount":chose_count,"diag":diag,"authoritativeBranchSelected":authoritative_selected},
  "authoritativeBranchSource":branch,
  "checks":checks,
  "nextMilestone":nxt
 }
 ep.write_text(json.dumps(ev,indent=2,default=str)+"\n")

 print("\n----- CHECKS -----")
 for k,v in checks.items():print(f"{k}: {v}")
 print("CLASSIFICATION:",classification)
 print("STATUS: PASSED")
 print("STATE:",ev["state"])
 print("NEXT_MILESTONE:",nxt)
 print("EVIDENCE:",ep)
 print("\nR29A-R4-R2-R2-R2-R3-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
 return 0
if __name__=="__main__":raise SystemExit(main())
