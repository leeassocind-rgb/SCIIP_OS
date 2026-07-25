/** Sprint 14 append-only certification ledger adapter. */
var SCIIP_EPIC3_PRODUCTION_HARDENING_INTEGRATION_PERSISTENCE=(function(){
  'use strict';var memory=[];
  function append(records){var added=0;(records||[]).forEach(function(r){var key=String(r.certificationId||r.eventId||'');if(!key)return;if(memory.some(function(x){return String(x.certificationId||x.eventId||'')===key;}))return;memory.push(JSON.parse(JSON.stringify(r)));added++;});return {appended:added,total:memory.length,appendOnly:true,duplicateSafe:true};}
  function list(){return JSON.parse(JSON.stringify(memory));}
  function clearForTest(){memory=[];}
  return {append:append,list:list,clearForTest:clearForTest};
}());
