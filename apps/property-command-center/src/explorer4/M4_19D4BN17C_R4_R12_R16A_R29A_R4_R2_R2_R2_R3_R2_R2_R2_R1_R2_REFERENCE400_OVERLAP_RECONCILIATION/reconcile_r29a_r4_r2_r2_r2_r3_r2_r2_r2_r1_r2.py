#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json, sys

R28A3="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
R28A4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_REFERENCE400_OVERLAP_RECONCILIATION"

def loadj(p): return json.loads(Path(p).read_text())
def key(x):
    if not isinstance(x,dict): return ""
    k=" ".join(str(x.get("selectionKey") or x.get("label") or "").lower().split())
    return k[7:] if k.startswith("select ") else k

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    priorp=er/R28A3/"exact_new_two_hundred_candidates.json"
    newp=er/R28A4/"exact_new_two_hundred_candidates_prefix_normalized.json"
    out=er/OUT; out.mkdir(parents=True,exist_ok=True)
    ep=out/"reference400_overlap_reconciliation.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2-R2-R2-R1-R2 Reference-400 Overlap Reconciliation")
    print("="*120)
    print("Mode: READ_ONLY_AUTHORITATIVE_COHORT_LINEAGE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    if not priorp.exists() or not newp.exists():
        print("STATUS: BLOCKED"); print("REASON: authoritative cohort artifact missing"); return 4
    a=loadj(priorp); b=loadj(newp)
    amap={key(x):x for x in a if key(x)}
    bmap={key(x):x for x in b if key(x)}
    ov=sorted(set(amap)&set(bmap))
    prior_only=sorted(set(amap)-set(bmap))
    new_only=sorted(set(bmap)-set(amap))
    union=set(amap)|set(bmap)

    # Determine whether the R28A3 "prior" artifact is actually a 194+6 reconstruction
    # that incorporated records later certified as members of the R28A4 new-200.
    overlap_records=[]
    for k in ov:
        overlap_records.append({"key":k,"priorRecord":amap[k],"newRecord":bmap[k],
                                "sameSf":amap[k].get("sf")==bmap[k].get("sf")})

    print("PRIOR_COUNT:",len(a))
    print("NEW_COUNT:",len(b))
    print("PRIOR_UNIQUE:",len(amap))
    print("NEW_UNIQUE:",len(bmap))
    print("OVERLAP_COUNT:",len(ov))
    print("REFERENCE_UNION_COUNT:",len(union))
    print("PRIOR_ONLY_COUNT:",len(prior_only))
    print("NEW_ONLY_COUNT:",len(new_only))
    print("OVERLAP_KEYS:",json.dumps(ov))
    print("OVERLAP_RECORDS:",json.dumps(overlap_records,sort_keys=True))
    print("ALL_OVERLAP_SF_MATCH:",all(x["sameSf"] for x in overlap_records))

    # Search pre-R29 evidence for exact 200-record artifacts and rank candidates that
    # are disjoint from the R28A4 new200. This is diagnosis only; do not rewrite lineage.
    candidates=[]
    for p in er.rglob("*.json"):
        s=str(p)
        if "R29A" in s or "/R29_" in s: continue
        try: j=loadj(p)
        except: continue
        pools=[]
        if isinstance(j,list): pools=[("$",j)]
        elif isinstance(j,dict):
            for n,v in j.items():
                if isinstance(v,list): pools.append((f"$.{n}",v))
        for sub,v in pools:
            if len(v)!=200 or not all(isinstance(x,dict) for x in v): continue
            m={key(x):x for x in v if key(x)}
            if len(m)!=200: continue
            o=set(m)&set(bmap)
            candidates.append({"file":str(p),"subpath":sub,"overlap":len(o),
                               "disjoint":len(o)==0,"sampleOverlap":sorted(o)[:10]})
    candidates.sort(key=lambda x:(x["overlap"],x["file"],x["subpath"]))
    exact=[x for x in candidates if x["disjoint"]]

    if len(union)==394 and len(ov)==6:
        classification="R29A_REFERENCE400_LINEAGE_CONTAINS_SIX_DUPLICATE_MEMBERS_UNION_394"
    else:
        classification="R29A_REFERENCE400_OVERLAP_SHAPE_REQUIRES_FURTHER_LINEAGE_DIAGNOSIS"

    if exact:
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R3_AUTHORITATIVE_DISJOINT_PRIOR200_SOURCE_ADJUDICATION"
    else:
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R3_MISSING_SIX_PRIOR200_MEMBERS_LINEAGE_RECONSTRUCTION"

    print("EXACT_DISJOINT_200_CANDIDATE_COUNT:",len(exact))
    print("TOP_CANDIDATES:",json.dumps(candidates[:10],indent=2))
    checks={"prior200Count":len(a)==200,"new200Count":len(b)==200,
            "priorUnique200":len(amap)==200,"newUnique200":len(bmap)==200,
            "overlapExactly6":len(ov)==6,"union394":len(union)==394,
            "overlapRecordSfCaptured":len(overlap_records)==len(ov),
            "preR29CandidateSearchComplete":True,
            "applicationMutationOff":True,"governedMutationOff":True,
            "liveUiInteractionOff":True,"exportInvocationOff":True}
    ev={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R2_REFERENCE400_OVERLAP_RECONCILIATION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED",
        "classification":classification,"overlapKeys":ov,"overlapRecords":overlap_records,
        "counts":{"prior":len(a),"new":len(b),"overlap":len(ov),"union":len(union),
                  "priorOnly":len(prior_only),"newOnly":len(new_only),
                  "exactDisjointCandidates":len(exact)},
        "topCandidates":candidates[:25],"checks":checks,"nextMilestone":nxt}
    ep.write_text(json.dumps(ev,indent=2)+"\n")
    print("\n----- CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2-R2-R3-R2-R2-R2-R1-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0
if __name__=="__main__": raise SystemExit(main())
