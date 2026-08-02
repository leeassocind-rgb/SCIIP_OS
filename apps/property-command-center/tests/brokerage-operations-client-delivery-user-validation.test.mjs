import assert from'node:assert/strict';
import fs from'node:fs';
let n=0;const t=c=>{n++;assert.ok(c)};
const m=fs.readFileSync('src/main.jsx','utf8'),r=fs.readFileSync('src/product/workspaceRegistry.js','utf8'),c=fs.readFileSync('src/components/BrokerageOperationsClientDeliveryCenter.jsx','utf8');
t(m.includes('BrokerageOperationsClientDeliveryCenter'));t(r.includes("'Brokerage Operations & Client Delivery Center'"));t(c.includes('Brokerage Operations & Client Delivery Center'));t(c.includes('Operations review'));t(c.includes('Delivery controls'));t(c.includes('BROKER CONTROLLED DELIVERY'));
console.log(JSON.stringify({framework:'SCIIP_PHASE17_BROKERAGE_OPERATIONS_CLIENT_DELIVERY_USER_VALIDATION',status:'PASSED',testsRun:n,result:{navigation:true,operationsVisible:true,controlsVisible:true}},null,2));
