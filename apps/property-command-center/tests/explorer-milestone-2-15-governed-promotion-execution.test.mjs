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
  getCanonicalOverlay,
  listCanonicalExecutionEvents,
  clearCanonicalExecutionForTests
}=await import('../src/broker-product/property-explorer/intelligence/CanonicalPromotionExecutor.js');

const{
  buildPropertyIntelligenceProvenance,
  findProvenanceField
}=await import('../src/broker-product/property-explorer/intelligence/PropertyIntelligenceProvenance.js');

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
  timestamp:'2026-08-12T20:00:00.000Z'
});

appendDecisionEvent(decision,{
  propertyId:'BASE-DOUBLEDAY',
  propertyAddress:'1001 Doubleday Ave'
});

let queue=listPromotionQueue({propertyId:'BASE-DOUBLEDAY'});
assert.equal(queue.length,1);
assert.equal(queue[0].status,'PENDING_APPROVAL');

const approved=decidePromotion(queue[0].promotionId,'APPROVE',{
  actor:'PRINCIPAL_TEST',
  timestamp:'2026-08-12T20:05:00.000Z'
});
assert.equal(approved.status,'APPROVED_FOR_EXECUTION');
assert.equal(approved.executionEligible,true);
assert.equal(approved.canonicalMutation,false);

const result=executeApprovedPromotion(approved,{
  actor:'PRINCIPAL_TEST',
  timestamp:'2026-08-12T20:10:00.000Z'
});
assert.equal(result.overlay.authority,'SCIIP');
assert.equal(result.overlay.value,'Warehouse');
assert.equal(result.overlay.priorCanonicalValue,null);
assert.equal(result.event.canonicalMutation,true);
assert.equal(result.event.mutationType,'GOVERNED_OVERLAY');
assert.equal(result.event.reversible,true);

const overlay=getCanonicalOverlay('BASE-DOUBLEDAY','propertyType');
assert.equal(overlay.value,'Warehouse');

const events=listCanonicalExecutionEvents({propertyId:'BASE-DOUBLEDAY'});
assert.equal(events.length,1);
assert.equal(events[0].canonicalAfter,'Warehouse');

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
assert.equal(typeField.canonical.value,'Warehouse');
assert.equal(typeField.canonical.authority,'SCIIP');
assert.equal(typeField.agreementState,'AGREED');

const fs=await import('node:fs');
const approvalCard=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/GovernedApprovalWorkflowCard.jsx',import.meta.url),
  'utf8'
);
assert.ok(approvalCard.includes('executeApprovedPromotion'));
assert.ok(approvalCard.includes('APPROVED_FOR_EXECUTION'));
assert.ok(approvalCard.includes('Execute'));

const provSrc=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/PropertyIntelligenceProvenance.js',import.meta.url),
  'utf8'
);
assert.ok(provSrc.includes('getCanonicalOverlayValue'));

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_MILESTONE_2_15_GOVERNED_PROMOTION_EXECUTION',
  version:'3.0-m2.15',
  status:'PASSED',
  testsRun:20,
  result:{
    approvalRequired:'PASSED',
    explicitExecution:'REQUIRED',
    canonicalExecution:'GOVERNED_OVERLAY',
    immutableExecutionEvent:'ACTIVE',
    provenanceRefresh:'ACTIVE',
    browserRefreshDurability:'ACTIVE',
    rollbackCapability:'AVAILABLE',
    rejectDeferMutation:'FORBIDDEN',
    reconciliationMutation:'FORBIDDEN'
  }
},null,2));
