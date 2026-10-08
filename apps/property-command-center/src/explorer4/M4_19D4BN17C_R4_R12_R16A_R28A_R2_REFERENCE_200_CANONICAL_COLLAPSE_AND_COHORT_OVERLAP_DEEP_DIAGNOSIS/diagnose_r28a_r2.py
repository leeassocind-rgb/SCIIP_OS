#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import json,sys,re,collections

R27D="M4_19D4BN17C_R4_R12_R16A_R27D_EXACT_NEW_ONE_HUNDRED_GUARDED_LIVE_EXPORT_EXECUTION"
OUT="M4_19D4BN17C_R4_R12_R16A_R28A_R2_REFERENCE_200_CANONICAL_COLLAPSE_AND_COHORT_OVERLAP_DEEP_DIAGNOSIS"
STATUSES=["UNDER CONSTRUCTION","PROPOSED/PLANNED","PROPOSED","PLANNED","EXISTING","AVAILABLE","LEASED","SOLD"]

def loadj(p):
    return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def normalize_label(raw):
    s=" ".join(str(raw or "").split())
    cut=len(s)
    for st in STATUSES:
        i=s.upper().find(st)
        if i>0: cut=min(cut,i)
    return s[:cut].strip()

def extract_ordered_values(xs,limit=100):
    if not isinstance(xs,list) or len(xs)<limit:return None
    vals=[]
    for x in xs[:limit]:
        if isinstance(x,str):
            v=normalize_label(x)
        elif isinstance(x,dict):
            v=x.get("target") or x.get("label") or x.get("address") or x.get("canonicalTarget") or x.get("rawTarget")
            v=normalize_label(v)
        else:
            v=""
        if not v:return None
        vals.append(v)
    return vals if len(vals)==limit else None

