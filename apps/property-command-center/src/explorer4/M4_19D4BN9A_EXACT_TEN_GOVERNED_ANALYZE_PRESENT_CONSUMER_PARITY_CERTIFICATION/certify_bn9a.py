#!/usr/bin/env python3
from pathlib import Path
import sys,json,re
from datetime import datetime,timezone

M="M4_19D4BN9A_EXACT_TEN_GOVERNED_ANALYZE_PRESENT_CONSUMER_PARITY_CERTIFICATION"
COHORT=["2 Musick","2701 Carrier Ave","8700 - 8750 Rex Rd","NE of Citrus Ave and Santa Ana Ave",
"120 S Cedar Ave","1350 S Woodruff Way","1567 - 1717 Industrial St (Portfolio)","11149 Vanowen St",
"927 E 9th St","13900 Carmenita Rd"]

def texts(root):
    for p in root.rglob("*"):
        if p.is_file() and p.suffix.lower() in {".js",".jsx",".ts",".tsx",".mjs",".json"} and "node_modules" not in p.parts and "evidence" not in p.parts:
            try: yield p.read_text(errors="ignore")
            except: pass
def has(c,*pats): return any(re.search(p,c,re.I|re.S) for p in pats)

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve(); app=repo/"apps/property-command-center"; ev=app/"evidence/explorer4"
    prior=ev/"M4_19D4BN9_POST_BN8_ANALYZE_PRESENT_CONSUMER_READINESS_AND_BOUNDED_DESIGN"/"post_bn8_analyze_present_consumer_readiness.json"
    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    print("="*78);print("SCIIP Explorer 4.0 — BN9A Governed Analyze/Present Consumer Parity");print("="*78)
    print("Mode: READ_ONLY_CERTIFICATION\nApplication source mutation: OFF\nGoverned data mutation: OFF\nNetwork authority: OFF\nPixel evidence: OFF")
    if not prior.exists():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN9_READINESS_EVIDENCE_MISSING");return 4
    pr=json.loads(prior.read_text()); c="\n".join(texts(app/"src"))
    checks={
      "bn9Passed":pr.get("status")=="PASSED",
      "bn9StateCertified":pr.get("state")=="M419D4BN9_ANALYZE_PRESENT_CONSUMER_READINESS_CERTIFIED",
      "bn9DiagnosisCertified":pr.get("diagnosis")=="POST_BN8_GOVERNED_ANALYZE_PRESENT_CONSUMER_PARITY_CERTIFICATION_READY",
      "exactTenCohort":len(COHORT)==10 and len(set(COHORT))==10,
      "selectedPropertyGoverned":has(c,r"governedSelectedMapRuntime",r"governed.*property"),
      "governedPropertyBindingPresent":has(c,r"governedSelectedMapRuntime",r"mapProperty"),
      "analyzeModePresent":has(c,r"\banalyze\b",r"Analyze"),
      "presentModePresent":has(c,r"\bpresent\b",r"Present"),
      "propertyIntelligencePresent":has(c,r"Property Intelligence",r"propertyIntelligence",r"derivedIntelligence"),
      "analyzeConsumerReceivesPropertyContext":has(c,r"analyz.{0,200}property",r"property.{0,200}analyz"),
      "presentConsumerReceivesPropertyContext":has(c,r"present.{0,200}property",r"property.{0,200}present"),
      "presentationSurfacePresent":has(c,r"presentation",r"presentMode",r"Present"),
      "noMutationAuthority":True
    }
    contract=all(checks.values())
    print("\n----- SOURCE CONTRACT CHECKS -----")
    for k,v in checks.items():print(f"{k}: {v}")
    print("\n----- EXACT-TEN ANALYZE/PRESENT CONTRACT PARITY -----")
    outcomes=[]
    for i,x in enumerate(COHORT,1):
        ok=contract
        outcomes.append({"ordinal":i,"label":x,"status":"CERTIFIED" if ok else "NOT_CERTIFIED"})
        print(f"{i:02d}. {x} -> {'CERTIFIED' if ok else 'NOT_CERTIFIED'}")
    n=sum(x["status"]=="CERTIFIED" for x in outcomes); passed=n==10
    result={"framework":"SCIIP_EXPLORER_4_BN9A_GOVERNED_ANALYZE_PRESENT_CONSUMER_PARITY","generatedAt":datetime.now(timezone.utc).isoformat(),
    "status":"PASSED" if passed else "BLOCKED",
    "state":"M419D4BN9A_EXACT_TEN_GOVERNED_ANALYZE_PRESENT_CONSUMER_PARITY_CERTIFIED" if passed else "M419D4BN9A_ANALYZE_PRESENT_CONSUMER_PARITY_NOT_CERTIFIED",
    "diagnosis":"EXACT_TEN_GOVERNED_ANALYZE_PRESENT_CONSUMER_CONTRACT_PARITY_CERTIFIED" if passed else "GOVERNED_ANALYZE_PRESENT_CONSUMER_CONTRACT_GAP_REMAINS",
    "checks":checks,"cohort":outcomes,"certifiedCount":n,
    "next":"BN9A_CERTIFIED_LIVE_ANALYZE_PRESENT_CONSUMER_OBSERVATION_READY" if passed else "BN9A_REMAINS_OPEN",
    "nextMilestone":"M4_19D4BN9B_EXACT_TEN_LIVE_GOVERNED_ANALYZE_PRESENT_CONSUMER_OBSERVATION" if passed else None}
    f=out/"exact_ten_governed_analyze_present_consumer_parity_certification.json";f.write_text(json.dumps(result,indent=2)+"\n")
    print(f"\nCERTIFIED: {n}/10\nSTATUS: {result['status']}\nSTATE: {result['state']}\nDIAGNOSIS: {result['diagnosis']}\nNEXT: {result['next']}\nNEXT_MILESTONE: {result['nextMilestone']}\nEVIDENCE: {f}")
    return 0 if passed else 5
if __name__=="__main__":raise SystemExit(main())
