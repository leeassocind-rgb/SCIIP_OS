import assert from'node:assert/strict';
import fs from'node:fs';
import{
  reconcileParcelIdentity,
  extractLightBoxConflictDetails
}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';
import{buildReconciliationPresentation}from'../src/broker-product/property-explorer/intelligence/LiveGovernedReconciliationPresentation.js';

const property={id:'BASE-5DC6ADA79602D0FA',address:'1001 Doubleday Ave',city:'Ontario',status:'EXISTING',parcelId:'0211232220000'};
const lightBox={resolution:{confidence:48,conflictReport:{conflictCount:2,conflicts:[
  {field:'owner',authoritativeValue:'PX SOCAL ONTARIO LLC',candidateValue:'EXTERNAL OWNER'},
  {field:'parcelId',authoritativeValue:'0211232220000',candidateValue:'0211-232-22-0000'}
]},top:{parcel:{parcelApn:'0211-232-22-0000',location:{streetAddress:'1001 DOUBLEDAY AVE'}}}}};

const base={resolutionStatus:'REVIEW_REQUIRED',verifiedMatch:false};
const model=reconcileParcelIdentity(property,lightBox,base);
const view=buildReconciliationPresentation(model,property);

assert.equal(model.resolutionStatus,'VERIFIED_MATCH');
assert.equal(view.identityConfidence,92);
assert.equal(view.sourceConfidence,48);
assert.equal(view.evidenceConflicts,2);
assert.equal(view.identityConflicts,0);
assert.equal(view.attributeConflicts,1);
assert.equal(view.resolvedRepresentations,1);
assert.equal(extractLightBoxConflictDetails(lightBox,base).length,2);

const card=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),'utf8');
assert.ok(card.includes('Evidence Conflicts'));
assert.ok(card.includes('reconciliation-evidence-audit'));
assert.ok(card.includes('Review reconciliation evidence'));
assert.ok(!card.includes('<small>Evidence {presentation.evidenceConflictLabel}</small>'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_9_5_CONFLICT_TAXONOMY_AUDIT_UX',
  version:'3.0-m2.9.5',
  status:'PASSED',
  testsRun:12,
  result:{
    identityConfidence:view.identityConfidence,
    sourceConfidence:view.sourceConfidence,
    identityConflicts:view.identityConflicts,
    evidenceConflicts:view.evidenceConflicts,
    attributeConflicts:view.attributeConflicts,
    resolvedRepresentations:view.resolvedRepresentations,
    evidenceAudit:'ACTIVE',
    conflictTaxonomy:'ACTIVE'
  }
},null,2));
