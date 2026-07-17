/** SCIIP_OS v7 Epic 3 Sprint 3 certification */
function sciipTestV7Epic3Sprint3IndustrialAICopilot(){
  var failures=[];
  function assert_(ok,msg){if(!ok)failures.push(msg);}
  var properties=[
    {propertyId:'PROPERTY-RIALTO-2125-LOWELL',address:'2125 W Lowell St',city:'Rialto',availableSf:664859,clearHeight:42,powerAmps:8000,trailerParking:398,status:'PLANNED'},
    {propertyId:'PROPERTY-SLOVER',address:'18012 Slover Ave',city:'Bloomington',availableSf:500000,clearHeight:36,powerAmps:4000,trailerParking:120,status:'AVAILABLE'},
    {propertyId:'PROPERTY-HARVILL',address:'20123 Harvill Ave',city:'Perris',availableSf:300000,clearHeight:32,powerAmps:2000,trailerParking:40,status:'PENDING'}
  ];
  var result=SCIIP_INDUSTRIAL_AI_COPILOT.ask({question:'Find buildings with at least 500,000 SF, 40 clear and 6,000 amps',properties:properties,entities:[],events:[],relationships:[]});
  assert_(SCIIP_INDUSTRIAL_AI_COPILOT.snapshot().workspace==='ai-copilot','workspace');
  assert_(result.intent==='SITE_SELECTION','intent');
  assert_(result.constraints.minimumSf===500000,'sf constraint');
  assert_(result.constraints.minimumPowerAmps===6000,'power constraint');
  assert_(result.constraints.minimumClearHeight===40,'clear constraint');
  assert_(result.evidence.length===1,'qualified evidence');
  assert_(result.evidence[0].entityId==='PROPERTY-RIALTO-2125-LOWELL','top property');
  assert_(result.governance.groundedOnly===true&&result.governance.externalModelUsed===false,'governance');
  var out={framework:'SCIIP_V7_EPIC_3_SPRINT_3_INDUSTRIAL_AI_COPILOT',version:'v7.0-epic3-sprint3.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{intent:result.intent,constraints:result.constraints,evidence:result.evidence.length,topProperty:result.evidence[0]&&result.evidence[0].entityId,confidence:result.confidence,groundedOnly:result.governance.groundedOnly,workspace:'ai-copilot'}};
  console.log(JSON.stringify(out));return out;
}
