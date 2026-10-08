#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

A="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
B="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
C="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_R1_CDP_FRESH_PAGE_CREATION_METHOD_REPAIR_AND_LIVE_INVENTORY_RECERTIFICATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R6_NEW200_BOUNDARY_RECONSTRUCTION_AND_REFERENCE400_RECERTIFICATION"

def load(p): return json.loads(Path(p).read_text())
def norm(s): return " ".join(str(s or "").lower().split())
def key(x):
    if not isinstance(x,dict): return ""
    k=norm(x.get("selectionKey") or x.get("key") or x.get("label") or x.get("rawIdentitySurface"))
    return k[7:] if k.startswith("select ") else k

def main():
    repo=Path(sys.argv[1]).expanduser().resolve(); er=repo/"apps/property-command-center/evidence/explorer4"
    out=er/OUT; out.mkdir(parents=True,exist_ok=True)
    prior=load(er/A/"exact_new_two_hundred_candidates.json")
    candidate=load(er/B/"exact_new_two_hundred_candidates_prefix_normalized.json")
    diag=load(er/C/"cdp_fresh_page_creation_method_repair_and_live_inventory_recertification.json")
    succ=diag["cohort"]["successorSix"]

    pmap={key(x):x for x in prior if key(x)}
    cmap={key(x):x for x in candidate if key(x)}
    overlap=set(pmap)&set(cmap)
    valid=[x for x in candidate if key(x) and key(x) not in set(pmap)]
    skeys=[]
    for x in succ:
        k=key(x)
        if k and k not in skeys:skeys.append(k)
    smap={key(x):x for x in succ if key(x)}
    corrected=valid+[smap[k].get("record",smap[k]) for k in skeys if k not in {key(x) for x in valid}]
    ckeys=[key(x) for x in corrected]
    union=list(prior)+corrected
    ukeys=[key(x) for x in union]

    checks={
      "prior200Count":len(prior)==200,
      "candidate200Count":len(candidate)==200,
      "historicalOverlapExactly6":len(overlap)==6,
      "validCandidateCount194":len(valid)==194,
      "successorSixCount":len(skeys)==6,
      "successorSixDisjointPrior200":not(set(skeys)&set(pmap)),
      "successorSixDisjointValid194":not(set(skeys)&{key(x) for x in valid}),
      "correctedNew200Count":len(corrected)==200,
      "correctedNew200Unique":len(set(ckeys))==200,
      "correctedNew200DisjointPrior200":not(set(ckeys)&set(pmap)),
      "reference400Count":len(union)==400,
      "reference400Unique":len(set(ukeys))==400,
      "r5r1SuccessorResolutionCertified":diag["cohort"].get("successorSixResolved") is True
    }
    status="PASSED" if all(checks.values()) else "FAILED"
    classification="CORRECTED_NEW200_AND_REFERENCE400_RECERTIFIED" if status=="PASSED" else "REFERENCE400_RECERTIFICATION_FAILED"
    nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R7_REFERENCE400_DOWNSTREAM_COHORT_REQUALIFICATION" if status=="PASSED" else "HALT_AND_DIAGNOSE_R1_R6"

    (out/"corrected_new_two_hundred_candidates.json").write_text(json.dumps(corrected,indent=2)+"\n")
    (out/"recertified_reference_four_hundred.json").write_text(json.dumps(union,indent=2)+"\n")
    ev={"framework":"SCIIP_EXPLORER_4_R29A_R1_R6_NEW200_BOUNDARY_RECONSTRUCTION_AND_REFERENCE400_RECERTIFICATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),"status":status,"classification":classification,
        "counts":{"prior200":len(prior),"historicalCandidate200":len(candidate),"historicalOverlap":len(overlap),
                  "validHistoricalNew":len(valid),"successorSix":len(skeys),"correctedNew200":len(corrected),
                  "reference400":len(union)},
        "historicalOverlapKeys":sorted(overlap),"successorSixKeys":skeys,"checks":checks,
        "safety":{"applicationSourceMutation":False,"governedDataMutation":False,"liveUiInteraction":False,
                  "propertyClick":False,"assignmentsInvocation":False,"generateInvocation":False,"exportInvocation":False},
        "nextMilestone":nxt}
    ep=out/"new200_boundary_reconstruction_and_reference400_recertification.json"; ep.write_text(json.dumps(ev,indent=2)+"\n")

    print("="*120);print("SCIIP Explorer 4.0 — R29A R1-R6 New-200 Boundary Reconstruction + Reference-400 Recertification");print("="*120)
    for x in ["Application source mutation: OFF","Governed data mutation: OFF","Live UI interaction: OFF","Property click: OFF","Assignments invocation: OFF","Generate invocation: OFF","Export invocation: OFF"]:print(x)
    print("PRIOR_200_COUNT:",len(prior));print("HISTORICAL_CANDIDATE_200_COUNT:",len(candidate));print("HISTORICAL_OVERLAP_COUNT:",len(overlap))
    print("VALID_HISTORICAL_NEW_COUNT:",len(valid));print("SUCCESSOR_SIX_COUNT:",len(skeys));print("SUCCESSOR_SIX_KEYS:",json.dumps(skeys,indent=2))
    print("CORRECTED_NEW_200_COUNT:",len(corrected));print("REFERENCE_400_COUNT:",len(union))
    print("----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification);print("STATUS:",status);print("NEXT_MILESTONE:",nxt);print("EVIDENCE:",ep)
    print("CORRECTED_NEW200:",out/"corrected_new_two_hundred_candidates.json")
    print("REFERENCE400:",out/"recertified_reference_four_hundred.json")
    print("R29A R1-R6 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0 if status=="PASSED" else 5
if __name__=="__main__":raise SystemExit(main())
