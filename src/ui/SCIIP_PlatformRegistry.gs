/** SCIIP_OS v7.0 Sprint 4B — canonical declarative platform registry. */
var SCIIP_PLATFORM_REGISTRY=(function(){
'use strict';
var VERSION='v7.0-integration-sprint-4b', definitions={}, order=[], events=[];
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function text(v){return String(v==null?'':v).trim();}
function list(v){return (v||[]).map(text).filter(function(x){return !!x;});}
function normalize(def){
 def=clone(def||{});var id=text(def.id);if(!id)throw new Error('PLATFORM_CAPABILITY_ID_REQUIRED');
 return {id:id,name:text(def.name||id),version:text(def.version||'v1'),enabled:def.enabled!==false,
  dependencies:list(def.dependencies),services:list(def.services),queries:list(def.queries),events:list(def.events),
  stateBindings:list(def.stateBindings),workspaces:list(def.workspaces),tests:list(def.tests),
  liveHandler:text(def.liveHandler),queryHandler:text(def.queryHandler),metadata:clone(def.metadata||{})};
}
function register(def){var n=normalize(def);if(definitions[n.id]){var same=JSON.stringify(definitions[n.id])===JSON.stringify(n);return {status:same?'DUPLICATE_SAFE':'CONFLICT',definition:clone(definitions[n.id])};}definitions[n.id]=n;order.push(n.id);events.push({type:'CAPABILITY_REGISTERED',capabilityId:n.id,at:new Date().toISOString()});return {status:'REGISTERED',definition:clone(n)};}
function unregister(id){id=text(id);if(!definitions[id])return false;delete definitions[id];order=order.filter(function(x){return x!==id;});events.push({type:'CAPABILITY_UNREGISTERED',capabilityId:id,at:new Date().toISOString()});return true;}
function get(id){return clone(definitions[text(id)]||null);}
function listDefinitions(){return order.filter(function(id){return !!definitions[id];}).map(function(id){return clone(definitions[id]);});}
function dependencyOrder(){var visiting={},visited={},result=[],cycles=[];function visit(id,path){if(visited[id])return;if(visiting[id]){cycles.push(path.concat([id]));return;}visiting[id]=true;var d=definitions[id];if(d)d.dependencies.forEach(function(dep){if(definitions[dep])visit(dep,path.concat([id]));});visiting[id]=false;visited[id]=true;if(d)result.push(id);}order.forEach(function(id){visit(id,[]);});return {order:result,cycles:cycles};}
function snapshot(){var dep=dependencyOrder();return {version:VERSION,status:dep.cycles.length?'INVALID':'AVAILABLE',count:order.length,definitions:listDefinitions(),dependencyOrder:dep.order,cycles:clone(dep.cycles),events:clone(events)};}
return {VERSION:VERSION,register:register,unregister:unregister,get:get,list:listDefinitions,dependencyOrder:dependencyOrder,snapshot:snapshot};
})();
function sciipPlatformRegistrySnapshotV7(){return SCIIP_PLATFORM_REGISTRY.snapshot();}
