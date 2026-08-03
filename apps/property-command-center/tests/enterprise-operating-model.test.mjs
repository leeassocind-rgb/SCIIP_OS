import assert from'node:assert/strict';
import{buildEnterpriseOperatingModel}from'../src/enterprise-operating-model/model/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=buildEnterpriseOperatingModel({
 domains:[{domainId:'D1'},{domainId:'D2'}],
 roles:[{domainId:'D1',name:'Owner',accountability:'ACCOUNTABLE'}],
 cadences:[{domainId:'D1',cadence:'WEEKLY'}]
});
t(r.total===2);t(r.defined===1);t(r.incomplete===1);t(r.domains[0].accountableOwner==='Owner');t(r.accountabilityVisible);t(r.operatingCadenceVisible);t(!r.autonomousAuthorityChangesAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE17_SPRINT277_ENTERPRISE_OPERATING_MODEL',status:'PASSED',testsRun:n,result:r},null,2));
