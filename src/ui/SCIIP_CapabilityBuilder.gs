/** SCIIP_OS v7.0 Sprint 4A — declarative capability builder. */
var SCIIP_CAPABILITY_BUILDER=(function(){
'use strict';
var VERSION='v7.0-integration-sprint-4a',definitions={},history=[];
function clone(v){return v==null?v:JSON.parse(JSON.stringify(v));}
function text(v){return String(v==null?'':v).trim();}
function normalize(def){
 def=clone(def||{}); var name=text(def.name); if(!name)throw new Error('CAPABILITY_NAME_REQUIRED');
 var id=text(def.id||name.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''));
 if(!id)throw new Error('CAPABILITY_ID_REQUIRED');
 return {id:id,name:name,version:text(def.version||'v1'),services:(def.services||[]).map(text),workspace:text(def.workspace||''),events:(def.events||[]).map(text),queries:(def.queries||[]).map(text),tests:(def.tests||['apps_script','node']).map(text),metadata:clone(def.metadata||{})};
}
function define(def){var n=normalize(def),key=n.id+'|'+n.version;if(definitions[key])return {status:'DUPLICATE_SAFE',definition:clone(definitions[key])};definitions[key]=n;history.push({type:'CAPABILITY_DEFINED',key:key,at:new Date().toISOString()});return {status:'CREATED',definition:clone(n)};}
function generate(def){var d=define(def).definition,base='SCIIP_'+d.id.toUpperCase().replace(/-/g,'_');var files=[];
 d.services.forEach(function(s){files.push({path:'src/ui/'+base+'_'+s.toUpperCase().replace(/[^A-Z0-9]+/g,'_')+'.gs',kind:'SERVICE',symbol:base+'_'+s.toUpperCase().replace(/[^A-Z0-9]+/g,'_')});});
 if(d.workspace)files.push({path:'src/ui/'+base+'_Workspace.gs',kind:'WORKSPACE',symbol:base+'_WORKSPACE'});
 files.push({path:'src/ui/'+base+'_Wiring.gs',kind:'WIRING',symbol:base+'_WIRING'});
 files.push({path:'src/ui/'+base+'_Tests.gs',kind:'TESTS',symbol:'sciipTest'+d.id.replace(/(^|-)([a-z])/g,function(_,a,b){return b.toUpperCase();})});
 return {version:VERSION,status:'GENERATED',capability:d,files:files,contracts:{queryEngine:true,liveRuntime:true,sharedState:!!d.workspace,eventBus:!!d.events.length,compilerV2:true,noProcessors:true},manifest:{capabilityId:d.id,fileCount:files.length,generatedAt:new Date().toISOString()}};
}
function snapshot(){return {version:VERSION,status:'AVAILABLE',definitions:Object.keys(definitions).map(function(k){return clone(definitions[k]);}),history:clone(history)};}
return {VERSION:VERSION,define:define,generate:generate,snapshot:snapshot};})();
function sciipCapabilityGenerateV7(definition){return SCIIP_CAPABILITY_BUILDER.generate(definition||{});}
