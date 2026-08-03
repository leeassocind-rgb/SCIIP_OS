import assert from 'node:assert/strict';
import { aggregateEnterpriseRisk } from '../src/enterprise-assurance/risk/index.js';

let n=0;const t=c=>{n++;assert.ok(c)};
const r=aggregateEnterpriseRisk({risks:[
  {riskId:'R1',likelihood:90,impact:95,velocity:80},
  {riskId:'R2',likelihood:40,impact:50,velocity:30}
]});

t(r.total===2);
t(r.highOrCritical===1);
t(r.topRisk.riskId==='R1');
t(r.topRisk.severity==='CRITICAL');
t(r.crossDomain);
t(r.evidenceBacked);
t(r.permanentHistory);
t(!r.autonomousMitigationAllowed);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE17_SPRINT253_ENTERPRISE_RISK_AGGREGATION',
  status:'PASSED',
  testsRun:n,
  result:r
},null,2));
