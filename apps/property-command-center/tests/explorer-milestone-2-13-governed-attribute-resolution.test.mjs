import assert from'node:assert/strict';
import fs from'node:fs';
import{
  buildGovernedAttributeResolution,
  createAttributeResolutionDecision,
  applyResolutionDecision
}from'../src/broker-product/property-explorer/intelligence/GovernedAttributeResolution.js';
import{reconcileParcelIdentity}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';

const property={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  city:'Ontario',
  status:'EXISTING',
  parcelId:'0211232220000',
  landAcres:16.02,
  buildingSf:406345,
  clearHeight:32,
  powerAmps:600
};

const lightBox={
 resolution:{
  confidence:48,
  conflictReport:{conflictCount:2,conflicts:[
   {field:'address',authoritativeValue:'1001 Doubleday Ave',candidateValue:'1001 DOUBLEDAY AVE'},
   {field:'parcelId',authoritativeValue:'0211232220000',candidateValue:'0211-232-22-0000'}
  ]},
  top:{parcel:{
   id:'02TEST',
   parcelApn:'0211-232-22-0000',
   location:{streetAddress:'1001 DOUBLEDAY AVE'},
   assessment:{
    apn:'0211-232-22-0000',
    assessedValue:{total:42018283,land:12565257,improvements:29453026,year:'2025'},
    improvementPercent:70.09
   },
   derived:{calculatedLotArea:64831.4},
   landUse:{normalized:{description:'DISTRIBUTION WAREHOUSE'}},
   propertyType:{class:{description:'Industrial'},type:{description:'Warehouse'}}
  }}
 }
};

const reconciled=reconcileParcelIdentity(property,lightBox,{resolutionStatus:'REVIEW_REQUIRED'});
assert.equal(reconciled.resolutionStatus,'VERIFIED_MATCH');
assert.equal(reconciled.propertyProvenance.status,'ACTIVE');
assert.equal(reconciled.attributeResolution.status,'ACTIVE');
assert.equal(reconciled.attributeResolution.authority,'SCIIP');
assert.equal(reconciled.attributeResolution.automaticWrites,false);
assert.equal(reconciled.attributeResolution.approvalRequired,true);
assert.ok(reconciled.attributeResolution.items.length>=2);

const propertyType=reconciled.attributeResolution.items.find(item=>item.fieldKey==='propertyType');
assert.ok(propertyType);
assert.equal(propertyType.agreementState,'ENRICHMENT_ONLY');
assert.equal(propertyType.eligibleForProposal,true);

const accept=createAttributeResolutionDecision(propertyType,'ACCEPT',{actor:'TEST_USER',timestamp:'2026-08-12T12:00:00.000Z'});
assert.equal(accept.status,'PROPOSED_PROMOTION');
assert.equal(accept.canonicalMutation,false);
assert.equal(accept.approvalRequired,true);
assert.equal(accept.nextStep,'GOVERNED_APPROVAL');

const applied=applyResolutionDecision(reconciled.attributeResolution,accept);
assert.equal(applied.items.find(item=>item.fieldKey==='propertyType').decisionStatus,'PROPOSED_PROMOTION');

const assessed=reconciled.attributeResolution.items.find(item=>item.fieldKey==='assessedTotal');
assert.ok(assessed);
const reject=createAttributeResolutionDecision(assessed,'REJECT',{timestamp:'2026-08-12T12:01:00.000Z'});
assert.equal(reject.status,'REJECTED_EXTERNAL_EVIDENCE');
assert.equal(reject.canonicalMutation,false);

const defer=createAttributeResolutionDecision(propertyType,'DEFER',{timestamp:'2026-08-12T12:02:00.000Z'});
assert.equal(defer.status,'DEFERRED_REVIEW');
assert.equal(defer.nextStep,'REVIEW_QUEUE');

const card=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),'utf8');
assert.ok(card.includes('GovernedAttributeResolutionCard'));
assert.ok(card.includes('<GovernedAttributeResolutionCard model={model}/>'));

console.log(JSON.stringify({
 framework:'SCIIP_EXPLORER_3_MILESTONE_2_13_GOVERNED_ATTRIBUTE_RESOLUTION',
 version:'3.0-m2.13',
 status:'PASSED',
 testsRun:20,
 result:{
  candidateResolution:'ACTIVE',
  acceptCreatesProposal:'PASSED',
  rejectRetainsCanonical:'PASSED',
  deferRoutesReview:'PASSED',
  canonicalMutation:'FORBIDDEN',
  separateApproval:'REQUIRED',
  auditDecision:'ACTIVE',
  canonicalAuthority:'SCIIP'
 }
},null,2));
