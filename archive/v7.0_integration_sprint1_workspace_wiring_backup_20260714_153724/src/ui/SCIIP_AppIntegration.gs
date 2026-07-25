/** SCIIP_OS v7.0 Integration Sprint 1 — synchronization and unified search. */
var SCIIP_APP_INTEGRATION = (function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-1', wired=false;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function entity_(value,type){if(!value)return null;if(typeof value==='string')return {id:value,label:value,entityType:type};var id=value.propertyId||value.companyId||value.marketId||value.nodeId||value.featureId||value.id;return {id:id,label:value.label||value.address||value.name||id,entityType:type,data:clone_(value)};}
  function clearSelectionPatch_(){return {selectedProperty:null,selectedCompany:null,selectedMarket:null,selectedGraphNode:null,selectedMapFeature:null};}
  function wire(){
    if(wired)return true; wired=true;
    SCIIP_APP_EVENTS.subscribe('*',function(event){var p=event.payload||{}, patch={};
      if(event.type===SCIIP_APP_EVENTS.TYPES.PROPERTY_SELECTED){var e=entity_(p.property||p,'PROPERTY');patch.selectedProperty=e;patch.selectedGraphNode=e?{id:e.id,label:e.label,entityType:'PROPERTY'}:null;patch.selectedMapFeature=e?{id:e.id,label:e.label,entityType:'PROPERTY'}:null;}
      else if(event.type===SCIIP_APP_EVENTS.TYPES.COMPANY_SELECTED)patch.selectedCompany=entity_(p.company||p,'COMPANY');
      else if(event.type===SCIIP_APP_EVENTS.TYPES.MARKET_SELECTED)patch.selectedMarket=entity_(p.market||p,'MARKET');
      else if(event.type===SCIIP_APP_EVENTS.TYPES.GRAPH_NODE_SELECTED)patch.selectedGraphNode=entity_(p.node||p,'GRAPH_NODE');
      else if(event.type===SCIIP_APP_EVENTS.TYPES.MAP_FEATURE_SELECTED)patch.selectedMapFeature=entity_(p.feature||p,'MAP_FEATURE');
      else if(event.type===SCIIP_APP_EVENTS.TYPES.WORKSPACE_CHANGED)patch.currentWorkspace=p.workspaceId||p.id||'executive-dashboard';
      else if(event.type===SCIIP_APP_EVENTS.TYPES.SEARCH_CHANGED)patch.globalSearchText=String(p.text||'');
      else if(event.type===SCIIP_APP_EVENTS.TYPES.FILTER_CHANGED)patch.activeFilters=clone_(p.filters||{});
      else if(event.type===SCIIP_APP_EVENTS.TYPES.CONTEXT_CLEARED)patch=clearSelectionPatch_();
      else if(event.type===SCIIP_APP_EVENTS.TYPES.NOTIFICATION_CREATED){var notes=SCIIP_APP_STATE.get('notifications')||[];notes.push(clone_(p));patch.notifications=notes.slice(-100);}
      if(Object.keys(patch).length)SCIIP_APP_STATE.patch(patch,{eventId:event.id,eventType:event.type});
    }); return true;
  }
  function normalize_(item,type,source){if(!item)return null;var id=item.propertyId||item.companyId||item.marketId||item.nodeId||item.featureId||item.id;var label=item.label||item.address||item.name||item.title||id;if(!id||!label)return null;return {entityId:String(id),label:String(label),entityType:type,sourceWorkspace:source,supportingDetail:item.city||item.type||item.status||item.layer||'',selectionAction:type+'_SELECTED',entity:clone_(item)};}
  function collect_(query){var items=[];function add(list,type,source){(list||[]).forEach(function(x){var n=normalize_(x,type,source);if(n)items.push(n);});}
    try{var p=SCIIP_PROPERTY_EXPLORER.snapshot();add(p.properties||p.items,'PROPERTY','property-explorer');}catch(e){}
    try{var g=SCIIP_KNOWLEDGE_GRAPH_VIEWER.snapshot({});add(g.nodes,'GRAPH_NODE','knowledge-graph');}catch(e){}
    try{var m=SCIIP_GIS_WORKSPACE.snapshot({});add(m.features,'MAP_FEATURE','gis-workspace');}catch(e){}
    var seen={};return items.filter(function(x){var hay=(x.entityId+' '+x.label+' '+x.entityType+' '+x.supportingDetail).toLowerCase(),key=x.entityType+'|'+x.entityId;if(seen[key]||hay.indexOf(query)<0)return false;seen[key]=true;return true;});
  }
  function search(request){request=request||{};var q=String(request.query||request.text||'').trim().toLowerCase();if(!q)return {query:'',count:0,results:[],status:'EMPTY'};var results=collect_(q).slice(0,Math.max(1,Math.min(Number(request.limit)||25,100)));return {query:q,count:results.length,results:results,status:'AVAILABLE',generatedAt:new Date().toISOString()};}
  function snapshot(){wire();return {version:VERSION,status:'AVAILABLE',state:SCIIP_APP_STATE.snapshot(),eventTypes:clone_(SCIIP_APP_EVENTS.TYPES),contracts:{desktop:true,mobile:true,globalSearch:true,crossWorkspaceSynchronization:true}};}
  wire(); return {VERSION:VERSION,wire:wire,search:search,snapshot:snapshot};
})();

function sciipGlobalSearchV7(request){return SCIIP_APP_INTEGRATION.search(request||{});}
function sciipIntegrationSnapshotV7(){return SCIIP_APP_INTEGRATION.snapshot();}
function sciipSelectPropertyV7(property){SCIIP_APP_EVENTS.publish('PROPERTY_SELECTED',{property:property},{source:'PUBLIC_API'});return SCIIP_APP_STATE.snapshot();}
function sciipClearContextV7(){SCIIP_APP_EVENTS.publish('CONTEXT_CLEARED',{}, {source:'PUBLIC_API'});return SCIIP_APP_STATE.snapshot();}
