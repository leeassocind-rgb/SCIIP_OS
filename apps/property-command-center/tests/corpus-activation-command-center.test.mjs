import assert from'node:assert/strict';
import fs from'node:fs';
import{createCorpusActivationCommand}from'../src/phase18-corpus/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createCorpusActivationCommand({
 activation:{datasets:[{datasetId:'D1',eligible:false}]},
 identity:{identities:[{canonicalId:'C1',reviewRequired:true}]},
 synchronization:{
  events:[{eventId:'E1',linked:false}],
  relationships:[{relationshipId:'R1',synchronized:false}]
 },
 graph:{missingNodes:[{id:'N1'}]},
 approvals:[{approvalId:'A1',status:'PENDING'}]
});
t(r.attentionCount===6);t(r.corpusActivationReady);t(r.executiveApprovalRequired);t(!r.autonomousActivationAllowed);t(!r.autonomousGraphMutationAllowed);
const source=fs.readFileSync('src/components/ProductionCorpusIdentityGraphCenter.jsx','utf8');
t(source.includes('Production Corpus, Identity & Knowledge Graph Center'));t(source.includes('CORPUS GOVERNANCE ACTIVE'));
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT299_CORPUS_ACTIVATION_COMMAND_CENTER',status:'PASSED',testsRun:n,result:r},null,2));
