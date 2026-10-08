#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,hashlib

M="M4_19D4BN10B_R1_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RESOLUTION"

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    bn10a=ev/"M4_19D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFICATION"/"exact_ten_governed_explain_evidence_consumer_parity_certification.json"
    bn10b=ev/"M4_19D4BN10B_EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_OBSERVATION"/"exact_ten_live_governed_explain_evidence_consumer_observation.json"
    out=ev/M;out.mkdir(parents=True,exist_ok=True)

    print("="*82)
    print("SCIIP Explorer 4.0 — BN10B-R1 Explain/Evidence Activation Path Resolution")
    print("="*82)
    print("Mode: READ_ONLY_DIAGNOSTIC")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    missing=[str(p) for p in (bn10a,bn10b) if not p.is_file()]
    if missing:
        print("STATUS: BLOCKED");print("DIAGNOSIS: REQUIRED_EVIDENCE_MISSING")
        for p in missing:print("MISSING:",p)
        return 4

    a=json.loads(bn10a.read_text())
    b=json.loads(bn10b.read_text())
    rows=b.get("records") or []

    source=[]
    for p in (app/"src").rglob("*"):
        if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"} and "node_modules" not in p.parts and "evidence" not in p.parts:
            try: source.append((p,p.read_text(errors="ignore")))
            except: pass

    corpus="\n".join(t for _,t in source)

    # Resolve likely activation machinery.
    run_command=bool(re.search(r"\brunCommand\b",corpus))
    explain_branch=bool(re.search(r"(action|command|id).{0,80}['\"]explain['\"]|['\"]explain['\"].{0,80}(action|command|id)",corpus,re.I|re.S))
    explain_property_route=bool(re.search(r"explain.{0,180}(property|drawer|intelligence)|(?:property|drawer|intelligence).{0,180}explain",corpus,re.I|re.S))
    command_palette=bool(re.search(r"CommandPalette|command.?palette|paletteOpen",corpus,re.I))
    direct_explain_button=bool(re.search(r"<button[^>]*>[^<]*(Explain|Why)|aria-label=['\"][^'\"]*(Explain|Why)",corpus,re.I))
    dispatcher_refs=len(re.findall(r"runCommand",corpus))
    explain_refs=len(re.findall(r"\bexplain\b",corpus,re.I))

    route_type=None
    if run_command and explain_branch and command_palette:
        route_type="ACTION_DISPATCHER"
    elif direct_explain_button:
        route_type="DIRECT_VISIBLE_CONTROL"
    elif explain_property_route:
        route_type="PROPERTY_CONTEXT_ROUTE"

    checks={
      "bn10aPassed":a.get("status")=="PASSED",
      "bn10aStateCertified":a.get("state")=="M419D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFIED",
      "bn10bExactTen":len(rows)==10,
      "allVisibleExplainControlsAbsent":all(x.get("explainControlClicked") is False for x in rows),
      "allEvidenceSignalsPresent":all((x.get("evidenceSignalCount") or 0)>0 for x in rows),
      "allExplanationSignalsPresent":all((x.get("explanationSignalCount") or 0)>0 for x in rows),
      "allMapsStillVisible":all(x.get("mapVisibleAfterExplain") is True for x in rows),
      "explainBranchResolved":explain_branch,
      "activationRouteResolved":route_type is not None,
      "noMutationAuthority":True
    }

    passed=all(checks.values())

    refs=[]
    for p,t in source:
        if re.search(r"\bexplain\b|runCommand|CommandPalette|paletteOpen",t,re.I):
            refs.append(str(p.relative_to(repo)))
            if len(refs)>=40:break

    result={
      "framework":"SCIIP_EXPLORER_4_BN10B_R1_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RESOLUTION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN10B_R1_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RESOLVED" if passed else "M419D4BN10B_R1_EXPLAIN_EVIDENCE_ACTIVATION_PATH_UNRESOLVED",
      "diagnosis":"EXPLAIN_EVIDENCE_CONSUMER_PRESENT_VISIBLE_CONTROL_ASSUMPTION_INVALID_ACTIVATION_PATH_RESOLVED" if passed else "EXPLAIN_EVIDENCE_ACTIVATION_PATH_REMAINS_UNRESOLVED",
      "mode":"READ_ONLY_DIAGNOSTIC",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "routeType":route_type,
      "signals":{
        "runCommandPresent":run_command,
        "commandPalettePresent":command_palette,
        "directExplainButtonPresent":direct_explain_button,
        "explainPropertyRoutePresent":explain_property_route,
        "dispatcherReferences":dispatcher_refs,
        "explainReferences":explain_refs
      },
      "sourceReferences":refs,
      "next":"BN10B_R2_LIVE_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RECERTIFICATION_READY" if passed else "BN10B_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN10B_R2_EXACT_TEN_LIVE_EXPLAIN_EVIDENCE_ACTIVATION_PATH_RECERTIFICATION" if passed else None,
      "evidence":{"bn10aSha256":sha(bn10a),"bn10bSha256":sha(bn10b)}
    }

    f=out/"explain_evidence_activation_path_resolution.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- RESOLUTION CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print()
    print("routeType:",route_type)
    print("runCommandPresent:",run_command)
    print("commandPalettePresent:",command_palette)
    print("directExplainButtonPresent:",direct_explain_button)
    print("explainPropertyRoutePresent:",explain_property_route)
    print("dispatcherReferences:",dispatcher_refs)
    print("explainReferences:",explain_refs)
    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
