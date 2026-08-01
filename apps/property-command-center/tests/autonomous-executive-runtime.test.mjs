import assert from'node:assert/strict';
import{createMemoryAutonomousExecutiveStorage,createAutonomousExecutiveRuntime}from'../src/autonomous-executive/runtime/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const storage=createMemoryAutonomousExecutiveStorage();
const runtime=createAutonomousExecutiveRuntime({storage});
const published=runtime.publishEvent({type:'OPPORTUNITY',subjectId:'P1',eventKey:'OPP-P1'});
runtime.planEvent({event:published.result.event,handlers:{OPPORTUNITY:[{capability:'QUALIFY',targetWorkspace:'Enterprise Intelligence Workspace'}]}});
runtime.createPlaybook({template:{playbookId:'PB-1',name:'Opportunity Review',steps:[{capability:'QUALIFY'}]},context:{subjectId:'P1'}});
runtime.evaluateAlerts({signals:[{subjectId:'P1',risk:90}],rules:[{ruleId:'R1',field:'risk',operator:'GT',threshold:80,severity:'HIGH'}]});
runtime.refreshObservability();
const state=runtime.getSnapshot();
t(state.events.length===1);t(state.runs.length===1);t(state.playbooks.length===1);t(state.alerts.length===1);
t(state.observability.health==='WATCH');t(state.revision===5);t(runtime.snapshot().persistent);t(!runtime.snapshot().productionExecutionAuthorized);
const recovered=createAutonomousExecutiveRuntime({storage});
t(recovered.getSnapshot().revision===5);t(recovered.getSnapshot().playbooks.length===1);
console.log(JSON.stringify({framework:'SCIIP_PHASE9_SPRINT100_AUTONOMOUS_EXECUTIVE_RUNTIME',status:'PASSED',testsRun:n,result:runtime.snapshot()},null,2));
