import assert from'node:assert/strict';
import{createLiveEnterpriseOSRuntime}from'../src/enterprise-os/runtime/index.js';
import{activateSuperSheetCorpus}from'../src/enterprise-os/activation/index.js';

let n=0;const t=(c,m)=>{n++;assert.ok(c,m||`Assertion ${n} failed`)};
const runtime=createLiveEnterpriseOSRuntime();
const result=activateSuperSheetCorpus({
  runtime,
  sheets:[
    {sheetId:'SS-1',rows:[
      {rowId:'R1',recordType:'PROPERTY',address:'100 Main'},
      {rowId:'R2',recordType:'RISK',severity:'HIGH',status:'OPEN'},
      {rowId:'R3',recordType:'OPPORTUNITY',status:'ACTIVE'},
      {rowId:'R4',recordType:'MARKET',name:'Inland Empire'}
    ]}
  ],
  identityResolver:row=>({
    entityId:row.rowId==='R4'?null:`ENTITY-${row.rowId}`,
    confidence:row.rowId==='R4'?0.4:0.95
  })
});

t(result.status==='ACTIVATED');
t(result.sheetsProcessed===1);
t(result.recordsAccepted===3);
t(result.recordsRejected===1);
t(result.properties===1);
t(result.risks===1);
t(result.opportunities===1);
t(result.evidence.length===3);
t(result.governed);
t(runtime.getSnapshot().enterprise.portfolio.length===1);
t(runtime.getSnapshot().enterprise.risks.length===1);
t(!result.productionExecutionAuthorized);

console.log(JSON.stringify({
  framework:'SCIIP_PHASE12_SPRINT127_SUPERSHEET_ENTERPRISE_OS_ACTIVATION',
  status:'PASSED',testsRun:n,result
},null,2));
