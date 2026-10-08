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
assert.equal(m.resolutionStatus,'VERIFIED_MATCH');
assert.equal(m.propertyProvenance.status,'ACTIVE');
assert.equal(m.attributeResolution.status,'ACTIVE');
assert.equal(m.attributeResolution.automaticWrites,false);

const pt=m.attributeResolution.items.find(x=>x.fieldKey==='propertyType');
const assessed=m.attributeResolution.items.find(x=>x.fieldKey==='assessedTotal');
assert.ok(pt);
assert.ok(assessed);
assert.equal(pt.externalValue,'Warehouse');
assert.equal(assessed.externalValue,42018283);

const accept=createAttributeResolutionDecision(pt,'ACCEPT',{timestamp:'2026-08-12T17:00:00.000Z'});
assert.equal(accept.status,'PROPOSED_PROMOTION');
assert.equal(accept.canonicalMutation,false);
assert.equal(accept.approvalRequired,true);

const src=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js',import.meta.url),'utf8');
assert.ok(src.includes('export function reconcileParcelIdentity(property,lightBoxState,baseModel={}){'));
assert.ok(src.includes('const next={'));
assert.ok(src.includes('next.attributeResolution=buildGovernedAttributeResolution(next.propertyProvenance);'));
assert.ok(!src.includes('return reconciled){'));

console.log(JSON.stringify({
 framework:'SCIIP_EXPLORER_3_MILESTONE_2_13C_BACKUP_RESTORE_SAFE_RUNTIME_WIRING',
 version:'3.0-m2.13c',
 status:'PASSED',
 testsRun:14,
 result:{
  recovery:'PRE_M2_13A_BACKUP',
  reconciliation:'RESTORED',
  provenanceSingleSource:'PASSED',
  attributeResolution:'ACTIVE',
  propertyTypeCandidate:'Warehouse',
  assessedTotalCandidate:42018283,
  canonicalMutation:'FORBIDDEN'
 }
},null,2));
