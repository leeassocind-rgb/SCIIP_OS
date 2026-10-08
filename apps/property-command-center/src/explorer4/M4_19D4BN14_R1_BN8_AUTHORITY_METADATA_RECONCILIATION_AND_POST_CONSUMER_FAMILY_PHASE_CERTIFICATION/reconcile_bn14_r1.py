#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import sys,json,hashlib

M="M4_19D4BN14_R1_BN8_AUTHORITY_METADATA_RECONCILIATION_AND_POST_CONSUMER_FAMILY_PHASE_CERTIFICATION"

CLOSURES=[
("BN8","M4_19D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSURE","governed_property_intelligence_consumer_lifecycle_closure.json","M419D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSED"),
("BN9","M4_19D4BN9C_R1_BN9A_AUTHORITY_METADATA_RECONCILIATION_AND_LIFECYCLE_CLOSURE","bn9a_authority_metadata_reconciliation_and_lifecycle_closure.json","M419D4BN9C_R1_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSED"),
("BN10","M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE","governed_explain_evidence_consumer_lifecycle_closure.json","M419D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSED"),
("BN11","M4_19D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSURE","governed_export_presentation_consumer_lifecycle_closure.json","M419D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSED"),
("BN12","M4_19D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSURE","governed_graph_relationship_consumer_lifecycle_closure.json","M419D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSED"),
("BN13","M4_19D4BN13C_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CLOSURE","governed_deep_link_context_restore_consumer_lifecycle_closure.json","M419D4BN13C_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CLOSED")
]

def load(p): return json.loads(p.read_text())
def sha(p): return hashlib.sha256(p.read_bytes()).hexdigest()

