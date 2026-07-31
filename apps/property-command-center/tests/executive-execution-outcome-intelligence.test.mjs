import assert from 'node:assert/strict';
import { classifyExecutiveOutcome, calculateExecutiveOutcomeMetrics, createExecutiveOutcomeSummary, createExecutiveOutcomeSignal, aggregateExecutiveOutcomeTimeline, createExecutiveOutcomeIntelligence } from '../src/executive-actions/outcomes/index.js';
let testsRun=0; const test=(name,fn)=>{fn();testsRun++;};
const base={workflowRequestId:'WF-200',workflowId:'ENGINE-200',proposalId:'PROP-200',approvalId:'APR-200',sourceSignalIds:['SIG-200']};
const timeline=[
  {...base,sequence:1,status:'ACCEPTED',occurredAt:'2026-07-31T16:00:00.000Z',evidenceIds:[]},
  {...base,sequence:2,status:'RUNNING',occurredAt:'2026-07-31T16:01:00.000Z',evidenceIds:[]},
  {...base,sequence:3,status:'COMPLETED',occurredAt:'2026-07-31T16:06:00.000Z',evidenceIds:['EV-200']}
];
test('completed classification',()=>assert.equal(classifyExecutiveOutcome({status:'COMPLETED',evidenceCount:1}).classification,'COMPLETED'));
test('failed classification',()=>assert.equal(classifyExecutiveOutcome({status:'FAILED'}).requiresReview,true));
test('cancelled classification',()=>assert.equal(classifyExecutiveOutcome({status:'CANCELLED'}).classification,'CANCELLED'));
test('partial classification',()=>assert.equal(classifyExecutiveOutcome({status:'FAILED',completedSteps:2,totalSteps:3}).classification,'PARTIALLY_COMPLETED'));
test('in progress classification',()=>assert.equal(classifyExecutiveOutcome({status:'RUNNING'}).terminal,false));
const summary=aggregateExecutiveOutcomeTimeline({timeline,evidenceCount:1});
test('timeline aggregation',()=>assert.equal(summary.classification,'COMPLETED'));
test('duration calculation',()=>assert.equal(summary.durationMs,300000));
test('traceability retained',()=>assert.deepEqual(summary.sourceSignalIds,['SIG-200']));
test('immutable summary',()=>assert.equal(Object.isFrozen(summary),true));
const signal=createExecutiveOutcomeSignal(summary);
test('governed signal',()=>assert.equal(signal.signalType,'EXECUTIVE_EXECUTION_OUTCOME'));
test('completed signal severity',()=>assert.equal(signal.severity,'INFO'));
test('autonomous execution disabled',()=>assert.equal(signal.autonomousExecutionAllowed,false));
const explicit=createExecutiveOutcomeSummary({...base,classification:'FAILED',durationMs:10,evidenceCount:1,requiresReview:true});
test('summary factory',()=>assert.equal(explicit.requiresReview,true));
const metrics=calculateExecutiveOutcomeMetrics([summary,explicit]);
test('metrics total',()=>assert.equal(metrics.totalOutcomes,2));
test('metrics success rate',()=>assert.equal(metrics.successRatePct,50));
test('metrics evidence coverage',()=>assert.equal(metrics.evidenceCoveragePct,100));
const engine=createExecutiveOutcomeIntelligence({maxOutcomes:2});
test('engine ready',()=>assert.equal(engine.snapshot().status,'READY'));
test('engine start',()=>assert.equal(engine.start().status,'OPERATIONAL'));
const generated=engine.analyze({outcomeEventId:'OE-1',timeline,evidenceCount:1});
test('outcome generated',()=>assert.equal(generated.status,'OUTCOME_GENERATED'));
test('duplicate suppression',()=>assert.equal(engine.analyze({outcomeEventId:'OE-1',timeline}).status,'DUPLICATE_IGNORED'));
test('non terminal ignored',()=>assert.equal(engine.analyze({outcomeEventId:'OE-2',workflowRequestId:'WF-201',timeline:[{...base,workflowRequestId:'WF-201',sequence:1,status:'RUNNING'}]}).status,'NON_TERMINAL_IGNORED'));
test('stop lifecycle',()=>assert.equal(engine.stop().status,'STOPPED'));
const snap=engine.snapshot('STOPPED');
console.log(JSON.stringify({framework:'SCIIP_PHASE2_SPRINT4_EXECUTIVE_EXECUTION_OUTCOME_INTELLIGENCE',status:'PASSED',testsRun,result:{status:'STOPPED',outcomesGenerated:snap.outcomesGenerated,retainedOutcomes:snap.retainedOutcomes,duplicatesIgnored:snap.duplicatesIgnored,nonTerminalIgnored:snap.nonTerminalIgnored,failures:snap.failures,outcomeClassification:generated.summary.classification,successRatePct:engine.getMetrics().successRatePct,evidenceCoveragePct:engine.getMetrics().evidenceCoveragePct,workflowMutationAllowed:snap.workflowMutationAllowed,autonomousExecutionAllowed:snap.autonomousExecutionAllowed,decisionTraceability:snap.decisionTraceability}},null,2));
