/** SCIIP_OS v7.0 Integration Sprint 3B — task routing. */
var SCIIP_TASK_ROUTER=(function(){
  'use strict';var VERSION='v7.0-integration-sprint-3b',nextId=1,tasks={};
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}function now_(){return new Date().toISOString();}
  function create(req){req=req||{};var id='task-'+nextId++;var task={id:id,title:req.title||'SCIIP task',status:'OPEN',priority:req.priority||'NORMAL',assignee:req.assignee||null,workspaceId:req.workspaceId||null,dueAt:req.dueAt||null,context:clone_(req.context||{}),createdAt:now_(),updatedAt:now_()};tasks[id]=task;return clone_(task);}
  function route(id,assignee){var t=tasks[id];if(!t)throw new Error('TASK_NOT_FOUND');t.assignee=assignee||null;t.status=assignee?'ASSIGNED':'OPEN';t.updatedAt=now_();return clone_(t);}
  function transition(id,status){var t=tasks[id];if(!t)throw new Error('TASK_NOT_FOUND');var s=String(status||'').toUpperCase();if(['OPEN','ASSIGNED','IN_PROGRESS','BLOCKED','COMPLETED','CANCELLED'].indexOf(s)===-1)throw new Error('INVALID_TASK_STATUS');t.status=s;t.updatedAt=now_();return clone_(t);}
  function list(filter){filter=filter||{};return Object.keys(tasks).map(function(k){return tasks[k];}).filter(function(t){return (!filter.status||t.status===filter.status)&&(!filter.assignee||t.assignee===filter.assignee)&&(!filter.workspaceId||t.workspaceId===filter.workspaceId);}).map(clone_);}function reset(){tasks={};nextId=1;return true;}
  return {VERSION:VERSION,create:create,route:route,transition:transition,list:list,reset:reset};
})();
function sciipTaskSnapshotV7(filter){return SCIIP_TASK_ROUTER.list(filter||{});}
