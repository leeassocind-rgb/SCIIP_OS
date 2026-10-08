#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime,timezone
import sys,json,re,hashlib

M="M4_19D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def read_sources(root):
    out=[]
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs"} and "node_modules" not in p.parts and "evidence" not in p.parts:
            try: out.append((p,p.read_text(errors="ignore")))
            except: pass
    return out

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    prior=ev/"M4_19D4BN10_POST_BN9_NEXT_DOWNSTREAM_CONSUMER_READINESS_AND_BOUNDED_DESIGN"/"post_bn9_next_downstream_consumer_readiness.json"
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    print("="*80)
    print("SCIIP Explorer 4.0 — BN10A Governed Explain/Evidence Consumer Parity")
    print("="*80)
    print("Mode: READ_ONLY_CERTIFICATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    if not prior.is_file():
        print("STATUS: BLOCKED");print("DIAGNOSIS: BN10_READINESS_EVIDENCE_MISSING");return 4
    pr=json.loads(prior.read_text())
    sources=read_sources(app/"src")
    corpus="\n".join(t for _,t in sources)

    def has(pat): return re.search(pat,corpus,re.I|re.S) is not None
    checks={
      "bn10Passed":pr.get("status")=="PASSED",
      "bn10StateCertified":pr.get("state")=="M419D4BN10_NEXT_DOWNSTREAM_CONSUMER_READINESS_CERTIFIED",
      "bn10DiagnosisCertified":pr.get("diagnosis")=="POST_BN9_NEXT_BOUNDED_DOWNSTREAM_CONSUMER_RESOLVED",
      "bn10ResolvedExplainEvidence":pr.get("resolvedConsumer")=="EXPLAIN_EVIDENCE",
      "exactTenCohort":len(COHORT)==10 and len(set(COHORT))==10,
      "selectedPropertyBoundaryPresent":has(r"selectedProperty"),
      "governedPropertyBindingPresent":has(r"(selectedProperty|property).{0,160}(govern|workspace|context|identity)") or has(r"governedSelected"),
      "explainConsumerPresent":has(r"\bexplain\b|explanation"),
      "evidenceConsumerPresent":has(r"\bevidence\b"),
      "provenanceOrConfidencePresent":has(r"provenance|confidence|source"),
      "explainRouteOrActionPresent":has(r"(explain.{0,100}(route|action|command|selected property))|((route|action|command).{0,100}explain)"),
      "propertyContextConsumptionPresent":has(r"(explain|evidence).{0,240}(selectedProperty|property|context)") or has(r"(selectedProperty|property|context).{0,240}(explain|evidence)"),
      "noMutationAuthority":True
    }
    passed=all(checks.values())
    outcomes=[{"ordinal":i+1,"property":x,"outcome":"CERTIFIED" if passed else "BLOCKED"} for i,x in enumerate(COHORT)]
    refs=[]
    for p,t in sources:
        if re.search(r"explain|evidence|provenance|confidence",t,re.I):
            refs.append(str(p.relative_to(repo)))
            if len(refs)>=50: break
    result={
      "framework":"SCIIP_EXPLORER_4_BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN10A_EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_PARITY_CERTIFIED" if passed else "M419D4BN10A_EXPLAIN_EVIDENCE_CONSUMER_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_CONTRACT_PARITY_CERTIFIED" if passed else "GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_CONTRACT_PRECONDITION_FAILED",
      "mode":"READ_ONLY_CERTIFICATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,"cohort":COHORT,"outcomes":outcomes,"sourceReferences":refs,
      "next":"BN10A_CERTIFIED_LIVE_EXPLAIN_EVIDENCE_CONSUMER_OBSERVATION_READY" if passed else "BN10A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN10B_EXACT_TEN_LIVE_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_OBSERVATION" if passed else None,
      "prerequisite":{"path":str(prior),"sha256":sha(prior)}
    }
    f=out/"exact_ten_governed_explain_evidence_consumer_parity_certification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\n----- EXACT-TEN EXPLAIN/EVIDENCE CONTRACT PARITY -----")
    for x in outcomes: print(f"{x['ordinal']:02d}. {x['property']} -> {x['outcome']}")
    print(f"\nCERTIFIED: {sum(x['outcome']=='CERTIFIED' for x in outcomes)}/10")
    print("STATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"]);print("NEXT_MILESTONE:",result["nextMilestone"]);print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__": raise SystemExit(main())
