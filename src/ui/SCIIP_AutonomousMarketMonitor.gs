/** SCIIP_OS v7.0 Sprint 5A — autonomous market monitoring. */
var SCIIP_AUTONOMOUS_MARKET_MONITOR=(function(){
'use strict';var VERSION='v7.0-integration-sprint-5a',observations=[],alerts=[],rules={};
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function num(v,d){var n=Number(v);return isFinite(n)?n:(d||0);}
function text(v){return String(v==null?'':v).trim();}
function registerRule(rule){rule=clone(rule||{});var id=text(rule.id);if(!id)throw new Error('MARKET_MONITOR_RULE_ID_REQUIRED');if(rules[id])return {status:'DUPLICATE_SAFE',rule:clone(rules[id])};rules[id]={id:id,metric:text(rule.metric),operator:text(rule.operator||'GTE'),threshold:num(rule.threshold),severity:text(rule.severity||'INFO'),workspace:text(rule.workspace||'industrial-intelligence')};return {status:'REGISTERED',rule:clone(rules[id])};}
function compare(op,value,threshold){if(op==='GT')return value>threshold;if(op==='LT')return value<threshold;if(op==='LTE')return value<=threshold;if(op==='EQ')return value===threshold;return value>=threshold;}
function observe(input){input=clone(input||{});var row={id:'market-observation-'+(observations.length+1),marketId:text(input.marketId||'UNKNOWN'),metric:text(input.metric),value:num(input.value),previousValue:input.previousValue==null?null:num(input.previousValue),observedAt:text(input.observedAt||new Date().toISOString()),source:text(input.source||'SCIIP')};observations.push(row);Object.keys(rules).forEach(function(id){var r=rules[id];if(r.metric===row.metric&&compare(r.operator,row.value,r.threshold)){alerts.push({id:'market-alert-'+(alerts.length+1),ruleId:r.id,marketId:row.marketId,metric:row.metric,value:row.value,threshold:r.threshold,severity:r.severity,status:'OPEN',workspace:r.workspace,createdAt:new Date().toISOString()});}});return {status:'OBSERVED',observation:clone(row),alertsCreated:alerts.filter(function(a){return a.marketId===row.marketId&&a.metric===row.metric&&a.value===row.value;}).length};}
function run(request){request=request||{};(request.rules||[]).forEach(registerRule);var results=(request.observations||[]).map(observe);return {version:VERSION,status:'COMPLETED',observationsProcessed:results.length,alertsOpen:alerts.filter(function(a){return a.status==='OPEN';}).length,results:results};}
function acknowledge(id){for(var i=0;i<alerts.length;i+=1)if(alerts[i].id===id){alerts[i].status='ACKNOWLEDGED';alerts[i].acknowledgedAt=new Date().toISOString();return clone(alerts[i]);}return null;}
function snapshot(){return {version:VERSION,status:'AVAILABLE',rules:clone(Object.keys(rules).map(function(id){return rules[id];})),observations:clone(observations),alerts:clone(alerts)};}
function reset(){observations=[];alerts=[];rules={};return true;}
return {VERSION:VERSION,registerRule:registerRule,observe:observe,run:run,acknowledge:acknowledge,snapshot:snapshot,reset:reset};
})();
function sciipAutonomousMarketMonitorV7(request){return SCIIP_AUTONOMOUS_MARKET_MONITOR.run(request||{});}
