import assert from 'node:assert/strict';
import { createExecutiveSignalBus } from '../src/executive-signals/executiveSignalBus.js';
import { resetExecutiveSignalRegistry } from '../src/executive-signals/executiveSignalRegistry.js';
import { createMarketIntelligenceRuntimeAdapter } from '../src/market-intelligence/executive-signal-integration/index.js';
import { createKnowledgeGraphRuntime } from '../src/enterprise-knowledge-graph/knowledgeGraphRuntime.js';
import { createKnowledgeGraphRuntimeAdapter } from '../src/enterprise-knowledge-graph/executive-signal-integration/index.js';
import { createPropertyDigitalTwinRuntimeAdapter } from '../src/property-digital-twin/executive-signal-integration/index.js';
import { createGisRuntimeAdapter } from '../src/spatial/executive-signal-integration/index.js';
import { createDocumentIntelligenceRuntimeAdapter } from '../src/production-operations/executive-signal-integration/index.js';
import { createExecutiveAIRuntimeAdapter } from '../src/executive-ai/executive-signal-integration/index.js';
import { createWorkflowRuntimeAdapter } from '../src/workflow/executive-signal-integration/index.js';
import { clearWorkflowStoreForTests } from '../src/workflow/actionCenterService.js';
import { clearActionLedgerForTests } from '../src/workflow/actionLedger.js';

let tests=0;const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
resetExecutiveSignalRegistry();clearWorkflowStoreForTests();clearActionLedgerForTests();
const bus=createExecutiveSignalBus({maxHistory:500});
const allSignals=[];bus.subscribe(s=>allSignals.push(s),{id:'cross-domain-audit'});

const graphRuntime=createKnowledgeGraphRuntime();
const domainSources=new Set(['market-intelligence','property-digital-twin','gis','document-intelligence','executive-ai']);
const graphAdapter=createKnowledgeGraphRuntimeAdapter({graphRuntime,signalBus:bus,maxHistory:200,consumeFilter:signal=>domainSources.has(signal.source)});
const workflowAdapter=createWorkflowRuntimeAdapter({signalBus:bus,maxHistory:200});
t(graphAdapter.connect());
t(!workflowAdapter.snapshot().connected);

const marketAdapter=createMarketIntelligenceRuntimeAdapter({signalBus:bus});
const twinAdapter=createPropertyDigitalTwinRuntimeAdapter({signalBus:bus});
const gisAdapter=createGisRuntimeAdapter({signalBus:bus});
const documentAdapter=createDocumentIntelligenceRuntimeAdapter({signalBus:bus});
const aiAdapter=createExecutiveAIRuntimeAdapter({signalBus:bus});

const market=marketAdapter.run({
 operationId:'PH2-MARKET-1',assignmentId:'A-CERT',propertyId:'P-CERT',correlationId:'PH2-CORR',
 occurredAt:'2026-07-31T23:00:00.000Z',
 trends:{rents:[10,12],vacancy:[8,6]},
 infrastructureSignals:[{id:'INF-1',category:'POWER',impact:'HIGH',description:'Substation capacity constraint'}],
 comparables:[],
 projects:[]
});
t(market.signals.length>0);

const twin=twinAdapter.process({
 operationId:'PH2-TWIN-1',assignmentId:'A-CERT',correlationId:'PH2-CORR',occurredAt:'2026-07-31T23:01:00.000Z',
 property:{propertyId:'P-CERT',address:'100 Certification Way',city:'Rialto',buildingSf:500000,landAcres:25,latitude:34.1,longitude:-117.3},
 sourceRecords:[{authoritative:true,data:{status:'ACTIVE'}}],evidenceCoveragePct:100,infrastructure:[],claims:[{field:'status',value:'ACTIVE',evidenceId:'EV-TWIN',confidence:1}]
});
t(twin.signals.length>0);

const gis=gisAdapter.analyze({
 operationId:'PH2-GIS-1',assignmentId:'A-CERT',correlationId:'PH2-CORR',occurredAt:'2026-07-31T23:02:00.000Z',
 graph:{nodes:[
  {id:'property:P-CERT',type:'Property',attributes:{propertyId:'P-CERT',latitude:34.1,longitude:-117.3,buildingSf:500000,powerAmps:4000,clearHeight:40,status:'Available'}},
  {id:'property:P-ALT',type:'Property',attributes:{propertyId:'P-ALT',latitude:34.11,longitude:-117.31,buildingSf:475000,powerAmps:3500,clearHeight:38,status:'Available'}}
 ],edges:[]},
 subjectId:'property:P-CERT',criteria:{buildingSf:450000,powerAmps:3000,clearHeight:36,maxDistanceMiles:20}
});
t(gis.signals.length>0);

