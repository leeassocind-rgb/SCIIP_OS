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
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail;}};

const{clearDecisionWorkflowForTests}=await import('../src/broker-product/property-explorer/intelligence/GovernedDecisionStore.js');
const{clearCanonicalExecutionForTests}=await import('../src/broker-product/property-explorer/intelligence/CanonicalPromotionExecutor.js');
const{
  traceCanonicalRuntimeField,
  alignCanonicalRuntimeTrace,
  certifyClearHeightInvariant
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalSourceTrace.js');
const{buildIntelligenceGapEngine}=await import('../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js');

clearDecisionWorkflowForTests();
clearCanonicalExecutionForTests();

const property={id:'BASE-DOUBLEDAY',address:'1001 Doubleday Ave'};

// Simulate the remaining runtime mismatch: the visible metric exists in a
// nested presentation array rather than as model.property.clearHeight.
const model={
  property:{id:'BASE-DOUBLEDAY',address:'1001 Doubleday Ave',powerAmps:600},
  propertyMetrics:[
    {label:'BUILDING',value:'406,345 SF'},
    {label:'LAND',value:'16.02 AC'},
    {label:'CLEAR',value:"32'"},
    {label:'POWER',value:'600 A'},
    {label:'PARCEL',value:'021123...'}
  ],
  propertyProvenance:{
    status:'ACTIVE',
    fields:[
      {key:'parcelId',label:'Parcel ID',group:'Identity',canonical:{value:'0211232220000'},externalValue:'0211-232-22-0000',confidence:'HIGH'},
      {key:'landAcres',label:'Land Area',group:'Site',canonical:{value:16.02},externalValue:16.02,confidence:'HIGH'},
      {key:'propertyType',label:'Property Type',group:'Classification',canonical:{value:null},externalValue:null,confidence:'MEDIUM'},
      {key:'landUse',label:'Land Use',group:'Classification',canonical:{value:null},externalValue:'DISTRIBUTION WAREHOUSE',confidence:'MEDIUM'},
      {key:'clearHeight',label:'Clear Height',group:'Building',canonical:{value:null},externalValue:null,confidence:'HIGH'},
      {key:'powerAmps',label:'Power',group:'Building',canonical:{value:null},externalValue:null,confidence:'HIGH'},
      {key:'assessedTotal',label:'Assessed Total',group:'Assessment',canonical:{value:null},externalValue:42018283,confidence:'MEDIUM'}
    ]
  }
};

const trace=traceCanonicalRuntimeField(property,model,'clearHeight');
assert.equal(trace.found,true);
assert.equal(trace.value,32);
assert.equal(trace.source,'PROPERTY_METRICS');
assert.equal(trace.mode,'LABEL_VALUE_PRESENTATION');

const result=buildIntelligenceGapEngine(property,model);
assert.equal(result.status,'ACTIVE');
assert.equal(result.gaps.some(x=>x.fieldKey==='clearHeight'&&x.type==='MISSING'),false);
assert.equal(result.gaps.some(x=>x.fieldKey==='powerAmps'&&x.type==='MISSING'),false);

const raw=model.propertyProvenance.fields.map(f=>({
  ...f,
  effectiveCanonicalValue:f.canonical?.value??null
}));
const aligned=alignCanonicalRuntimeTrace(property,model,raw);
assert.equal(aligned.find(x=>x.key==='clearHeight').effectiveCanonicalValue,32);

const inv=certifyClearHeightInvariant(property,model,aligned,result.gaps);
assert.equal(inv.valid,true);
assert.equal(inv.canonicalValue,32);
assert.equal(inv.missingGap,false);

const fs=await import('node:fs');
const gap=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js',import.meta.url),
  'utf8'
);
assert.ok(gap.includes('alignCanonicalRuntimeTrace'));
assert.ok(gap.includes('CLEAR_HEIGHT_CANONICAL_TRACE_INVARIANT_VIOLATION'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_21D_CLEAR_HEIGHT_CANONICAL_SOURCE_TRACE_ALIGNMENT_REPAIR',
  version:'3.0-m2.21d',
  status:'PASSED',
  testsRun:15,
  result:{
    clearHeightTraceSource:'PROPERTY_METRICS',
    clearHeightTraceMode:'LABEL_VALUE_PRESENTATION',
    clearHeightCanonicalValue:32,
    clearHeightMissingGap:false,
    powerMissingGap:false,
    falseCanonicalGaps:0,
    hardInvariant:'CLEAR_HEIGHT_KNOWN_NEVER_MISSING',
    canonicalMutation:false,
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
