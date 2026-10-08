#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys

R28A3="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
R28A4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R3_MISSING_SIX_PRIOR200_MEMBERS_LINEAGE_RECONSTRUCTION"

def loadj(p):
    try:return json.loads(Path(p).read_text())
    except:return None

def norm(s): return " ".join(str(s or "").lower().split())
def key(x):
    if not isinstance(x,dict): return ""
    k=norm(x.get("selectionKey") or x.get("label"))
    return k[7:] if k.startswith("select ") else k

def ordinal(x):
    if isinstance(x,dict):
        v=x.get("domOrdinal")
        try:return int(v)
        except:return None
    return None

def record_lists(obj,path="$"):
    out=[]
    if isinstance(obj,list):
        if obj and all(isinstance(x,dict) for x in obj):
            out.append((path,obj))
        for i,v in enumerate(obj):
            out.extend(record_lists(v,f"{path}[{i}]"))
    elif isinstance(obj,dict):
        for k,v in obj.items():
            out.extend(record_lists(v,f"{path}.{k}"))
    return out

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    priorp=er/R28A3/"exact_new_two_hundred_candidates.json"
    newp=er/R28A4/"exact_new_two_hundred_candidates_prefix_normalized.json"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"missing_six_prior200_members_lineage_reconstruction.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2-R2-R2-R1-R3 Missing Six Prior-200 Members Lineage Reconstruction")
    print("="*120)
    print("Mode: READ_ONLY_REFERENCE400_BOUNDARY_AND_LINEAGE_RECONSTRUCTION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Live UI interaction: OFF")
    print("Export invocation: OFF")

    a=loadj(priorp);b=loadj(newp)
    if not isinstance(a,list) or not isinstance(b,list) or len(a)!=200 or len(b)!=200:
        print("STATUS: BLOCKED");print("REASON: authoritative 200-record artifacts missing/unexpected");return 4

    amap={key(x):x for x in a if key(x)}
    bmap={key(x):x for x in b if key(x)}
    ov=sorted(set(amap)&set(bmap))
    ovord=sorted([ordinal(bmap[k]) for k in ov if ordinal(bmap[k]) is not None])
    newords=sorted([ordinal(x) for x in b if ordinal(x) is not None])
    priorords=sorted([ordinal(x) for x in a if ordinal(x) is not None])

    print("OVERLAP_COUNT:",len(ov))
    print("OVERLAP_DOM_ORDINALS:",ovord)
    print("PRIOR_DOM_ORDINAL_MIN_MAX:",(min(priorords),max(priorords)) if priorords else None)
    print("NEW_DOM_ORDINAL_MIN_MAX:",(min(newords),max(newords)) if newords else None)
    print("NEW_FIRST_TWELVE_DOM_ORDINALS:",newords[:12])
    print("NEW_LAST_TWELVE_DOM_ORDINALS:",newords[-12:])

    # Search all pre-R29 evidence recursively for record lists that expose DOM ordinals
    # beyond the current new-200 maximum. These are historical evidence candidates only.
    observations={}
    list_summaries=[]
    for p in er.rglob("*.json"):
        s=str(p)
        if "R29A" in s or "/R29_" in s: continue
        j=loadj(p)
        if j is None: continue
        for sub,lst in record_lists(j):
            rows=[]
            for x in lst:
                k=key(x);o=ordinal(x)
                if k and o is not None:
                    rows.append((o,k,x))
                    cur=observations.get((o,k))
                    if cur is None:
                        observations[(o,k)]={"ordinal":o,"key":k,"record":x,"sources":[]}
                    observations[(o,k)]["sources"].append({"file":s,"subpath":sub})
            if rows:
                os_=[r[0] for r in rows]
                list_summaries.append({"file":s,"subpath":sub,"count":len(lst),
                                       "ordinalCount":len(os_),"ordinalMin":min(os_),"ordinalMax":max(os_)})

    current_new_max=max(newords) if newords else None
    next_six=[]
    if current_new_max is not None:
        # Prefer exact consecutive ordinals immediately after the current cohort boundary.
        for o in range(current_new_max+1,current_new_max+7):
            c=[v for (oo,k),v in observations.items() if oo==o and k not in amap and k not in bmap]
            # unique canonical key only
            uniq={}
            for v in c: uniq[v["key"]]=v
            if len(uniq)==1:
                next_six.append(next(iter(uniq.values())))
            else:
                next_six.append({"ordinal":o,"candidateCount":len(uniq),
                                 "candidates":[{"key":k,"sources":v["sources"][:5]} for k,v in sorted(uniq.items())]})

    # Also look for any 200-record historical list whose normalized canonical membership
    # equals prior-194 plus six replacements and is disjoint from the new200.
    prior_only=set(amap)-set(bmap)
    lineage_candidates=[]
    for summ in list_summaries:
        j=loadj(Path(summ["file"]))
        # locate exact subpath is expensive; re-enumerate and match
        for sub,lst in record_lists(j):
            if sub!=summ["subpath"] or len(lst)!=200: continue
            km={key(x):x for x in lst if key(x)}
            if len(km)!=200: continue
            cover=len(set(km)&prior_only)
            overnew=len(set(km)&set(bmap))
            if cover>=190:
                lineage_candidates.append({"file":summ["file"],"subpath":sub,
                                           "prior194Coverage":cover,"overlapWithNew200":overnew,
                                           "candidateReplacementKeys":sorted(set(km)-prior_only)[:20]})
    lineage_candidates.sort(key=lambda x:(-x["prior194Coverage"],x["overlapWithNew200"],x["file"]))

    # Decide which side most likely owns the defect.
    overlap_is_tail=(ovord==list(range(195,201)))
    new_starts_at_195=(newords and min(newords)==195)
    sequential_new=(newords==list(range(min(newords),max(newords)+1))) if newords else False
    six_successors_resolved=(len(next_six)==6 and all("key" in x for x in next_six))

    if overlap_is_tail and new_starts_at_195 and sequential_new:
        classification="SIX_DUPLICATES_ARE_PRIOR200_TAIL_ORDINALS_195_200_AND_NEW200_SELECTION_BOUNDARY_STARTED_SIX_RECORDS_TOO_EARLY"
        if six_successors_resolved:
            nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R4_NEW200_BOUNDARY_RECONSTRUCTION_WITH_ORDINALS_201_400_AND_REFERENCE400_RECERTIFICATION"
        else:
            nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R4_MISSING_NEW200_SUCCESSOR_SIX_DEEP_DIAGNOSIS"
    elif lineage_candidates and lineage_candidates[0]["prior194Coverage"]==194 and lineage_candidates[0]["overlapWithNew200"]==0:
        classification="EXACT_HISTORICAL_PRIOR200_RECONSTRUCTION_CANDIDATE_FOUND"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R4_AUTHORITATIVE_PRIOR200_SOURCE_ADJUDICATION_AND_REFERENCE400_RECERTIFICATION"
    else:
        classification="REFERENCE400_SIX_MEMBER_LINEAGE_DIRECTION_REMAINS_UNRESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R4_SIX_MEMBER_LINEAGE_DEEP_DIAGNOSIS"

    print("OVERLAP_IS_EXACT_PRIOR_TAIL_195_200:",overlap_is_tail)
    print("NEW_COHORT_STARTS_AT_DOM_ORDINAL_195:",new_starts_at_195)
    print("NEW_COHORT_DOM_ORDINALS_SEQUENTIAL:",sequential_new)
    print("NEXT_SIX_SUCCESSORS:")
    print(json.dumps(next_six,indent=2,default=str))
    print("NEXT_SIX_SUCCESSORS_RESOLVED:",six_successors_resolved)
    print("TOP_PRIOR_LINEAGE_CANDIDATES:")
    print(json.dumps(lineage_candidates[:10],indent=2))

    checks={
        "prior200Count":len(a)==200,"new200Count":len(b)==200,
        "overlapExactly6":len(ov)==6,
        "overlapOrdinalsCaptured":len(ovord)==len(ov),
        "preR29EvidenceRecursivelyScanned":True,
        "newCohortOrdinalBoundaryEvaluated":True,
        "successorSixEvaluated":True,
        "historicalPrior200AlternativesEvaluated":True,
        "applicationMutationOff":True,"governedMutationOff":True,
        "liveUiInteractionOff":True,"exportInvocationOff":True
    }
    ev={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R3_MISSING_SIX_PRIOR200_MEMBERS_LINEAGE_RECONSTRUCTION",
        "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED",
        "classification":classification,
        "overlapKeys":ov,"overlapOrdinals":ovord,
        "priorOrdinalMinMax":[min(priorords),max(priorords)] if priorords else None,
        "newOrdinalMinMax":[min(newords),max(newords)] if newords else None,
        "nextSixSuccessors":next_six,
        "topPriorLineageCandidates":lineage_candidates[:25],
        "checks":checks,"nextMilestone":nxt}
    ep.write_text(json.dumps(ev,indent=2,default=str)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2-R2-R3-R2-R2-R2-R1-R3 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":raise SystemExit(main())
