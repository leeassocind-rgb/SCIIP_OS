import assert from 'node:assert/strict';
import { clearWorkflowStoreForTests, actionCenterSnapshot } from '../src/workflow/actionCenterService.js';
import { clearActionLedgerForTests } from '../src/workflow/actionLedger.js';
import { createExecutiveSignalBus } from '../src/executive-signals/executiveSignalBus.js';
import { createExecutiveSignal } from '../src/executive-signals/signalContract.js';
import { resetExecutiveSignalRegistry, getExecutiveSignalType } from '../src/executive-signals/executiveSignalRegistry.js';
import { WORKFLOW_SIGNAL_TYPES, createWorkflowRuntimeAdapter } from '../src/workflow/executive-signal-integration/index.js';

let tests=0; const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
clearWorkflowStoreForTests(); clearActionLedgerForTests(); resetExecutiveSignalRegistry();
const bus=createExecutiveSignalBus({maxHistory:50}); const received=[]; bus.subscribe(s=>received.push(s),{id:'workflow-test',filter:s=>s.source==='workflow-engine'});
const adapter=createWorkflowRuntimeAdapter({signalBus:bus});
t(adapter.snapshot().status==='OPERATIONAL');
t(getExecutiveSignalType(WORKFLOW_SIGNAL_TYPES.DRAFT_CREATED)!==null);
t(getExecutiveSignalType(WORKFLOW_SIGNAL_TYPES.APPROVAL_REQUIRED)!==null);
t(getExecutiveSignalType(WORKFLOW_SIGNAL_TYPES.STATUS_CHANGED)!==null);

const source=createExecutiveSignal({
 id:'EXEC-SIG-32-1',type:'MARKET_BROKER_REVIEW_REQUIRED',source:'market-intelligence',severity:'HIGH',
 occurredAt:'2026-07-31T22:00:00.000Z',assignmentId:'A-100',propertyId:'P-100',title:'Broker review required',
 summary:'Market evidence requires review.',evidence:[{id:'EV-32-1',type:'MARKET_BRIEF',source:'market-intelligence'}],
 actions:[{type:'HUMAN_REVIEW',autonomous:false}]
});
const result=adapter.consume(source);
t(result.created);
t(result.workflow.status==='DRAFT');
t(result.workflow.requiresApproval);
t(!result.workflow.autonomousExecution);
t(result.workflow.tasks.length===3);
t(result.derivedSignals.length===2);
t(result.derivedSignals.some(s=>s.type===WORKFLOW_SIGNAL_TYPES.DRAFT_CREATED));
t(result.derivedSignals.some(s=>s.type===WORKFLOW_SIGNAL_TYPES.APPROVAL_REQUIRED));
t(result.publications.every(p=>p.status==='PUBLISHED'));
t(received.length===2);
t(!result.executionAuthorized);
t(!result.workflowMutationAllowed);
t(!result.autonomousExecutionAllowed);

const duplicate=adapter.consume(source);
t(duplicate.status==='DUPLICATE_IGNORED');
t(adapter.snapshot().duplicatesIgnored===1);

const info=createExecutiveSignal({id:'EXEC-SIG-32-2',type:'INFORMATIONAL',source:'gis',severity:'INFO',occurredAt:'2026-07-31T22:01:00.000Z',assignmentId:'A-100'});
const ignored=adapter.consume(info);
t(ignored.status==='NON_ACTIONABLE_IGNORED');
t(adapter.snapshot().consumed===2);
t(adapter.snapshot().draftsCreated===1);
t(adapter.snapshot().published===2);
const center=actionCenterSnapshot('A-100');
t(center.counts.total===1);
t(center.workflows[0].status==='DRAFT');
t(center.history.length===1);

const connectedBus=createExecutiveSignalBus({maxHistory:20});
const connected=createWorkflowRuntimeAdapter({signalBus:connectedBus});
t(connected.connect());
connectedBus.publish(createExecutiveSignal({id:'EXEC-SIG-32-3',type:'GIS_SPATIAL_DATA_REVIEW_REQUIRED',source:'gis',severity:'HIGH',occurredAt:'2026-07-31T22:02:00.000Z',assignmentId:'A-200',actions:[{type:'HUMAN_REVIEW'}]}));
t(connected.snapshot().consumed===1);
t(connected.snapshot().draftsCreated===1);
connected.disconnect(); t(!connected.snapshot().connected);

adapter.stop();t(adapter.snapshot().status==='STOPPED');let stopped=false;try{adapter.consume(source)}catch{stopped=true}t(stopped);adapter.start();t(adapter.snapshot().status==='OPERATIONAL');

console.log(JSON.stringify({framework:'SCIIP_PHASE2_SPRINT32_WORKFLOW_ENGINE_RUNTIME_ADAPTER',status:'PASSED',testsRun:tests,result:{
 signalsConsumed:adapter.snapshot().consumed,draftsCreated:adapter.snapshot().draftsCreated,signalsPublished:adapter.snapshot().published,
 duplicatesIgnored:adapter.snapshot().duplicatesIgnored,approvalRequired:true,executionAuthorized:false,workflowMutationAllowed:false,
 autonomousExecutionAllowed:false,actionLedgerAppendOnly:true
}},null,2));
