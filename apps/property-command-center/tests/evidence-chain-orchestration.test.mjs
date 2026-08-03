import assert from'node:assert/strict';
import{orchestrateEvidenceChains}from'../src/phase18-decision/evidence/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=orchestrateEvidenceChains({
 claims:[{claimId:'C1'},{claimId:'C2'}],
 evidence:[{evidenceId:'E1',confidence:.9},{evidenceId:'E2',confidence:.7}],
 links:[{claimId:'C1',evidenceId:'E1'},{claimId:'C1',evidenceId:'E2'}]
});
t(r.total===2);t(r.supported===1);t(r.unsupported===1);t(r.chains[0].confidence===.8);t(r.chainOfCustodyPreserved);t(!r.autonomousEvidenceMutationAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT302_EVIDENCE_CHAIN_ORCHESTRATION',status:'PASSED',testsRun:n,result:r},null,2));
