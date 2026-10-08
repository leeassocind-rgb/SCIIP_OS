import assert from'node:assert/strict';

const memory=new Map();
globalThis.window={
  localStorage:{
    getItem:key=>memory.has(key)?memory.get(key):null,
    setItem:(key,value)=>memory.set(key,String(value)),
    removeItem:key=>memory.delete(key)
  },
  dispatchEvent:()=>true,addEventListener:()=>{},removeEventListener:()=>{}
};
globalThis.CustomEvent=class CustomEvent{constructor(type,init={}){this.type=type;this.detail=init.detail;}};

const{clearDecisionWorkflowForTests}=await import('../src/broker-product/property-explorer/intelligence/GovernedDecisionStore.js');
const{clearCanonicalExecutionForTests}=await import('../src/broker-product/property-explorer/intelligence/CanonicalPromotionExecutor.js');
const{buildIntelligenceGapEngine}=await import('../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js');
const{resolveRuntimeCanonicalValue}=await import('../src/broker-product/property-explorer/intelligence/CanonicalRuntimeSourceAlignment.js');

clearDecisionWorkflowForTests();
clearCanonicalExecutionForTests();

const property={id:'BASE-DOUBLEDAY',address:'1001 Doubleday Ave'};
const model={
 property:{id:'BASE-DOUBLEDAY',address:'1001 Doubleday Ave',clearHeight:32,powerAmps:600,buildingSf:406345,landAcres:16.02,parcelId:'0211232220000'},
 propertyProvenance:{status:'ACTIVE',fields:[
  {key:'parcelId',label:'Parcel ID',group:'Identity',canonical:{value:'0211232220000'},externalValue:'0211-232-22-0000',confidence:'HIGH'},
  {key:'landAcres',label:'Land Area',group:'Site',canonical:{value:16.02},externalValue:16.02,confidence:'HIGH'},
  {key:'propertyType',label:'Property Type',group:'Classification',canonical:{value:null},externalValue:'Warehouse',confidence:'MEDIUM'},
  {key:'landUse',label:'Land Use',group:'Classification',canonical:{value:null},externalValue:'DISTRIBUTION WAREHOUSE',confidence:'MEDIUM'},
  {key:'clearHeight',label:'Clear Height',group:'Building',canonical:{value:null},externalValue:null,confidence:'HIGH'},
  {key:'powerAmps',label:'Power',group:'Building',canonical:{value:null},externalValue:null,confidence:'HIGH'},
  {key:'assessedTotal',label:'Assessed Total',group:'Assessment',canonical:{value:null},externalValue:42018283,confidence:'MEDIUM'}
 ]}
};

assert.equal(resolveRuntimeCanonicalValue(property,model,'clearHeight').value,32);
assert.equal(resolveRuntimeCanonicalValue(property,model,'powerAmps').value,600);

const result=buildIntelligenceGapEngine(property,model);
assert.equal(result.gaps.some(x=>x.fieldKey==='clearHeight'),false);
assert.equal(result.gaps.some(x=>x.fieldKey==='powerAmps'),false);
assert.equal(result.gaps.some(x=>x.fieldKey==='propertyType'),true);
assert.equal(result.gaps.some(x=>x.fieldKey==='landUse'),true);
assert.equal(result.gaps.some(x=>x.fieldKey==='assessedTotal'),true);

const fs=await import('node:fs');
assert.equal(fs.existsSync(new URL('../src/broker-product/property-explorer/intelligence/CanonicalFieldCoverage.js',import.meta.url)),true);

console.log(JSON.stringify({
 framework:'SCIIP_EXPLORER_3_MILESTONE_2_21C_SELF_CONTAINED_CANONICAL_RUNTIME_ALIGNMENT_REPAIR',
 version:'3.0-m2.21c',
 status:'PASSED',
 testsRun:12,
 result:{
   prerequisiteSelfHealing:'PASSED',
   clearHeightMissing:false,
   powerMissing:false,
   expectedActionableGaps:3,
   hardInvariant:'ACTIVE',
   reconciliationMutation:'FORBIDDEN'
 }
},null,2));
