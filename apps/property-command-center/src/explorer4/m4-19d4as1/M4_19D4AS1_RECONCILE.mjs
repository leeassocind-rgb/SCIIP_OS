#!/usr/bin/env node
import fs from "node:fs"; import path from "node:path";
import {VERSION,CONTRACT,kind,eligible} from "./M419D4AS1Runtime.js";
const repo=path.resolve(process.argv[2]||".");
const app=path.join(repo,"apps/property-command-center"), ev=path.join(app,"evidence");
const asPath=path.join(ev,"m4-19d4as-market-availability-source-authority-selection-contract-definition.json");
const invPath=path.join(ev,"m4-19d4as-market-availability-source-inventory.json");
const outPath=path.join(ev,"m4-19d4as1-market-availability-source-precedence-reconciliation.json");
const auditPath=path.join(ev,"m4-19d4as1-candidate-role-reclassification-audit.json");
const contractPath=path.join(ev,"m4-19d4as1-market-availability-source-precedence-contract.json");
const write=(p,x)=>fs.writeFileSync(p,JSON.stringify(x,null,2)+"\n");
function finish(status,state,extra={},code=0){
 const o={contract:CONTRACT,version:VERSION,status,state,certifiedAt:new Date().toISOString(),...extra,
 authorityClosure:{temporalWriteAuthority:false,canonicalWriteAuthority:false,identityWriteAuthority:false,externalObservationIngestionAuthority:false,refreshExecutionAuthority:false,operationalIngestionAuthority:false,syncAuthority:false,propagationAuthority:false,automaticRetry:false},
 safety:{networkRequestsPerformed:0,sourceMutationPerformed:false,canonicalMutationPerformed:false,temporalMutationPerformed:false,identityMutationPerformed:false,operationalIngestionPerformed:false,availabilityObservationIngested:false,automaticRetry:false}};
 write(outPath,o); console.log(JSON.stringify(o,null,2)); process.exit(code);
}
if(!fs.existsSync(asPath)||!fs.existsSync(invPath)) finish("BLOCKED","M419D4AS1_AS_ARTIFACTS_REQUIRED",{},3);
const as=JSON.parse(fs.readFileSync(asPath,"utf8")), inv=JSON.parse(fs.readFileSync(invPath,"utf8"));
if(as.state!=="M419D4AS_MULTIPLE_HIGHEST_AUTHORITY_MARKET_AVAILABILITY_SOURCE_CANDIDATES_REQUIRE_RECONCILIATION")
 finish("BLOCKED","M419D4AS1_MULTIPLE_CANDIDATE_AS_STATE_REQUIRED",{observed:as.state},3);

const src=inv.highestAuthorityCandidates||[];
const reclassified=src.map(c=>{
 const role=kind(c.path);
 const isEligible=eligible(role);
 const reason = role==="EVIDENCE_OR_GOVERNANCE_ARTIFACT" ? "Mentions availability policy/provenance but is not a fresh market observation source"
 : role==="MILESTONE_IMPLEMENTATION" ? "Implementation code defines or processes semantics; it is not provider evidence"
 : role==="APPLICATION_CODE" ? "UI/engine code may reference availability but is not itself market evidence"
 : role==="FIXTURE_DEMO_OR_TEST" ? "Fixture/demo/test content is non-production evidence"
 : role==="GOVERNED_BASE_INVENTORY" ? "Persistent governed inventory dataset; eligible for exact provenance inspection"
 : role==="DATASET_OR_MARKET_DATA" ? "Data-bearing source; eligible for exact provenance inspection"
 : "No source-native observation authority proven";
 return {...c,role,isEligibleForAuthority: isEligible,reason};
});
const eligibleCandidates=reclassified.filter(x=>x.isEligibleForAuthority);
write(auditPath,{contract:"SCIIP_EXPLORER_4_M4_19D4AS1_CANDIDATE_ROLE_RECLASSIFICATION_AUDIT",version:VERSION,generatedAt:new Date().toISOString(),originalHighestCandidateCount:src.length,reclassified});

const precedence={
 contract:"SCIIP_EXPLORER_4_M4_19D4AS1_MARKET_AVAILABILITY_SOURCE_PRECEDENCE_CONTRACT",
 version:VERSION,generatedAt:new Date().toISOString(),
 rule:"SOURCE ROLE AND PROVENANCE PRECEDE FILENAME OR SEMANTIC TOKEN MATCHES",
 authorityRequirements:[
  "Data-bearing source rather than code, test, fixture, policy, or evidence artifact",
  "Source-native current market availability assertion",
  "Stable source/provider identity",
  "Observation timestamp or freshness evidence",
  "Exact source-native field path",
  "Property identity match evidence"
 ],
 exclusions:["APPLICATION_CODE","MILESTONE_IMPLEMENTATION","FIXTURE_DEMO_OR_TEST","EVIDENCE_OR_GOVERNANCE_ARTIFACT"],
 missingAvailabilityDoesNotMeanZero:true,
 buildingAreaSubstitutionProhibited:true,
 executionAuthorized:false
};
write(contractPath,precedence);

let state,next;
if(eligibleCandidates.length===1){
 state="M419D4AS1_FALSE_POSITIVE_AUTHORITY_CANDIDATES_REMOVED_SINGLE_DATA_BEARING_CANDIDATE_REMAINS_EXACT_PROVENANCE_INSPECTION_REQUIRED";
 next="M4.19D4AT_MARKET_AVAILABILITY_SOURCE_CANDIDATE_EXACT_BINDING_AND_OBSERVATION_PREAUTHORIZATION";
}else if(eligibleCandidates.length>1){
 state="M419D4AS1_FALSE_POSITIVE_AUTHORITY_CANDIDATES_REMOVED_MULTIPLE_DATA_BEARING_CANDIDATES_REQUIRE_EXACT_PROVENANCE_RECONCILIATION";
 next="M4.19D4AS2_DATA_BEARING_MARKET_AVAILABILITY_CANDIDATE_EXACT_PROVENANCE_RECONCILIATION";
}else{
 state="M419D4AS1_FALSE_POSITIVE_AUTHORITY_CANDIDATES_REMOVED_NO_DATA_BEARING_AUTHORITY_PROVEN_OPERATOR_SOURCE_SELECTION_REQUIRED";
 next="M4.19D4AS2_OPERATOR_MARKET_AVAILABILITY_SOURCE_SELECTION_AND_BINDING";
}
finish("PASSED",state,{
 reconciliation:{
  originalHighestAuthorityCandidateCount:src.length,
  excludedFalsePositiveCount:src.length-eligibleCandidates.length,
  eligibleDataBearingCandidateCount:eligibleCandidates.length,
  eligibleCandidates
 },
 policy:{
  filenameKeywordAuthorityInferenceProhibited:true,
  semanticTokenPresenceAloneInsufficient:true,
  codeAndGovernanceArtifactsCannotBeFreshAvailabilityAuthority:true,
  exactProvenanceRequiredBeforeObservationRead:true,
  networkRequestsPerformed:0
 },
 artifacts:{candidateRoleReclassificationAudit:auditPath,sourcePrecedenceContract:contractPath},
 nextMilestone:next
});
