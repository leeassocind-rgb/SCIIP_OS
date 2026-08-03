import assert from 'node:assert/strict';
import { createMemoryActivationStorage, createProductionActivationStateRuntime } from '../src/production-activation/runtime/index.js';
import { createActivationEvidenceHydrator } from '../src/production-activation/evidence/index.js';
let n=0; const t=(x,m)=>{n++;assert.ok(x,m)};
const runtime=createProductionActivationStateRuntime({storage:createMemoryActivationStorage()});
const hydrator=createActivationEvidenceHydrator({runtime,now:()=>new Date('2026-07-31T22:00:00Z')});
const r=hydrator.hydrateReports({
 approval:{framework:'A',status:'PASSED',approvals:[{proposalId:'P1',status:'APPROVED'}],snapshot:{counts:{APPROVED:1}}},
 canary:{framework:'C',status:'PASSED',rollbackResult:{status:'ROLLED_BACK_VERIFIED'},ledger:[{type:'CANARY_WRITTEN'},{type:'CANARY_ROLLED_BACK'}]},
 promotion:{framework:'P',status:'PASSED',stage:'CANARY',productionDefaultDenied:true},
 build:{framework:'B',status:'PASSED',modules:1811},
 sources:{approval:'approval.json',canary:'canary.json',promotion:'promotion.json',build:'build.json'}
});
t(r.status==='HYDRATED'); t(r.reports.length===4); t(r.runtimeRevision===1); t(r.state.approval.approved===1); t(r.state.canary.status==='ROLLED_BACK_VERIFIED'); t(r.state.build.modules===1811); t(r.state.promotion.productionDefaultDenied); t(!hydrator.snapshot().productionWritesEnabled);
console.log(JSON.stringify({framework:'SCIIP_PHASE5_SPRINT61_EVIDENCE_REPORT_HYDRATION',status:'PASSED',testsRun:n,result:{reportsHydrated:4,runtimeRevision:1,buildModules:1811,productionWritesEnabled:false}},null,2));
