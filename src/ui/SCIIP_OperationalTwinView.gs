/** SCIIP_OS v7.0 Integration Sprint 3C — executive operational twin view. */
var SCIIP_OPERATIONAL_TWIN_VIEW=(function(){
  'use strict';var VERSION='v7.0-integration-sprint-3c';
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function snapshot(request){request=request||{};var twins=SCIIP_DIGITAL_TWIN_REGISTRY.snapshot(),markets=SCIIP_MARKET_TWIN.snapshot(),portfolio=null;if(request.portfolioId){try{portfolio=SCIIP_PORTFOLIO_INTELLIGENCE.analyze(request.portfolioId);}catch(ignore){portfolio=null;}}var stale=twins.twins.filter(function(t){return t.status==='STALE';}).length;var gisReady=twins.twins.filter(function(t){return isFinite(Number(t.latitude))&&isFinite(Number(t.longitude));}).length;return {version:VERSION,status:'OPERATIONAL',generatedAt:new Date().toISOString(),kpis:[{id:'twins',label:'Digital Twins',value:twins.twinCount},{id:'events',label:'Twin Events',value:twins.eventCount},{id:'markets',label:'Market Twins',value:markets.marketCount},{id:'gis-ready',label:'GIS Ready',value:gisReady},{id:'stale',label:'Stale Context',value:stale}],portfolio:clone_(portfolio),digitalTwin:twins,marketTwin:markets,synchronization:SCIIP_TWIN_SYNCHRONIZATION.snapshot()};}
  return {VERSION:VERSION,snapshot:snapshot};
})();
function sciipOperationalTwinViewV7(request){return SCIIP_OPERATIONAL_TWIN_VIEW.snapshot(request||{});}
