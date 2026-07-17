/** Append-only persistence adapter for Sprint 10 workflow events. */
var SCIIP_OPPORTUNITY_WORKFLOW_EXECUTION_PERSISTENCE=(function(){
  'use strict';
  function memory(){var rows=[],keys={};return {append:function(events){var appended=0,duplicates=0;(events||[]).forEach(function(e){var k=e.eventId||JSON.stringify(e);if(keys[k]){duplicates++;return;}keys[k]=true;rows.push(JSON.parse(JSON.stringify(e)));appended++;});return {appended:appended,duplicates:duplicates,total:rows.length};},all:function(){return JSON.parse(JSON.stringify(rows));}};}
  function persist(adapter,events){if(!adapter||typeof adapter.append!=='function')throw new Error('Append-only adapter required.');return adapter.append(events||[]);}
  return {memory:memory,persist:persist};
}());
