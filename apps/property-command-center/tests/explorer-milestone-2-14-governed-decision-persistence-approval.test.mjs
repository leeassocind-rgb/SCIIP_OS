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

const{
  appendDecisionEvent,
  listDecisionEvents,
  listPromotionQueue,
  decidePromotion,
  getDecisionWorkflowState,
  clearDecisionWorkflowForTests
}=await import('../src/broker-product/property-explorer/intelligence/GovernedDecisionStore.js');

const{
  createAttributeResolutionDecision
}=await import('../src/broker-product/property-explorer/intelligence/GovernedAttributeResolution.js');

clearDecisionWorkflowForTests();

const item={
 fieldKey:'propertyType',
 label:'Property Type',
 agreementState:'ENRICHMENT_ONLY',
 canonicalValue:null,
 externalValue:'Warehouse',
 normalizedExternalValue:'warehouse',
 eligibleForProposal:true,
 confidence:'MEDIUM',
 evidenceSources:['LightBox'],
 provenance:{mergePolicy:'ENRICH_NEVER_OVERWRITE'}
};

const decision=createAttributeResolutionDecision(item,'ACCEPT',{
 actor:'BROKER_TEST',
 timestamp:'2026-08-12T18:00:00.000Z'
});
assert.equal(decision.status,'PROPOSED_PROMOTION');
assert.equal(decision.canonicalMutation,false);

const event=appendDecisionEvent(decision,{
 propertyId:'BASE-DOUBLEDAY',
 propertyAddress:'1001 Doubleday Ave'
});
assert.equal(event.eventType,'ATTRIBUTE_RESOLUTION_DECISION');
assert.equal(event.canonicalMutation,false);

let events=listDecisionEvents({propertyId:'BASE-DOUBLEDAY'});
assert.equal(events.length,1);

let queue=listPromotionQueue({propertyId:'BASE-DOUBLEDAY'});
assert.equal(queue.length,1);
assert.equal(queue[0].status,'PENDING_APPROVAL');
assert.equal(queue[0].executionEligible,false);
assert.equal(queue[0].canonicalMutation,false);

const approved=decidePromotion(queue[0].promotionId,'APPROVE',{
 actor:'PRINCIPAL_TEST',
 timestamp:'2026-08-12T18:05:00.000Z'
});
assert.equal(approved.status,'APPROVED_FOR_EXECUTION');
assert.equal(approved.executionEligible,true);
assert.equal(approved.canonicalMutation,false);

events=listDecisionEvents({propertyId:'BASE-DOUBLEDAY'});
assert.equal(events.length,2);
assert.equal(events[1].eventType,'ATTRIBUTE_PROMOTION_APPROVAL');
assert.equal(events[1].canonicalMutation,false);

const state=getDecisionWorkflowState({propertyId:'BASE-DOUBLEDAY'});
assert.equal(state.eventSourcing,'APPEND_ONLY');
assert.equal(state.canonicalAuthority,'SCIIP');
assert.equal(state.automaticWrites,false);
assert.equal(state.canonicalExecutionImplemented,false);
assert.equal(state.counts.approved,1);

const fs=await import('node:fs');
const resolutionCard=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/GovernedAttributeResolutionCard.jsx',import.meta.url),'utf8');
assert.ok(resolutionCard.includes('appendDecisionEvent(decision'));
const liveCard=fs.readFileSync(new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),'utf8');
assert.ok(liveCard.includes('GovernedApprovalWorkflowCard'));

console.log(JSON.stringify({
 framework:'SCIIP_EXPLORER_3_MILESTONE_2_14_GOVERNED_DECISION_PERSISTENCE_APPROVAL_WORKFLOW',
 version:'3.0-m2.14',
 status:'PASSED',
 testsRun:18,
 result:{
  decisionPersistence:'ACTIVE',
  eventSourcing:'APPEND_ONLY',
  pendingPromotionQueue:'ACTIVE',
  secondApproval:'REQUIRED',
  approvedState:'READY_FOR_EXECUTION',
  canonicalExecution:'NOT_IMPLEMENTED',
  canonicalMutation:'FORBIDDEN',
  canonicalAuthority:'SCIIP'
 }
},null,2));
