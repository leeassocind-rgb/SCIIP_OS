import assert from'node:assert/strict';
import{prepareAssignmentDelivery}from'../src/brokerage-operations/delivery/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=prepareAssignmentDelivery({
  assignmentId:'A1',
  evidence:[{evidenceId:'E1'}],
  sections:[
    {sectionId:'S1',title:'Summary',evidenceIds:[]},
    {sectionId:'S2',title:'Comparables',evidenceIds:['E1']}
  ]
});
t(r.assignmentId==='A1');t(r.total===2);t(r.ready===2);t(r.complete);t(r.sections.every(item=>item.brokerEditable));t(r.evidencePreserved);t(r.brokerReviewRequired);t(!r.autonomousPublishingAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT232_ASSIGNMENT_DELIVERY_REPORTING',status:'PASSED',testsRun:n,result:r},null,2));