const docs=documentAdapter.process({
 operationId:'PH2-DOC-1',assignmentId:'A-CERT',propertyId:'P-CERT',occurredAt:'2026-07-31T23:03:00.000Z',
 entries:[{name:'Certification Brochure.pdf',path:'/docs/Certification Brochure.pdf',bytes:1000}],
 extractions:[{evidenceId:'EV-DOC-1',sourceId:'SRC-00000001',field:'buildingSf',value:500000,confidence:0.99,parserVersion:'v1'}]
});
t(docs.signals.length>0);

const ai=aiAdapter.run({
 operationId:'PH2-AI-1',assignmentId:'A-CERT',propertyId:'P-CERT',actorId:'BROKER-CERT',occurredAt:'2026-07-31T23:04:00.000Z',
 prompt:'Summarize the governed opportunity',evidence:[{sourceId:'EV-DOC-1',claim:'Building is 500,000 SF',confidence:99,status:'VERIFIED'}],steps:[{capability:'COPILOT'}]
});
t(ai.signals.length>0);

t(allSignals.some(s=>s.source==='market-intelligence'));
t(allSignals.some(s=>s.source==='property-digital-twin'));
t(allSignals.some(s=>s.source==='gis'));
t(allSignals.some(s=>s.source==='document-intelligence'));
t(allSignals.some(s=>s.source==='executive-ai'));
t(allSignals.some(s=>s.source==='enterprise-knowledge-graph'));
const workflowSource=allSignals.find(s=>s.source==='market-intelligence'&&s.severity==='HIGH')||allSignals.find(s=>['HIGH','CRITICAL'].includes(s.severity));
const workflowResult=workflowAdapter.consume(workflowSource);
t(workflowResult.workflow.status==='DRAFT');
t(allSignals.some(s=>s.source==='workflow-engine'));

t(graphAdapter.snapshot().consumed>=5);
t(graphAdapter.snapshot().published>=5);
t(graphRuntime.entities.all().length>10);
t(graphRuntime.relationships.all().length>10);
t(workflowAdapter.snapshot().consumed>=1);
t(workflowAdapter.snapshot().draftsCreated>=1);

const domains=['market-intelligence','enterprise-knowledge-graph','property-digital-twin','gis','document-intelligence','executive-ai','workflow-engine'];
const represented=domains.filter(domain=>allSignals.some(s=>s.source===domain));
t(represented.length===7);
t(allSignals.every(s=>s.autonomousExecution!==true));
t(allSignals.filter(s=>s.source==='workflow-engine').every(s=>s.metadata.requiresApproval===true));
t(workflowAdapter.snapshot().executionAuthorized===false);
t(workflowAdapter.snapshot().workflowMutationAllowed===false);
t(workflowAdapter.snapshot().autonomousExecutionAllowed===false);

graphAdapter.disconnect();
t(!graphAdapter.snapshot().connected);
t(!workflowAdapter.snapshot().connected);

console.log(JSON.stringify({
 framework:'SCIIP_PHASE2_SPRINT33_CROSS_DOMAIN_INTEGRATION_CERTIFICATION',status:'PASSED',testsRun:tests,
 result:{
  domainsCertified:represented.length,
  domains,
  executiveSignalsObserved:allSignals.length,
  graphEntities:graphRuntime.entities.all().length,
  graphRelationships:graphRuntime.relationships.all().length,
  workflowDraftsCreated:workflowAdapter.snapshot().draftsCreated,
  marketIntelligenceIntegrated:true,
  knowledgeGraphIntegrated:true,
  propertyDigitalTwinIntegrated:true,
  gisIntegrated:true,
  documentIntelligenceIntegrated:true,
  executiveAIIntegrated:true,
  workflowEngineIntegrated:true,
  executionAuthorized:false,
  workflowMutationAllowed:false,
  autonomousExecutionAllowed:false,
  phase2Status:'CERTIFIED'
 }
},null,2));
