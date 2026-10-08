import assert from'node:assert/strict';
import fs from'node:fs';
import{
  reconcileParcelIdentity,
  extractLightBoxSourceConfidence,
  extractLightBoxEvidenceConflicts
}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';
import{buildReconciliationPresentation}from'../src/broker-product/property-explorer/intelligence/LiveGovernedReconciliationPresentation.js';

const property={
  id:'TEST-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  city:'Ontario',
  status:'EXISTING',
  parcelId:'0211-232-22-0000'
};

const lightBox={
  resolution:{
    confidence:48,
    conflictReport:{
      conflictCount:2,
      conflicts:[{field:'owner'},{field:'address'}]
    },
    top:{
      parcel:{
        parcelApn:'0211232220000',
        location:{streetAddress:'1001 DOUBLEDAY AVE'}
      }
    }
  }
};

const base={resolutionStatus:'REVIEW_REQUIRED',verifiedMatch:false};
const model=reconcileParcelIdentity(property,lightBox,base);
const view=buildReconciliationPresentation(model,property);

assert.equal(extractLightBoxSourceConfidence(lightBox,base),48);
assert.equal(extractLightBoxEvidenceConflicts(lightBox,base),2);
assert.equal(model.resolutionStatus,'VERIFIED_MATCH');
assert.equal(view.identityConfidence,92);
assert.equal(view.sourceConfidence,48);
assert.equal(view.sourceConfidenceLabel,'48%');
assert.equal(view.evidenceConflicts,2);
assert.equal(view.identityConflicts,1);
assert.equal(view.canonicalConflicts,0);

const card=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),'utf8');
assert.ok(card.includes('Evidence {presentation.evidenceConflictLabel}'));
assert.ok(!card.includes('Canonical {presentation.canonicalConflictLabel}'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_9_4B_RECONCILIATION_EVIDENCE_PROPAGATION',
  version:'3.0-m2.9.4b',
  status:'PASSED',
  testsRun:11,
  result:{
    identityConfidence:view.identityConfidence,
    sourceConfidence:view.sourceConfidence,
    identityConflicts:view.identityConflicts,
    evidenceConflicts:view.evidenceConflicts,
    canonicalLineageConflicts:view.canonicalConflicts,
    semanticContract:'IDENTITY_VS_EVIDENCE_SEPARATED'
  }
},null,2));
