/** SCIIP_OS v7.0 Integration Sprint 1B — synchronization, navigation, and unified search. */
var SCIIP_APP_INTEGRATION = (function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-1b', wired=false;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function entity_(value,type){if(!value)return null;if(typeof value==='string')return {id:value,label:value,entityType:type};var id=value.propertyId||value.companyId||value.marketId||value.nodeId||value.featureId||value.id;return {id:id,label:value.label||value.address||value.name||id,entityType:type,data:clone_(value)};}
  function clearSelectionPatch_(){return {selectedProperty:null,selectedCompany:null,selectedMarket:null,selectedGraphNode:null,selectedMapFeature:null,mapExtent:null};}
  function workspaceForType_(type){return type==='PROPERTY'?'property-explorer':type==='COMPANY'?'knowledge-graph':type==='MARKET'?'gis-workspace':type==='GRAPH_NODE'?'knowledge-graph':type==='MAP_FEATURE'?'gis-workspace':'executive-dashboard';}
  function eventForType_(type){return type==='PROPERTY'?'PROPERTY_SELECTED':type==='COMPANY'?'COMPANY_SELECTED':type==='MARKET'?'MARKET_SELECTED':type==='GRAPH_NODE'?'GRAPH_NODE_SELECTED':type==='MAP_FEATURE'?'MAP_FEATURE_SELECTED':null;}
  function applyProjection_(meta){if(typeof SCIIP_WORKSPACE_SYNCHRONIZATION!=='undefined'&&typeof SCIIP_APP_STATE!=='undefined')SCIIP_WORKSPACE_SYNCHRONIZATION.applyState(SCIIP_APP_STATE.snapshot(),meta||{});}
  function wire(){
    if(wired)return true; wired=true;
    SCIIP_APP_EVENTS.subscribe('*',function(event){var p=event.payload||{}, patch={};
      if(event.type===SCIIP_APP_EVENTS.TYPES.PROPERTY_SELECTED){var e=entity_(p.property||p,'PROPERTY');patch.selectedProperty=e;patch.selectedGraphNode=e?{id:e.id,label:e.label,entityType:'PROPERTY',data:clone_(e.data)}:null;patch.selectedMapFeature=e?{id:e.id,label:e.label,entityType:'PROPERTY',data:clone_(e.data)}:null;}
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
      applyProjection_({eventId:event.id,eventType:event.type});
    });
    applyProjection_({eventType:'INTEGRATION_WIRED'});
    return true;
  }
  function normalize_(item,type,source){if(!item)return null;var id=item.propertyId||item.companyId||item.marketId||item.nodeId||item.featureId||item.id;var label=item.label||item.address||item.name||item.title||id;if(!id||!label)return null;return {entityId:String(id),label:String(label),entityType:type,sourceWorkspace:source,supportingDetail:[item.city,item.type,item.status,item.layer].filter(function(v){return !!v;}).join(' · '),selectionAction:eventForType_(type),workspaceAction:workspaceForType_(type),entity:clone_(item)};}
  function collect_(query){var items=[];function add(list,type,source){(list||[]).forEach(function(x){var n=normalize_(x,type,source);if(n)items.push(n);});}
    try{var p=SCIIP_PROPERTY_EXPLORER.snapshot();add(p.properties||p.items||p.results,'PROPERTY','property-explorer');}catch(e){}
    try{var g=SCIIP_KNOWLEDGE_GRAPH_VIEWER.snapshot({});add(g.nodes,'GRAPH_NODE','knowledge-graph');g.nodes.filter(function(n){return String(n.type||'').toLowerCase()==='company';}).forEach(function(n){var c=normalize_(n,'COMPANY','knowledge-graph');if(c)items.push(c);});g.nodes.filter(function(n){return String(n.type||'').toLowerCase()==='market';}).forEach(function(n){var m=normalize_(n,'MARKET','knowledge-graph');if(m)items.push(m);});}catch(e){}
    try{var m=SCIIP_GIS_WORKSPACE.snapshot({});add(m.features,'MAP_FEATURE','gis-workspace');m.features.filter(function(f){return String(f.layer||'').toLowerCase()==='companies';}).forEach(function(f){var c=normalize_(f,'COMPANY','gis-workspace');if(c)items.push(c);});m.features.filter(function(f){return String(f.layer||'').toLowerCase()==='markets';}).forEach(function(f){var market=normalize_(f,'MARKET','gis-workspace');if(market)items.push(market);});}catch(e){}
    var seen={};return items.filter(function(x){var hay=(x.entityId+' '+x.label+' '+x.entityType+' '+x.supportingDetail).toLowerCase(),key=x.entityType+'|'+x.entityId;if(seen[key]||hay.indexOf(query)<0)return false;seen[key]=true;return true;});
  }
  function search(request){request=request||{};var q=String(request.query||request.text||'').trim().toLowerCase();if(!q)return {query:'',count:0,results:[],status:'EMPTY'};var results=collect_(q).slice(0,Math.max(1,Math.min(Number(request.limit)||25,100)));return {query:q,count:results.length,results:results,status:'AVAILABLE',generatedAt:new Date().toISOString()};}
  function selectSearchResult(result,options){options=options||{};if(!result||!result.entityType)throw new Error('SCIIP search selection requires a result.');var eventType=result.selectionAction||eventForType_(result.entityType);if(!eventType)throw new Error('Unsupported SCIIP entity type: '+result.entityType);SCIIP_APP_EVENTS.publish(eventType,result.entity||{id:result.entityId,label:result.label},{source:'GLOBAL_SEARCH'});var workspace=options.workspaceId||result.workspaceAction||result.sourceWorkspace||workspaceForType_(result.entityType);if(options.navigate!==false)SCIIP_APP_EVENTS.publish('WORKSPACE_CHANGED',{workspaceId:workspace},{source:'GLOBAL_SEARCH'});return {status:'SELECTED',entityId:result.entityId,entityType:result.entityType,workspaceId:workspace,state:SCIIP_APP_STATE.snapshot(),focus:typeof SCIIP_WORKSPACE_SYNCHRONIZATION!=='undefined'?SCIIP_WORKSPACE_SYNCHRONIZATION.get(workspace):null};}
  function contextEnvelope(){var state=SCIIP_APP_STATE.snapshot(), selected=state.selectedProperty||state.selectedCompany||state.selectedMarket||state.selectedGraphNode||state.selectedMapFeature||null;return {version:VERSION,status:'AVAILABLE',selectedEntity:clone_(selected),currentWorkspace:state.currentWorkspace,breadcrumbs:['SCIIP',String(state.currentWorkspace||'executive-dashboard').replace(/-/g,' '),selected?selected.label:null].filter(function(v){return !!v;}),state:state,workspaceFocus:typeof SCIIP_WORKSPACE_SYNCHRONIZATION!=='undefined'?SCIIP_WORKSPACE_SYNCHRONIZATION.get(state.currentWorkspace):null,notifications:clone_(state.notifications||[]),loading:clone_(state.loading),error:clone_(state.error)};}
  function snapshot(){wire();return {version:VERSION,status:'AVAILABLE',state:SCIIP_APP_STATE.snapshot(),eventTypes:clone_(SCIIP_APP_EVENTS.TYPES),workspaceSynchronization:typeof SCIIP_WORKSPACE_SYNCHRONIZATION!=='undefined'?SCIIP_WORKSPACE_SYNCHRONIZATION.snapshot():null,context:contextEnvelope(),contracts:{desktop:true,mobile:true,globalSearch:true,crossWorkspaceSynchronization:true,workspaceFocus:true,contextNavigation:true,notificationState:true,loadingAndErrorState:true}};}
  wire(); return {VERSION:VERSION,wire:wire,search:search,selectSearchResult:selectSearchResult,contextEnvelope:contextEnvelope,snapshot:snapshot};
})();

function sciipGlobalSearchV7(request){return SCIIP_APP_INTEGRATION.search(request||{});}
function sciipSelectGlobalSearchResultV7(result,options){return SCIIP_APP_INTEGRATION.selectSearchResult(result||{},options||{});}
function sciipIntegrationContextV7(){return SCIIP_APP_INTEGRATION.contextEnvelope();}
function sciipIntegrationSnapshotV7(){return SCIIP_APP_INTEGRATION.snapshot();}
function sciipSelectPropertyV7(property){SCIIP_APP_EVENTS.publish('PROPERTY_SELECTED',{property:property},{source:'PUBLIC_API'});return SCIIP_APP_STATE.snapshot();}
function sciipClearContextV7(){SCIIP_APP_EVENTS.publish('CONTEXT_CLEARED',{}, {source:'PUBLIC_API'});return SCIIP_APP_STATE.snapshot();}
