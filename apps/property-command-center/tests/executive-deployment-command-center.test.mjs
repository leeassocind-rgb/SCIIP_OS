import assert from'node:assert/strict';
import fs from'node:fs';
import{createExecutiveDeploymentCommand}from'../src/enterprise-deployment/executive/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=createExecutiveDeploymentCommand({
 readiness:{checks:[{id:'G1',passed:false}]},
 adoption:{workspaceUsage:[{workspaceId:'W1',status:'UNUSED'}]},
 value:{initiatives:[{initiativeId:'I1',status:'VALUE_AT_RISK'}]},
 enablement:{plans:[{audienceId:'A1',status:'BLOCKED'}]},
 approvals:[{approvalId:'P1',status:'PENDING'}]
});
t(r.attentionCount===5);t(r.deploymentCommandReady);t(r.executiveReviewRequired);t(!r.autonomousDeploymentAllowed);t(!r.autonomousCommunicationAllowed);
const s=fs.readFileSync('src/components/EnterpriseDeploymentAdoptionValueCenter.jsx','utf8');
t(s.includes('Enterprise Deployment, Adoption & Value Realization Center'));t(s.includes('DEPLOYMENT GOVERNANCE ACTIVE'));
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT269_EXECUTIVE_DEPLOYMENT_COMMAND_CENTER',status:'PASSED',testsRun:n,result:r},null,2));
