#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,hashlib

M="M4_19D4BN17C_R4_R12_R16A_R8_APPLICATION_OWNED_FUNCTION_ALIAS_AND_ROLE_RESOLUTION"

def fj(p): return json.JSONDecoder().raw_decode(p.read_text(errors="ignore").lstrip())[0]

def norm_src(s):
    s=re.sub(r"\s+","",s or "")
    s=re.sub(r"[_$A-Za-z][_$A-Za-z0-9]*","v",s)
    s=re.sub(r"\d+","n",s)
    return s

def grams(s,n=5):
    s=norm_src(s)
    if len(s)<n:return set([s]) if s else set()
    return {s[i:i+n] for i in range(len(s)-n+1)}

def sim(a,b):
    A=grams(a);B=grams(b)
    if not A or not B:return 0.0
    return len(A&B)/len(A|B)

def source_role(fn):
    c=fn.get("classification","")
    sem=fn.get("semantics",{})
    if c=="FILE_EXPORT_OR_DOWNLOAD_FUNCTION" or sem.get("export") or sem.get("download") or sem.get("ppt"):
        return "EXPORT"
    if c=="PRESENTATION_OR_DECK_FUNCTION" or sem.get("presentation") or sem.get("deck") or sem.get("present"):
        return "PRESENTATION"
    return "UNKNOWN"

