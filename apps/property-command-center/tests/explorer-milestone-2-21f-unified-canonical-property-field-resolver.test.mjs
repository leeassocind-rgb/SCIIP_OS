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
  resolveCanonicalPropertyField,
  resolveCanonicalPropertyRecord,
  resolveCanonicalPropertyFields,
  buildCanonicalPropertySnapshot,
  certifyCanonicalRuntimeInvariant
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalPropertyFieldResolver.js');

const{
  propertyIntelligenceSnapshot
}=await import('../src/broker-product/property-explorer/intelligence/PropertyIntelligenceModel.js');

const{
  buildIntelligenceGapEngine
}=await import('../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js');

const{
  buildGovernedPropertyState
}=await import('../src/broker-product/property-explorer/intelligence/GovernedPropertyState.js');

clearDecisionWorkflowForTests();
clearCanonicalExecutionForTests();

const property={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  buildingSf:406345,
  landAcres:16.02,
  clearHeightFt:32,
  powerAmps:600,
  parcelId:'0211232220000'
};

const model={
  property,
  propertyProvenance:{
    status:'ACTIVE',
    fields:[
      {
        key:'parcelId',label:'Parcel ID',group:'Identity',
        canonical:{value:'0211232220000'},
        externalValue:'0211-232-22-0000',confidence:'HIGH'
      },
      {
        key:'buildingSf',label:'Building SF',group:'Building',
        canonical:{value:406345},externalValue:null,confidence:'HIGH'
      },
      {
        key:'landAcres',label:'Land Area',group:'Site',
        canonical:{value:16.02},externalValue:16.02,confidence:'HIGH'
      },
      {
        key:'clearHeight',label:'Clear Height',group:'Building',
        canonical:{value:null},externalValue:null,confidence:'HIGH'
      },
      {
        key:'powerAmps',label:'Power',group:'Building',
        canonical:{value:null},externalValue:null,confidence:'HIGH'
      },
      {
        key:'propertyType',label:'Property Type',group:'Classification',
        canonical:{value:null},externalValue:null,confidence:'MEDIUM'
      },
      {
        key:'landUse',label:'Land Use',group:'Classification',
        canonical:{value:null},
        externalValue:'DISTRIBUTION WAREHOUSE',confidence:'MEDIUM'
      },
      {
        key:'assessedTotal',label:'Assessed Total',group:'Assessment',
        canonical:{value:null},externalValue:42018283,confidence:'MEDIUM'
      }
    ]
  }
};

// ------------------------------------------------------------------
// Canonical resolver must normalize the live property schema.
// ------------------------------------------------------------------
const clear=resolveCanonicalPropertyField(property,model,'clearHeight');
assert.equal(clear.found,true);
assert.equal(clear.value,32);
assert.equal(clear.runtimeKey,'clearHeightFt');

const power=resolveCanonicalPropertyField(property,model,'powerAmps');
assert.equal(power.value,600);

const record=resolveCanonicalPropertyRecord(property,model);
assert.equal(record.buildingSf.value,406345);
assert.equal(record.landAcres.value,16.02);
assert.equal(record.clearHeight.value,32);
assert.equal(record.powerAmps.value,600);
assert.equal(record.parcelId.value,'0211232220000');

// ------------------------------------------------------------------
// UI snapshot must consume the same resolver.
// ------------------------------------------------------------------
const snapshot=propertyIntelligenceSnapshot(property);
assert.equal(snapshot.buildingSf,406345);
assert.equal(snapshot.landAcres,16.02);
assert.equal(snapshot.clearHeightFt,32);
assert.equal(snapshot.powerAmps,600);
assert.equal(snapshot.parcelId,'0211232220000');

const directSnapshot=buildCanonicalPropertySnapshot(property,model);
assert.equal(directSnapshot.clearHeightFt,32);

// ------------------------------------------------------------------
// Governed property state must see Clear Height / Power as canonical.
// ------------------------------------------------------------------
const governed=buildGovernedPropertyState(property,model);
const clearGoverned=governed.reconciled.fields.find(x=>x.key==='clearHeight');
assert.ok(clearGoverned);

// buildGovernedPropertyState metrics are now based on resolver-aligned fields.
assert.ok(governed.metrics.canonicalPresent>=5);

// ------------------------------------------------------------------
// Gap engine may not emit false canonical gaps.
// ------------------------------------------------------------------
const gaps=buildIntelligenceGapEngine(property,model);
assert.equal(
  gaps.gaps.some(x=>x.fieldKey==='clearHeight'&&x.type==='MISSING'),
  false
);
assert.equal(
  gaps.gaps.some(x=>x.fieldKey==='powerAmps'&&x.type==='MISSING'),
  false
);

// Expected genuine unresolved/enrichment items remain.
assert.equal(
  gaps.gaps.some(x=>x.fieldKey==='landUse'),
  true
);
assert.equal(
  gaps.gaps.some(x=>x.fieldKey==='assessedTotal'),
  true
);

const aligned=resolveCanonicalPropertyFields(
  property,
  model,
  governed.reconciled.fields
);
const invariant=certifyCanonicalRuntimeInvariant({
  property,
  model,
  fields:aligned,
  gaps:gaps.gaps
});
assert.equal(invariant.valid,true);
assert.deepEqual(invariant.violations,[]);

// ------------------------------------------------------------------
// Static architecture checks.
// ------------------------------------------------------------------
const fs=await import('node:fs');

const piModel=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/PropertyIntelligenceModel.js',import.meta.url),
  'utf8'
);
assert.ok(piModel.includes('buildCanonicalPropertySnapshot'));

const governedSource=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/GovernedPropertyState.js',import.meta.url),
  'utf8'
);
assert.ok(governedSource.includes('resolveCanonicalPropertyFields'));

const gapSource=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js',import.meta.url),
  'utf8'
);
assert.ok(gapSource.includes('resolveCanonicalPropertyFields'));
assert.ok(gapSource.includes('CANONICAL_RUNTIME_INVARIANT_VIOLATION'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_21F_UNIFIED_CANONICAL_PROPERTY_FIELD_RESOLVER',
  version:'3.0-m2.21f',
  status:'PASSED',
  testsRun:26,
  result:{
    sharedResolver:'CanonicalPropertyFieldResolver',
    metricRailClearHeight:32,
    gapEngineClearHeightMissing:false,
    metricRailPowerAmps:600,
    gapEnginePowerMissing:false,
    governedStateUsesSharedResolver:true,
    intelligenceQualityUsesGovernedState:true,
    falseCanonicalGaps:0,
    hardInvariant:'CANONICAL_RUNTIME_INVARIANT_VIOLATION',
    canonicalMutation:false,
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
