/** Append-only persistence adapter for Sprint 9 command events. */
var SCIIP_EXECUTIVE_OPPORTUNITY_COMMAND_PERSISTENCE=(function(){
  'use strict';
  function memory(){var rows=[];return {append:function(events){(events||[]).forEach(function(e){rows.push(JSON.parse(JSON.stringify(e)));});return {appended:(events||[]).length,total:rows.length};},all:function(){return JSON.parse(JSON.stringify(rows));}};}
  function persist(adapter,events){if(!adapter||typeof adapter.append!=='function')throw new Error('Append-only adapter required.');var normalized=(events||[]).map(function(e){return {eventId:e.eventId||('EVT-'+Date.now()+'-'+Math.floor(Math.random()*100000)),eventType:e.eventType||'OPPORTUNITY_COMMAND_EVENT',opportunityId:e.opportunityId||'',occurredAt:e.occurredAt||new Date().toISOString(),payload:JSON.parse(JSON.stringify(e.payload||e)),appendOnly:true};});return adapter.append(normalized);}
  return {memory:memory,persist:persist};
}());
