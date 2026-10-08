#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,re,hashlib

M="M4_19D4BN11_POST_BN10_NEXT_DOWNSTREAM_CONSUMER_READINESS_AND_BOUNDED_DESIGN"

PATTERNS={
 "DEEP_LINK_CONTEXT_RESTORE":[r"deep.?link",r"context.?restore",r"restore.?context",r"URLSearchParams",r"location\.search"],
 "GRAPH_RELATIONSHIP":[r"graph",r"relationship",r"neighbor",r"related",r"edge"],
 "EXPORT_PRESENTATION":[r"export",r"presentation",r"present",r"property.?package",r"download"]
}

def load(p): return json.loads(p.read_text())
def scan(root):
    scores={k:0 for k in PATTERNS}
    refs={k:[] for k in PATTERNS}
    exts={".js",".jsx",".ts",".tsx",".mjs",".json"}
    skip=("node_modules","dist","build","evidence","src/explorer4/M4_19D4")
    for p in root.rglob("*"):
        if not p.is_file() or p.suffix.lower() not in exts: continue
        s=str(p)
        if any(x in s for x in skip): continue
        try: txt=p.read_text(errors="ignore")
        except: continue
        for k, pats in PATTERNS.items():
            c=sum(len(re.findall(x,txt,re.I)) for x in pats)
            if c:
                scores[k]+=c
                if len(refs[k])<30: refs[k].append({"file":str(p),"references":c})
    return scores,refs

def main():
    if len(sys.argv)!=2:
        print("usage: design_bn11.py <repo-root>",file=sys.stderr); return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    c=ev/"M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE"/"governed_explain_evidence_consumer_lifecycle_closure.json"

    print("="*86)
    print("SCIIP Explorer 4.0 — BN11 Post-BN10 Next Downstream Consumer Readiness")
    print("="*86)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not c.is_file():
        print("STATUS: BLOCKED"); print("DIAGNOSIS: BN10C_CLOSURE_EVIDENCE_MISSING"); return 4
    cr=load(c)
    scores,refs=scan(app/"src")
    resolved=max(scores,key=scores.get) if any(scores.values()) else None

    checks={
      "bn10ClosurePassed":cr.get("status")=="PASSED",
      "bn10ClosureStateCertified":cr.get("state")=="M419D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSED",
      "bn10ClosureDiagnosisCertified":cr.get("diagnosis")=="EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
      "explainEvidenceExcludedAsClosed":True,
      "sourceInventoryPresent":sum(scores.values())>0,
      "nextConsumerResolved":resolved is not None,
      "noMutationAuthority":True
    }
    passed=all(checks.values())

    next_map={
      "DEEP_LINK_CONTEXT_RESTORE":"M4_19D4BN11A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFICATION",
      "GRAPH_RELATIONSHIP":"M4_19D4BN11A_EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY_CERTIFICATION",
      "EXPORT_PRESENTATION":"M4_19D4BN11A_EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_PARITY_CERTIFICATION"
    }
    result={
      "framework":"SCIIP_EXPLORER_4_BN11_POST_BN10_NEXT_DOWNSTREAM_CONSUMER_READINESS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN11_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED" if passed else "M419D4BN11_NEXT_DOWNSTREAM_CONSUMER_NOT_RESOLVED",
      "diagnosis":"POST_BN10_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_RESOLVED" if passed else "POST_BN10_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_UNRESOLVED",
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "closedConsumers":["EXPLAIN_EVIDENCE"],
      "candidateConsumers":[{"consumer":k,"score":scores[k],"references":refs[k]} for k in PATTERNS],
      "resolvedConsumer":resolved,
      "nextMilestone":next_map.get(resolved) if passed else None,
      "bn10cEvidence":{"path":str(c),"sha256":hashlib.sha256(c.read_bytes()).hexdigest()}
    }

    out=ev/M; out.mkdir(parents=True,exist_ok=True)
    f=out/"post_bn10_next_downstream_consumer_readiness.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\n----- REMAINING CANDIDATE CONSUMERS -----")
    for k in PATTERNS: print(f"{k}: score={scores[k]} references={len(refs[k])}")
    print()
    print("RESOLVED_CONSUMER:",resolved)
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__": raise SystemExit(main())
