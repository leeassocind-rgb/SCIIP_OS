var SCIIP_APPROVAL_ORCHESTRATOR=(function(){'use strict';var approvals={};function reset(){approvals={};}
function request(i){i=i||{};var id=i.approvalId||('approval-'+(Object.keys(approvals).length+1));if(approvals[id])return {status:'DUPLICATE',approval:approvals[id]};var a={approvalId:id,workflowId:i.workflowId,stage:i.stage,authority:i.authority||'EXECUTIVE',status:'PENDING',requestedAt:new Date().toISOString(),evidence:i.evidence||[]};approvals[id]=a;return {status:'REQUESTED',approval:a};}
function decide(id,decision,actor){var a=approvals[id];if(!a)return {status:'NOT_FOUND'};a.status=decision==='APPROVE'?'APPROVED':'REJECTED';a.actor=actor||'SYSTEM';a.decidedAt=new Date().toISOString();return {status:'DECIDED',approval:a};}
function pending(workflowId){return Object.keys(approvals).map(function(k){return approvals[k];}).filter(function(a){return a.workflowId===workflowId&&a.status==='PENDING';});}
return {reset:reset,request:request,decide:decide,pending:pending};})();
