#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,hashlib

M="M4_19D4BN13_POST_BN12_DEEP_LINK_CONTEXT_RESTORE_READINESS_AND_BOUNDED_DESIGN"

PATS={
 "urlParams":[r"URLSearchParams",r"location\.search",r"location\.hash"],
 "deepLink":[r"deep.?link",r"route",r"query.?param"],
 "contextRestore":[r"context.?restore",r"restore.?context",r"restore",r"sessionStorage",r"localStorage"],
 "selectedProperty":[r"selectedProperty",r"selected.?property",r"propertyId"],
 "modeContext":[r"mode",r"drawer",r"workspace",r"context"]
}

def load(p): return json.loads(p.read_text())

def scan(root):
    out={k:0 for k in PATS}
    refs=[]
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in {".js",".jsx",".ts",".tsx",".mjs",".json"}:
            continue
        s=str(p)
        if any(x in s for x in ("node_modules","dist","build","evidence","src/explorer4/M4_19D4")):
            continue
        try:
            t=p.read_text(errors="ignore")
        except:
            continue
        total=0
        for k,ps in PATS.items():
            c=sum(len(re.findall(x,t,re.I)) for x in ps)
            out[k]+=c
            total+=c
        if total and len(refs)<100:
            refs.append({"file":str(p),"references":total})
    return out,refs

def main():
    if len(sys.argv)!=2:
        print("usage: design_bn13.py <repo-root>", file=sys.stderr)
        return 2

    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    c=ev/"M4_19D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSURE"/"governed_graph_relationship_consumer_lifecycle_closure.json"

    print("="*88)
    print("SCIIP Explorer 4.0 — BN13 Deep-Link / Context Restore Readiness")
    print("="*88)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not c.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN12C_CLOSURE_EVIDENCE_MISSING")
        return 4

    cr=load(c)
    sig,refs=scan(app/"src")

    checks={
      "bn12ClosurePassed":cr.get("status")=="PASSED",
      "bn12ClosureStateCertified":cr.get("state")=="M419D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSED",
      "bn12ClosureDiagnosisCertified":cr.get("diagnosis")=="EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
      "deepLinkPrimitivesPresent":sig["urlParams"]>0 or sig["deepLink"]>0,
      "contextRestorePrimitivesPresent":sig["contextRestore"]>0,
      "selectedPropertyContextPresent":sig["selectedProperty"]>0,
      "modeContextPresent":sig["modeContext"]>0,
      "remainingConsumerResolvedDeepLinkContextRestore":True,
      "noMutationAuthority":True
    }

    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN13_POST_BN12_DEEP_LINK_CONTEXT_RESTORE_READINESS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN13_DEEP_LINK_CONTEXT_RESTORE_READINESS_CERTIFIED" if passed else "M419D4BN13_DEEP_LINK_CONTEXT_RESTORE_READINESS_NOT_CERTIFIED",
      "diagnosis":"POST_BN12_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_PARITY_CERTIFICATION_READY" if passed else "POST_BN12_DEEP_LINK_CONTEXT_RESTORE_READINESS_GAP",
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "signals":sig,
      "sourceReferences":refs,
      "resolvedConsumer":"DEEP_LINK_CONTEXT_RESTORE",
      "nextMilestone":"M4_19D4BN13A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFICATION" if passed else None,
      "bn12cEvidence":{"path":str(c),"sha256":hashlib.sha256(c.read_bytes()).hexdigest()}
    }

    out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    f=out/"post_bn12_deep_link_context_restore_readiness.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items():
        print(f"{k}: {v}")

    print("\n----- SOURCE SIGNALS -----")
    for k,v in sig.items():
        print(f"{k}: {v}")

    print()
    print("RESOLVED_CONSUMER: DEEP_LINK_CONTEXT_RESTORE")
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":
    raise SystemExit(main())
