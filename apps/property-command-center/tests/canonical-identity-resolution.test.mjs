import assert from'node:assert/strict';
import{resolveCanonicalIdentities}from'../src/phase18-corpus/identity/index.js';
let n=0;const t=c=>{n++;assert.ok(c)};
const r=resolveCanonicalIdentities({records:[
 {recordId:'R1',address:'100 Main St',city:'LA',state:'CA',postalCode:'90001',confidence:.95},
 {recordId:'R2',address:'100 Main Street',city:'LA',state:'CA',postalCode:'90001',canonicalKey:'100mainst|la|ca|90001',confidence:.80},
 {recordId:'R3',address:'200 Main St',city:'LA',state:'CA',postalCode:'90001',confidence:.95}
]});
t(r.totalRecords===3);t(r.canonicalCount===2);t(r.duplicateRecords===1);t(r.identities.some(i=>i.reviewRequired));t(r.permanentIdentityHistory);t(!r.autonomousMergeAllowed);
console.log(JSON.stringify({framework:'SCIIP_PHASE18_SPRINT296_CANONICAL_IDENTITY_RESOLUTION',status:'PASSED',testsRun:n,result:r},null,2));