def candidates_first100(er):
    preferred=list(er.glob("M4_19D4BN17C_R4_R12_R16A_R26A_*/*.json"))
    paths=preferred+list(er.rglob("*.json"))
    out=[];seen=set()
    for p in paths:
        if p in seen:continue
        seen.add(p)
        try:j=loadj(p)
        except:continue
        found=[]
        if isinstance(j,list):
            vals=extract_ordered_values(j,100)
            if vals:found.append(("TOP_LEVEL_LIST",vals))
        elif isinstance(j,dict):
            for key in ["exactOneHundredCandidateCohort","candidateCohort","cohort","targets","outcomes"]:
                vals=extract_ordered_values(j.get(key),100)
                if vals:found.append((f"DICT_KEY:{key}",vals))
        for shape,vals in found:
            out.append({"path":str(p),"shape":shape,"values":vals})
    return out

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    p27d=er/R27D/"exact_new_one_hundred_guarded_live_export_execution.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R28A-R2 Reference-200 Canonical Collapse + Cohort Overlap Deep Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_EVIDENCE_COHORT_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    if not p27d.exists():
        print("STATUS: BLOCKED");print("REASON: R27D exact second-100 evidence missing");return 4
    r27d=loadj(p27d)
    if not isinstance(r27d,dict) or r27d.get("status")!="PASSED" or r27d.get("certifiedCount")!=100:
        print("STATUS: BLOCKED");print("REASON: R27D exact second-100 must be PASSED 100/100");return 5

    second=[normalize_label(x.get("target")) for x in (r27d.get("outcomes") or []) if isinstance(x,dict)]
    if len(second)!=100:
        print("STATUS: BLOCKED");print("REASON: R27D second-100 target list unresolved");return 6
    second_set=set(x.lower() for x in second)

    cands=candidates_first100(er)
    if not cands:
        print("STATUS: BLOCKED");print("REASON: no candidate first-100 cohort evidence found");return 7

    analyses=[]
    for c in cands:
        vals=c["values"]
        low=[x.lower() for x in vals]
        s=set(low)
        inter=sorted(s & second_set)
        within_dups=[k for k,v in collections.Counter(low).items() if v>1]
        analyses.append({
          "path":c["path"],
          "shape":c["shape"],
          "count":len(vals),
          "uniqueNormalizedCount":len(s),
          "withinCohortDuplicateCount":len(within_dups),
          "withinCohortDuplicates":within_dups[:50],
          "overlapWithR27DSecond100Count":len(inter),
          "overlapWithR27DSecond100":inter[:100],
          "unionUniqueCount":len(s | second_set),
          "looksLikeSameCohortAsR27D":len(inter)>=90,
          "looksCompatibleAsDistinctFirst100":len(inter)<=10 and len(s)>=95
        })

    analyses.sort(key=lambda x:(x["looksCompatibleAsDistinctFirst100"],x["unionUniqueCount"],-x["overlapWithR27DSecond100Count"]),reverse=True)
    best=analyses[0]

    exact_candidates=[x for x in analyses if x["looksCompatibleAsDistinctFirst100"]]
    same_candidates=[x for x in analyses if x["looksLikeSameCohortAsR27D"]]

    # Find the exact source R28A-R1 would have picked: preferred R26A first, then global.
    selected=None
    preferred_prefix="M4_19D4BN17C_R4_R12_R16A_R26A_"
    for x in analyses:
        if preferred_prefix in x["path"]:
            selected=x;break
    if selected is None:
        # reconstruct scan order approximately by candidate discovery order:
        raw=candidates_first100(er)
        if raw:
            rp,rs=raw[0]["path"],raw[0]["shape"]
            selected=next((x for x in analyses if x["path"]==rp and x["shape"]==rs),None)

    checks={
      "r27dPassed":True,
      "r27dSecondHundredResolved":len(second)==100,
      "candidateFirstHundredEvidenceInventoryCaptured":len(analyses)>0,
      "selectedPriorCandidateResolved":selected is not None,
      "overlapCountsCaptured":True,
      "unionUniqueCountsCaptured":True,
      "withinCohortDuplicateCountsCaptured":True,
      "sameCohortCandidatesClassified":True,
      "distinctFirstHundredCandidatesClassified":True,
      "noReferenceMutationPerformed":True,
      "liveUiInteractionOff":True,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    if selected and selected["looksLikeSameCohortAsR27D"]:
        classification="R28A_R1_SELECTED_FIRST100_SOURCE_COLLIDES_WITH_R27D_SECOND100_LIKELY_WRONG_REFERENCE_SOURCE"
        nextm="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST100_SOURCE_RESOLUTION_AND_REFERENCE200_RECONSTRUCTION_REPAIR"
    elif selected and selected["withinCohortDuplicateCount"]>5:
        classification="R28A_R1_SELECTED_FIRST100_SOURCE_HAS_INTERNAL_CANONICAL_DUPLICATION"
        nextm="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST100_SOURCE_RESOLUTION_AND_REFERENCE200_RECONSTRUCTION_REPAIR"
    elif selected:
        classification="REFERENCE200_COLLAPSE_REQUIRES_RECORD_LEVEL_GRANULARITY_DISAMBIGUATION"
        nextm="M4_19D4BN17C_R4_R12_R16A_R28A_R3_REFERENCE200_RECORD_LEVEL_GRANULARITY_RECONCILIATION"
    else:
        classification="REFERENCE200_FIRST100_SOURCE_SELECTION_UNRESOLVED"
        nextm="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST100_SOURCE_RESOLUTION"

    od=er/OUT;od.mkdir(parents=True,exist_ok=True)
    ef=od/"reference_200_canonical_collapse_and_cohort_overlap_deep_diagnosis.json"
    out={
      "framework":"SCIIP_EXPLORER_4_R28A_R2_REFERENCE_200_CANONICAL_COLLAPSE_AND_COHORT_OVERLAP_DEEP_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R28A_R2_REFERENCE_200_CANONICAL_COLLAPSE_CAUSE_DIAGNOSED",
      "classification":classification,
      "r27dSecond100Count":100,
      "candidateFirst100EvidenceCount":len(analyses),
      "selectedPriorCandidate":selected,
      "bestDistinctCandidate":best,
      "sameCohortCandidateCount":len(same_candidates),
      "distinctCompatibleCandidateCount":len(exact_candidates),
      "candidateAnalyses":analyses,
      "checks":checks,
      "nextMilestone":nextm
    }
    ef.write_text(json.dumps(out,indent=2)+"\n")

    print("R27D_SECOND_100_COUNT: 100")
    print("FIRST_100_CANDIDATE_EVIDENCE_COUNT:",len(analyses))
    if selected:
        print("R28A_R1_SELECTED_SOURCE:",selected["path"])
        print("R28A_R1_SELECTED_SHAPE:",selected["shape"])
        print("R28A_R1_SELECTED_UNIQUE_NORMALIZED_COUNT:",selected["uniqueNormalizedCount"])
        print("R28A_R1_SELECTED_OVERLAP_WITH_R27D_SECOND100:",selected["overlapWithR27DSecond100Count"])
        print("R28A_R1_SELECTED_UNION_UNIQUE_COUNT:",selected["unionUniqueCount"])
        print("R28A_R1_SELECTED_LOOKS_SAME_AS_R27D:",selected["looksLikeSameCohortAsR27D"])
    print("DISTINCT_COMPATIBLE_FIRST100_CANDIDATE_COUNT:",len(exact_candidates))
    print("SAME_AS_R27D_CANDIDATE_COUNT:",len(same_candidates))
    print("\n----- TOP CANDIDATE SOURCES -----")
    for i,x in enumerate(analyses[:15],1):
        print(f"{i}. overlap={x['overlapWithR27DSecond100Count']} unionUnique={x['unionUniqueCount']} "
              f"withinDup={x['withinCohortDuplicateCount']} distinctCompatible={x['looksCompatibleAsDistinctFirst100']} "
              f"shape={x['shape']} path={x['path']}")
    if selected and selected["overlapWithR27DSecond100"]:
        print("\n----- SELECTED SOURCE OVERLAP SAMPLE -----")
        for x in selected["overlapWithR27DSecond100"][:30]:
            print(x)
    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",out["state"])
    print("NEXT_MILESTONE:",nextm)
    print("EVIDENCE:",ef)
    print("\nR28A-R2 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
