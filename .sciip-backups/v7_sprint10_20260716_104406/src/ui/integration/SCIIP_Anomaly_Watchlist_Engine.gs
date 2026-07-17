/** SCIIP_OS v7.0 Sprint 5B — Anomaly and Watchlist Engine. */
var SCIIP_ANOMALY_WATCHLIST_ENGINE=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-5b', watchlists={}, anomalies=[], nextId=1;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function num_(v){var n=Number(v);return isFinite(n)?n:0;}

  function createWatchlist(def){
    def=def||{}; var id=String(def.id||('watchlist-'+nextId++));
    if(watchlists[id]) return {status:'DUPLICATE_SAFE',watchlist:clone_(watchlists[id])};
    watchlists[id]={id:id,label:String(def.label||id),metric:String(def.metric||'value'),
      threshold:num_(def.threshold),direction:String(def.direction||'ABOVE').toUpperCase(),
      severity:String(def.severity||'WARNING').toUpperCase(),workspace:def.workspace||null,
      createdAt:new Date().toISOString()};
    return {status:'CREATED',watchlist:clone_(watchlists[id])};
  }

  function evaluate(watchlistId, observation){
    var w=watchlists[watchlistId]; if(!w) throw new Error('WATCHLIST_NOT_FOUND');
    observation=observation||{}; var value=num_(observation.value);
    var triggered=w.direction==='BELOW'?value<w.threshold:value>w.threshold;
    var result={watchlistId:w.id,triggered:triggered,value:value,threshold:w.threshold,
      direction:w.direction,severity:triggered?w.severity:'NONE',entityId:observation.entityId||null,
      observedAt:observation.observedAt||new Date().toISOString()};
    if(triggered){result.anomalyId='anomaly-'+nextId++;anomalies.push(clone_(result));}
    return result;
  }

  function listWatchlists(){return clone_(Object.keys(watchlists).sort().map(function(k){return watchlists[k];}));}
  function listAnomalies(){return clone_(anomalies);}
  function reset(){watchlists={};anomalies=[];nextId=1;return true;}
  return {VERSION:VERSION,createWatchlist:createWatchlist,evaluate:evaluate,listWatchlists:listWatchlists,listAnomalies:listAnomalies,reset:reset};
})();
