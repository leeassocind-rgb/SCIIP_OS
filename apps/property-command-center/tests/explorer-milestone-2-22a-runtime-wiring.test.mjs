import assert from'node:assert/strict';
const m=new Map();globalThis.window={localStorage:{getItem:k=>m.get(k)??null,setItem:(k,v)=>m.set(k,String(v)),removeItem:k=>m.delete(k)}};
const a=await import('../src/broker-product/property-explorer/intelligence/GovernedIntelligenceAcquisition.js');
a.clearAcquisitionEventsForTests();
const p={id:'BASE-DOUBLEDAY'};const gaps=[{fieldKey:'landUse',label:'Land Use',type:'ENRICHMENT_AVAILABLE',priority:81},{fieldKey:'assessedTotal',label:'Assessed Value',type:'ENRICHMENT_AVAILABLE',priority:48}];
const w=a.acquisitionWorkflow(p,gaps);assert.equal(w.items.length,2);assert.equal(w.automaticCanonicalWrites,false);
const e=a.requestIntelligenceAcquisition({property:p,gap:gaps[0]});assert.equal(e.status,'REQUESTED');assert.equal(e.canonicalWrite,false);
console.log(JSON.stringify({framework:'SCIIP_EXPLORER_3_M2_22A_RUNTIME_WIRING_REPAIR',version:'3.0-m2.22a',status:'PASSED',testsRun:4,result:{gaps:2,canonicalWrites:false,persistentRequest:true}},null,2));
