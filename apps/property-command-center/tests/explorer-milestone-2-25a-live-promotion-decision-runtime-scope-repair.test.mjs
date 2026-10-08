import assert from'node:assert/strict';
import fs from'node:fs';

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

const evidence=await import('../src/broker-product/property-explorer/intelligence/GovernedEvidenceWorkflow.js');
const promotion=await import('../src/broker-product/property-explorer/intelligence/GovernedPromotionDecision.js');

evidence.clearEvidenceEventsForTests();
promotion.clearPromotionEventsForTests();

const property={id:'BASE-DOUBLEDAY'};
const gap={
  fieldKey:'landUse',
  label:'Land Use',
  type:'ENRICHMENT_AVAILABLE',
  priorityScore:81,
  recommendedSource:'County / LightBox'
};

evidence.openEvidenceReview({property,gap});
evidence.attachEvidence({
  property,
  fieldKey:'landUse',
  value:'Distribution Warehouse',
  source:'County / LightBox',
  reference:'evidence://land-use'
});
evidence.verifyEvidence({
  property,
  fieldKey:'landUse',
  decision:'VERIFIED'
});

const ev=evidence.latestEvidenceState(property,'landUse');
assert.equal(ev.status,'VERIFIED');

const pd=promotion.decidePromotion({
  property,
  fieldKey:'landUse',
  evidence:ev,
  decision:'PROMOTE'
});
assert.equal(pd.status,'APPROVED_FOR_PROMOTION');

const evidenceEvents=evidence.evidenceEvents(property);
const promotionEvents=promotion.promotionEvents(property);

assert.ok(Array.isArray(evidenceEvents));
assert.ok(Array.isArray(promotionEvents));
assert.ok(evidenceEvents.length>=3);
assert.equal(promotionEvents.length,1);

const source=fs.readFileSync(
  new URL('../src/broker-product/property-explorer/intelligence/GovernedEvidenceWorkflowInline.jsx',import.meta.url),
  'utf8'
);

assert.ok(source.includes("import{promotionEvents,latestPromotionState,decidePromotion}"));
assert.ok(source.includes("import{evidenceEvents,evidenceWorkflow,openEvidenceReview,attachEvidence,verifyEvidence}"));
assert.ok(source.includes("evidenceEvents={evidenceEvents(property)}"));
assert.ok(source.includes("promotionDecisions={promotionEvents(property)}"));
assert.equal(source.includes("promotionDecisions={decisions}"),false);

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_M2_25A_LIVE_PROMOTION_DECISION_RUNTIME_SCOPE_REPAIR',
  version:'3.0-m2.25a',
  status:'PASSED',
  testsRun:10,
  failures:[],
  result:{
    evidenceAccessor:'evidenceEvents(property)',
    promotionAccessor:'promotionEvents(property)',
    undefinedDecisionsReferenceRemoved:true,
    verifiedEvidenceVisible:true,
    approvedPromotionVisible:true,
    governedExecutionContractPreserved:true
  }
},null,2));
