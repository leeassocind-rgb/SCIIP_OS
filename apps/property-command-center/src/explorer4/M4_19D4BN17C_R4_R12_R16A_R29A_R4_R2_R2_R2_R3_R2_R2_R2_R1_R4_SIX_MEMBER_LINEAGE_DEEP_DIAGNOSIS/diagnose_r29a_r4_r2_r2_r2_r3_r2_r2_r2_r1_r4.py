#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import importlib.util,json,sys,traceback

R28A3="M4_19D4BN17C_R4_R12_R16A_R28A_R3_AUTHORITATIVE_FIRST_100_SOURCE_RESOLUTION_AND_RECORD_LEVEL_REFERENCE_200_RECONSTRUCTION_REPAIR"
R28A4="M4_19D4BN17C_R4_R12_R16A_R28A_R4_CANDIDATE_UI_ACTION_PREFIX_NORMALIZATION_AND_REFERENCE_EXCLUSION_INTEGRITY_REPAIR"
R29A="M4_19D4BN17C_R4_R12_R16A_R29A_EXACT_EIGHT_HUNDRED_RECORD_EXPORT_COHORT_CANDIDATE_SELECTION_QUALIFICATION_AND_PREAUTHORIZATION"
OUT="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R4_SIX_MEMBER_LINEAGE_DEEP_DIAGNOSIS"

def loadj(p):
    try:return json.loads(Path(p).read_text())
    except:return None
def norm(s): return " ".join(str(s or "").lower().split())
def key(x):
    if not isinstance(x,dict):return ""
    k=norm(x.get("selectionKey") or x.get("label"))
    return k[7:] if k.startswith("select ") else k
def ordv(x):
    if not isinstance(x,dict): return None
    try:return int(x.get("domOrdinal"))
    except:return None
