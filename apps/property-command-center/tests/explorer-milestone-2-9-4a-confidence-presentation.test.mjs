import assert from'node:assert/strict';
import fs from'node:fs';
import{reconcileParcelIdentity}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';
import{buildReconciliationPresentation}from'../src/broker-product/property-explorer/intelligence/LiveGovernedReconciliationPresentation.js';

const property={address:'1001 Doubleday Ave',city:'Ontario',status:'EXISTING',parcelId:'0211-232-22-0000',conflicts:[{field:'owner'},{field:'buildingSf'}]};
const lightBox={resolution:{top:{parcel:{parcelApn:'0211232220000',location:{streetAddress:'1001 DOUBLEDAY AVE'}}}}};
const base={resolutionStatus:'REVIEW_REQUIRED',confidence:48,matchConfidence:48,conflictCount:2,verifiedMatch:false};
const model=reconcileParcelIdentity(property,lightBox,base);
const view=buildReconciliationPresentation(model,property);
const card=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),'utf8');

assert.equal(model.resolutionStatus,'VERIFIED_MATCH');
assert.ok(view.identityConfidence>=92);
assert.equal(view.sourceConfidence,48);
assert.equal(view.identityConflicts,1);
assert.equal(view.canonicalConflicts,2);
assert.ok(card.includes('Identity Confidence'));
assert.ok(card.includes('presentation.identityConfidenceLabel'));
assert.ok(card.includes('presentation.sourceConfidenceLabel'));
assert.ok(card.includes('Identity Conflicts'));
assert.ok(card.includes('presentation.canonicalConflictLabel'));

console.log(JSON.stringify({
 framework:'SCIIP_EXPLORER_3_MILESTONE_2_9_4A_GOVERNED_CONFIDENCE_PRESENTATION_BINDING',
 version:'3.0-m2.9.4a',
 status:'PASSED',
 testsRun:10,
 result:{identityConfidence:view.identityConfidence,sourceConfidence:view.sourceConfidence,identityConflicts:view.identityConflicts,canonicalConflicts:view.canonicalConflicts,visiblePresentationContract:'BOUND'}
},null,2));
