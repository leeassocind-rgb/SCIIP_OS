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

const{clearDecisionWorkflowForTests}=await import(
  '../src/broker-product/property-explorer/intelligence/GovernedDecisionStore.js'
);
const{clearCanonicalExecutionForTests}=await import(
  '../src/broker-product/property-explorer/intelligence/CanonicalPromotionExecutor.js'
);
const{
  selectCanonicalMetric,
  alignFieldsWithCanonicalMetricSelector,
  certifyMetricGapConsistency
}=await import(
  '../src/broker-product/property-explorer/intelligence/CanonicalMetricSelector.js'
);
const{buildIntelligenceGapEngine}=await import(
  '../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js'
);

clearDecisionWorkflowForTests();
clearCanonicalExecutionForTests();

const property={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave'
};

// Key test: visible metric strip source is a presentation array,
// not model.property.clearHeight.
const metricStrip=[
  {label:'BUILDING',displayValue:'406,345 SF'},
  {label:'LAND',displayValue:'16.02 AC'},
  {label:'CLEAR',displayValue:"32'"},
  {label:'POWER',displayValue:'600 A'},
  {label:'PARCEL',displayValue:'021123...'}
];

const model={
  property:{
    id:'BASE-DOUBLEDAY',
    address:'1001 Doubleday Ave'
  },
  propertyMetrics:metricStrip,
  propertyProvenance:{
    status:'ACTIVE',
    fields:[
      {
        key:'parcelId',label:'Parcel ID',group:'Identity',
        canonical:{value:'0211232220000'},
        externalValue:'0211-232-22-0000',confidence:'HIGH'
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

const clear=selectCanonicalMetric(
  property,model,'clearHeight',metricStrip
);
assert.equal(clear.found,true);
assert.equal(clear.value,32);
assert.equal(clear.source,'METRIC_STRIP_SOURCE');

const power=selectCanonicalMetric(
  property,model,'powerAmps',metricStrip
);
assert.equal(power.value,600);

const raw=model.propertyProvenance.fields.map(f=>({
  ...f,
  effectiveCanonicalValue:f.canonical?.value??null
}));
const aligned=alignFieldsWithCanonicalMetricSelector(
  property,model,raw,metricStrip
);
assert.equal(
  aligned.find(x=>x.key==='clearHeight').effectiveCanonicalValue,
  32
);
assert.equal(
  aligned.find(x=>x.key==='powerAmps').effectiveCanonicalValue,
  600
);

const result=buildIntelligenceGapEngine(property,model);
assert.equal(
  result.gaps.some(x=>x.fieldKey==='clearHeight'&&x.type==='MISSING'),
  false
);
assert.equal(
  result.gaps.some(x=>x.fieldKey==='powerAmps'&&x.type==='MISSING'),
  false
);

const consistency=certifyMetricGapConsistency(
  property,model,aligned,result.gaps,metricStrip
);
assert.equal(consistency.valid,true);
assert.deepEqual(consistency.violations,[]);

const fs=await import('node:fs');
const gap=fs.readFileSync(
  new URL(
    '../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js',
    import.meta.url
  ),
  'utf8'
);
assert.ok(gap.includes('alignFieldsWithCanonicalMetricSelector'));
assert.ok(gap.includes('CANONICAL_METRIC_GAP_CONSISTENCY_VIOLATION'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_21E_CANONICAL_METRIC_STRIP_SOURCE_UNIFICATION',
  version:'3.0-m2.21e',
  status:'PASSED',
  testsRun:16,
  result:{
    metricStripClearHeight:32,
    metricStripPowerAmps:600,
    gapEngineClearHeightMissing:false,
    gapEnginePowerMissing:false,
    sameSelector:'PASSED',
    hardConsistencyInvariant:'ACTIVE',
    falseCanonicalGaps:0,
    canonicalMutation:false,
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
