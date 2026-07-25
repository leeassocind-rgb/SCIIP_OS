/** Sprint 13 append-only persistence adapter. */
var SCIIP_ENTERPRISE_PORTFOLIO_STRATEGY_CAPITAL_ALLOCATION_PERSISTENCE=(function(){
  'use strict';var memory=[];
  function append(events){var added=0;(events||[]).forEach(function(e){var key=String(e.eventId||e.allocationId||'');if(!key)return;if(memory.some(function(x){return String(x.eventId||x.allocationId||'')===key;}))return;memory.push(JSON.parse(JSON.stringify(e)));added++;});return {appended:added,total:memory.length,appendOnly:true};}
  function list(){return JSON.parse(JSON.stringify(memory));}
  function clearForTest(){memory=[];}
  return {append:append,list:list,clearForTest:clearForTest};
}());
