import assert from'node:assert/strict';
import fs from'node:fs';
import{createEnterpriseIngestionCommand}from'../src/phase18-ingestion/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createEnterpriseIngestionCommand({
 orchestration:{jobs:[{jobId:'J1',status:'BLOCKED'}]},
 integrity:{relationships:[{relationshipId:'R1',passed:false}]},
 delta:{counts:{inserts:1}},
 rehearsal:{batches:[{batchId:'B1',passed:false}]},
 approvals:[{approvalId:'A1',status:'PENDING'}]
});
t(r.attentionCount===4);t(r.enterpriseIngestionReady);t(r.brokerApprovalRequired);t(!r.autonomousProductionCommitAllowed);t(!r.destructiveWritesAllowed);
const s=fs.readFileSync('src/components/LiveSuperSheetIngestionCenter.jsx','utf8');
t(s.includes('Live SuperSheet Ingestion & Enterprise Data Certification Center'));t(s.includes('LIVE INGESTION GOVERNANCE ACTIVE'));
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT293_ENTERPRISE_INGESTION_COMMAND_CENTER',status:'PASSED',testsRun:n,result:r},null,2));
