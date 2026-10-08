import assert from'node:assert/strict';
import fs from'node:fs';
import{buildVerifiedParcelSynthesis}from'../src/broker-product/property-explorer/intelligence/VerifiedParcelSynthesis.js';
import{reconcileParcelIdentity}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';

const property={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  city:'Ontario',
  status:'EXISTING',
  parcelId:'0211232220000',
  landAcres:16.02,
  buildingSf:406345,
  propertyType:'Industrial'
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
   propertyType:{class:{description:'Industrial'},type:{description:'Warehouse'}},
   transaction:{lastMarketSale:{value:0,transferDate:'2008-10-30T00:00:00.000Z',buyer:'1001 DOUBLEDAY LLC'}},
   lastLoan:{value:50400000,recordingDate:'2026-06-25T00:00:00.000Z',lender:'REFT MULBERRY STREET LLC'}
  }}
 }
};

const reconciled=reconcileParcelIdentity(property,lightBox,{resolutionStatus:'REVIEW_REQUIRED'});
assert.equal(reconciled.resolutionStatus,'VERIFIED_MATCH');
assert.equal(reconciled.parcelEnrichment.status,'VERIFIED_ENRICHMENT');
assert.equal(reconciled.parcelSynthesis.status,'ACTIVE');
assert.equal(reconciled.parcelSynthesis.canonicalAuthority,'SCIIP');
assert.equal(reconciled.parcelSynthesis.silentOverwrite,false);
assert.equal(reconciled.parcelSynthesis.site.alignmentStatus,'ALIGNED');
assert.ok(reconciled.parcelSynthesis.site.deltaPct<1);
assert.equal(reconciled.parcelSynthesis.classification.industrialSupport,true);
assert.equal(reconciled.parcelSynthesis.assessment.total,42018283);
assert.ok(reconciled.parcelSynthesis.assessment.improvementPct>70&&reconciled.parcelSynthesis.assessment.improvementPct<71);
assert.equal(reconciled.parcelSynthesis.activity.hasLoan,true);
assert.equal(reconciled.parcelSynthesis.reviewCount,0);
assert.equal(reconciled.parcelSynthesis.posture,'CORROBORATED');

const withheld=buildVerifiedParcelSynthesis(property,{status:'WITHHELD_UNVERIFIED_IDENTITY'});
assert.equal(withheld.status,'WITHHELD');

const card=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),'utf8');
assert.ok(card.includes('VerifiedParcelSynthesisCard'));
assert.ok(card.includes('<VerifiedParcelSynthesisCard model={model}/>'));

console.log(JSON.stringify({
 framework:'SCIIP_EXPLORER_3_MILESTONE_2_11_VERIFIED_PARCEL_INTELLIGENCE_SYNTHESIS',
 version:'3.0-m2.11',
 status:'PASSED',
 testsRun:16,
 result:{
  activationGate:'VERIFIED_PARCEL_ENRICHMENT_ONLY',
  siteAlignment:'ACTIVE',
  classificationAlignment:'ACTIVE',
  assessmentComposition:'ACTIVE',
  recordedActivityContext:'ACTIVE',
  reviewSignals:'ACTIVE',
  canonicalAuthority:'SCIIP',
  silentOverwrite:'FORBIDDEN'
 }
},null,2));
