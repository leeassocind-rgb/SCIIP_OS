import assert from'node:assert/strict';
import fs from'node:fs';
import{createProductionOperationsModel}from'../src/production-operations/command-center/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const model=createProductionOperationsModel({
 runtime:{status:'OPERATIONAL'},
 ingestion:{status:'OPERATIONAL',throughputPerMinute:120,queueDepth:3},
 knowledgeGraph:{status:'SYNCHRONIZED',nodes:5000},
 aiServices:{status:'OPERATIONAL',requestsPerMinute:20},
 search:{status:'READY',latencyMs:45},
 eventPipeline:{status:'OPERATIONAL',lagMs:80},
 storage:{status:'HEALTHY',utilizationPct:62},
 approvals:{pending:2}
});
t(model.health==='OPERATIONAL');
t(model.servicesOperational===7);
t(model.servicesTotal===7);
t(model.ingestionThroughputPerMinute===120);
t(model.queueDepth===3);
t(model.knowledgeGraphNodes===5000);
t(model.pendingApprovals===2);
t(model.operationalControls==='READ_ONLY');
t(model.productionWritesGoverned);
t(!model.autonomousExecutionAllowed);

const source=fs.readFileSync('src/components/ProductionOperationsCommandCenter.jsx','utf8');
t(source.includes('Production Operations Command Center'));
t(source.includes('READ-ONLY CONTROLS'));

console.log(JSON.stringify({
 framework:'SCIIP_PHASE15_SPRINT148_PRODUCTION_OPERATIONS_COMMAND_CENTER',
 status:'PASSED',testsRun:n,result:model
},null,2));
