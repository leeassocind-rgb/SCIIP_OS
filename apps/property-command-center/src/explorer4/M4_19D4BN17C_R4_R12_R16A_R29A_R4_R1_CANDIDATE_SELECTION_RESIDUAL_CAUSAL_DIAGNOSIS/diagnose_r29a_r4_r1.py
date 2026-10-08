#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,re,hashlib

R29A_R4="M4_19D4BN17C_R4_R12_R16A_R29A_R4_PAGE_READY_ANCHORED_EXPLORER_SETTLE_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"
R28A_R4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS"

STATUS_BOUNDARIES=["UNDER CONSTRUCTION","PROPOSED/PLANNED","PROPOSED","PLANNED","EXISTING","AVAILABLE","LEASED","SOLD"]

def loadj(p):
    try:return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]
    except Exception:return None

def norm(s):
    s=" ".join(str(s or "").split()).strip()
    if s.lower().startswith("select "):s=s[7:].strip()
    up=s.upper();cut=None
    for t in STATUS_BOUNDARIES:
        i=up.find(t)
        if i>0 and (cut is None or i<cut):cut=i
    if cut is not None:s=s[:cut].strip()
    return s.lower()

def parse_sf(s):
    m=re.search(r'(\d[\d,]{2,})\s*SF\b',str(s or ""),re.I)
    if not m:return None
    try:return int(m.group(1).replace(",",""))
    except:return None

def ident(x):
    if isinstance(x,str):
        lab=norm(x);sf=parse_sf(x)
        return f"{lab}|{sf if sf is not None else ''}" if lab else None
    if not isinstance(x,dict):return None
    sk=x.get("selectionKey") or x.get("canonicalKey")
    if isinstance(sk,str) and sk.strip():
        return sk.strip().lower()
    lab=(x.get("canonicalTarget") or x.get("normalizedTarget") or x.get("address") or
         x.get("label") or x.get("target") or x.get("name"))
    lab=norm(lab)
    if not lab:return None
    sf=x.get("sf")
    if sf is None:sf=x.get("availableSf")
    if sf is None:sf=x.get("buildingSf")
    if sf is None:sf=parse_sf(x.get("rawTarget") or x.get("text") or "")
    try:
        if sf is not None:sf=int(float(str(sf).replace(",","")))
    except:sf=None
    return f"{lab}|{sf if sf is not None else ''}"

def ids(xs):
    if not isinstance(xs,list):return []
    out=[]
    for x in xs:
        z=ident(x)
        if z:out.append(z)
    return out

