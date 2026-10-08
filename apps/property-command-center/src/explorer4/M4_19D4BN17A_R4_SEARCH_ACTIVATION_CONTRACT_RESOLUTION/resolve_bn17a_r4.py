#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,hashlib

M="M4_19D4BN17A_R4_SEARCH_ACTIVATION_CONTRACT_RESOLUTION"

def first_json(p):
    s=p.read_text(errors="ignore")
    return json.JSONDecoder().raw_decode(s.lstrip())[0]

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    r3p=ev/"M4_19D4BN17A_R3_LIVE_SEARCH_RESULT_STATE_TRANSITION_DIAGNOSIS_AND_DYNAMIC_CANDIDATE_ENUMERATION"/"live_search_result_state_transition_diagnosis_and_dynamic_candidate_enumeration.json"
    if not r3p.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN17A_R3_EVIDENCE_REQUIRED");return 4
    r3=first_json(r3p)

    roots=[app/"src"]
    exts={".js",".jsx",".ts",".tsx",".mjs"}
    files=[]
    for root in roots:
        if root.exists():
            files += [p for p in root.rglob("*") if p.is_file() and p.suffix in exts]

    # Exclude generated milestone packages to avoid self-reference pollution.
    files=[p for p in files if "/src/explorer4/M4_" not in str(p).replace("\\","/")]

    patterns={
      "searchInput":re.compile(r"(placeholder\s*=\s*[\"'`][^\"'`]*search|aria-label\s*=\s*[\"'`][^\"'`]*search|type\s*=\s*[\"']search[\"'])",re.I),
      "onChange":re.compile(r"\bonChange\s*=\s*\{[^}]+\}",re.I),
      "onKeyDown":re.compile(r"\bonKeyDown\s*=\s*\{[^}]+\}",re.I),
      "enterKey":re.compile(r"(key\s*===?\s*[\"']Enter[\"']|code\s*===?\s*[\"']Enter[\"']|keyCode\s*===?\s*13)",re.I),
      "submit":re.compile(r"(onSubmit\s*=|type\s*=\s*[\"']submit[\"']|handleSubmit|submitSearch)",re.I),
      "searchState":re.compile(r"(useState\([^)]*\).*search|setSearch|searchQuery|query\s*,\s*setQuery|searchTerm|searchText)",re.I),
      "searchResults":re.compile(r"(searchResults|filteredResults|filteredProperties|results\.map|properties\.filter|filterProperties)",re.I),
      "propertySelect":re.compile(r"(setSelectedProperty|selectProperty|selectedProperty|onSelectProperty|handlePropertySelect)",re.I),
      "dispatcher":re.compile(r"(runCommand|dispatch\(|executeCommand|commandPalette|CommandPalette)",re.I),
    }

    hits={k:[] for k in patterns}
    source_refs=0
    for p in files:
        try:s=p.read_text(errors="ignore")
        except Exception:continue
        lines=s.splitlines()
        for i,line in enumerate(lines,1):
            for k,rx in patterns.items():
                if rx.search(line):
                    source_refs+=1
                    if len(hits[k])<40:
                        lo=max(1,i-2);hi=min(len(lines),i+2)
                        snippet="\n".join(f"{j}: {lines[j-1]}" for j in range(lo,hi+1))
                        hits[k].append({"file":str(p.relative_to(app)),"line":i,"snippet":snippet})

    checks={
      "bn17aR3DiagnosticComplete":r3.get("status")=="DIAGNOSTIC_COMPLETE",
      "bn17aR3NoResultStateTransitions":r3.get("transitionCount")==0,
      "sourceFilesScanned":len(files)>0,
      "searchInputResolved":len(hits["searchInput"])>0,
      "controlledStateOrChangePathResolved":len(hits["onChange"])>0 or len(hits["searchState"])>0,
      "activationKeyOrSubmitResolved":len(hits["onKeyDown"])>0 or len(hits["enterKey"])>0 or len(hits["submit"])>0,
      "searchResultSurfaceResolved":len(hits["searchResults"])>0,
      "propertySelectionRouteResolved":len(hits["propertySelect"])>0,
      "applicationMutationOff":True,
      "governedMutationOff":True
    }

    # Determine best bounded route from source evidence.
    if hits["enterKey"] or hits["onKeyDown"]:
        route="CONTROLLED_INPUT_PLUS_KEY_ACTIVATION"
    elif hits["submit"]:
        route="CONTROLLED_INPUT_PLUS_FORM_SUBMIT"
    elif hits["dispatcher"]:
        route="ACTION_DISPATCHER"
    else:
        route="UNRESOLVED"

    checks["activationRouteResolved"]=route!="UNRESOLVED"
    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN17A_R4_SEARCH_ACTIVATION_CONTRACT_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "DIAGNOSTIC_COMPLETE",
      "state":"M419D4BN17A_R4_SEARCH_ACTIVATION_CONTRACT_RESOLVED" if passed else "M419D4BN17A_R4_SEARCH_ACTIVATION_CONTRACT_INCOMPLETE",
      "diagnosis":"LIVE_SEARCH_INPUT_DOM_VALUE_MUTATION_BYPASSED_APPLICATION_SEARCH_ACTIVATION_CONTRACT" if passed else "SEARCH_ACTIVATION_CONTRACT_PARTIALLY_RESOLVED",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "resolvedRouteType":route,
      "sourceReferenceCount":source_refs,
      "sourceEvidence":hits,
      "next":"BN17A_R4_CERTIFIED_ACTIVATION_CONTRACT_LIVE_ENUMERATION_READY" if passed else "BN17A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN17A_R5_ACTIVATION_CONTRACT_DRIVEN_LIVE_SEARCH_ENUMERATION_AND_50_RECORD_PREAUTHORIZATION" if passed else None
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"search_activation_contract_resolution.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("="*108)
    print("SCIIP Explorer 4.0 — BN17A-R4 Search Activation Contract Resolution")
    print("="*108)
    print("Mode: READ_ONLY_SOURCE_CONTRACT_DIAGNOSIS")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF\n")
    print("----- RESOLUTION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\nresolvedRouteType:",route)
    print("sourceFilesScanned:",len(files))
    print("sourceReferenceCount:",source_refs)
    print("\n----- SOURCE SIGNAL COUNTS -----")
    for k,v in hits.items():print(f"{k}: {len(v)}")
    print("\nSTATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0

if __name__=="__main__":raise SystemExit(main())
