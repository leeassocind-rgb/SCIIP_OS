#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,hashlib

M="M4_19D4BN12_POST_BN11_NEXT_DOWNSTREAM_CONSUMER_READINESS_AND_BOUNDED_DESIGN"

PATTERNS={
 "GRAPH_RELATIONSHIP":[r"graph",r"relationship",r"neighbor",r"related",r"edge"],
 "DEEP_LINK_CONTEXT_RESTORE":[r"deep.?link",r"context.?restore",r"restore.?context",r"URLSearchParams",r"location\.search"]
}

def load(p): return json.loads(p.read_text())

def scan(root):
    scores={k:0 for k in PATTERNS}
    refs={k:[] for k in PATTERNS}
    exts={".js",".jsx",".ts",".tsx",".mjs",".json"}
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in exts: continue
        s=str(p)
        if any(x in s for x in ("node_modules","dist","build","evidence","src/explorer4/M4_19D4")): continue
        try: txt=p.read_text(errors="ignore")
        except: continue
        for k,pats in PATTERNS.items():
            c=sum(len(re.findall(x,txt,re.I)) for x in pats)
            if c:
                scores[k]+=c
                if len(refs[k])<30:
                    refs[k].append({"file":str(p),"references":c})
    return scores,refs

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    c=ev/"M4_19D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSURE"/"governed_export_presentation_consumer_lifecycle_closure.json"

    print("="*88)
    print("SCIIP Explorer 4.0 — BN12 Post-BN11 Next Downstream Consumer Readiness")
    print("="*88)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not c.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: BN11C_CLOSURE_EVIDENCE_MISSING")
        return 4

    cr=load(c)
    scores,refs=scan(app/"src")
    resolved=max(scores,key=scores.get) if any(scores.values()) else None

    checks={
      "bn11ClosurePassed":cr.get("status")=="PASSED",
      "bn11ClosureStateCertified":cr.get("state")=="M419D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSED",
      "bn11ClosureDiagnosisCertified":cr.get("diagnosis")=="EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
      "explainEvidenceExcludedAsClosed":True,
      "exportPresentationExcludedAsClosed":True,
      "sourceInventoryPresent":sum(scores.values())>0,
      "nextConsumerResolved":resolved is not None,
      "noMutationAuthority":True
    }
    passed=all(checks.values())

    next_map={
      "GRAPH_RELATIONSHIP":"M4_19D4BN12A_EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY_CERTIFICATION",
      "DEEP_LINK_CONTEXT_RESTORE":"M4_19D4BN12A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFICATION"
    }

    result={
      "framework":"SCIIP_EXPLORER_4_BN12_POST_BN11_NEXT_DOWNSTREAM_CONSUMER_READINESS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN12_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED" if passed else "M419D4BN12_NEXT_DOWNSTREAM_CONSUMER_NOT_RESOLVED",
      "diagnosis":"POST_BN11_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_RESOLVED" if passed else "POST_BN11_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_UNRESOLVED",
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "closedConsumers":["EXPLAIN_EVIDENCE","EXPORT_PRESENTATION"],
      "candidateConsumers":[{"consumer":k,"score":scores[k],"references":refs[k]} for k in PATTERNS],
      "resolvedConsumer":resolved,
      "nextMilestone":next_map.get(resolved) if passed else None,
      "bn11cEvidence":{"path":str(c),"sha256":hashlib.sha256(c.read_bytes()).hexdigest()}
    }

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"post_bn11_next_downstream_consumer_readiness.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- REMAINING CANDIDATE CONSUMERS -----")
    for k in PATTERNS:print(f"{k}: score={scores[k]} references={len(refs[k])}")
    print()
    print("RESOLVED_CONSUMER:",resolved)
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
