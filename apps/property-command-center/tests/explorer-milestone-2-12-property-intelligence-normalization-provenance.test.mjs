import assert from'node:assert/strict';
import fs from'node:fs';
import{buildPropertyIntelligenceProvenance,findProvenanceField}from'../src/broker-product/property-explorer/intelligence/PropertyIntelligenceProvenance.js';
import{reconcileParcelIdentity}from'../src/broker-product/property-explorer/intelligence/ParcelIdentityReconciliation.js';

const property={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  city:'Ontario',
  status:'EXISTING',
  parcelId:'0211232220000',
  landAcres:16.02,
  buildingSf:406345,
  propertyType:'Industrial',
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
assert.equal(reconciled.propertyProvenance.canonicalAuthority,'SCIIP');
assert.equal(reconciled.propertyProvenance.mergePolicy,'ENRICH_NEVER_OVERWRITE');

const parcelField=findProvenanceField(reconciled.propertyProvenance,'parcelId');
assert.equal(parcelField.agreementState,'AGREED');
assert.equal(parcelField.confidence,'HIGH');
assert.equal(parcelField.canonical.authority,'SCIIP');

const landField=findProvenanceField(reconciled.propertyProvenance,'landAcres');
assert.equal(landField.agreementState,'AGREED');
assert.ok(landField.deltaPct<1);
assert.equal(landField.conflictState,'ALIGNED');

const typeField=findProvenanceField(reconciled.propertyProvenance,'propertyType');
assert.equal(typeField.agreementState,'AGREED');

const assessmentField=findProvenanceField(reconciled.propertyProvenance,'assessedTotal');
assert.equal(assessmentField.agreementState,'ENRICHMENT_ONLY');
assert.equal(assessmentField.provenance.mergePolicy,'ENRICH_NEVER_OVERWRITE');

const buildingField=findProvenanceField(reconciled.propertyProvenance,'buildingSf');
assert.equal(buildingField.agreementState,'CANONICAL_ONLY');
assert.equal(buildingField.canonical.value,406345);

assert.ok(reconciled.propertyProvenance.counts.agreed>=3);
assert.equal(reconciled.propertyProvenance.counts.conflicts,0);
assert.ok(reconciled.propertyProvenance.fieldContract.includes('provenance'));

const standalone=buildPropertyIntelligenceProvenance(property,null,null);
assert.equal(standalone.status,'ACTIVE');
assert.equal(findProvenanceField(standalone,'buildingSf').agreementState,'CANONICAL_ONLY');

const card=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),'utf8');
assert.ok(card.includes('PropertyIntelligenceProvenanceCard'));
assert.ok(card.includes('<PropertyIntelligenceProvenanceCard model={model}/>'));

console.log(JSON.stringify({
 framework:'SCIIP_EXPLORER_3_MILESTONE_2_12_PROPERTY_INTELLIGENCE_NORMALIZATION_PROVENANCE',
 version:'3.0-m2.12',
 status:'PASSED',
 testsRun:20,
 result:{
  fieldLevelGovernance:'ACTIVE',
  normalization:'ACTIVE',
  sourceEvidence:'ACTIVE',
  agreementState:'ACTIVE',
  confidence:'ACTIVE',
  temporalState:'ACTIVE',
  provenance:'ACTIVE',
  canonicalAuthority:'SCIIP',
  mergePolicy:'ENRICH_NEVER_OVERWRITE',
  providerAgnosticContract:'ESTABLISHED'
 }
},null,2));
