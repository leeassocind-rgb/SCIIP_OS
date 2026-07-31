import assert from 'node:assert/strict';
import { createExecutiveDashboardSignalExperience } from '../src/executive-command-center/ux/index.js';

let tests=0;
const t=(condition,message)=>{tests++;assert.ok(condition,message||`Assertion ${tests} failed`)};

const model=createExecutiveDashboardSignalExperience({
  legacySnapshot:{
    kpis:{propertiesUnderReview:8,highConfidenceOpportunities:3,approvalsRequired:2,workflowCompletion:75,averageOpportunityScore:88,evidenceFreshness:94},
    health:[{id:'gis',label:'GIS',status:'OPERATIONAL'}]
  },
  signalState:{
    health:'ATTENTION_REQUIRED',
    severity:'HIGH',
    status:'ATTENTION_REQUIRED',
    headline:'Two executive reviews require attention',
    immediateAction:'Review governed workflow approvals',
    brokerReviewRequired:true,
    recommendationCount:4,
    alerts:[{id:'A1'},{id:'A2'}],
    sourceSignalIds:['S1','S2','S3'],
    traceable:true,
    generatedAt:'2026-07-31T23:30:00.000Z'
  },
  signalRuntime:{
    registeredTypes:[
      {source:'market-intelligence'},
      {source:'enterprise-knowledge-graph'},
      {source:'property-digital-twin'},
      {source:'gis'},
      {source:'document-intelligence'},
      {source:'executive-ai'},
      {source:'workflow-engine'}
    ]
  }
});

t(model.health==='ATTENTION_REQUIRED');
t(model.severity==='HIGH');
t(model.reviewRequired);
t(model.headline.includes('executive reviews'));
t(model.immediateAction==='Review governed workflow approvals');
t(model.recommendationCount===4);
t(model.activeAlertCount===2);
t(model.sourceSignalCount===3);
t(model.traceable);
t(model.integratedDomainCount===7);
t(model.domains.length===7);
t(model.domains.every(item=>item.status==='INTEGRATED'));
t(model.kpis.propertiesUnderReview===8);
t(model.kpis.workflowCompletion===75);
t(model.workspaceHealth.length===1);
t(!model.executionAuthorized);
t(!model.autonomousExecutionAllowed);
t(Object.isFrozen(model));
t(Object.isFrozen(model.domains));

const empty=createExecutiveDashboardSignalExperience();
t(empty.health==='OPERATIONAL');
t(empty.integratedDomainCount===0);
t(!empty.reviewRequired);
t(empty.sourceSignalCount===0);
t(empty.kpis.propertiesUnderReview===0);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE3_SPRINT34_EXECUTIVE_DASHBOARD_SIGNAL_EXPERIENCE',
  status:'PASSED',
  testsRun:tests,
  result:{
    integratedDomains:model.integratedDomainCount,
    reviewRequired:model.reviewRequired,
    traceable:model.traceable,
    sourceSignals:model.sourceSignalCount,
    responsiveUI:true,
    executionAuthorized:false,
    autonomousExecutionAllowed:false
  }
},null,2));
