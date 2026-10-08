import assert from'node:assert/strict';
import fs from'node:fs';
import{reconcileParcelIdentity}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';
import{createAttributeResolutionDecision}from'../src/broker-product/property-explorer/intelligence/GovernedAttributeResolution.js';

const property={id:'BASE-DOUBLEDAY',address:'1001 Doubleday Ave',city:'Ontario',status:'EXISTING',parcelId:'0211232220000',landAcres:16.02,buildingSf:406345,clearHeight:32,powerAmps:600};
const lightBox={resolution:{confidence:48,conflictReport:{conflictCount:2,conflicts:[
 {field:'address',authoritativeValue:'1001 Doubleday Ave',candidateValue:'1001 DOUBLEDAY AVE'},
 {field:'parcelId',authoritativeValue:'0211232220000',candidateValue:'0211-232-22-0000'}
]},top:{parcel:{id:'02TEST',parcelApn:'0211-232-22-0000',location:{streetAddress:'1001 DOUBLEDAY AVE'},assessment:{apn:'0211-232-22-0000',assessedValue:{total:42018283,land:12565257,improvements:29453026,year:'2025'},improvementPercent:70.09},derived:{calculatedLotArea:64831.4},landUse:{normalized:{description:'DISTRIBUTION WAREHOUSE'}},propertyType:{class:{description:'Industrial'},type:{description:'Warehouse'}}}}}};

const m=reconcileParcelIdentity(property,lightBox,{resolutionStatus:'REVIEW_REQUIRED'});
assert.equal(m.propertyProvenance.status,'ACTIVE');
assert.equal(m.attributeResolution.status,'ACTIVE');
assert.equal(m.attributeResolution.authority,'SCIIP');
assert.equal(m.attributeResolution.automaticWrites,false);
assert.ok(m.attributeResolution.items.length>=2);

const pt=m.attributeResolution.items.find(x=>x.fieldKey==='propertyType');
const at=m.attributeResolution.items.find(x=>x.fieldKey==='assessedTotal');
assert.ok(pt,'Property Type candidate must reach M2.13');
assert.ok(at,'Assessed Total candidate must reach M2.13');
assert.equal(pt.externalValue,'Warehouse');
assert.equal(at.externalValue,42018283);

const accept=createAttributeResolutionDecision(pt,'ACCEPT',{timestamp:'2026-08-12T15:00:00.000Z'});
assert.equal(accept.status,'PROPOSED_PROMOTION');
assert.equal(accept.canonicalMutation,false);
assert.equal(accept.approvalRequired,true);

const reject=createAttributeResolutionDecision(at,'REJECT',{timestamp:'2026-08-12T15:01:00.000Z'});
assert.equal(reject.canonicalMutation,false);
const defer=createAttributeResolutionDecision(pt,'DEFER',{timestamp:'2026-08-12T15:02:00.000Z'});
assert.equal(defer.nextStep,'REVIEW_QUEUE');

const reconSrc=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js',import.meta.url),'utf8');
assert.ok(reconSrc.includes('reconciled.attributeResolution=buildGovernedAttributeResolution(reconciled.propertyProvenance)'));
assert.equal((reconSrc.match(/attributeResolution:buildGovernedAttributeResolution/g)||[]).length,0,'duplicate inline provenance reconstruction must be removed');

const cardSrc=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/GovernedAttributeResolutionCard.jsx',import.meta.url),'utf8');
assert.ok(cardSrc.includes('model?.attributeResolution'));
assert.ok(!cardSrc.includes('buildGovernedAttributeResolution(model?.propertyProvenance)'));
assert.ok(cardSrc.includes('Runtime wiring unavailable'));

console.log(JSON.stringify({
 framework:'SCIIP_EXPLORER_3_MILESTONE_2_13A_RUNTIME_WIRING_VISIBILITY_REPAIR',
 version:'3.0-m2.13a',
 status:'PASSED',
 testsRun:18,
 result:{
  provenanceSingleSource:'PASSED',
  resolutionRuntimeWiring:'PASSED',
  propertyTypeCandidate:'Warehouse',
  assessedTotalCandidate:42018283,
  failVisibleDevelopment:'PASSED',
  canonicalMutation:'FORBIDDEN',
  separateApproval:'REQUIRED'
 }
},null,2));
