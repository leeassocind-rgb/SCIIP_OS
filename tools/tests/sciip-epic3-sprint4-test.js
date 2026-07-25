'use strict';
const fs=require('fs'),vm=require('vm'),path=require('path');
const root=path.resolve(__dirname,'../..');
const files=[
  'src/applications/market-intelligence/SCIIP_Market_Intelligence_Engine.gs',
  'src/applications/market-intelligence/SCIIP_Market_Intelligence_AI_Bridge.gs',
  'src/applications/market-intelligence/SCIIP_Epic3_Sprint4_Tests.gs'
];
const logs=[];const ctx={console:{log:x=>logs.push(String(x))},Date,JSON,Math,Object,String,Number,Array,RegExp};vm.createContext(ctx);
for(const f of files)vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx,{filename:f});
const previous={propertyId:'PROPERTY-RIALTO-2125-LOWELL',status:'Available',availableSf:664859,askingRate:1.35,powerAmps:4000,constructionStatus:'Under Construction'};
const current={propertyId:'PROPERTY-RIALTO-2125-LOWELL',status:'Available',availableSf:664859,askingRate:1.25,powerAmps:8000,constructionStatus:'Complete'};
const source={sourceId:'SURVEY-2026-07-17',importJobId:'JOB-1',sourceName:'LEE_INDUSTRIAL_SURVEY',observedAt:'2026-07-17T08:00:00Z'};
const snap=ctx.SCIIP_MARKET_INTELLIGENCE.buildSnapshot(previous,current,source,[current]);
const assertions=[
 ['version',snap.version==='v7.0-epic3-sprint4.0'],
 ['events',snap.events.length===3],
 ['rate',snap.events.some(e=>e.eventType==='RATE_CHANGE')],
 ['power',snap.events.some(e=>e.eventType==='POWER_CHANGE')],
 ['construction',snap.events.some(e=>e.eventType==='CONSTRUCTION_COMPLETED')],
 ['timeline',snap.timeline.length===3],
 ['opportunities',snap.opportunities.length>=2],
 ['governance',snap.reviewRequired===true&&snap.destructiveCommitEnabled===false]
];
const failures=assertions.filter(x=>!x[1]).map(x=>x[0]);
const cert=ctx.sciipTestV7Epic3Sprint4MarketIntelligence();if(cert.status!=='PASSED')failures.push('apps-script-certification');
const ai=ctx.sciipMarketIntelligenceAnswerContext('What changed this week?',snap.events,[current]);if(!ai.groundedOnly||ai.evidence.length!==3)failures.push('ai-bridge');
const ui=fs.readFileSync(path.join(root,'src/ui/SCIIP_Application_Shell.html'),'utf8');if(!ui.includes('marketIntelligence()')||!ui.includes("id==='market-intelligence'"))failures.push('workspace-ui');
const app=fs.readFileSync(path.join(root,'src/ui/SCIIP_Application.gs'),'utf8');if(!app.includes("id:'market-intelligence'"))failures.push('workspace-registration');
const result={framework:'SCIIP_EPIC_3_SPRINT_4_NODE_TEST',status:failures.length?'FAILED':'PASSED',testsRun:11,failures,result:{events:snap.events.length,opportunities:snap.opportunities.length,groundedOnly:ai.groundedOnly,workspace:'market-intelligence'}};
console.log(JSON.stringify(result,null,2));process.exitCode=failures.length?1:0;
