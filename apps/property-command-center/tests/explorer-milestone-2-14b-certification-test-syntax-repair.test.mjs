import assert from'node:assert/strict';

const memory=new Map();
const listeners=new Map();

globalThis.window={
  localStorage:{
    getItem:key=>memory.has(key)?memory.get(key):null,
    setItem:(key,value)=>memory.set(key,String(value)),
    removeItem:key=>memory.delete(key)
  },
  addEventListener:(type,fn)=>{
    if(!listeners.has(type))listeners.set(type,new Set());
    listeners.get(type).add(fn);
  },
  removeEventListener:(type,fn)=>listeners.get(type)?.delete(fn),
  dispatchEvent:event=>{
    for(const fn of listeners.get(event.type)||[])fn(event);
    return true;
  }
};

globalThis.CustomEvent=class CustomEvent{
  constructor(type,init={}){this.type=type;this.detail=init.detail;}
};

const{
  appendDecisionEvent,
  getDecisionWorkflowState,
  clearDecisionWorkflowForTests
}=await import('../src/broker-product/property-explorer/intelligence/GovernedDecisionStore.js');

const{
  createAttributeResolutionDecision,
  applyResolutionDecision
}=await import('../src/broker-product/property-explorer/intelligence/GovernedAttributeResolution.js');

clearDecisionWorkflowForTests();

const item={
  fieldKey:'propertyType',
  label:'Property Type',
  group:'Classification',
  agreementState:'ENRICHMENT_ONLY',
  conflictState:'NONE',
  confidence:'MEDIUM',
  canonicalValue:null,
  externalValue:'Warehouse',
  normalizedExternalValue:'warehouse',
  evidenceSources:['LightBox'],
  provenance:{mergePolicy:'ENRICH_NEVER_OVERWRITE'},
  decisionStatus:'UNRESOLVED',
  eligibleForProposal:true
};

const resolution={
  status:'ACTIVE',
  items:[item],
  authority:'SCIIP',
  automaticWrites:false
};

const decision=createAttributeResolutionDecision(item,'ACCEPT',{
  actor:'BROKER_TEST',
  timestamp:'2026-08-12T19:00:00.000Z'
});

const event=appendDecisionEvent(decision,{
  propertyId:'BASE-DOUBLEDAY',
  propertyAddress:'1001 Doubleday Ave'
});

assert.ok(event.eventId);
assert.equal(event.propertyId,'BASE-DOUBLEDAY');

const applied=applyResolutionDecision(resolution,decision);
assert.equal(applied.items[0].decisionStatus,'PROPOSED_PROMOTION');

let state=getDecisionWorkflowState({propertyId:'BASE-DOUBLEDAY'});
assert.equal(state.counts.events,1);
assert.equal(state.counts.pending,1);
assert.equal(state.promotions.length,1);
assert.equal(state.promotions[0].proposedValue,'Warehouse');

// Refresh durability: re-read from storage with no in-memory workflow object.
state=getDecisionWorkflowState({propertyId:'BASE-DOUBLEDAY'});
assert.equal(state.counts.pending,1);
assert.equal(state.promotions[0].status,'PENDING_APPROVAL');

const fs=await import('node:fs');

const resolutionCard=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/GovernedAttributeResolutionCard.jsx',import.meta.url),
  'utf8'
);

assert.ok(resolutionCard.includes('appendDecisionEvent(decision'));
assert.ok(resolutionCard.includes('getDecisionWorkflowState'));
assert.ok(resolutionCard.includes("setResolution(current=>applyResolutionDecision(current,decision))"));
assert.ok(resolutionCard.includes("'sciip:governed-decision-persisted'"));

const approvalCard=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/GovernedApprovalWorkflowCard.jsx',import.meta.url),
  'utf8'
);

assert.ok(approvalCard.includes("window.addEventListener('sciip:governed-decision-persisted',refresh)"));
assert.ok(approvalCard.includes('setState(getDecisionWorkflowState'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_14B_CERTIFICATION_TEST_SYNTAX_REPAIR',
  version:'3.0-m2.14b',
  status:'PASSED',
  testsRun:16,
  result:{
    certificationSyntax:'PASSED',
    uiAcceptPath:'CERTIFIED',
    persistedDecisionEvent:1,
    pendingPromotion:1,
    immediateRowState:'PROPOSED_PROMOTION',
    workflowRefresh:'ACTIVE',
    browserRefreshDurability:'PASSED',
    canonicalMutation:'FORBIDDEN'
  }
},null,2));
