import assert from'node:assert/strict';
import{
  createExecutiveGovernanceRuntimeIntegrationEngine,
  createExecutiveGovernanceRuntimeSignal,
  createExecutiveGovernanceRuntimeIntegrationLedger
}from'../src/executive-actions/runtime-integration/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const calls={registry:0,bus:0,runtime:0,insight:0,command:0,workflow:0,graph:0};
const ports={
  signalRegistry:{register(descriptor){calls.registry++;return descriptor.id}},
  signalBus:{publish(type,signal){calls.bus++;return{type,id:signal.id}}},
  executiveRuntime:{project(id,projection){calls.runtime++;return{id,status:projection.status}}},
  executiveInsight:{ingest(insight){calls.insight++;return insight.id}},
  commandCenter:{updateSection(section,state){calls.command++;return{section,id:state.id}}},
  workflowEngine:{submitProposal(handoff){calls.workflow++;return{accepted:true,id:handoff.id}}},
  knowledgeGraph:{appendProjection(projection){calls.graph++;return{entities:projection.entities.length}}}
};

const submission={
  id:'SUBMIT:REVIEW-24-1',
  proposalId:'GOV-PROP:LEDGER:DEC-1',
  envelopeId:'ENV:BRIDGE-23-1',
  targetCapability:'executive-action-orchestration',
  submittedBy:'EXEC-2',
  submissionStatus:'SUBMITTED_TO_EXISTING_ORCHESTRATOR',
  payload:{
    proposalType:'GOVERNANCE_POLICY_REVALIDATION',
    title:'Revalidate governance policy',
    description:'Policy drift detected.',
    priorityScore:68,
    confidence:68,
    subjectId:'INITIATIVE-1',
    certificationId:'CERT-19-1',
    recommendationId:'REC-1',
    decisionId:'LEDGER:DEC-1'
  },
  evidenceIds:['EV-1','EV-2','EV-APPROVAL'],
  sourceSignalIds:['SIG-21','SIG-22','SIG-24'],
  humanApprovalRecorded:true,
  executionAuthorized:false,
  workflowMutationAllowed:false,
  autonomousExecutionAllowed:false
};

const engine=createExecutiveGovernanceRuntimeIntegrationEngine({
  ports,maxEntries:2,clock:()=> '2026-07-31T21:00:00.000Z'
});
t(engine.getStatus().status==='OPERATIONAL');
t(engine.getStatus().appendOnly);
t(engine.getStatus().dependencyInjection);
t(!engine.getStatus().executionAuthorized);
t(!engine.getStatus().workflowMutationAllowed);
t(!engine.getStatus().autonomousExecutionAllowed);

const result=engine.integrate({id:'INT-25-1',submission});
const i=result.integration;
t(!result.duplicate);
t(i.id==='INT-25-1');
t(i.submissionId==='SUBMIT:REVIEW-24-1');
t(i.signal.type==='EXECUTIVE_GOVERNANCE_ACTION_PROPOSAL_SUBMITTED');
t(i.signal.proposalId==='GOV-PROP:LEDGER:DEC-1');
t(i.signal.emittedAt==='2026-07-31T21:00:00.000Z');
t(i.signal.humanApprovalRecorded);
t(!i.signal.executionAuthorized);
t(i.registry.registered);
t(i.signalBus.published);
t(i.runtime.projected);
t(i.insightResult.exposed);
t(i.commandCenter.updated);
t(i.workflow.submitted);
t(i.knowledgeGraph.projected);
t(i.connectedPorts===7);
t(i.totalPorts===7);
t(i.integrationStatus==='FULLY_INTEGRATED');
t(i.projection.status==='AWAITING_EXISTING_ORCHESTRATOR_PROCESSING');
t(i.insight.reviewRequired);
t(i.commandState.section==='Governance Actions');
t(i.commandState.status==='AWAITING_EXISTING_ORCHESTRATOR_PROCESSING');
t(i.workflowHandoff.target==='existing-workflow-engine');
t(i.workflowHandoff.status==='READY_FOR_EXISTING_WORKFLOW_ENGINE_INTAKE');
t(!i.workflowHandoff.executionAuthorized);
t(i.graphProjection.entities.length===4);
t(i.graphProjection.relationships.length===3);
t(i.graphProjection.appendOnly);
t(i.graphProjection.evidenceIds.length===3);
t(i.graphProjection.sourceSignalIds.length===3);
t(!i.executionAuthorized);
t(!i.workflowMutationAllowed);
t(!i.autonomousExecutionAllowed);
t(Object.isFrozen(i));
t(Object.isFrozen(i.signal));
t(Object.isFrozen(i.graphProjection));
t(calls.registry===1);
t(calls.bus===1);
t(calls.runtime===1);
t(calls.insight===1);
t(calls.command===1);
t(calls.workflow===1);
t(calls.graph===1);
t(engine.getIntegrations().length===1);
t(engine.getIntegrations()[0].sequence===1);

