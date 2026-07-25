/** SCIIP_OS v7.0 Integration Sprint 3B — approval engine. */
var SCIIP_APPROVAL_ENGINE=(function(){
  'use strict';var VERSION='v7.0-integration-sprint-3b',nextId=1,requests={};
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}function now_(){return new Date().toISOString();}
  function create(req){req=req||{};var id='approval-'+nextId++;var r={id:id,title:req.title||'Approval request',workflowId:req.workflowId||null,status:'PENDING',policy:req.policy||'SINGLE_APPROVER',requestedBy:req.requestedBy||'SCIIP_OS',assignedTo:req.assignedTo||null,context:clone_(req.context||{}),decisions:[],createdAt:now_(),updatedAt:now_()};requests[id]=r;return clone_(r);}
  function decide(id,decision){var r=requests[id];if(!r)throw new Error('APPROVAL_NOT_FOUND');if(r.status!=='PENDING')throw new Error('APPROVAL_ALREADY_RESOLVED');decision=decision||{};var value=String(decision.decision||'').toUpperCase();if(value!=='APPROVED'&&value!=='REJECTED')throw new Error('INVALID_APPROVAL_DECISION');r.status=value;r.decisions.push({decision:value,actor:decision.actor||'Current SCIIP User',comment:decision.comment||'',timestamp:now_()});r.updatedAt=now_();if(r.workflowId&&value==='APPROVED'&&typeof SCIIP_WORKFLOW_ENGINE!=='undefined'){try{SCIIP_WORKFLOW_ENGINE.resume(r.workflowId,{approved:true,approvalId:id});}catch(ignore){}}return clone_(r);}
  function get(id){return clone_(requests[id]||null);}function list(filter){filter=filter||{};return Object.keys(requests).map(function(k){return requests[k];}).filter(function(r){return !filter.status||r.status===filter.status;}).map(clone_);}function reset(){requests={};nextId=1;return true;}
  return {VERSION:VERSION,create:create,decide:decide,get:get,list:list,reset:reset};
})();
function sciipApprovalSnapshotV7(status){return SCIIP_APPROVAL_ENGINE.list({status:status||null});}
