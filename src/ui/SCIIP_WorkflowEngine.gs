/** SCIIP_OS v7.0 Integration Sprint 3B — workflow engine. */
var SCIIP_WORKFLOW_ENGINE = (function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3b', nextId=1, definitions={}, instances={}, history=[];
  var STATES={DRAFT:'DRAFT',READY:'READY',RUNNING:'RUNNING',WAITING_APPROVAL:'WAITING_APPROVAL',COMPLETED:'COMPLETED',FAILED:'FAILED',CANCELLED:'CANCELLED'};
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function now_(){return new Date().toISOString();}
  function emit_(type,payload){var e={id:'wf-event-'+nextId++,type:type,payload:clone_(payload),timestamp:now_()};history.push(e);if(history.length>500)history.shift();try{if(typeof SCIIP_APP_EVENTS!=='undefined')SCIIP_APP_EVENTS.publish(type,payload,{source:'SCIIP_WORKFLOW_ENGINE'});}catch(ignore){}return e;}
  function define(def){def=def||{};var id=String(def.id||'').trim();if(!id)throw new Error('WORKFLOW_DEFINITION_ID_REQUIRED');if(!Array.isArray(def.steps)||!def.steps.length)throw new Error('WORKFLOW_STEPS_REQUIRED');definitions[id]={id:id,label:def.label||id,version:def.version||'1',steps:clone_(def.steps),metadata:clone_(def.metadata||{}),createdAt:now_()};return clone_(definitions[id]);}
  function start(request){request=request||{};var def=definitions[request.definitionId];if(!def)throw new Error('WORKFLOW_DEFINITION_NOT_FOUND');var id='workflow-'+nextId++;var instance={id:id,definitionId:def.id,label:def.label,state:STATES.READY,currentStep:0,context:clone_(request.context||{}),results:[],error:null,createdAt:now_(),updatedAt:now_()};instances[id]=instance;emit_('WORKFLOW_STARTED',{workflowId:id,definitionId:def.id});return clone_(instance);}
  function executeStep_(instance,step){var result={stepId:step.id||('step-'+instance.currentStep),type:step.type||'ACTION',status:'COMPLETED',startedAt:now_(),completedAt:null,output:null};
    if(step.type==='APPROVAL'){instance.state=STATES.WAITING_APPROVAL;result.status='WAITING_APPROVAL';result.output={approvalPolicy:step.approvalPolicy||'SINGLE_APPROVER'};}
    else if(step.type==='INTELLIGENCE'){result.output=typeof SCIIP_INTELLIGENCE_ENGINE!=='undefined'?SCIIP_INTELLIGENCE_ENGINE.analyze({prompt:step.prompt||instance.context.prompt||'Analyze current context',context:instance.context}):{status:'UNAVAILABLE'};}
    else if(step.type==='NOTIFICATION'){result.output=typeof SCIIP_NOTIFICATION_SERVICE!=='undefined'?SCIIP_NOTIFICATION_SERVICE.create({title:step.title||instance.label,detail:step.detail||'Workflow notification',severity:step.severity||'info',workspaceId:step.workspaceId||null}):{status:'UNAVAILABLE'};}
    else if(step.type==='TASK'){result.output=typeof SCIIP_TASK_ROUTER!=='undefined'?SCIIP_TASK_ROUTER.create({title:step.title||step.id,assignee:step.assignee||null,workspaceId:step.workspaceId||null,context:instance.context}):{status:'UNAVAILABLE'};}
    else result.output=clone_(step.output||{ok:true});
    result.completedAt=now_();return result;}
  function run(workflowId,options){options=options||{};var instance=instances[workflowId];if(!instance)throw new Error('WORKFLOW_INSTANCE_NOT_FOUND');if([STATES.COMPLETED,STATES.CANCELLED].indexOf(instance.state)!==-1)return clone_(instance);instance.state=STATES.RUNNING;var def=definitions[instance.definitionId],max=Math.max(1,Math.min(Number(options.maxSteps)||100,100));var processed=0;
    try{while(instance.currentStep<def.steps.length&&processed<max){var step=def.steps[instance.currentStep],result=executeStep_(instance,step);instance.results.push(result);processed++;if(result.status==='WAITING_APPROVAL')break;instance.currentStep++;}if(instance.currentStep>=def.steps.length)instance.state=STATES.COMPLETED;instance.updatedAt=now_();emit_('WORKFLOW_UPDATED',{workflowId:instance.id,state:instance.state,currentStep:instance.currentStep});}
    catch(error){instance.state=STATES.FAILED;instance.error=String(error);instance.updatedAt=now_();emit_('WORKFLOW_FAILED',{workflowId:instance.id,error:String(error)});}return clone_(instance);}
  function resume(workflowId,payload){var instance=instances[workflowId];if(!instance)throw new Error('WORKFLOW_INSTANCE_NOT_FOUND');if(instance.state!==STATES.WAITING_APPROVAL)throw new Error('WORKFLOW_NOT_WAITING_APPROVAL');var last=instance.results[instance.results.length-1];last.status='COMPLETED';last.output=clone_(payload||{approved:true});instance.currentStep++;instance.state=STATES.READY;return run(workflowId,{});}
  function cancel(id,reason){var i=instances[id];if(!i)throw new Error('WORKFLOW_INSTANCE_NOT_FOUND');i.state=STATES.CANCELLED;i.error=reason||null;i.updatedAt=now_();emit_('WORKFLOW_CANCELLED',{workflowId:id,reason:reason||null});return clone_(i);}
  function snapshot(){return {version:VERSION,status:'AVAILABLE',definitions:clone_(definitions),instances:clone_(instances),history:clone_(history),states:clone_(STATES)};}
  function reset(){definitions={};instances={};history=[];nextId=1;return true;}
  return {VERSION:VERSION,STATES:STATES,define:define,start:start,run:run,resume:resume,cancel:cancel,snapshot:snapshot,reset:reset};
})();
function sciipWorkflowSnapshotV7(){return SCIIP_WORKFLOW_ENGINE.snapshot();}
