/** SCIIP_OS v7.0 Integration Sprint 2A — reactive binding and notification services. */
var SCIIP_REACTIVE_BINDINGS=(function(){
 'use strict';var VERSION='v7.0-integration-sprint-2a',bindings={},nextId=1;
 function bind(selector,handler){if(typeof handler!=='function')throw new Error('REACTIVE_BINDING_HANDLER_REQUIRED');var id='binding-'+nextId++;bindings[id]={selector:String(selector||'*'),handler:handler,lastRevision:null};return id;}
 function unbind(id){if(!bindings[id])return false;delete bindings[id];return true;}
 function propagate(change){var called=0,keys=(change&&change.changedKeys)||[];Object.keys(bindings).forEach(function(id){var b=bindings[id];if(b.selector!=='*'&&keys.indexOf(b.selector)===-1)return;try{b.handler(change);b.lastRevision=change&&change.state?change.state.revision:null;called++;}catch(error){}});return called;}
 function snapshot(){return {version:VERSION,status:'AVAILABLE',bindingCount:Object.keys(bindings).length};}
 if(typeof SCIIP_APP_STATE!=='undefined'&&SCIIP_APP_STATE.subscribe)SCIIP_APP_STATE.subscribe(propagate);
 return {VERSION:VERSION,bind:bind,unbind:unbind,propagate:propagate,snapshot:snapshot};
})();
var SCIIP_NOTIFICATION_SERVICE=(function(){
 'use strict';var VERSION='v7.0-integration-sprint-2a',items=[],nextId=1;
 function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));} function now_(){return new Date().toISOString();}
 function create(input){input=input||{};var n={id:input.id||'notification-'+nextId++,title:String(input.title||'SCIIP Notification'),detail:String(input.detail||''),severity:String(input.severity||'info').toLowerCase(),status:'UNREAD',workspace:input.workspace||null,deepLink:input.deepLink||null,group:input.group||null,createdAt:now_(),updatedAt:now_(),expiresAt:input.expiresAt||null};items.push(n);if(typeof SCIIP_APP_EVENTS!=='undefined')SCIIP_APP_EVENTS.publish('NOTIFICATION_CREATED',clone_(n),{source:'NOTIFICATION_SERVICE'});return clone_(n);}
 function transition(id,status){var allowed={READ:true,ACKNOWLEDGED:true,DISMISSED:true,ARCHIVED:true,EXPIRED:true};if(!allowed[status])throw new Error('NOTIFICATION_STATUS_INVALID');for(var i=0;i<items.length;i++)if(items[i].id===id){items[i].status=status;items[i].updatedAt=now_();return clone_(items[i]);}throw new Error('NOTIFICATION_NOT_FOUND:'+id);}
 function list(filter){filter=filter||{};return clone_(items.filter(function(n){return (!filter.status||n.status===filter.status)&&(!filter.workspace||n.workspace===filter.workspace);}));}
 function expire(at){var t=new Date(at||now_()).getTime(),count=0;items.forEach(function(n){if(n.expiresAt&&new Date(n.expiresAt).getTime()<=t&&n.status!=='EXPIRED'){n.status='EXPIRED';n.updatedAt=now_();count++;}});return count;}
 function snapshot(){var counts={};items.forEach(function(n){counts[n.status]=(counts[n.status]||0)+1;});return {version:VERSION,status:'AVAILABLE',total:items.length,counts:counts,items:clone_(items)};}
 return {VERSION:VERSION,create:create,transition:transition,list:list,expire:expire,snapshot:snapshot};
})();
function sciipNotificationCreateV7(input){return SCIIP_NOTIFICATION_SERVICE.create(input||{});} function sciipNotificationSnapshotV7(){return SCIIP_NOTIFICATION_SERVICE.snapshot();}
