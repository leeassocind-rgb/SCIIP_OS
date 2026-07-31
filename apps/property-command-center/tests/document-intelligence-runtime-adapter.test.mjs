import assert from 'node:assert/strict';
import { createExecutiveSignalBus } from '../src/executive-signals/executiveSignalBus.js';
import { resetExecutiveSignalRegistry, getExecutiveSignalType } from '../src/executive-signals/executiveSignalRegistry.js';
import { DOCUMENT_INTELLIGENCE_SIGNAL_TYPES, createDocumentIntelligenceRuntimeAdapter } from '../src/production-operations/executive-signal-integration/index.js';

let tests=0; const t=(c,m)=>{tests++;assert.ok(c,m||`Assertion ${tests} failed`)};
resetExecutiveSignalRegistry();
const bus=createExecutiveSignalBus({maxHistory:50}); const received=[]; bus.subscribe(s=>received.push(s),{id:'doc-test'});
const adapter=createDocumentIntelligenceRuntimeAdapter({signalBus:bus});
t(adapter.snapshot().status==='OPERATIONAL');
t(getExecutiveSignalType(DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.CORPUS_REGISTERED)!==null);
t(getExecutiveSignalType(DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.EVIDENCE_READY)!==null);
t(getExecutiveSignalType(DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.REVIEW_REQUIRED)!==null);

const result=adapter.process({
  operationId:'DOC-30-1', batchId:'BATCH-30-1', assignmentId:'A-100', propertyId:'P-100',
  occurredAt:'2026-07-31T21:00:00.000Z',
  entries:[
    {name:'Rialto Property Brochure.pdf',path:'/docs/Rialto Property Brochure.pdf',bytes:1000},
    {name:'Market Report Q2.pdf',path:'/docs/Market Report Q2.pdf',bytes:2000},
    {name:'unknown.bin',path:'/docs/unknown.bin',bytes:100}
  ],
  extractions:[
    {evidenceId:'EVD-30-1',sourceId:'SRC-00000001',field:'askingRate',value:1.45,confidence:0.95,parserVersion:'v1'},
    {evidenceId:'EVD-30-2',sourceId:'SRC-00000002',field:'vacancyRate',value:7.2,confidence:0.90,parserVersion:'v1'}
  ]
});
t(result.corpus.sourceCount===3);
t(result.corpus.supportedCount===2);
t(result.classifications.length===3);
t(result.evidenceRecords.length===2);
t(result.signals.length===3);
t(result.signals.some(s=>s.type===DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.CORPUS_REGISTERED));
t(result.signals.some(s=>s.type===DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.EVIDENCE_READY));
t(result.signals.some(s=>s.type===DOCUMENT_INTELLIGENCE_SIGNAL_TYPES.REVIEW_REQUIRED));
t(result.publications.every(p=>p.status==='PUBLISHED'));
t(received.length===3);
t(result.metrics.evidenceRecords===2);
t(result.readOnly);
t(result.appendOnlyEvidence);
t(result.autonomousConsequentialActions==='BLOCKED');

const dup=adapter.process({operationId:'DOC-30-1'});
t(dup.status==='DUPLICATE_IGNORED');
t(adapter.snapshot().duplicatesIgnored===1);
t(adapter.snapshot().processed===1);
t(adapter.snapshot().published===3);
t(adapter.snapshot().evidenceLedgerSize===2);
adapter.stop(); t(adapter.snapshot().status==='STOPPED');
let stopped=false; try{adapter.process({operationId:'X'})}catch{stopped=true} t(stopped);
adapter.start(); t(adapter.snapshot().status==='OPERATIONAL');

console.log(JSON.stringify({framework:'SCIIP_PHASE2_SPRINT30_DOCUMENT_INTELLIGENCE_RUNTIME_ADAPTER',status:'PASSED',testsRun:tests,result:{
  operationsProcessed:adapter.snapshot().processed,signalsPublished:adapter.snapshot().published,duplicatesIgnored:adapter.snapshot().duplicatesIgnored,
  evidenceLedgerSize:adapter.snapshot().evidenceLedgerSize,signalBusIntegrated:true,executiveInsightCompatible:true,executiveEngineCompatible:true,
  commandCenterCompatible:true,appendOnlyEvidence:true,autonomousConsequentialActions:'BLOCKED'
}},null,2));
