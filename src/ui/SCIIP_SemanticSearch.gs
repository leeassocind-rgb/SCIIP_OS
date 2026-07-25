/** SCIIP_OS v7.0 Integration Sprint 3A — unified semantic search and ranking. */
var SCIIP_SEMANTIC_SEARCH=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3a', MAX_RESULTS=100;
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function text_(v){return String(v==null?'':v).trim();}
  function lower_(v){return text_(v).toLowerCase();}
  function tokens_(v){return lower_(v).replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(function(x){return x.length>1;});}
  function unique_(arr){var seen={},out=[];(arr||[]).forEach(function(x){x=String(x);if(!seen[x]){seen[x]=true;out.push(x);}});return out;}
  function normalize_(item,type,source){
    if(!item)return null;
    var id=item.entityId||item.propertyId||item.companyId||item.marketId||item.nodeId||item.featureId||item.id;
    var label=item.label||item.address||item.name||item.title||id;
    if(!id||!label)return null;
    var detail=item.supportingDetail||item.detail||item.description||item.city||item.status||item.type||item.layer||'';
    return {entityId:String(id),label:String(label),entityType:String(type||item.entityType||item.type||'ENTITY').toUpperCase(),sourceWorkspace:source||item.sourceWorkspace||'unknown',supportingDetail:String(detail),city:text_(item.city),status:text_(item.status),timestamp:item.timestamp||item.updatedAt||item.createdAt||null,entity:clone_(item)};
  }
  function collect_(){
    var items=[];
    function add(list,type,source){(list||[]).forEach(function(x){var n=normalize_(x,type,source);if(n)items.push(n);});}
    try{var p=SCIIP_PROPERTY_EXPLORER.snapshot();add(p.results||p.records||p.properties||p.items,'PROPERTY','property-explorer');}catch(e){}
    try{var g=SCIIP_KNOWLEDGE_GRAPH_VIEWER.snapshot({});add(g.nodes,'GRAPH_NODE','knowledge-graph');}catch(e){}
    try{var m=SCIIP_GIS_WORKSPACE.snapshot({});add(m.features,'GIS_FEATURE','gis-workspace');}catch(e){}
    try{var a=SCIIP_ACTIVITY_TIMELINE.list({limit:250});add(a,'EVENT','activity-timeline');}catch(e){}
    try{var n=SCIIP_NOTIFICATION_SERVICE.list({});add(n,'NOTIFICATION','notification-center');}catch(e){}
    var state=typeof SCIIP_APP_STATE!=='undefined'?SCIIP_APP_STATE.snapshot():{};
    [['selectedCompany','COMPANY','property-explorer'],['selectedMarket','MARKET','gis-workspace'],['selectedProperty','PROPERTY','property-explorer'],['selectedGraphNode','GRAPH_NODE','knowledge-graph'],['selectedMapFeature','GIS_FEATURE','gis-workspace']].forEach(function(spec){if(state&&state[spec[0]])add([state[spec[0]]],spec[1],spec[2]);});
    var seen={};return items.filter(function(x){var key=x.entityType+'|'+x.entityId;if(seen[key])return false;seen[key]=true;return true;});
  }
  function score_(item,query,context){
    var q=lower_(query),qt=tokens_(query),label=lower_(item.label),hay=lower_([item.entityId,item.label,item.entityType,item.supportingDetail,item.city,item.status].join(' ')),score=0,reasons=[];
    if(label===q){score+=100;reasons.push('EXACT_LABEL');}
    else if(label.indexOf(q)===0){score+=70;reasons.push('LABEL_PREFIX');}
    else if(label.indexOf(q)!==-1){score+=50;reasons.push('LABEL_CONTAINS');}
    qt.forEach(function(t){if(label.indexOf(t)!==-1){score+=15;reasons.push('LABEL_TOKEN');}else if(hay.indexOf(t)!==-1){score+=6;reasons.push('DETAIL_TOKEN');}});
    context=context||{};
    if(context.currentWorkspace&&item.sourceWorkspace===context.currentWorkspace){score+=12;reasons.push('WORKSPACE_CONTEXT');}
    var selected=context.selectedEntity||context.selectedProperty||context.selectedCompany||context.selectedMarket||null;
    if(selected&&selected.id&&String(selected.id)===item.entityId){score+=30;reasons.push('SELECTED_CONTEXT');}
    if(context.city&&lower_(item.city)===lower_(context.city)){score+=10;reasons.push('CITY_CONTEXT');}
    if(item.timestamp){var age=Date.now()-new Date(item.timestamp).getTime();if(isFinite(age)&&age>=0){var days=age/86400000;if(days<1){score+=8;reasons.push('RECENT_1D');}else if(days<30){score+=4;reasons.push('RECENT_30D');}}}
    return {score:score,reasons:unique_(reasons)};
  }
  function search(request){
    request=request||{};var query=text_(request.query||request.text);if(!query)return {version:VERSION,status:'EMPTY',query:'',count:0,results:[]};
    var context=clone_(request.context||{});if(!Object.keys(context).length&&typeof SCIIP_APP_STATE!=='undefined')context=SCIIP_APP_STATE.snapshot();
    var types=(request.entityTypes||[]).map(function(x){return String(x).toUpperCase();}),limit=Math.max(1,Math.min(Number(request.limit)||25,MAX_RESULTS));
    var results=collect_().map(function(item){var ranked=score_(item,query,context);item.score=ranked.score;item.matchReasons=ranked.reasons;item.selectionAction=item.entityType+'_SELECTED';return item;}).filter(function(item){return item.score>0&&(!types.length||types.indexOf(item.entityType)!==-1);});
    results.sort(function(a,b){return b.score-a.score||a.label.localeCompare(b.label);});results=results.slice(0,limit);
    return {version:VERSION,status:'AVAILABLE',query:query,count:results.length,results:clone_(results),generatedAt:new Date().toISOString(),ranking:'DETERMINISTIC_CONTEXTUAL_V1'};
  }
  return {VERSION:VERSION,search:search,collect:collect_};
})();
function sciipSemanticSearchV7(request){return SCIIP_SEMANTIC_SEARCH.search(request||{});}
