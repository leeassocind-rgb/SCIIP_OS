import assert from'node:assert/strict';
import{certifyProductionCorpus}from'../src/production-activation/corpus-certification/index.js';
let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const cert=certifyProductionCorpus({
 batch:{status:'COMPLETED'},
 identity:{total:100,reviewRequired:2},
 graphSnapshot:{nodes:[{id:'P1',type:'PROPERTY'}]},
 ingestionRuntime:{latest:{schemaCoveragePct:100,rejected:0,productionWritesEnabled:false,sourceMutationAllowed:false}}
});
t(cert.status==='CERTIFIED');t(cert.checksRun===7);t(cert.checksPassed===7);t(cert.checksFailed===0);t(cert.propertyNodes===1);t(cert.unresolvedIdentityPct===2);t(!cert.productionWritesEnabled);t(!cert.sourceMutationAllowed);
const blocked=certifyProductionCorpus({
 batch:{status:'PROCESSING'},
 identity:{total:10,reviewRequired:3},
 graphSnapshot:{nodes:[]},
 ingestionRuntime:{latest:{schemaCoveragePct:80,rejected:2,productionWritesEnabled:false,sourceMutationAllowed:false}}
});
t(blocked.status==='BLOCKED');t(blocked.checksFailed===5);t(blocked.checks.find(c=>c.id==='IDENTITY_RESOLUTION').passed===false);
console.log(JSON.stringify({framework:'SCIIP_PHASE5_SPRINT69_PRODUCTION_CORPUS_ACTIVATION_CERTIFICATION',status:'PASSED',testsRun:n,result:cert},null,2));
