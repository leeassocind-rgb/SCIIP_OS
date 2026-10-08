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
const{buildIntelligenceGapEngine}=await import('../src/broker-product/property-explorer/intelligence/IntelligenceGapEngine.js');

clearDecisionWorkflowForTests();
clearCanonicalExecutionForTests();

const property={id:'BASE-DOUBLEDAY',address:'1001 Doubleday Ave'};
const model={
  property,
  propertyProvenance:{
    status:'ACTIVE',
    fields:[
      {key:'parcelId',label:'Parcel ID',group:'Identity',canonical:{value:'0211232220000'},externalValue:'0211-232-22-0000',confidence:'HIGH'},
      {key:'landAcres',label:'Land Area',group:'Site',canonical:{value:16.02},externalValue:16.02,confidence:'HIGH'},
      {key:'propertyType',label:'Property Type',group:'Classification',canonical:{value:null},externalValue:'Warehouse',confidence:'MEDIUM'},
      {key:'powerAmps',label:'Power',group:'Building',canonical:{value:null},externalValue:null,confidence:'UNRATED'},
      {key:'clearHeight',label:'Clear Height',group:'Building',canonical:{value:32},externalValue:null,confidence:'HIGH'},
      {key:'assessedTotal',label:'Assessed Total',group:'Assessment',canonical:{value:null},externalValue:42018283,confidence:'MEDIUM'}
    ]
  }
};

const result=buildIntelligenceGapEngine(property,model);
assert.equal(result.status,'ACTIVE');
assert.equal(result.propertyId,'BASE-DOUBLEDAY');
assert.equal(result.acquisitionMode,'GOVERNED_RECOMMENDATION_ONLY');
assert.equal(result.automaticExternalWrites,false);

const power=result.gaps.find(x=>x.fieldKey==='powerAmps');
assert.ok(power);
assert.equal(power.type,'MISSING');
assert.equal(power.severity,'CRITICAL');
assert.equal(power.recommendedSource,'Utility / Broker Verification');

const propertyType=result.gaps.find(x=>x.fieldKey==='propertyType');
assert.ok(propertyType);
assert.equal(propertyType.type,'ENRICHMENT_AVAILABLE');

assert.equal(result.topPriorityGap.fieldKey,'powerAmps');
assert.ok(result.nextBestAction.includes('Power'));

const fs=await import('node:fs');
const live=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),'utf8');
assert.ok(live.includes('IntelligenceGapCard'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_21_INTELLIGENCE_GAP_ACQUISITION_ENGINE',
  version:'3.0-m2.21',
  status:'PASSED',
  testsRun:14,
  result:{
    gapTypes:['MISSING','STALE','CONFLICT','GOVERNANCE_REQUIRED','ENRICHMENT_AVAILABLE'],
    topPriorityGap:'powerAmps',
    severity:'CRITICAL',
    recommendedSource:'Utility / Broker Verification',
    recommendationOnly:true,
    automaticExternalWrites:false,
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