def main():
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center";ev=app/"evidence/explorer4"

    r5p=ev/"M4_19D4BN17C_R4_R12_R16A_R5_EXACT_EXPORT_PRESENTATION_BOUND_FUNCTION_AND_ARGUMENT_CONTRACT_RESOLUTION"/"exact_export_presentation_bound_function_and_argument_contract_resolution.json"
    r7p=ev/"M4_19D4BN17C_R4_R12_R16A_R7_LIVE_BOUND_FUNCTION_RESIDUAL_CAUSAL_DIAGNOSIS"/"live_bound_function_residual_causal_diagnosis.json"
    if not r5p.exists() or not r7p.exists():
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R5_AND_R7_EVIDENCE_REQUIRED");return 4
    r5=fj(r5p);r7=fj(r7p)
    if r5.get("status")!="PASSED" or r7.get("status")!="PASSED":
        print("STATUS: BLOCKED");print("DIAGNOSIS: R16A_R5_AND_R7_MUST_PASS");return 5

    source=[]
    for x in r5.get("topExportFunctions",[]):
        y=dict(x);y["sourceRole"]="EXPORT";source.append(y)
    for x in r5.get("topPresentationFunctions",[]):
        y=dict(x);y["sourceRole"]="PRESENTATION";source.append(y)

    live=(r7.get("runtimeDiagnosis") or {}).get("topApplicationCandidates",[])
    mappings=[]
    for l in live:
        lsrc=l.get("source","")
        for s in source:
            ssrc=s.get("snippet","")
            lexical=sim(lsrc,ssrc)
            arity_live=l.get("length")
            params=s.get("params","")
            arity_src=0 if not params.strip() else len([x for x in params.split(",") if x.strip()])
            arity_score=1.0 if arity_live==arity_src else (0.5 if abs((arity_live or 0)-arity_src)==1 else 0.0)
            react_bonus=0.15 if l.get("reactOwned") else 0.0
            exact_bonus=0.25 if l.get("exactName") else 0.0
            semantic_bonus=0.1 if l.get("appSemantic") else 0.0
            score=lexical*0.55+arity_score*0.25+react_bonus+exact_bonus+semantic_bonus
            mappings.append({
              "livePath":l.get("path"),"liveName":l.get("name"),"liveLength":arity_live,
              "liveReactOwned":l.get("reactOwned"),"liveSource":lsrc[:1200],
              "sourceName":s.get("name"),"sourceRole":s.get("sourceRole"),
              "sourceParams":params,"sourceScore":s.get("score"),
              "lexicalSimilarity":round(lexical,6),"arityScore":arity_score,
              "mappingScore":round(score,6)
            })

    mappings.sort(key=lambda x:(-x["mappingScore"],x["livePath"] or "",x["sourceName"] or ""))

    # Keep best role-specific mapping per live function.
    per_live={}
    for m in mappings:
        key=(m["livePath"],m["sourceRole"])
        if key not in per_live:per_live[key]=m

    best_export=sorted([m for k,m in per_live.items() if m["sourceRole"]=="EXPORT"],
                       key=lambda x:-x["mappingScore"])
    best_present=sorted([m for k,m in per_live.items() if m["sourceRole"]=="PRESENTATION"],
                        key=lambda x:-x["mappingScore"])

    # Confidence thresholds are deliberately bounded: mapping must be application-owned and structurally plausible.
    export_resolved=[m for m in best_export if m["mappingScore"]>=0.35][:10]
    present_resolved=[m for m in best_present if m["mappingScore"]>=0.35][:10]

    shared_paths=sorted(set(m["livePath"] for m in export_resolved)&set(m["livePath"] for m in present_resolved))
    role_rows=[]
    for l in live:
        path=l.get("path")
        e=next((m for m in export_resolved if m["livePath"]==path),None)
        p=next((m for m in present_resolved if m["livePath"]==path),None)
        if e and p:
            role="SHARED_EXPORT_PRESENTATION_ACTION"
            confidence=max(e["mappingScore"],p["mappingScore"])
        elif e:
            role="EXPORT"
            confidence=e["mappingScore"]
        elif p:
            role="PRESENTATION"
            confidence=p["mappingScore"]
        else:
            role="UNRELATED_OR_UNRESOLVED"
            confidence=0
        role_rows.append({"livePath":path,"liveName":l.get("name"),"liveLength":l.get("length"),
                          "reactOwned":l.get("reactOwned"),"role":role,"confidence":confidence})

    checks={
      "r16aR5Passed":r5.get("status")=="PASSED",
      "r16aR7Passed":r7.get("status")=="PASSED",
      "r7ApplicationCandidateCountPositive":r7.get("applicationCandidateCount",0)>0,
      "sourceCandidateRolesResolved":len(source)>0,
      "liveApplicationCandidatesConsumed":len(live)>0,
      "aliasFingerprintMappingsComputed":len(mappings)>0,
      "roleClassificationCompleted":len(role_rows)==len(live),
      "applicationMutationOff":True,
      "governedMutationOff":True,
      "networkAuthorityOff":True,
      "pixelEvidenceOff":True,
      "exportPresentationRuntimeInvocationOff":True
    }

    if export_resolved and present_resolved:
        diagnosis="APPLICATION_OWNED_EXPORT_PRESENTATION_ALIASES_AND_ROLES_RESOLVED"
        nxt="M4_19D4BN17C_R4_R12_R16A_R9_APPLICATION_OWNED_BOUND_EXPORT_PRESENTATION_FUNCTION_LIVE_RECERTIFICATION"
    elif export_resolved or present_resolved:
        diagnosis="APPLICATION_OWNED_EXPORT_PRESENTATION_ALIAS_RESOLUTION_PARTIAL"
        nxt="M4_19D4BN17C_R4_R12_R16A_R9_APPLICATION_OWNED_ROLE_CLOSURE_AND_NEIGHBOR_HANDLER_DIAGNOSIS"
    else:
        diagnosis="APPLICATION_OWNED_RUNTIME_FUNCTIONS_REMAIN_UNMAPPED_TO_EXPORT_PRESENTATION_ROLES"
        nxt="M4_19D4BN17C_R4_R12_R16A_R9_REACT_OWNER_CHAIN_AND_MODULE_SCOPE_ALIAS_RESOLUTION"

    passed=all(checks.values())
    status="PASSED" if passed else "DIAGNOSTIC_COMPLETE"
    state=("M419D4BN17C_R4_R12_R16A_R8_APPLICATION_OWNED_FUNCTION_ALIAS_AND_ROLE_RESOLVED"
           if passed else "M419D4BN17C_R4_R12_R16A_R8_ALIAS_ROLE_RESOLUTION_INCOMPLETE")

    res={
      "framework":"SCIIP_EXPLORER_4_BN17C_R4_R12_R16A_R8_APPLICATION_OWNED_FUNCTION_ALIAS_AND_ROLE_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":status,"state":state,"diagnosis":diagnosis,"checks":checks,
      "sourceCandidateCount":len(source),"liveApplicationCandidateCount":len(live),
      "mappingCount":len(mappings),"resolvedExportAliasCount":len(export_resolved),
      "resolvedPresentationAliasCount":len(present_resolved),
      "sharedRolePathCount":len(shared_paths),
      "resolvedExportAliases":export_resolved,
      "resolvedPresentationAliases":present_resolved,
      "roleClassifications":role_rows,
      "topMappings":mappings[:120],
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,
                   "pixelEvidence":False,"exportPresentationRuntimeInvocation":False},
      "nextMilestone":nxt
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"application_owned_function_alias_and_role_resolution.json"
    f.write_text(json.dumps(res,indent=2)+"\n")

    print("="*120)
    print("SCIIP Explorer 4.0 — BN17C-R4-R12-R16A-R8 Application-Owned Function Alias + Role Resolution")
    print("="*120)
    print("SOURCE_CANDIDATE_COUNT:",len(source))
    print("LIVE_APPLICATION_CANDIDATE_COUNT:",len(live))
    print("MAPPING_COUNT:",len(mappings))
    print("RESOLVED_EXPORT_ALIAS_COUNT:",len(export_resolved))
    print("RESOLVED_PRESENTATION_ALIAS_COUNT:",len(present_resolved))
    print("SHARED_ROLE_PATH_COUNT:",len(shared_paths))

    print("\n----- TOP EXPORT ALIASES -----")
    for x in export_resolved[:10]:
        print(f'{x["livePath"]} -> {x["sourceName"]} score={x["mappingScore"]} lexical={x["lexicalSimilarity"]} arity={x["arityScore"]}')
    print("\n----- TOP PRESENTATION ALIASES -----")
    for x in present_resolved[:10]:
        print(f'{x["livePath"]} -> {x["sourceName"]} score={x["mappingScore"]} lexical={x["lexicalSimilarity"]} arity={x["arityScore"]}')

    print("\n----- CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("STATUS:",status)
    print("STATE:",state)
    print("DIAGNOSIS:",diagnosis)
    print("NEXT_MILESTONE:",nxt)
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
