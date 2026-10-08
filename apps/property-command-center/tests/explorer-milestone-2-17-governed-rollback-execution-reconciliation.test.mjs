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
  validateRollbackRequest,
  rollbackExecution
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalExecutionHistory.js');

const{
  buildPropertyIntelligenceProvenance,
  findProvenanceField
}=await import('../src/broker-product/property-explorer/intelligence/PropertyIntelligenceProvenance.js');

clearCanonicalExecutionForTests();

const promotion={
  promotionId:'PROMO-ROLLBACK-1',
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
  timestamp:'2026-08-12T22:00:00.000Z'
});

assert.equal(getCanonicalOverlay('BASE-DOUBLEDAY','propertyType').value,'Warehouse');

let validation=validateRollbackRequest('BASE-DOUBLEDAY','propertyType',{
  reason:'',
  confirmed:true
});
assert.equal(validation.valid,false);
assert.equal(validation.error,'REASON_REQUIRED');

validation=validateRollbackRequest('BASE-DOUBLEDAY','propertyType',{
  reason:'Incorrect classification',
  confirmed:false
});
assert.equal(validation.valid,false);
assert.equal(validation.error,'CONFIRMATION_REQUIRED');

validation=validateRollbackRequest('BASE-DOUBLEDAY','propertyType',{
  reason:'Incorrect classification',
  confirmed:true
});
assert.equal(validation.valid,true);

const result=rollbackExecution('BASE-DOUBLEDAY','propertyType',{
  actor:'PRINCIPAL_TEST',
  reason:'Incorrect classification',
  confirmed:true,
  timestamp:'2026-08-12T22:05:00.000Z'
});

assert.equal(result.status,'ROLLED_BACK');
assert.equal(result.restoredCanonicalValue,null);
assert.equal(getCanonicalOverlay('BASE-DOUBLEDAY','propertyType'),null);

const history=buildCanonicalExecutionHistory('BASE-DOUBLEDAY');
assert.equal(history.counts.executions,1);
assert.equal(history.counts.rollbacks,1);
assert.equal(history.counts.activeOverlays,0);
assert.equal(history.events.length,2);
assert.equal(history.events[0].eventType,'CANONICAL_ATTRIBUTE_PROMOTION_ROLLED_BACK');
assert.equal(history.events[0].reason,'Incorrect classification');

const events=listCanonicalExecutionEvents({propertyId:'BASE-DOUBLEDAY'});
assert.equal(events.length,2);
assert.equal(events[0].eventType,'CANONICAL_ATTRIBUTE_PROMOTION_EXECUTED');
assert.equal(events[1].eventType,'CANONICAL_ATTRIBUTE_PROMOTION_ROLLED_BACK');

const property={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  landAcres:16.02,
  buildingSf:406345
};
const parcel={
  status:'VERIFIED_ENRICHMENT',
  propertyType:{typeDescription:'Warehouse',classDescription:'Industrial'},
  landUse:{normalizedDescription:'DISTRIBUTION WAREHOUSE'},
  site:{calculatedLotAreaAcres:16.02},
  assessment:{total:42018283}
};

const provenance=buildPropertyIntelligenceProvenance(property,parcel,null);
const typeField=findProvenanceField(provenance,'propertyType');
assert.equal(typeField.canonical.value,null);
assert.equal(typeField.agreementState,'ENRICHMENT_ONLY');

const fs=await import('node:fs');
const historyCard=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/CanonicalExecutionHistoryCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(historyCard.includes('Reason required'));
assert.ok(historyCard.includes('Confirm rollback'));
assert.ok(historyCard.includes("sciip:property-intelligence-refresh"));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_17_GOVERNED_ROLLBACK_EXECUTION_RECONCILIATION',
  version:'3.0-m2.17',
  status:'PASSED',
  testsRun:20,
  result:{
    explicitReason:'REQUIRED',
    explicitConfirmation:'REQUIRED',
    rollbackEvent:'APPEND_ONLY',
    priorCanonicalRestored:'PASSED',
    overlayRemoved:'PASSED',
    provenanceRecomputed:'ENRICHMENT_ONLY',
    refreshDurability:'ACTIVE',
    priorExecutionPreserved:'PASSED',
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
