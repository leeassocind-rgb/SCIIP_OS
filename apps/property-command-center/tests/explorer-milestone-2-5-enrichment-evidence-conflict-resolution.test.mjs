import fs from'node:fs';
import path from'node:path';
import assert from'node:assert/strict';
import{fileURLToPath}from'node:url';
import{evidenceRecord,fieldEvidenceSummary,propertyEvidenceMatrix,SOURCE_PRECEDENCE}from'../server/lightbox/EnrichmentEvidence.mjs';
import{extractSciipEvidence}from'../server/lightbox/SciipEvidenceExtractor.mjs';
import{extractParcelEvidence}from'../server/lightbox/LightBoxEvidenceExtractor.mjs';
import{buildPropertyConflictReport,buildConflictReviewQueue}from'../server/lightbox/EnrichmentConflictService.mjs';

const here=path.dirname(fileURLToPath(import.meta.url));
const app=path.resolve(here,'..');
const read=rel=>fs.readFileSync(path.join(app,rel),'utf8');
const checks=[];
const check=(name,value)=>{assert.ok(value,name);checks.push({name,status:'PASSED'});};

check('SCIIP canonical precedence exceeds LightBox verified',SOURCE_PRECEDENCE.SCIIP_CANONICAL>SOURCE_PRECEDENCE.LIGHTBOX_VERIFIED);
check('Base inventory precedence exceeds LightBox verified',SOURCE_PRECEDENCE.BASE_INVENTORY>SOURCE_PRECEDENCE.LIGHTBOX_VERIFIED);

const records=[
  evidenceRecord({field:'owner',value:'SCIIP Owner',sourceType:'BASE_INVENTORY',provider:'SCIIP'}),
  evidenceRecord({field:'owner',value:'Different Owner',sourceType:'LIGHTBOX_VERIFIED',provider:'LightBox'})
];
const summary=fieldEvidenceSummary('owner',records);
check('Conflicting values are detected',summary.status==='CONFLICT'&&summary.conflictCount===1);
check('Higher precedence evidence remains authoritative',summary.authoritative.value==='SCIIP Owner');

const property={
  id:'P-1',address:'13032 Slover Ave',city:'Fontana',zip:'92337',
  owner:'SCIIP Owner',landAcres:10,provenance:{sourceType:'BASE_INVENTORY',sourceFiles:[{file:'base.csv'}]}
};
const parcel={
  id:'LB-1',apn:'0238-123-45',
  location:{streetAddress:'13032 Slover Ave',locality:'Fontana',postalCode:'92337'},
  owner:{name:'Different Owner'}
};
check('SCIIP evidence extraction emits canonical evidence',extractSciipEvidence(property).length>=4);
check('LightBox extraction emits provider evidence',extractParcelEvidence(parcel,{matchScore:92}).some(row=>row.provider==='LightBox'));

const report=buildPropertyConflictReport(property,{top:{parcel,score:92}});
check('Conflict report requires review',report.status==='REVIEW_REQUIRED');
check('Owner conflict appears in matrix',report.conflicts.some(row=>row.field==='owner'));
check('Canonical address alignment is not falsely flagged',!report.conflicts.some(row=>row.field==='address'));

const queue=buildConflictReviewQueue([report,{propertyId:'P-2',status:'ALIGNED',conflictCount:0}]);
check('Review queue contains only conflicted properties',queue.length===1&&queue[0].propertyId==='P-1');

check('Browser source comparison exists',read('src/broker-product/property-explorer/integrations/lightbox/LightBoxSourceComparison.jsx').includes('Source Comparison'));
check('Explorer exposes source comparison',read('src/broker-product/property-explorer/v6/Explorer3.jsx').includes('LightBoxSourceComparison'));
check('Proxy exposes conflict endpoint',read('server/lightbox/proxy-server.mjs').includes('/api/lightbox/conflicts'));
check('LightBox parcel adapter emits conflict report',read('server/lightbox/LightBoxParcelAdapter.mjs').includes('conflictReport'));
check('No conflict resolution overwrites canonical identity',!read('server/lightbox/EnrichmentConflictService.mjs').includes('property.address='));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_5_ENRICHMENT_EVIDENCE_CONFLICT_RESOLUTION',
  version:'3.0-m2.5',
  status:'PASSED',
  testsRun:checks.length,
  result:{
    fieldEvidence:'ACTIVE',
    conflictDetection:'ACTIVE',
    sourcePrecedence:'GOVERNED',
    reviewQueue:'ACTIVE',
    silentOverwrite:'FORBIDDEN',
    sourceComparisonUi:'ACTIVE'
  },
  checks
},null,2));
