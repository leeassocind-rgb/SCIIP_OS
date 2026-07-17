/** Apps Script certification for Epic 3 Sprint 4. */
function sciipTestV7Epic3Sprint4MarketIntelligence(){
  var failures=[];
  function ok(name,value){if(!value)failures.push(name);}
  var previous={propertyId:'PROPERTY-RIALTO-2125-LOWELL',status:'Available',availableSf:664859,askingRate:1.35,powerAmps:4000,constructionStatus:'Under Construction'};
  var current={propertyId:'PROPERTY-RIALTO-2125-LOWELL',status:'Available',availableSf:664859,askingRate:1.25,powerAmps:8000,constructionStatus:'Complete'};
  var source={sourceId:'SURVEY-2026-07-17',importJobId:'JOB-1',sourceName:'LEE_INDUSTRIAL_SURVEY',observedAt:'2026-07-17T08:00:00Z'};
  var snap=SCIIP_MARKET_INTELLIGENCE.buildSnapshot(previous,current,source,[current]);
  ok('version',snap.version==='v7.0-epic3-sprint4.0');
  ok('events',snap.events.length===3);
  ok('rate',snap.events.some(function(e){return e.eventType==='RATE_CHANGE';}));
  ok('power',snap.events.some(function(e){return e.eventType==='POWER_CHANGE';}));
  ok('construction',snap.events.some(function(e){return e.eventType==='CONSTRUCTION_COMPLETED';}));
  ok('timeline',snap.timeline.length===3);
  ok('opportunities',snap.opportunities.length>=2);
  ok('governance',snap.reviewRequired===true&&snap.destructiveCommitEnabled===false);
  var result={framework:'SCIIP_V7_EPIC_3_SPRINT_4_MARKET_INTELLIGENCE',version:'v7.0-epic3-sprint4.0',status:failures.length?'FAILED':'PASSED',testsRun:8,failures:failures,result:{events:snap.events.length,rateChanges:snap.events.filter(function(e){return e.eventType==='RATE_CHANGE';}).length,powerChanges:snap.events.filter(function(e){return e.eventType==='POWER_CHANGE';}).length,constructionCompletions:snap.events.filter(function(e){return e.eventType==='CONSTRUCTION_COMPLETED';}).length,opportunities:snap.opportunities.length,summary:snap.summary.summary,workspace:'market-intelligence',reviewRequired:snap.reviewRequired,destructiveCommitEnabled:snap.destructiveCommitEnabled}};
  console.log(JSON.stringify(result));return result;
}
