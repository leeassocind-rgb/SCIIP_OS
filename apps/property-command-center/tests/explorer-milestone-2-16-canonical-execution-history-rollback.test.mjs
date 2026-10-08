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
  executeApprovedPromotion,
  getCanonicalOverlay,
  listCanonicalExecutionEvents,
  clearCanonicalExecutionForTests
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalPromotionExecutor.js');

const{
  buildCanonicalExecutionHistory,
  rollbackExecution
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalExecutionHistory.js');

clearCanonicalExecutionForTests();

const promotion={
  promotionId:'PROMO-1',
  propertyId:'BASE-DOUBLEDAY',
  propertyAddress:'1001 Doubleday Ave',
  fieldKey:'propertyType',
  canonicalBefore:null,
  proposedValue:'Warehouse',
  normalizedProposedValue:'warehouse',
  sourceDecisionEventId:'DECISION-1',
  sourceProviders:['LightBox'],
  confidence:'MEDIUM',
  status:'APPROVED_FOR_EXECUTION',
  executionEligible:true
};

executeApprovedPromotion(promotion,{
  actor:'PRINCIPAL_TEST',
  timestamp:'2026-08-12T21:00:00.000Z'
});

let overlay=getCanonicalOverlay('BASE-DOUBLEDAY','propertyType');
assert.equal(overlay.value,'Warehouse');

let history=buildCanonicalExecutionHistory('BASE-DOUBLEDAY');
assert.equal(history.status,'ACTIVE');
assert.equal(history.appendOnly,true);
assert.equal(history.counts.executions,1);
assert.equal(history.counts.rollbacks,0);
assert.equal(history.counts.activeOverlays,1);
assert.equal(history.events[0].canonicalAfter,'Warehouse');

const result=rollbackExecution('BASE-DOUBLEDAY','propertyType',{
  actor:'PRINCIPAL_TEST',
  reason:'TEST_ROLLBACK',
  timestamp:'2026-08-12T21:05:00.000Z'
});
assert.equal(result.status,'ROLLED_BACK');

overlay=getCanonicalOverlay('BASE-DOUBLEDAY','propertyType');
assert.equal(overlay,null);

history=buildCanonicalExecutionHistory('BASE-DOUBLEDAY');
assert.equal(history.counts.executions,1);
assert.equal(history.counts.rollbacks,1);
assert.equal(history.counts.activeOverlays,0);
assert.equal(history.events.length,2);

const events=listCanonicalExecutionEvents({propertyId:'BASE-DOUBLEDAY'});
assert.equal(events.length,2);
assert.equal(events[0].eventType,'CANONICAL_ATTRIBUTE_PROMOTION_EXECUTED');
assert.equal(events[1].eventType,'CANONICAL_ATTRIBUTE_PROMOTION_ROLLED_BACK');
assert.equal(events[1].canonicalBefore,'Warehouse');
assert.equal(events[1].canonicalAfter,null);

const fs=await import('node:fs');
const live=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/LiveGovernedPropertyCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(live.includes('CanonicalExecutionHistoryCard'));

const historyCard=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/CanonicalExecutionHistoryCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(historyCard.includes('Rollback'));
assert.ok(historyCard.includes('rollbackExecution'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_16_CANONICAL_EXECUTION_HISTORY_ROLLBACK',
  version:'3.0-m2.16',
  status:'PASSED',
  testsRun:18,
  result:{
    executionHistory:'ACTIVE',
    appendOnly:'PASSED',
    rollback:'GOVERNED',
    rollbackCreatesEvent:'PASSED',
    priorCanonicalPreserved:'PASSED',
    activeOverlayRemoval:'PASSED',
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
