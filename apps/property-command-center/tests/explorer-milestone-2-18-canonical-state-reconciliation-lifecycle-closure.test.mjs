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
  listPromotionQueue,
  decidePromotion,
  clearDecisionWorkflowForTests
}=await import('../src/broker-product/property-explorer/intelligence/GovernedDecisionStore.js');

const{
  createAttributeResolutionDecision
}=await import('../src/broker-product/property-explorer/intelligence/GovernedAttributeResolution.js');

const{
  executeApprovedPromotion,
  clearCanonicalExecutionForTests
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalPromotionExecutor.js');

const{
  rollbackExecution
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalExecutionHistory.js');

const{
  buildFieldDecisionLifecycle,
  buildDecisionLifecycleRegistry
}=await import('../src/broker-product/property-explorer/intelligence/DecisionLifecycle.js');

const{
  reconcileFieldPresentation
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalStateReconciler.js');

clearDecisionWorkflowForTests();
clearCanonicalExecutionForTests();

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

const decision=createAttributeResolutionDecision(item,'ACCEPT',{
  actor:'BROKER_TEST',
  timestamp:'2026-08-12T23:00:00.000Z'
});
appendDecisionEvent(decision,{
  propertyId:'BASE-DOUBLEDAY',
  propertyAddress:'1001 Doubleday Ave'
});

let life=buildFieldDecisionLifecycle('BASE-DOUBLEDAY','propertyType');
assert.equal(life.state,'PROPOSED');
assert.equal(life.candidateVisible,false);

let queue=listPromotionQueue({propertyId:'BASE-DOUBLEDAY'});
const approved=decidePromotion(queue[0].promotionId,'APPROVE',{
  actor:'PRINCIPAL_TEST',
  timestamp:'2026-08-12T23:05:00.000Z'
});

life=buildFieldDecisionLifecycle('BASE-DOUBLEDAY','propertyType');
assert.equal(life.state,'APPROVED');

executeApprovedPromotion(approved,{
  actor:'PRINCIPAL_TEST',
  timestamp:'2026-08-12T23:10:00.000Z'
});

life=buildFieldDecisionLifecycle('BASE-DOUBLEDAY','propertyType');
assert.equal(life.state,'EXECUTED');
assert.equal(life.closed,true);
assert.equal(life.activeCanonicalValue,'Warehouse');

const field={
  key:'propertyType',
  label:'Property Type',
  group:'Classification',
  canonical:{value:null,authority:'SCIIP'},
  externalValue:'Warehouse',
  confidence:'MEDIUM'
};
let presentation=reconcileFieldPresentation('BASE-DOUBLEDAY',field);
assert.equal(presentation.effectiveCanonicalValue,'Warehouse');
assert.equal(presentation.effectiveAgreementState,'AGREED');

rollbackExecution('BASE-DOUBLEDAY','propertyType',{
  actor:'PRINCIPAL_TEST',
  reason:'Lifecycle closure test',
  confirmed:true,
  timestamp:'2026-08-12T23:15:00.000Z'
});

life=buildFieldDecisionLifecycle('BASE-DOUBLEDAY','propertyType');
assert.equal(life.state,'ROLLED_BACK');
assert.equal(life.candidateVisible,true);
assert.equal(life.activeCanonicalValue,null);

presentation=reconcileFieldPresentation('BASE-DOUBLEDAY',field);
assert.equal(presentation.effectiveCanonicalValue,null);
assert.equal(presentation.effectiveAgreementState,'ENRICHMENT_ONLY');
assert.equal(presentation.restoredByRollback,true);

const registry=buildDecisionLifecycleRegistry('BASE-DOUBLEDAY',['propertyType']);
assert.equal(registry.counts.rolledBack,1);
assert.equal(registry.reconstruction,'EVENT_DERIVED');
assert.equal(registry.refreshDurable,true);

// Refresh reconstruction: derive state again solely from durable stores.
const refreshed=buildFieldDecisionLifecycle('BASE-DOUBLEDAY','propertyType');
assert.equal(refreshed.state,'ROLLED_BACK');
assert.equal(refreshed.proposedValue,'Warehouse');

const fs=await import('node:fs');
const live=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(live.includes('DecisionLifecycleCard'));

const resolutionCard=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/GovernedAttributeResolutionCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(resolutionCard.includes("life.state==='EXECUTED'"));
assert.ok(resolutionCard.includes("life.state==='ROLLED_BACK'"));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_18_CANONICAL_STATE_RECONCILIATION_DECISION_LIFECYCLE_CLOSURE',
  version:'3.0-m2.18',
  status:'PASSED',
  testsRun:22,
  result:{
    lifecycle:'PROPOSED>APPROVED>EXECUTED>ROLLED_BACK',
    executedCandidateRetirement:'PASSED',
    rollbackCandidateResurrection:'PASSED',
    canonicalStateReconciliation:'PASSED',
    provenanceAfterExecution:'AGREED',
    provenanceAfterRollback:'ENRICHMENT_ONLY',
    browserRefreshReconstruction:'EVENT_DERIVED',
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
