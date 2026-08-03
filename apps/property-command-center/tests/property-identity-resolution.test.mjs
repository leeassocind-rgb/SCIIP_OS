import assert from'node:assert/strict';
import{createPropertyIdentityResolver}from'../src/production-activation/identity-resolution/index.js';
let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const resolver=createPropertyIdentityResolver();
const result=resolver.resolveBatch([
 {id:'1',apn:'123-456-789',address:'100 Main St',city:'Rialto'},
 {id:'2',apn:'123456789',address:'100 Main Street',city:'Rialto'},
 {id:'3',address:'200 Market Ave',city:'Perris',state:'CA'},
 {id:'4',latitude:33.85,longitude:-117.24},
 {id:'5',name:'Unknown'}
]);
t(result.total===5);t(result.newCanonical===3);t(result.autoMerged===1);t(result.reviewRequired===1);t(!result.destructiveMergeAllowed);
const first=result.decisions[0],second=result.decisions[1];
t(first.canonicalPropertyId===second.canonicalPropertyId);t(second.resolution==='AUTO_MERGE');t(second.confidence===1);t(!second.humanReviewRequired);
t(result.decisions[4].resolution==='REVIEW_REQUIRED');t(resolver.registrySize()===3);
console.log(JSON.stringify({framework:'SCIIP_PHASE5_SPRINT68_PROPERTY_IDENTITY_RESOLUTION',status:'PASSED',testsRun:n,result:{total:result.total,newCanonical:result.newCanonical,autoMerged:result.autoMerged,reviewRequired:result.reviewRequired,destructiveMergeAllowed:false}},null,2));
