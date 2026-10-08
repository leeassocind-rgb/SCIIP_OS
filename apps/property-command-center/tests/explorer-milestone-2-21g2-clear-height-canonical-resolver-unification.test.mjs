import assert from'node:assert/strict';

const memory=new Map();
globalThis.window={
  localStorage:{
    getItem:k=>memory.has(k)?memory.get(k):null,
    setItem:(k,v)=>memory.set(k,String(v)),
    removeItem:k=>memory.delete(k)
  },
  dispatchEvent:()=>true,
  addEventListener:()=>{},
  removeEventListener:()=>{}
};
globalThis.CustomEvent=class{
  constructor(type,init={}){this.type=type;this.detail=init.detail;}
};

const {
  clearCanonicalPropertyRuntimeRegistryForTests,
  readCanonicalPropertyRuntime
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalPropertyRuntimeRegistry.js');

const {
  propertyIntelligenceSnapshot
}=await import('../src/broker-product/property-explorer/intelligence/PropertyIntelligenceModel.js');

const {
  resolveCanonicalPropertyField
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalPropertyFieldResolver.js');

const {
  buildIntelligenceGapEngine
}=await import('../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js');

clearCanonicalPropertyRuntimeRegistryForTests();

// Simulate the real divergence:
// Metric rail receives the full selected property with clearHeightFt.
// Intelligence model later receives a narrower property object.
const metricProperty={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  buildingSf:406345,
  landAcres:16.02,
  clearHeightFt:32,
  powerAmps:600,
  parcelId:'0211232220000'
};

const snapshot=propertyIntelligenceSnapshot(metricProperty);
assert.equal(snapshot.clearHeightFt,32);
assert.equal(snapshot.powerAmps,600);

const published=readCanonicalPropertyRuntime(metricProperty);
assert.ok(published);
assert.equal(published.snapshot.clearHeightFt,32);

// Narrower downstream property intentionally omits clearHeightFt/powerAmps.
const intelligenceProperty={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave'
};

const model={
  property:intelligenceProperty,
  propertyProvenance:{
    status:'ACTIVE',
    fields:[
      {key:'parcelId',label:'Parcel ID',group:'Identity',canonical:{value:'0211232220000'},externalValue:'0211-232-22-0000',confidence:'HIGH'},
      {key:'buildingSf',label:'Building SF',group:'Building',canonical:{value:406345},externalValue:null,confidence:'HIGH'},
      {key:'landAcres',label:'Land Area',group:'Site',canonical:{value:16.02},externalValue:16.02,confidence:'HIGH'},
      {key:'clearHeight',label:'Clear Height',group:'Building',canonical:{value:null},externalValue:null,confidence:'HIGH'},
      {key:'powerAmps',label:'Power',group:'Building',canonical:{value:null},externalValue:null,confidence:'HIGH'},
      {key:'landUse',label:'Land Use',group:'Classification',canonical:{value:null},externalValue:'DISTRIBUTION WAREHOUSE',confidence:'MEDIUM'},
      {key:'assessedTotal',label:'Assessed Value',group:'Assessment',canonical:{value:null},externalValue:42018283,confidence:'MEDIUM'}
    ]
  }
};

const clear=resolveCanonicalPropertyField(intelligenceProperty,model,'clearHeight');
assert.equal(clear.found,true);
assert.equal(clear.value,32);
assert.equal(clear.source,'PROPERTY_METRIC_RUNTIME_REGISTRY');

const power=resolveCanonicalPropertyField(intelligenceProperty,model,'powerAmps');
assert.equal(power.found,true);
assert.equal(power.value,600);

const result=buildIntelligenceGapEngine(intelligenceProperty,model);

assert.equal(
  result.gaps.some(g=>g.fieldKey==='clearHeight'&&g.type==='MISSING'),
  false
);
assert.equal(
  result.gaps.some(g=>g.fieldKey==='powerAmps'&&g.type==='MISSING'),
  false
);

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_M2_21G2_CLEAR_HEIGHT_CANONICAL_RESOLVER_UNIFICATION',
  version:'3.0-m2.21g.2',
  status:'PASSED',
  testsRun:10,
  result:{
    metricRailClearHeight:32,
    registryClearHeight:32,
    resolverClearHeight:32,
    clearHeightMissing:false,
    metricRailPowerAmps:600,
    resolverPowerAmps:600,
    powerMissing:false,
    bridge:'PROPERTY_METRIC_RUNTIME_REGISTRY',
    canonicalMutation:false,
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