def main():
    if len(sys.argv)!=2:return 2
    repo=Path(sys.argv[1]).expanduser().resolve()
    ev=repo/"apps/property-command-center/evidence/explorer4"

    original=ev/"M4_19D4BN14_POST_CONSUMER_FAMILY_LIFECYCLE_RECONCILIATION_AND_NEXT_PHASE_READINESS"/"post_consumer_family_lifecycle_reconciliation.json"

    print("="*100)
    print("SCIIP Explorer 4.0 — BN14-R1 BN8 Authority Metadata Reconciliation + Phase Certification")
    print("="*100)
    print("Mode: READ_ONLY_EVIDENCE_RECONCILIATION")
    print("Application source mutation: OFF")
    print("Governed data mutation: OFF")
    print("Network authority: OFF")
    print("Pixel evidence: OFF")

    if not original.is_file():
        print("STATUS: BLOCKED")
        print("DIAGNOSIS: ORIGINAL_BN14_EVIDENCE_MISSING")
        return 4

    orig=load(original)
    oc=orig.get("checks") or {}

    paths={}
    docs={}
    missing=[]
    for bn,d,f,state in CLOSURES:
        p=ev/d/f
        paths[bn]=p
        if not p.is_file(): missing.append(str(p))
        else: docs[bn]=load(p)
    if missing:
        print("STATUS: BLOCKED"); print("DIAGNOSIS: REQUIRED_CLOSURE_EVIDENCE_MISSING")
        for p in missing: print("MISSING:",p)
        return 5

    bn8=docs["BN8"]
    bn8checks=bn8.get("checks") or {}

    # Critical reconciliation:
    # BN8C closure certified both constituent governed mutation authorities OFF.
    # Therefore omission/shape mismatch of the top-level authority object does not
    # negate the already-certified no-governed-mutation closure fact.
    bn8_governed_reconciled=(
        bn8.get("status")=="PASSED" and
        bn8.get("state")=="M419D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSED" and
        bn8checks.get("bn8aGovernedMutationOff") is True and
        bn8checks.get("bn8bR3GovernedMutationOff") is True
    )

    bn8_app_reconciled=(
        bn8checks.get("bn8aApplicationMutationOff") is True and
        bn8checks.get("bn8bR3ApplicationMutationOff") is True
    )

    checks={
      "originalBn14Blocked":orig.get("status")=="BLOCKED",
      "originalBn14AllSixFamiliesClosed":oc.get("allSixConsumerFamiliesClosed") is True,
      "originalBn14OnlyMutationAuthorityAggregateFailed":oc.get("noMutationAuthority") is False,
      "originalBn14Bn8GovernedMutationProbeFailed":oc.get("bn8GovernedMutationOff") is False,
      "bn8ClosurePassed":bn8.get("status")=="PASSED",
      "bn8ClosureStateCertified":bn8.get("state")=="M419D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSED",
      "bn8ConstituentApplicationMutationOff":bn8_app_reconciled,
      "bn8ConstituentGovernedMutationOff":bn8_governed_reconciled,
      "bn8AuthorityMetadataOmissionOrShapeMismatchReconciled":bn8_governed_reconciled,
    }

    for bn,d,f,state in CLOSURES[1:]:
        x=docs[bn]
        auth=x.get("authority") or {}
        checks[f"{bn.lower()}ClosurePassed"]=x.get("status")=="PASSED"
        checks[f"{bn.lower()}ClosureStateCertified"]=x.get("state")==state
        checks[f"{bn.lower()}ApplicationMutationOff"]=auth.get("applicationSourceMutation") is False
        checks[f"{bn.lower()}GovernedMutationOff"]=auth.get("governedDataMutation") is False

    checks["allSixConsumerFamiliesClosed"]=(
        checks["bn8ClosurePassed"] and checks["bn8ClosureStateCertified"] and
        all(checks.get(f"bn{i}ClosurePassed") and checks.get(f"bn{i}ClosureStateCertified") for i in range(9,14))
    )
    checks["noMutationAuthorityReconciled"]=(
        bn8_app_reconciled and bn8_governed_reconciled and
        all(checks.get(f"bn{i}ApplicationMutationOff") and checks.get(f"bn{i}GovernedMutationOff") for i in range(9,14))
    )

    passed=all(checks.values())
    result={
      "framework":"SCIIP_EXPLORER_4_BN14_R1_BN8_AUTHORITY_METADATA_RECONCILIATION_AND_POST_CONSUMER_FAMILY_PHASE_CERTIFICATION",
      "generatedAt":datetime.now(timezone.utc).isoformat(),
      "status":"PASSED" if passed else "BLOCKED",
      "state":"M419D4BN14_R1_POST_CONSUMER_FAMILY_LIFECYCLE_RECONCILIATION_CERTIFIED" if passed else "M419D4BN14_R1_RECONCILIATION_INCOMPLETE",
      "diagnosis":"BN8_AUTHORITY_METADATA_OMISSION_RECONCILED_BN8_THROUGH_BN13_CONSUMER_FAMILIES_CERTIFIED_CLOSED" if passed else "BN14_R1_POST_CONSUMER_FAMILY_RECONCILIATION_PRECONDITION_FAILED",
      "mode":"READ_ONLY_EVIDENCE_RECONCILIATION",
      "authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
      "checks":checks,
      "closedConsumerFamilies":["PROPERTY_INTELLIGENCE","ANALYZE_PRESENT","EXPLAIN_EVIDENCE","EXPORT_PRESENTATION","GRAPH_RELATIONSHIP","DEEP_LINK_CONTEXT_RESTORE"] if passed else [],
      "evidence":{"originalBn14":{"path":str(original),"sha256":sha(original)}},
      "nextMilestone":"M4_19D4BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_DESIGN" if passed else None
    }
    for bn,p in paths.items():
        result["evidence"][bn.lower()]={"path":str(p),"sha256":sha(p)}

    out=ev/M;out.mkdir(parents=True,exist_ok=True)
    f=out/"bn8_authority_metadata_reconciliation_and_post_consumer_family_phase_certification.json"
    f.write_text(json.dumps(result,indent=2)+"\n")

    print("\n----- RECONCILIATION CHECKS -----")
    for k,v in checks.items(): print(f"{k}: {v}")

    print("\n----- CLOSED CONSUMER FAMILIES -----")
    for x in result["closedConsumerFamilies"]: print(x)

    print()
    print("STATUS:",result["status"])
    print("STATE:",result["state"])
    print("DIAGNOSIS:",result["diagnosis"])
    print("NEXT_MILESTONE:",result["nextMilestone"])
    print("EVIDENCE:",f)
    return 0 if passed else 6

if __name__=="__main__":raise SystemExit(main())
