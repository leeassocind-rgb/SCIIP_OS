import assert from'node:assert/strict';
import{createMemoryActivationStorage,createProductionActivationStateRuntime}from'../src/production-activation/runtime/index.js';
import{createLiveSuperSheetRuntime}from'../src/production-activation/live-ingestion/index.js';
let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const activation=createProductionActivationStateRuntime({storage:createMemoryActivationStorage()});
const live=createLiveSuperSheetRuntime({activationRuntime:activation});
const event=live.publish({
 parsed:{fileName:'Live.csv',format:'CSV',fileSize:120,rows:[[1],[2],[3]]},
 mapping:{coverage:1},
 required:{valid:true,missing:[]},
 results:[{status:'ACCEPTED'},{status:'WARNING'},{status:'REJECTED'}]
});
t(event.fileName==='Live.csv');t(event.inputRows===3);t(event.schemaCoveragePct===100);
t(event.accepted===1);t(event.warnings===1);t(event.rejected===1);
t(!event.productionWritesEnabled);t(!event.sourceMutationAllowed);
const state=activation.getSnapshot();
t(state.ingestion.status==='VALIDATED');t(state.ingestion.totalRuns===1);
t(state.ingestion.latest.eventId===event.eventId);t(live.snapshot().liveParserConnected);
t(live.snapshot().liveNormalizerConnected);t(!live.snapshot().productionWritesEnabled);
console.log(JSON.stringify({framework:'SCIIP_PHASE5_SPRINT64_LIVE_SUPERSHEET_RUNTIME',status:'PASSED',testsRun:n,result:live.snapshot()},null,2));
