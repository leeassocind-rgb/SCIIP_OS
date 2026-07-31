import assert from 'node:assert/strict';
import {createMemoryEnterpriseIntelligenceStorage,createEnterpriseIntelligenceRuntime} from '../src/enterprise-intelligence/runtime/index.js';
let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const storage=createMemoryEnterpriseIntelligenceStorage();
const runtime=createEnterpriseIntelligenceRuntime({storage});
runtime.hydrateGraph({nodes:[
  {id:'P1',type:'PROPERTY',label:'Rialto Logistics Center',city:'Rialto'},
  {id:'T1',type:'TENANT',label:'Acme Logistics'}
],edges:[{from:'T1',to:'P1',type:'OCCUPIES'}]});
runtime.runSearch({query:'Rialto'});
runtime.runReasoning({startNodeId:'T1',targetType:'PROPERTY'});
runtime.runRecommendations({signals:[{subjectId:'P1',type:'OPPORTUNITY',evidence:[{source:'graph'},{source:'market'}]}]});
runtime.runOpportunities({properties:[{id:'P1',fitScore:95,marketScore:90}],marketSignals:[{propertyId:'P1',type:'NEW_REQUIREMENT'}]});
runtime.runCopilot({question:'What should we review?'});
const state=runtime.getSnapshot();
t(state.graph.nodes.length===2);t(state.search.total===2);t(state.search.results[0].nodeId==='P1');t(state.reasoning.findingCount===1);
t(state.recommendations.recommended===1);t(state.opportunities.detected===1);t(state.copilot.grounded);
t(state.revision===6);t(runtime.snapshot().persistent);t(!runtime.snapshot().productionExecutionAuthorized);
const recovered=createEnterpriseIntelligenceRuntime({storage});
t(recovered.getSnapshot().revision===6);t(recovered.getSnapshot().copilot.grounded);
console.log(JSON.stringify({framework:'SCIIP_PHASE6_SPRINT82_ENTERPRISE_INTELLIGENCE_RUNTIME',status:'PASSED',testsRun:n,result:runtime.snapshot()},null,2));