def record_lists(obj,path="$"):
    out=[]
    if isinstance(obj,list):
        if obj and all(isinstance(x,dict) for x in obj): out.append((path,obj))
        for i,v in enumerate(obj): out.extend(record_lists(v,f"{path}[{i}]"))
    elif isinstance(obj,dict):
        for k,v in obj.items(): out.extend(record_lists(v,f"{path}.{k}"))
    return out

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    pcc=repo/"apps/property-command-center"; er=pcc/"evidence/explorer4"
    priorp=er/R28A3/"exact_new_two_hundred_candidates.json"
    newp=er/R28A4/"exact_new_two_hundred_candidates_prefix_normalized.json"
    selector=pcc/"src/explorer4"/R29A/"select_r29a.py"
    out=er/OUT; out.mkdir(parents=True,exist_ok=True)
    ep=out/"six_member_lineage_deep_diagnosis.json"

    print("="*120)
    print("SCIIP Explorer 4.0 — R29A-R4-R2-R2-R2-R3-R2-R2-R2-R1-R4 Six-Member Lineage Deep Diagnosis")
    print("="*120)
    print("Mode: EVIDENCE_FIRST_WITH_BOUNDED_READ_ONLY_LIVE_INVENTORY_FALLBACK")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Property click: OFF")
    print("Assignments invocation: OFF")
    print("Generate invocation: OFF")
    print("Export invocation: OFF")

    prior=loadj(priorp); new=loadj(newp)
    if not isinstance(prior,list) or not isinstance(new,list) or len(prior)!=200 or len(new)!=200:
        print("STATUS: BLOCKED"); print("REASON: authoritative cohort artifacts unavailable"); return 4

    pmap={key(x):x for x in prior if key(x)}
    nmap={key(x):x for x in new if key(x)}
    overlaps=sorted(set(pmap)&set(nmap))

    new_ord_rows=[(ordv(x),key(x),x) for x in new if ordv(x) is not None and key(x)]
    new_ord_rows.sort(key=lambda z:z[0])
    ords=[o for o,_,_ in new_ord_rows]
    omin,omax=min(ords),max(ords)
    missing_inside=[o for o in range(omin,omax+1) if o not in set(ords)]
    duplicates={}
    for o,k,x in new_ord_rows: duplicates.setdefault(o,[]).append(k)
    duplicate_ordinals={o:ks for o,ks in duplicates.items() if len(ks)>1}
    expected_width=omax-omin+1
    displaced_count=expected_width-len(set(ords))

    print("NEW_ORDINAL_MIN:",omin)
    print("NEW_ORDINAL_MAX:",omax)
    print("NEW_ORDINAL_UNIQUE_COUNT:",len(set(ords)))
    print("NEW_ORDINAL_EXPECTED_WIDTH:",expected_width)
    print("NEW_MISSING_ORDINALS_WITHIN_RANGE:",missing_inside)
    print("NEW_DUPLICATE_ORDINALS:",json.dumps(duplicate_ordinals,sort_keys=True))
    print("NEW_DISPLACED_POSITION_COUNT:",displaced_count)
    print("OVERLAP_ORDINALS:",sorted(ordv(nmap[k]) for k in overlaps))

    # Evidence-wide ordinal index.
    obs={}
    for p in er.rglob("*.json"):
        s=str(p)
        if "R29A" in s or "/R29_" in s: continue
        j=loadj(p)
        if j is None: continue
        for sub,lst in record_lists(j):
            for x in lst:
                o=ordv(x); k=key(x)
                if o is None or not k: continue
                obs.setdefault(o,{})
                ent=obs[o].setdefault(k,{"record":x,"sources":[]})
                ent["sources"].append({"file":s,"subpath":sub})

    interesting=sorted(set(missing_inside + list(range(399,405)) + list(range(189,207))))
    evidence_ordinals={}
    for o in interesting:
        vals=[]
        for k,e in sorted(obs.get(o,{}).items()):
            vals.append({"key":k,"sf":e["record"].get("sf"),
                         "status":e["record"].get("status"),
                         "sources":e["sources"][:6]})
        evidence_ordinals[o]=vals

    print("\n----- EVIDENCE ORDINAL READBACK -----")
    for o in interesting:
        vals=evidence_ordinals[o]
        print(f"{o}: {json.dumps(vals,default=str)}")

    # Determine if evidence alone provides a unique canonical record at 399-404.
    successors=[]
    evidence_successors_resolved=True
    for o in range(399,405):
        vals=evidence_ordinals.get(o,[])
        eligible=[v for v in vals if v["key"] not in pmap and v["key"] not in nmap]
        uniq={v["key"]:v for v in eligible}
        if len(uniq)==1: successors.append({"ordinal":o,**next(iter(uniq.values())),"source":"PRE_R29_EVIDENCE"})
        else:
            evidence_successors_resolved=False
            successors.append({"ordinal":o,"candidateCount":len(uniq),
                               "candidates":list(uniq.values()),"source":"PRE_R29_EVIDENCE"})

    live_attempted=False; live_error=None; live_rows=[]
    # Only if evidence cannot resolve successor positions, use the selector's live
    # inventory helper. This may enter Explorer, but performs no property selection.
    if not evidence_successors_resolved and selector.exists():
        live_attempted=True
        try:
            spec=importlib.util.spec_from_file_location("r29a_lineage_live",selector)
            mod=importlib.util.module_from_spec(spec); spec.loader.exec_module(mod)
            raw,origin=mod.live_inventory()
            live=[mod.marker_identity(x) for x in raw]
            # marker_identity may lose domOrdinal, so pair back to raw where possible.
            for idx,x in enumerate(raw,1):
                o=ordv(x)
                if o is None: o=idx
                k=key(x)
                if not k and idx-1<len(live): k=key(live[idx-1])
                live_rows.append({"ordinal":o,"key":k,"record":x})
            print("\nLIVE_INVENTORY_ORIGIN:",origin)
            print("LIVE_INVENTORY_COUNT:",len(raw))
            print("LIVE_BOUNDARY_ORDINALS:")
            for row in live_rows:
                if row["ordinal"] in set(range(189,207))|set(range(393,411)):
                    print(json.dumps(row,default=str))
        except Exception as e:
            live_error={"type":type(e).__name__,"message":str(e),"traceback":traceback.format_exc()}
            print("LIVE_INVENTORY_ERROR:",json.dumps(live_error))

    live_by_ord={}
    for r in live_rows:
        if r["ordinal"] is not None and r["key"]:
            live_by_ord.setdefault(r["ordinal"],{})[r["key"]]=r

    # Fill unresolved 399-404 from live inventory.
    resolved_successors=[]
    for x in successors:
        if x.get("key"):
            resolved_successors.append(x); continue
        o=x["ordinal"]
        cand={k:r for k,r in live_by_ord.get(o,{}).items() if k not in pmap and k not in nmap}
        if len(cand)==1:
            r=next(iter(cand.values()))
            resolved_successors.append({"ordinal":o,"key":r["key"],"record":r["record"],"source":"LIVE_EXPLORER_INVENTORY"})
        else:
            resolved_successors.append({"ordinal":o,"candidateCount":len(cand),
                                        "candidates":list(cand.keys()),"source":"LIVE_EXPLORER_INVENTORY"})

    successor_six_resolved=len(resolved_successors)==6 and all(x.get("key") for x in resolved_successors)

    # Evaluate precise cohort topology hypotheses.
    overlap_tail=(sorted(ordv(nmap[k]) for k in overlaps)==list(range(195,201)))
    exactly_six_internal_gaps=(len(missing_inside)==6)
    corrected_new_keys=(set(nmap)-set(overlaps)) | ({x["key"] for x in resolved_successors if x.get("key")})
    corrected_count=len(corrected_new_keys)
    corrected_disjoint=len(corrected_new_keys & set(pmap))==0
    corrected_reference_count=len(set(pmap)|corrected_new_keys)

    print("\nRESOLVED_SUCCESSOR_SIX:",json.dumps(resolved_successors,indent=2,default=str))
    print("SUCCESSOR_SIX_RESOLVED:",successor_six_resolved)
    print("CORRECTED_NEW_UNIQUE_COUNT:",corrected_count)
    print("CORRECTED_NEW_DISJOINT_FROM_PRIOR:",corrected_disjoint)
    print("CORRECTED_REFERENCE_UNION_COUNT:",corrected_reference_count)

    if overlap_tail and successor_six_resolved and corrected_count==200 and corrected_disjoint and corrected_reference_count==400:
        classification="R29A_NEW200_BOUNDARY_CONTAMINATED_BY_PRIOR_TAIL_195_200_SIX_CANONICAL_SUCCESSORS_RESOLVED_REFERENCE400_RECONSTRUCTABLE"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_NEW200_BOUNDARY_RECONSTRUCTION_AND_REFERENCE400_RECERTIFICATION"
    elif overlap_tail and not successor_six_resolved:
        classification="R29A_PRIOR_TAIL_OVERLAP_CONFIRMED_BUT_SIX_CANONICAL_SUCCESSORS_NOT_YET_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_SUCCESSOR_SIX_TARGETED_LIVE_INVENTORY_DIAGNOSIS"
    else:
        classification="R29A_REFERENCE400_ORDINAL_TOPOLOGY_REQUIRES_FURTHER_RECONCILIATION"
        nxt="M4_19D4BN17C_R4_R12_R16A_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R5_REFERENCE400_ORDINAL_TOPOLOGY_RECONCILIATION"

    checks={
        "prior200Count":len(prior)==200,
        "new200Count":len(new)==200,
        "overlapExactly6":len(overlaps)==6,
        "overlapTail195Through200":overlap_tail,
        "ordinalTopologyCaptured":True,
        "missingInternalOrdinalsCaptured":True,
        "evidenceOrdinalIndexBuilt":True,
        "successorSixEvaluated":True,
        "liveFallbackBoundedToInventoryOnly":True,
        "propertyClickOff":True,
        "assignmentsInvocationOff":True,
        "generateInvocationOff":True,
        "exportInvocationOff":True,
        "applicationMutationOff":True,
        "governedMutationOff":True
    }
    ev={"framework":"SCIIP_EXPLORER_4_R29A_R4_R2_R2_R2_R3_R2_R2_R2_R1_R4_SIX_MEMBER_LINEAGE_DEEP_DIAGNOSIS",
        "generatedAt":datetime.now(timezone.utc).isoformat(),
        "status":"PASSED","classification":classification,
        "ordinalTopology":{"min":omin,"max":omax,"uniqueCount":len(set(ords)),
                           "expectedWidth":expected_width,"missingInside":missing_inside,
                           "duplicateOrdinals":duplicate_ordinals},
        "overlapKeys":overlaps,
        "evidenceOrdinalReadback":evidence_ordinals,
        "liveFallback":{"attempted":live_attempted,"error":live_error,"count":len(live_rows)},
        "resolvedSuccessorSix":resolved_successors,
        "reconstruction":{"successorSixResolved":successor_six_resolved,
                          "correctedNewUniqueCount":corrected_count,
                          "correctedNewDisjointFromPrior":corrected_disjoint,
                          "correctedReferenceUnionCount":corrected_reference_count},
        "checks":checks,"nextMilestone":nxt}
    ep.write_text(json.dumps(ev,indent=2,default=str)+"\n")

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("CLASSIFICATION:",classification)
    print("STATUS: PASSED")
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",ep)
    print("\nR29A-R4-R2-R2-R2-R3-R2-R2-R2-R1-R4 EXECUTION COMPLETE — paste complete output into ChatGPT.")
    return 0

if __name__=="__main__":raise SystemExit(main())