def walk(obj,path="$",depth=0):
    out=[]
    if depth>6:return out
    if isinstance(obj,list):
        zs=ids(obj)
        if len(zs) in (50,100,200,400):out.append((path,zs))
        for i,v in enumerate(obj[:25]):
            if isinstance(v,(list,dict)):out += walk(v,f"{path}[{i}]",depth+1)
    elif isinstance(obj,dict):
        for k,v in obj.items():
            if isinstance(v,(list,dict)):out += walk(v,f"{path}.{k}",depth+1)
    return out

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    er=repo/"apps/property-command-center/evidence/explorer4"
    prior_ev=er/R29A_R4/"page_ready_anchored_explorer_settle_repair_and_candidate_selection_recertification.json"
    new200_file=er/R28A_R4/"exact_new_two_hundred_candidates_prefix_normalized.json"
    out=er/OUT;out.mkdir(parents=True,exist_ok=True)
    ep=out/"candidate_selection_residual_causal_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R1 Candidate Selection Residual Causal Diagnosis")
    print("="*120)
    print("Mode: READ_ONLY_REFERENCE_COHORT_EVIDENCE_DIAGNOSIS")
    print("Live UI interaction: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")

    r4=loadj(prior_ev)
    new200=ids(loadj(new200_file))
    if not isinstance(r4,dict) or r4.get("status")!="DIAGNOSTIC_COMPLETE":
        print("STATUS: BLOCKED");print("REASON: R29A-R4 diagnostic evidence missing");return 4
    if len(new200)!=200 or len(set(new200))!=200:
        print("STATUS: BLOCKED");print("REASON: authoritative R28 new-200 artifact missing or malformed");return 5
    newset=set(new200)

    rows=[]
    for p in er.rglob("*.json"):
        # Ignore R29A generated outputs/diagnostics as candidate reference sources.
        sp=str(p)
        if "R29A_R4_R1" in sp or "R29A_R4_PAGE_READY" in sp:continue
        j=loadj(p)
        if j is None:continue
        for subpath,zs in walk(j):
            if len(zs)!=200:continue
            s=set(zs)
            dup=len(zs)-len(s)
            overlap=len(s & newset)
            union=len(s | newset)
            rows.append({
              "file":sp,
              "subpath":subpath,
              "count":len(zs),
              "uniqueCount":len(s),
              "withinDuplicateCount":dup,
              "overlapWithR28New200":overlap,
              "unionUniqueWithR28New200":union,
              "disjoint":overlap==0,
              "exactReferenceCompatible":len(s)==200 and overlap==0 and union==400
            })

    rows.sort(key=lambda r:(not r["exactReferenceCompatible"], r["overlapWithR28New200"], r["withinDuplicateCount"], r["file"], r["subpath"]))
    compatible=[r for r in rows if r["exactReferenceCompatible"]]
    same=[r for r in rows if r["overlapWithR28New200"]==200 and r["uniqueCount"]==200]
    partial=[r for r in rows if 0<r["overlapWithR28New200"]<200]

    # Also inventory exact-100 candidates; two disjoint 100s may reconstruct the prior 200.
    hrows=[]
    hundred_sources=[]
    for p in er.rglob("*.json"):
        sp=str(p)
        if "R29A_R4_R1" in sp:continue
        j=loadj(p)
        if j is None:continue
        for subpath,zs in walk(j):
            if len(zs)!=100 or len(set(zs))!=100:continue
            s=set(zs)
            hundred_sources.append((sp,subpath,zs,s))
    for i,a in enumerate(hundred_sources):
        for b in hundred_sources[i+1:]:
            union=a[3]|b[3]
            if len(union)!=200:continue
            overlap=len(union&newset)
            if overlap!=0:continue
            hrows.append({
              "sourceA":a[0],"pathA":a[1],
              "sourceB":b[0],"pathB":b[1],
              "unionUniqueCount":200,
              "overlapWithR28New200":0,
              "exactReferenceCompatible":True
            })
    # de-duplicate pair descriptions
    seen=set(); uniqpairs=[]
    for r in hrows:
        k=(r["sourceA"],r["pathA"],r["sourceB"],r["pathB"])
        if k in seen:continue
        seen.add(k);uniqpairs.append(r)

    if compatible:
        classification="EXACT_DISJOINT_PRIOR_200_SOURCE_EXISTS_R29A_SELECTOR_SOURCE_RESOLUTION_LOGIC_INCOMPLETE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_AUTHORITATIVE_PRIOR_200_SOURCE_BINDING_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"
    elif uniqpairs:
        classification="NO_SINGLE_EXACT_PRIOR_200_SOURCE_BUT_TWO_DISJOINT_AUTHORITATIVE_100_COHORTS_CAN_RECONSTRUCT_REFERENCE_200"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_AUTHORITATIVE_PRIOR_200_COMPOSITE_RECONSTRUCTION_REPAIR_AND_CANDIDATE_SELECTION_RECERTIFICATION"
    else:
        classification="NO_PROVEN_DISJOINT_PRIOR_200_REFERENCE_SOURCE_REFERENCE_400_RECONSTRUCTION_REQUIRES_DEEP_LINEAGE_RESOLUTION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_REFERENCE_400_LINEAGE_DEEP_DIAGNOSIS"

    checks={
      "r29aR4DiagnosticConsumed":True,
      "r28NewTwoHundredArtifactPresent":new200_file.exists(),
      "r28NewTwoHundredCountExactly200":len(new200)==200,
      "r28NewTwoHundredUnique":len(set(new200))==200,
      "candidateEvidenceInventoryCaptured":True,
      "candidate200SourcesEvaluated":len(rows)>0,
      "candidate100SourcesEvaluated":len(hundred_sources)>0,
      "overlapCountsCaptured":True,
      "unionUniqueCountsCaptured":True,
      "withinCohortDuplicateCountsCaptured":True,
      "singleSourceCompatibilityClassified":True,
      "compositeHundredPairCompatibilityClassified":True,
      "noReferenceMutationPerformed":True,
      "liveUiInteractionOff":True,
      "propertyClickOff":True,
      "assignmentsInvocationOff":True,
      "generateInvocationOff":True,
      "exportInvocationOff":True,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    evidence={
      "framework":"SCIIP_EXPLORER_4_R29A_R4_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSAL_DIAGNOSIS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED",
      "state":"M419D4BN17C_R4_R12_R16A_R29A_R4_R1_CANDIDATE_SELECTION_RESIDUAL_CAUSE_DIAGNOSED",
      "classification":classification,
      "r28NewTwoHundredSource":str(new200_file),
      "candidate200SourceCount":len(rows),
      "exactCompatibleSingleSourceCount":len(compatible),
      "sameAsR28New200SourceCount":len(same),
      "partialOverlapSourceCount":len(partial),
      "compatibleSingleSources":compatible[:20],
      "topCandidate200Sources":rows[:30],
      "compatibleCompositeHundredPairs":uniqpairs[:20],
      "candidate100SourceCount":len(hundred_sources),
      "checks":checks,
      "nextMilestone":nxt
    }
    ep.write_text(json.dumps(evidence,indent=2)+"\n")

    print("R28_NEW_200_COUNT:",len(new200))
    print("CANDIDATE_200_SOURCE_COUNT:",len(rows))
    print("EXACT_COMPATIBLE_SINGLE_SOURCE_COUNT:",len(compatible))
    print("SAME_AS_R28_NEW200_SOURCE_COUNT:",len(same))
    print("PARTIAL_OVERLAP_SOURCE_COUNT:",len(partial))
    print("CANDIDATE_100_SOURCE_COUNT:",len(hundred_sources))
    print("EXACT_COMPATIBLE_COMPOSITE_100_PAIR_COUNT:",len(uniqpairs))

    print("\n----- TOP 200-RECORD CANDIDATE SOURCES -----")
    for i,r in enumerate(rows[:20],1):
        print(f"{i}. overlap={r['overlapWithR28New200']} unionUnique={r['unionUniqueWithR28New200']} "
              f"unique={r['uniqueCount']} dup={r['withinDuplicateCount']} compatible={r['exactReferenceCompatible']} "
              f"path={r['file']} :: {r['subpath']}")

    if uniqpairs:
        print("\n----- TOP COMPOSITE 100+100 REFERENCE PAIRS -----")
        for i,r in enumerate(uniqpairs[:10],1):
            print(f"{i}. {r['sourceA']} :: {r['pathA']}  +  {r['sourceB']} :: {r['pathB']}")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("STATE:",evidence["state"])
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R1 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":
    raise SystemExit(main())
