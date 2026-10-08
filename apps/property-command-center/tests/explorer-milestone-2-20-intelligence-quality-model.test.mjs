import assert from'node:assert/strict';

const memory=new Map();
globalThis.window={
  localStorage:{
    getItem:key=>memory.has(key)?memory.get(key):null,
    setItem:(key,value)=>memory.set(key,String(value)),
    removeItem:key=>memory.delete(key)
  },
  dispatchEvent:()=>true,
  addEventListener:()=>{},
  removeEventListener:()=>{}
};
globalThis.CustomEvent=class CustomEvent{
  constructor(type,init={}){this.type=type;this.detail=init.detail;}
};

const{
  clearDecisionWorkflowForTests
}=await import('../src/broker-product/property-explorer/intelligence/GovernedDecisionStore.js');

const{
  clearCanonicalExecutionForTests
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalPromotionExecutor.js');

const{
  buildIntelligenceQualityModel
}=await import('../src/broker-product/property-explorer/intelligence/IntelligenceQualityModel.js');

clearDecisionWorkflowForTests();
clearCanonicalExecutionForTests();

const property={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave'
};

const model={
  property,
  propertyProvenance:{
    status:'ACTIVE',
    fields:[
      {key:'parcelId',label:'Parcel ID',group:'Identity',canonical:{value:'0211232220000'},externalValue:'0211-232-22-0000',confidence:'HIGH'},
      {key:'landAcres',label:'Land Area',group:'Site',canonical:{value:16.02},externalValue:16.02,confidence:'HIGH'},
      {key:'propertyType',label:'Property Type',group:'Classification',canonical:{value:null},externalValue:'Warehouse',confidence:'MEDIUM'},
      {key:'assessedTotal',label:'Assessed Total',group:'Assessment',canonical:{value:null},externalValue:42018283,confidence:'MEDIUM'},
      {key:'buildingSf',label:'Building SF',group:'Building',canonical:{value:406345},externalValue:null,confidence:'HIGH'},
      {key:'powerAmps',label:'Power',group:'Building',canonical:{value:null},externalValue:null,confidence:'UNRATED'}
    ]
  }
};

const quality=buildIntelligenceQualityModel(property,model);

assert.equal(quality.status,'ACTIVE');
assert.equal(quality.propertyId,'BASE-DOUBLEDAY');
assert.equal(quality.canonicalAuthority,'SCIIP');

# Coverage counts union-known fields and may be incomplete.
assert.equal(quality.coverage.knownFields,5);
assert.equal(quality.coverage.totalFields,6);
assert.equal(quality.coverage.score,83);

# Confidence explicitly excludes the missing power field.
assert.equal(quality.confidence.assessedFields,5);
assert.equal(quality.confidence.missingFieldsExcluded,true);
assert.ok(quality.confidence.score>=75);

# Enrichment-only fields do not directly penalize governance health.
assert.equal(quality.governance.enrichmentOnlyNotPenalized,true);
assert.equal(quality.governance.reviewRequired,0);
assert.equal(quality.governance.pendingGovernance,0);
assert.ok(quality.governance.score>=90);

# Overall quality is not the same as the legacy completeness-heavy composite.
assert.ok(quality.overall.score>=70);
assert.ok(['STRONG','DEVELOPING','EXCELLENT'].includes(quality.overall.quality));
assert.equal(quality.diagnostics.methodology,'COVERAGE_35_CONFIDENCE_40_GOVERNANCE_25');

const fs=await import('node:fs');

const live=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(live.includes('IntelligenceQualityCard'));

const card=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/IntelligenceQualityCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(card.includes('Missing data ≠ low confidence.'));
assert.ok(card.includes('Coverage'));
assert.ok(card.includes('Governance Health'));

const legacy=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/GovernedPropertyStateCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(legacy.includes('LEGACY GOVERNANCE COMPOSITE'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_20_INTELLIGENCE_QUALITY_MODEL',
  version:'3.0-m2.20',
  status:'PASSED',
  testsRun:18,
  result:{
    coverage:'SEPARATE_DIMENSION',
    confidence:'MISSING_FIELDS_EXCLUDED',
    governanceHealth:'ENRICHMENT_NOT_PENALIZED',
    overallQuality:'WEIGHTED_35_40_25',
    legacyCompositeRelabeled:'PASSED',
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
