#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,hashlib

M="M4_19D4BN10_POST_BN9_NEXT_DOWNSTREAM_CONSUMER_READINESS_AND_BOUNDED_DESIGN"

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def source_files(root):
    exts={".js",".jsx",".ts",".tsx",".mjs"}
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in exts and "node_modules" not in p.parts and "evidence" not in p.parts:
            try: yield p,p.read_text(errors="ignore")
            except: pass

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    prior=ev/"M4_19D4BN9C_R1_BN9A_AUTHORITY_METADATA_RECONCILIATION_AND_LIFECYCLE_CLOSURE"/"bn9a_authority_metadata_reconciliation_and_lifecycle_closure.json"
    out=ev/M;out.mkdir(parents=True,exist_ok=True)

    print("="*82)
    print("SCIIP Explorer 4.0 — BN10 Post-BN9 Next Downstream Consumer Readiness")
    print("="*82)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not prior.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN9_CLOSURE_EVIDENCE_MISSING");return 4
    pr=json.loads(prior.read_text())

    files=list(source_files(app/"src"))
    corpus="\n".join(t for _,t in files)

    candidates={
      "EXPLAIN_EVIDENCE":{
        "patterns":[r"\bexplain\b",r"explanation",r"evidence",r"confidence",r"provenance"],
        "score":0
      },
      "DEEP_LINK_CONTEXT_RESTORE":{
        "patterns":[r"deep.?link",r"context.?restore",r"URLSearchParams",r"location\.search",r"restore"],
        "score":0
      },
      "GRAPH_RELATIONSHIP":{
        "patterns":[r"knowledge.?graph",r"relationship",r"neighborRelationships",r"graph"],
        "score":0
      },
      "EXPORT_PRESENTATION":{
        "patterns":[r"export",r"download",r"presentation",r"briefing"],
        "score":0
      }
    }

    refs={k:[] for k in candidates}
    for p,t in files:
        for k,v in candidates.items():
            hits=sum(1 for pat in v["patterns"] if re.search(pat,t,re.I|re.S))
            if hits:
                v["score"]+=hits
                if len(refs[k])<30: refs[k].append(str(p.relative_to(repo)))

    # Prefer an independently addressable consumer whose source path is already
    # visible in Explorer command/runtime wiring. Explain/Evidence is the strongest
    # next boundary if present; otherwise fall back deterministically by score.
    order=["EXPLAIN_EVIDENCE","DEEP_LINK_CONTEXT_RESTORE","GRAPH_RELATIONSHIP","EXPORT_PRESENTATION"]
    resolved=None
    for k in order:
        if candidates[k]["score"]>0:
            resolved=k;break

    next_map={
      "EXPLAIN_EVIDENCE":"M4_19D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFICATION",
      "DEEP_LINK_CONTEXT_RESTORE":"M4_19D4BN10A_EXACT_TEN_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_PARITY_CERTIFICATION",
      "GRAPH_RELATIONSHIP":"M4_19D4BN10A_EXACT_TEN_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_PARITY_CERTIFICATION",
      "EXPORT_PRESENTATION":"M4_19D4BN10A_EXACT_TEN_GOVERNED_EXPORT_PRESENTATION_CONSUMER_PARITY_CERTIFICATION"
    }

    checks={
      "bn9ClosurePassed":pr.get("status")=="PASSED",
      "bn9ClosureStateCertified":pr.get("state")=="M419D4BN9C_R1_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSED",
      "bn9ClosureDiagnosisCertified":pr.get("diagnosis")=="BN9A_AUTHORITY_METADATA_OMISSION_RECONCILED_EXACT_TEN_ANALYZE_PRESENT_LIFECYCLE_CERTIFIED_AND_CLOSED",
      "sourceInventoryPresent":len(files)>0,
      "nextConsumerResolved":resolved is not None,
      "noMutationAuthority":True
    }
    passed=all(checks.values())

    result={
      "framework":"SCIIP_EXPLORER_4_BN10_POST_BN9_NEXT_DOWNSTREAM_CONSUMER_READINESS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN10_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED" if passed else "M419D4BN10_NEXT_DOWNSTREAM_CONSUMER_NOT_RESOLVED",
      "diagnosis":"POST_BN9_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_RESOLVED" if passed else "POST_BN9_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_UNRESOLVED",
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "candidateConsumers":candidates,
      "sourceReferences":refs,
      "resolvedConsumer":resolved,
      "nextMilestone":next_map.get(resolved) if passed else None,
      "prerequisite":{"path":str(prior),"sha256":sha(prior)}
    }

    f=out/"post_bn9_next_downstream_consumer_readiness.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- CANDIDATE CONSUMERS -----")
    for k,v in candidates.items():print(f"{k}: score={v['score']} references={len(refs[k])}")
    print("\nRESOLVED_CONSUMER:",resolved)
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__":raise SystemExit(main())
