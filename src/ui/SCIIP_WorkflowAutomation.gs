/** SCIIP_OS v7.0 Integration Sprint 3B — scheduled automation descriptors. */
var SCIIP_WORKFLOW_AUTOMATION=(function(){
  'use strict';var VERSION='v7.0-integration-sprint-3b',nextId=1,automations={};
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}function now_(){return new Date().toISOString();}
  function create(req){req=req||{};if(!req.definitionId)throw new Error('AUTOMATION_DEFINITION_REQUIRED');var id='automation-'+nextId++;var a={id:id,label:req.label||id,definitionId:req.definitionId,status:req.enabled===false?'DISABLED':'ENABLED',schedule:clone_(req.schedule||{mode:'MANUAL'}),context:clone_(req.context||{}),lastRunAt:null,nextRunAt:req.nextRunAt||null,runCount:0,createdAt:now_(),updatedAt:now_()};automations[id]=a;return clone_(a);}
  function trigger(id){var a=automations[id];if(!a)throw new Error('AUTOMATION_NOT_FOUND');if(a.status!=='ENABLED')throw new Error('AUTOMATION_DISABLED');var instance=SCIIP_WORKFLOW_ENGINE.start({definitionId:a.definitionId,context:a.context});var result=SCIIP_WORKFLOW_ENGINE.run(instance.id,{});a.lastRunAt=now_();a.runCount++;a.updatedAt=now_();return {automation:clone_(a),workflow:result};}
  function setEnabled(id,enabled){var a=automations[id];if(!a)throw new Error('AUTOMATION_NOT_FOUND');a.status=enabled?'ENABLED':'DISABLED';a.updatedAt=now_();return clone_(a);}function list(){return Object.keys(automations).map(function(k){return clone_(automations[k]);});}function reset(){automations={};nextId=1;return true;}
  return {VERSION:VERSION,create:create,trigger:trigger,setEnabled:setEnabled,list:list,reset:reset};
})();
function sciipWorkflowAutomationSnapshotV7(){return SCIIP_WORKFLOW_AUTOMATION.list();}
