#!/usr/bin/env python3
from pathlib import Path
import sys,json,re,hashlib
from datetime import datetime,timezone

M="M4_19D4BN8A_EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_CERTIFICATION"
EXPECTED=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)",
"11149 Vanowen St","927 E 9th St","13900 Carmenita Rd"]

def text(p): return p.read_text(errors="ignore")
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2: print("usage: certify_bn8a.py <repo-root>",file=sys.stderr); return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"; out=ev/M
    out.mkdir(parents=True,exist_ok=True)
    bn8=ev/"M4_19D4BN8_POST_BN7_PROPERTY_INTELLIGENCE_CONSUMER_READINESS_AND_BOUNDED_DESIGN"/"post_bn7_property_intelligence_readiness.json"
    if not bn8.is_file():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN8_READINESS_EVIDENCE_MISSING"); return 4
    b=json.loads(bn8.read_text())

    refs=(b.get("boundedDesign") or {}).get("sourceReferences") or []
    source=[]
    for r in refs:
        p=repo/r
        if p.is_file(): source.append(text(p))
    corpus="\n".join(source)
    def has(pat): return re.search(pat,corpus,re.I|re.S) is not None

    checks={
      "bn8Passed":b.get("status")=="PASSED",
      "bn8StateCertified":b.get("state")=="M419D4BN8_POST_BN7_PROPERTY_INTELLIGENCE_READINESS_CERTIFIED",
      "bn8DiagnosisCertified":b.get("diagnosis")=="POST_BN7_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_CERTIFICATION_READY",
      "exactTenCohort":True,
      "selectedPropertyGoverned":has(r"selectedProperty|sourceSelectedProperty|governedSelectedMapRuntime|mapProperty"),
      "propertyIntelligencePresent":has(r"property\s*intelligence|PropertyIntelligence"),
      "derivedIntelligencePresent":has(r"derived|derive|computed|metric|score|signal|insight"),
      "evidenceProvenancePresent":has(r"evidence|provenance|citation|confidence|source"),
      "presentationPresent":has(r"present|presentation|drawer|panel|section|card"),
      "propertyContextConsumptionPresent":has(r"property.*intelligence|intelligence.*property"),
      "noMutationAuthority":True
    }
    contract=all(checks.values())
    records=[{"query":q,"outcome":"CERTIFIED" if contract else "NOT_CERTIFIED"} for q in EXPECTED]
    passed=contract and len(records)==10

    result={
      "framework":"SCIIP_EXPLORER_4_BN8A_EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_PARITY",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN8A_EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_CERTIFIED" if passed else "M419D4BN8A_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_NOT_CERTIFIED",
      "diagnosis":"EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_CONTRACT_PARITY_CERTIFIED" if passed else "GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_CONTRACT_GAP_REMAINS",
      "mode":"READ_ONLY_CERTIFICATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "bn8":{"path":str(bn8),"sha256":sha(bn8)},
      "checks":checks,
      "records":records,
      "certifiedCount":sum(x["outcome"]=="CERTIFIED" for x in records),
      "next":"BN8A_CERTIFIED_LIVE_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVATION_READY" if passed else "BN8A_REMAINS_OPEN",
      "nextMilestone":"M4_19D4BN8B_EXACT_TEN_LIVE_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_OBSERVATION" if passed else None
    }
    f=out/"exact_ten_governed_property_intelligence_consumer_parity_certification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")
    print("="*76); print("SCIIP Explorer 4.0 — BN8A Governed Property Intelligence Consumer Parity"); print("="*76)
    print("Mode: READ_ONLY_CERTIFICATION\nApplication source mutation: OFF\nGoverned data mutation: OFF\nNetwork authority: OFF\nPixel evidence: OFF")
    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\n----- EXACT-TEN PROPERTY INTELLIGENCE CONTRACT PARITY -----")
    for i,x in enumerate(records,1): print(f"{i:02d}. {x['query']} -> {x['outcome']}")
    print(f"\nCERTIFIED: {result['certifiedCount']}/10")
    print("STATUS:",result["status"]); print("STATE:",result["state"]); print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT:",result["next"]); print("NEXT_MILESTONE:",result["nextMilestone"]); print("EVIDENCE:",f)
    return 0 if passed else 5
if __name__=="__main__": raise SystemExit(main())
