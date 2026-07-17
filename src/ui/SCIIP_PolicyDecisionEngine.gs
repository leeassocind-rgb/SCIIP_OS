/** SCIIP_OS v7.0 Sprint 3E — deterministic policy and governance decisions. */
var SCIIP_POLICY_DECISION_ENGINE=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3e', policies={}, decisions=[];
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function register(policy){policy=policy||{};var id=String(policy.policyId||policy.id||'').trim();if(!id)throw new Error('POLICY_ID_REQUIRED');policies[id]={policyId:id,label:policy.label||id,priority:Number(policy.priority||100),rules:clone_(policy.rules||[]),enabled:policy.enabled!==false};return clone_(policies[id]);}
  function compare_(actual,op,expected){if(op==='EQ')return actual===expected;if(op==='NEQ')return actual!==expected;if(op==='GT')return Number(actual)>Number(expected);if(op==='GTE')return Number(actual)>=Number(expected);if(op==='LT')return Number(actual)<Number(expected);if(op==='LTE')return Number(actual)<=Number(expected);if(op==='IN')return (expected||[]).indexOf(actual)!==-1;return false;}
  function evaluate(request){request=request||{};var context=request.context||{}, findings=[];Object.keys(policies).map(function(k){return policies[k];}).sort(function(a,b){return a.priority-b.priority;}).forEach(function(p){if(!p.enabled)return;(p.rules||[]).forEach(function(rule){var actual=context[rule.field],passed=compare_(actual,rule.operator||'EQ',rule.value);if(!passed)findings.push({policyId:p.policyId,ruleId:rule.ruleId||rule.field,severity:rule.severity||'HIGH',field:rule.field,actual:actual,expected:rule.value,message:rule.message||'Policy rule failed'});});});var blocking=findings.filter(function(f){return f.severity==='CRITICAL'||f.severity==='HIGH';});var result={decisionId:'policy-decision-'+(decisions.length+1),status:blocking.length?'BLOCKED':'APPROVED',findings:findings,blockingFindings:blocking.length,context:clone_(context),generatedAt:new Date().toISOString()};decisions.push(result);return clone_(result);}
  function history(){return clone_(decisions);}
  function reset(){policies={};decisions=[];}
  return {VERSION:VERSION,register:register,evaluate:evaluate,history:history,reset:reset};
})();
