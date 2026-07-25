/** SCIIP_OS v7.0 Sprint 8 — streaming rules, signals, and alerts. */
var SCIIP_STREAMING_SIGNAL_ENGINE=(function(){'use strict';var VERSION='v7.0-integration-sprint-8.0',rules=[],signals=[];
function reset(){rules=[];signals=[];}
function register(rule){rule=rule||{};if(!rule.id)throw new Error('Signal rule id required.');rules.push(rule);return {status:'REGISTERED',rule:rule};}
function evaluate(event){var emitted=[];for(var i=0;i<rules.length;i++){var r=rules[i],value=event.payload?event.payload[r.field]:undefined,hit=r.operator==='GTE'?Number(value)>=Number(r.threshold):r.operator==='EQ'?String(value)===String(r.value):false;if(hit){var s={signalId:'signal-'+(signals.length+1),ruleId:r.id,severity:r.severity||'INFO',eventId:event.eventId,message:r.message||r.id,generatedAt:new Date().toISOString()};signals.push(s);emitted.push(s);}}return emitted;}
function list(){return signals.slice();} return {VERSION:VERSION,reset:reset,register:register,evaluate:evaluate,list:list};})();