const duplicate=engine.integrate({id:'INT-25-1',submission});
t(duplicate.duplicate);
t(duplicate.integration===i);
t(calls.bus===1);

const disconnected=createExecutiveGovernanceRuntimeIntegrationEngine({clock:()=> '2026-07-31T21:01:00.000Z'});
const d=disconnected.integrate({
  id:'INT-25-2',
  submission:{...submission,id:'SUBMIT:REVIEW-24-2',proposalId:'P-2'}
}).integration;
t(d.connectedPorts===0);
t(d.integrationStatus==='ADAPTERS_READY_NO_PORTS_CONNECTED');
t(!d.registry.registered);
t(!d.signalBus.published);
t(!d.runtime.projected);
t(!d.insightResult.exposed);
t(!d.commandCenter.updated);
t(!d.workflow.submitted);
t(!d.knowledgeGraph.projected);

const signal=createExecutiveGovernanceRuntimeSignal({submission,clock:()=> 'T'});
t(signal.id==='EXEC-SIGNAL:SUBMIT:REVIEW-24-1');
let invalid=false;
try{
  createExecutiveGovernanceRuntimeSignal({submission:{...submission,executionAuthorized:true}})
}catch{invalid=true}
t(invalid);

const ledger=createExecutiveGovernanceRuntimeIntegrationLedger({maxEntries:1});
t(!ledger.append({id:'L1',submissionId:'S1'}).duplicate);
t(ledger.append({id:'L1',submissionId:'S1'}).duplicate);
t(ledger.append({id:'L2',submissionId:'S1'}).duplicate);
t(!ledger.append({id:'L3',submissionId:'S3'}).duplicate);
t(ledger.list().length===1);
t(ledger.list()[0].id==='L3');
t(ledger.getStatus().appendOnly);

engine.stop();
t(engine.getStatus().status==='STOPPED');
let stopped=false;
try{engine.integrate({id:'STOP',submission:{...submission,id:'STOP-S'}})}catch{stopped=true}
t(stopped);
engine.start();
t(engine.getStatus().status==='OPERATIONAL');

console.log(JSON.stringify({
  framework:'SCIIP_PHASE2_SPRINT25_EXECUTIVE_RUNTIME_INTEGRATION',
  status:'PASSED',
  testsRun:tests,
  result:{
    integrations:engine.getIntegrations().length,
    connectedPorts:i.connectedPorts,
    signalPublished:i.signalBus.published,
    runtimeProjected:i.runtime.projected,
    insightExposed:i.insightResult.exposed,
    commandCenterUpdated:i.commandCenter.updated,
    workflowSubmitted:i.workflow.submitted,
    knowledgeGraphProjected:i.knowledgeGraph.projected,
    integrationStatus:i.integrationStatus,
    executionAuthorized:false,
    workflowMutationAllowed:false,
    autonomousExecutionAllowed:false,
    decisionTraceability:true
  }
},null,2));
