import assert from'node:assert/strict';
import fs from'node:fs';
import{createBrokerageOperationsReview}from'../src/brokerage-operations/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createBrokerageOperationsReview({
 communications:[{communicationId:'C1',status:'INSUFFICIENT_EVIDENCE'}],
 workflows:[{stepId:'S1',status:'BLOCKED'}],
 milestones:[{milestoneId:'M1',atRisk:true}],
 deliveries:[{sectionId:'D1',status:'BLOCKED'}],
 approvals:[{approvalId:'A1',status:'PENDING'}]
});
t(r.attentionCount===5);t(r.communications.length===1);t(r.workflows.length===1);t(r.milestones.length===1);t(r.deliveries.length===1);t(r.evidenceBacked);t(r.brokerReviewRequired);t(!r.autonomousExecutionAllowed);t(!r.autonomousPublishingAllowed);
const s=fs.readFileSync('src/components/BrokerageOperationsClientDeliveryCenter.jsx','utf8');
t(s.includes('Brokerage Operations & Client Delivery Center'));t(s.includes('BROKER CONTROLLED DELIVERY'));
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT233_BROKERAGE_OPERATIONS_REVIEW_CENTER',status:'PASSED',testsRun:n,result:r},null,2));
