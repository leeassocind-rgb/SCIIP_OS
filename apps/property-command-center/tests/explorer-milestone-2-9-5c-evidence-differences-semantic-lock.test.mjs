import assert from'node:assert/strict';
import fs from'node:fs';
import{reconcileParcelIdentity}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';
import{buildReconciliationPresentation}from'../src/broker-product/property-explorer/intelligence/LiveGovernedReconciliationPresentation.js';

const property={id:'BASE-5DC6ADA79602D0FA',address:'1001 Doubleday Ave',city:'Ontario',status:'EXISTING',parcelId:'0211232220000'};
const lightBox={resolution:{confidence:48,conflictReport:{conflictCount:2,conflicts:[
  {field:'address',authoritativeValue:'1001 Doubleday Ave',candidateValue:'1001 DOUBLEDAY AVE'},
  {field:'parcelId',authoritativeValue:'0211232220000',candidateValue:'0211-232-22-0000'}
]},top:{parcel:{parcelApn:'0211-232-22-0000',location:{streetAddress:'1001 DOUBLEDAY AVE'}}}}};

const model=reconcileParcelIdentity(property,lightBox,{resolutionStatus:'REVIEW_REQUIRED',verifiedMatch:false});
const view=buildReconciliationPresentation(model,property);

assert.equal(model.resolutionStatus,'VERIFIED_MATCH');
assert.equal(view.identityConfidence,92);
assert.equal(view.sourceConfidence,48);
assert.equal(view.identityConflicts,0);
assert.equal(view.evidenceConflicts,2);
assert.equal(view.evidenceDifferences,2);
assert.equal(view.resolvedRepresentations,2);
assert.equal(view.unresolvedEvidenceConflicts,0);
assert.equal(view.evidenceDifferenceLabel,'2');
assert.equal(view.semanticContract.difference,'Any SCIIP-vs-LightBox source disagreement');

const card=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),'utf8');
assert.ok(card.includes('Evidence Differences'));
assert.ok(!card.includes('Evidence Conflicts'));
assert.ok(card.includes('2 normalized')||card.includes('presentation.resolvedRepresentations'));
assert.ok(card.includes('View reconciliation evidence'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_9_5C_EVIDENCE_DIFFERENCES_SEMANTIC_LOCK',
  version:'3.0-m2.9.5c',
  status:'PASSED',
  testsRun:14,
  result:{
    identityConfidence:view.identityConfidence,
    sourceConfidence:view.sourceConfidence,
    identityConflicts:view.identityConflicts,
    evidenceDifferences:view.evidenceDifferences,
    normalizedEvidence:view.resolvedRepresentations,
    unresolvedReview:view.unresolvedEvidenceConflicts,
    semanticLock:'ACTIVE'
  }
},null,2));
