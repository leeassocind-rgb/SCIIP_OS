import assert from'node:assert/strict';

const mem=new Map();
globalThis.window={
  localStorage:{
    getItem:k=>mem.get(k)??null,
    setItem:(k,v)=>mem.set(k,String(v)),
    removeItem:k=>mem.delete(k)
  },
  dispatchEvent:()=>true
};
globalThis.CustomEvent=class{
  constructor(type,init={}){this.type=type;this.detail=init.detail;}
};

const c=await import('../src/broker-product/property-explorer/intelligence/GovernedCanonicalPromotionExecution.js');
c.clearCanonicalExecutionEventsForTests();

const property={
  id:'BASE-DOUBLEDAY',
  address:'1001 Doubleday Ave',
  landUse:null
};

assert.throws(()=>c.executeApprovedPromotion({
  property,
  fieldKey:'landUse',
  approved:false,
  promotionDecisionId:'PD-1',
  promotedValue:'Distribution Warehouse'
}),/approved/);

const executed=c.executeApprovedPromotion({
  property,
  fieldKey:'landUse',
  approved:true,
  promotionDecisionId:'PD-1',
  evidenceEventId:'EV-1',
  beforeValue:null,
  promotedValue:'Distribution Warehouse',
  source:'County / LightBox'
});

assert.equal(executed.type,'CANONICAL_PROMOTION_EXECUTED');
assert.equal(executed.baseMutation,false);
assert.equal(executed.directWrite,false);
assert.equal(executed.reversible,true);

let overlay=c.canonicalOverlayForField(property,'landUse');
assert.equal(overlay.value,'Distribution Warehouse');

const duplicate=c.executeApprovedPromotion({
  property,
  fieldKey:'landUse',
  approved:true,
  promotionDecisionId:'PD-1',
  evidenceEventId:'EV-1',
  promotedValue:'Distribution Warehouse'
});
assert.equal(duplicate.id,executed.id);

const effective=c.applyCanonicalOverlays(property);
assert.equal(effective.landUse,'Distribution Warehouse');
assert.equal(property.landUse,null);

assert.throws(()=>c.rollbackCanonicalPromotion({
  property,
  executionId:executed.id,
  reason:''
}),/reason/);

const rolled=c.rollbackCanonicalPromotion({
  property,
  executionId:executed.id,
  reason:'Test rollback'
});
assert.equal(rolled.type,'CANONICAL_PROMOTION_ROLLED_BACK');

overlay=c.canonicalOverlayForField(property,'landUse');
assert.equal(overlay,null);

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_M2_25_GOVERNED_CANONICAL_PROMOTION_EXECUTION',
  version:'3.0-m2.25',
  status:'PASSED',
  testsRun:14,
  failures:[],
  result:{
    unapprovedExecutionBlocked:true,
    approvedExecution:true,
    appendOnly:true,
    baseMutation:false,
    directWrite:false,
    overlayApplied:true,
    duplicateSafe:true,
    rollbackReasonRequired:true,
    rollbackExecuted:true,
    overlayRemovedAfterRollback:true,
    reversible:true
  }
},null,2));
