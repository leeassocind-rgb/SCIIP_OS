import assert from 'node:assert/strict';
import { createEnterpriseWorkflowOrchestrator } from '../src/enterprise-workflow/orchestrator/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const orchestrator=createEnterpriseWorkflowOrchestrator();
const workflow=orchestrator.createWorkflow({
  workflowId:'WF-1',
  name:'Opportunity Qualification',
  steps:[
    {stepId:'S1',capability:'GRAPH_ANALYSIS',workspace:'Enterprise Intelligence Workspace'},
    {stepId:'S2',capability:'GIS_REVIEW',workspace:'GIS Intelligence',dependsOn:['S1']},
    {stepId:'S3',capability:'PROPERTY_REVIEW',workspace:'Property Digital Twin',dependsOn:['S2']}
  ]
});

t(workflow.steps.length===3);
t(orchestrator.readySteps('WF-1').length===1);
t(orchestrator.readySteps('WF-1')[0].stepId==='S1');

orchestrator.updateStep({workflowId:'WF-1',stepId:'S1',status:'COMPLETED',evidence:[{source:'graph'}]});
t(orchestrator.readySteps('WF-1')[0].stepId==='S2');

orchestrator.updateStep({workflowId:'WF-1',stepId:'S2',status:'COMPLETED'});
orchestrator.updateStep({workflowId:'WF-1',stepId:'S3',status:'COMPLETED'});

t(orchestrator.read('WF-1').status==='COMPLETED');
t(orchestrator.snapshot().distributed);
t(orchestrator.snapshot().dependencyAware);
t(orchestrator.snapshot().sharedState);
t(!orchestrator.snapshot().executionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE11_SPRINT116_ENTERPRISE_WORKFLOW_ORCHESTRATOR',
  status:'PASSED',
  testsRun:tests,
  result:orchestrator.snapshot()
},null,2));
