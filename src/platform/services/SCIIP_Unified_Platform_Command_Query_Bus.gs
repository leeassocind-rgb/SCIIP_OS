/** SCIIP_OS v7.0 — Epic 4 Sprint 1: Unified Command and Query Bus */
var SCIIP_UNIFIED_PLATFORM_COMMAND_QUERY_BUS=(function(){
  'use strict';
  var handlers={},ledger=[];
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function hash(s){var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  function registerHandler(type,name,handler,options){var key=upper(type)+':'+upper(name);if(typeof handler!=='function')return {status:'REJECTED',reason:'HANDLER_REQUIRED'};handlers[key]={handler:handler,requiresApproval:!!(options&&options.requiresApproval),readOnly:upper(type)==='QUERY'};return {status:'REGISTERED',handlerKey:key};}
  function envelope(type,name,payload,context){context=context||{};var created=context.createdAt||new Date().toISOString();return {messageId:text(context.messageId||('MSG-'+hash(upper(type)+'|'+upper(name)+'|'+JSON.stringify(payload||{})+'|'+created))),messageType:upper(type),name:upper(name),payload:payload||{},context:{correlationId:text(context.correlationId||''),causationId:text(context.causationId||''),workspace:upper(context.workspace||'UNKNOWN'),actorId:text(context.actorId||'SYSTEM'),entityIds:(context.entityIds||[]).map(text).filter(Boolean),evidenceIds:(context.evidenceIds||[]).map(text).filter(Boolean)},createdAt:created,destructiveCommitEnabled:false,autonomousExecution:false};}
  function dispatch(type,name,payload,context){var msg=envelope(type,name,payload,context),key=msg.messageType+':'+msg.name,h=handlers[key];if(!h)return {status:'REJECTED',reason:'HANDLER_NOT_FOUND',message:msg};if(msg.messageType==='COMMAND'&&h.requiresApproval&&!(context&&context.approvedBy))return {status:'PENDING_APPROVAL',reason:'EXPLICIT_APPROVAL_REQUIRED',message:msg};var duplicate=ledger.some(function(e){return e.messageId===msg.messageId;});if(duplicate)return {status:'DUPLICATE_SAFE',message:msg};var result=h.handler(msg.payload,msg.context);ledger.push({messageId:msg.messageId,messageType:msg.messageType,name:msg.name,status:'COMPLETED',workspace:msg.context.workspace,actorId:msg.context.actorId,evidenceIds:msg.context.evidenceIds,occurredAt:new Date().toISOString(),appendOnly:true});return {status:'COMPLETED',message:msg,result:result};}
  function audit(){return ledger.slice();}function clearForTest(){handlers={};ledger=[];}
  return {registerHandler:registerHandler,envelope:envelope,dispatch:dispatch,audit:audit,clearForTest:clearForTest};
}());
