/** SCIIP_OS v7.0 Sprint 3E — immutable decision ledger. */
var SCIIP_DECISION_LEDGER=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3e', entries=[], keys={};
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function record(input){input=input||{};var key=String(input.businessKey||input.decisionId||'').trim();if(!key)throw new Error('DECISION_BUSINESS_KEY_REQUIRED');if(keys[key])return clone_(keys[key]);var entry={ledgerId:'decision-ledger-'+(entries.length+1),businessKey:key,decisionType:input.decisionType||'GENERAL',status:input.status||'RECORDED',subject:clone_(input.subject||null),rationale:String(input.rationale||''),evidence:clone_(input.evidence||[]),riskIds:clone_(input.riskIds||[]),policyDecision:clone_(input.policyDecision||null),approvedBy:input.approvedBy||null,recordedAt:new Date().toISOString()};entries.push(entry);keys[key]=entry;return clone_(entry);}
  function list(filter){filter=filter||{};return clone_(entries.filter(function(e){return !filter.status||e.status===filter.status;}));}
  function getByKey(key){return clone_(keys[String(key)]||null);}
  function reset(){entries=[];keys={};}
  return {VERSION:VERSION,record:record,list:list,getByKey:getByKey,reset:reset};
})();
