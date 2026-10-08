#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime, timezone
import json,sys,hashlib

M="M4_19D4BN14_POST_CONSUMER_FAMILY_LIFECYCLE_RECONCILIATION_AND_NEXT_PHASE_READINESS"
CLOSURES=[
("BN8","M4_19D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSURE","governed_property_intelligence_consumer_lifecycle_closure.json","M419D4BN8C_GOVERNED_PROPERTY_INTELLIGENCE_CONSUMER_LIFECYCLE_CLOSED"),
("BN9","M4_19D4BN9C_R1_BN9A_AUTHORITY_METADATA_RECONCILIATION_AND_LIFECYCLE_CLOSURE","bn9a_authority_metadata_reconciliation_and_lifecycle_closure.json","M419D4BN9C_R1_GOVERNED_ANALYZE_PRESENT_CONSUMER_LIFECYCLE_CLOSED"),
("BN10","M4_19D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSURE","governed_explain_evidence_consumer_lifecycle_closure.json","M419D4BN10C_GOVERNED_EXPLAIN_EVIDENCE_CONSUMER_LIFECYCLE_CLOSED"),
("BN11","M4_19D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSURE","governed_export_presentation_consumer_lifecycle_closure.json","M419D4BN11C_GOVERNED_EXPORT_PRESENTATION_CONSUMER_LIFECYCLE_CLOSED"),
("BN12","M4_19D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSURE","governed_graph_relationship_consumer_lifecycle_closure.json","M419D4BN12C_GOVERNED_GRAPH_RELATIONSHIP_CONSUMER_LIFECYCLE_CLOSED"),
("BN13","M4_19D4BN13C_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CLOSURE","governed_deep_link_context_restore_consumer_lifecycle_closure.json","M419D4BN13C_GOVERNED_DEEP_LINK_CONTEXT_RESTORE_CONSUMER_LIFECYCLE_CLOSED")
]
def sha(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def main():
 if len(sys.argv)!=2:return 2
 repo=Path(sys.argv[1]).expanduser().resolve(); ev=repo/"apps/property-command-center/evidence/explorer4"
 print("="*94);print("SCIIP Explorer 4.0 — BN14 Post-Consumer-Family Lifecycle Reconciliation");print("="*94)
 print("Mode: READ_ONLY_PHASE_RECONCILIATION\nApplication source mutation: OFF\nGoverned data mutation: OFF\nNetwork authority: OFF\nPixel evidence: OFF")
 checks={}; evidence={}; states={}
 for bn,d,f,state in CLOSURES:
  p=ev/d/f
  present=p.is_file(); checks[f"{bn.lower()}ClosureEvidencePresent"]=present
  if present:
   x=json.loads(p.read_text()); evidence[bn]={"path":str(p),"sha256":sha(p)}
   checks[f"{bn.lower()}ClosurePassed"]=x.get("status")=="PASSED"
   checks[f"{bn.lower()}ClosureStateCertified"]=x.get("state")==state
   auth=x.get("authority") or {}
   checks[f"{bn.lower()}ApplicationMutationOff"]=auth.get("applicationSourceMutation") is False
   checks[f"{bn.lower()}GovernedMutationOff"]=auth.get("governedDataMutation") is False
   states[bn]=x.get("state")
  else:
   checks[f"{bn.lower()}ClosurePassed"]=False;checks[f"{bn.lower()}ClosureStateCertified"]=False
   checks[f"{bn.lower()}ApplicationMutationOff"]=False;checks[f"{bn.lower()}GovernedMutationOff"]=False
 checks["allSixConsumerFamiliesClosed"]=all(checks.get(f"bn{i}ClosurePassed") and checks.get(f"bn{i}ClosureStateCertified") for i in range(8,14))
 checks["noMutationAuthority"]=all(checks.get(f"bn{i}ApplicationMutationOff") and checks.get(f"bn{i}GovernedMutationOff") for i in range(8,14))
 passed=all(checks.values())
 result={"framework":"SCIIP_EXPLORER_4_BN14_POST_CONSUMER_FAMILY_LIFECYCLE_RECONCILIATION",
 "generatedAt":datetime.now(timezone.utc).isoformat(),"status":"PASSED" if passed else "BLOCKED",
 "state":"M419D4BN14_POST_CONSUMER_FAMILY_LIFECYCLE_RECONCILIATION_CERTIFIED" if passed else "M419D4BN14_RECONCILIATION_INCOMPLETE",
 "diagnosis":"BN8_THROUGH_BN13_GOVERNED_DOWNSTREAM_CONSUMER_FAMILIES_CERTIFIED_CLOSED_AND_NEXT_PHASE_READY" if passed else "POST_CONSUMER_FAMILY_RECONCILIATION_PRECONDITION_FAILED",
 "mode":"READ_ONLY_PHASE_RECONCILIATION","authority":{"applicationSourceMutation":False,"governedDataMutation":False,"networkAuthority":False,"pixelEvidence":False},
 "checks":checks,"closedConsumerFamilies":["PROPERTY_INTELLIGENCE","ANALYZE_PRESENT","EXPLAIN_EVIDENCE","EXPORT_PRESENTATION","GRAPH_RELATIONSHIP","DEEP_LINK_CONTEXT_RESTORE"] if passed else [],
 "closureStates":states,"evidence":evidence,
 "next":"M4_19D4BN14A_BOUNDED_NEXT_PHASE_ARCHITECTURE_AND_EXPANSION_READINESS_DESIGN" if passed else "BN14_REMAINS_OPEN"}
 out=ev/M;out.mkdir(parents=True,exist_ok=True);f=out/"post_consumer_family_lifecycle_reconciliation.json";f.write_text(json.dumps(result,indent=2)+"\n")
 print("\n----- RECONCILIATION CHECKS -----")
 for k,v in checks.items():print(f"{k}: {v}")
 print("\n----- CLOSED CONSUMER FAMILIES -----")
 for x in result["closedConsumerFamilies"]:print(x)
 print("\nSTATUS:",result["status"]);print("STATE:",result["state"]);print("DIAGNOSIS:",result["diagnosis"]);print("NEXT_MILESTONE:",result["next"]);print("EVIDENCE:",f)
 return 0 if passed else 5
if __name__=="__main__":raise SystemExit(main())
# noMutationAuthority
