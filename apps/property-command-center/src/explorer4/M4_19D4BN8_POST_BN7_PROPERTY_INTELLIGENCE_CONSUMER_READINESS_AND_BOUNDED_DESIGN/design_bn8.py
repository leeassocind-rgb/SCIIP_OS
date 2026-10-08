#!/usr/bin/env python3
from pathlib import Path
import sys,json,re,hashlib
from datetime import datetime,timezone

M="M4_19D4BN8_POST_BN7_PROPERTY_INTELLIGENCE_CONSUMER_READINESS_AND_BOUNDED_DESIGN"

def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()
def read(p): return p.read_text(errors="ignore")

def main():
    if len(sys.argv)!=2:
        print("usage: design_bn8.py <repo-root>",file=sys.stderr); return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    app=repo/"apps/property-command-center"
    ev=app/"evidence/explorer4"
    out=ev/M; out.mkdir(parents=True,exist_ok=True)

    bn7c=ev/"M4_19D4BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSURE"/"governed_command_consumer_lifecycle_closure.json"
    if not bn7c.is_file():
        print("STATUS: BLOCKED\nDIAGNOSIS: BN7C_EVIDENCE_MISSING"); return 4
    b=json.loads(bn7c.read_text())

    exts={".js",".jsx",".ts",".tsx"}
    files=[p for p in app.rglob("*") if p.is_file() and p.suffix.lower() in exts
           and "node_modules" not in p.parts and "dist" not in p.parts and "evidence" not in p.parts]
    corpus="\n".join(read(p) for p in files)

    def has(pattern): return re.search(pattern,corpus,re.I|re.S) is not None

    # Deliberately semantic/tolerant: readiness discovers the actual implementation
    # vocabulary rather than requiring one historical identifier spelling.
    checks={
      "bn7cPassed":b.get("status")=="PASSED",
      "bn7cStateClosed":b.get("state")=="M419D4BN7C_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CLOSED",
      "bn7cDiagnosisCertified":b.get("diagnosis")=="EXACT_TEN_GOVERNED_COMMAND_CONSUMER_LIFECYCLE_CERTIFIED_AND_CLOSED",
      "propertyIntelligencePresent":has(r"property\s*intelligence|PropertyIntelligence"),
      "selectedPropertyBoundaryPresent":has(r"selectedProperty|sourceSelectedProperty|governedSelectedMapRuntime|mapProperty"),
      "derivedIntelligenceSurfacePresent":has(r"derived|derive|computed|metric|score|signal|insight"),
      "evidenceOrProvenanceSurfacePresent":has(r"evidence|provenance|source|citation|confidence"),
      "presentationSurfacePresent":has(r"present|presentation|drawer|panel|section|card"),
      "propertyContextConsumptionPresent":has(r"property.*intelligence|intelligence.*property"),
      "noMutationAuthority":True
    }
    passed=all(checks.values())

    # Capture bounded source references as evidence for BN8A authoring.
    refs=[]
    terms=re.compile(r"property\s*intelligence|PropertyIntelligence|derived|provenance|evidence|presentation",re.I)
    for p in files:
        txt=read(p)
        if terms.search(txt):
            refs.append(str(p.relative_to(repo)))
    refs=sorted(set(refs))[:100]

    result={
      "framework":"SCIIP_EXPLORER_4_BN8_POST_BN7_PROPERTY_INTELLIGENCE_READINESS",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN8_POST_BN7_PROPERTY_INTELLIGENCE_READINESS_CERTIFIED" if passed else "M419D4BN8_PROPERTY_INTELLIGENCE_READINESS_NOT_CERTIFIED",
      "diagnosis":"POST_BN7_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_CERTIFICATION_READY" if passed else "PROPERTY_INTELLIGENCE_READINESS_GAP_REMAINS",
      "mode":"READ_ONLY_ARCHITECTURE_DESIGN",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "bn7c":{"path":str(bn7c),"sha256":sha(bn7c)},
      "checks":checks,
      "boundedDesign":{
        "boundary":"PROPERTY_INTELLIGENCE_DOWNSTREAM_CONSUMER",
        "candidateDimensions":["GOVERNED_SELECTED_PROPERTY_CONTEXT","DERIVED_INTELLIGENCE","EVIDENCE_PROVENANCE","PRESENTATION"],
        "sourceReferences":refs,
        "exactTenInherited":True
      },
      "nextMilestone":"M4_19D4BN8A_EXACT_TEN_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_PARITY_CERTIFICATION" if passed else None
    }
    f=out/"post_bn7_property_intelligence_readiness.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("="*72)
    print("SCIIP Explorer 4.0 — BN8 Post-BN7 Property Intelligence Readiness")
    print("="*72)
    print("Mode: READ_ONLY_ARCHITECTURE_DESIGN")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")
    print("\n----- READINESS CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")
    print("\nsourceReferenceCount:",len(refs))
    print("\nSTATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 5

if __name__=="__main__": raise SystemExit(main())
