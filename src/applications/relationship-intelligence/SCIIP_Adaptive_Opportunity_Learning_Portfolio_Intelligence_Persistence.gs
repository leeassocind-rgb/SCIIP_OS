/** Append-only persistence adapter for Sprint 12 learning records and approvals. */
var SCIIP_ADAPTIVE_OPPORTUNITY_LEARNING_PORTFOLIO_INTELLIGENCE_PERSISTENCE=(function(){
  'use strict';
  function memory(){var rows=[],keys={};return {append:function(records){var appended=0,duplicates=0;(records||[]).forEach(function(r){var k=r.eventId||r.proposalId||r.feedbackId||JSON.stringify(r);if(keys[k]){duplicates++;return;}keys[k]=true;rows.push(JSON.parse(JSON.stringify(r)));appended++;});return {appended:appended,duplicates:duplicates,total:rows.length};},all:function(){return JSON.parse(JSON.stringify(rows));}};}
  function persist(adapter,records){if(!adapter||typeof adapter.append!=='function')throw new Error('Append-only adapter required.');return adapter.append(records||[]);}
  return {memory:memory,persist:persist};
}());
