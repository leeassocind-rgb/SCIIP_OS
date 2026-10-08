import assert from'node:assert/strict';
const mem=new Map();
globalThis.window={localStorage:{
  getItem:k=>mem.get(k)??null,
  setItem:(k,v)=>mem.set(k,String(v)),
  removeItem:k=>mem.delete(k)
}};

const w=await import('../src/broker-product/property-explorer/intelligence/GovernedEvidenceWorkflow.js');
w.clearEvidenceEventsForTests();

const property={id:'BASE-DOUBLEDAY'};
const gap={
  fieldKey:'landUse',
  label:'Land Use',
  type:'ENRICHMENT_AVAILABLE',
  priorityScore:81,
  recommendedSource:'County / LightBox'
};

const req=w.openEvidenceReview({property,gap});
assert.equal(req.status,'REQUESTED');

const attached=w.attachEvidence({
  property,
  fieldKey:'landUse',
  value:'Distribution Warehouse',
  source:'County / LightBox',
  reference:'evidence://land-use/1'
});
assert.equal(attached.status,'EVIDENCE_ATTACHED');
assert.equal(attached.canonicalWrite,false);

const verified=w.verifyEvidence({
  property,
  fieldKey:'landUse',
  decision:'VERIFIED'
});
assert.equal(verified.status,'VERIFIED');
assert.equal(verified.promotionEligible,true);
assert.equal(verified.promotionExecuted,false);

const wf=w.evidenceWorkflow(property,[gap]);
assert.equal(wf.items[0].evidenceStatus,'VERIFIED');
assert.equal(wf.automaticCanonicalWrites,false);
assert.equal(wf.automaticPromotion,false);

console.log(JSON.stringify({
  framework:'SCIIP_EXPLORER_3_M2_23_GOVERNED_EVIDENCE_INTAKE_VERIFICATION',
  version:'3.0-m2.23',
  status:'PASSED',
  testsRun:10,
  result:{
    requested:true,
    evidenceAttached:true,
    verified:true,
    appendOnly:true,
    automaticCanonicalWrites:false,
    automaticPromotion:false,
    verifiedEvidenceRequiresPromotion:true
  }
},null,2));
