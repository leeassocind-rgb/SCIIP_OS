const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const files=[
 'src/applications/enterprise-financial-planning/SCIIP_Enterprise_Capital_Allocation_Optimizer_V7.gs',
 'src/applications/enterprise-financial-planning/SCIIP_Enterprise_Financial_Planning_Application.gs',
 'src/tests/SCIIP_TestingFramework_v7_IntegrationSprint27.gs'
];
const ctx={console,Date,Object,Math,JSON}; vm.createContext(ctx);
// Simulate the pre-existing conflicting global observed in Apps Script.
vm.runInContext("var SCIIP_CAPITAL_ALLOCATION_ENGINE={allocate:function(){return {status:'COMPLETED',budget:500,allocated:0,remaining:500,selected:[],rejected:[],annualBenefit:0,portfolioRoiPct:0};}};",ctx);
// Minimal certified-platform stubs for the complete Sprint 27 aggregate test.
vm.runInContext(`
var SCIIP_ENTERPRISE_FINANCIAL_PLANNING_ENGINE={plan:function(x){return {periods:x.periods.length,revenue:2600,expense:1900,operatingIncome:700,margin:26.92};}};
var SCIIP_FORECAST_VARIANCE_ENGINE={calculate:function(){return {variance:100,variancePct:4,direction:'ABOVE_FORECAST'};}};
var SCIIP_FINANCIAL_RISK_FORECAST={evaluate:function(){return {status:'WATCH',risks:[]};}};
var SCIIP_EXECUTIVE_FINANCIAL_WORKSPACE={build:function(i){return {id:'enterprise-financial-planning-forecasting',sections:new Array(10),plan:i.plan};}};
var SCIIP_PLATFORM_REGISTRY={register:function(){return {status:'REGISTERED'};}};
var SCIIP_PLATFORM_SELF_ASSEMBLY={assemble:function(){return {status:'ASSEMBLED'};}};
var SCIIP_QUERY_ENGINE={register:function(){}};
var SCIIP_LIVE_RUNTIME={register:function(){}};
var SCIIP_APP_STATE={}; var SCIIP_APP_EVENTS={};
`,ctx);
for(const f of files) vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const result=vm.runInContext('sciipTestV7IntegrationSprint27()',ctx);
if(result.status!=='PASSED'||result.testsRun!==6) throw new Error('Sprint 27 patch regression failed');
const allocation=result.tests.find(t=>t.test==='CapitalAllocation');
if(!allocation||allocation.allocated!==450||allocation.selected!==2) throw new Error('Capital allocation did not survive legacy collision');
console.log(JSON.stringify({status:'PASSED',testsRun:result.testsRun,allocated:allocation.allocated,selected:allocation.selected,legacyCollisionIsolated:true}));
