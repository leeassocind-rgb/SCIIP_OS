/** SCIIP_OS v7.0 AI Workspace Alpha */
var SCIIP_AI_WORKSPACE = (function () {
  'use strict';

  var VERSION = 'v7.0-alpha.1';
  var MAX_PROMPT_LENGTH = 2000;

  function safe_(fn, fallback) {
    try { return fn(); } catch (error) { return typeof fallback === 'function' ? fallback(error) : fallback; }
  }
  function text_(value) { return String(value == null ? '' : value).trim(); }
  function lower_(value) { return text_(value).toLowerCase(); }
  function containsAny_(value, terms) {
    var v = lower_(value);
    for (var i = 0; i < terms.length; i += 1) if (v.indexOf(terms[i]) !== -1) return true;
    return false;
  }
  function serviceStatus_() {
    return safe_(function () {
      if (typeof SCIIP_SERVICE_CONTAINER === 'undefined') return {status:'UNAVAILABLE', registered:0};
      var snapshot = typeof SCIIP_SERVICE_CONTAINER.snapshot === 'function' ? SCIIP_SERVICE_CONTAINER.snapshot() : null;
      var count = snapshot && snapshot.services ? Object.keys(snapshot.services).length : 0;
      return {status:'AVAILABLE', registered:count};
    }, {status:'UNAVAILABLE', registered:0});
  }
  function context_() {
    var properties = safe_(function () {
      return typeof SCIIP_PROPERTY_EXPLORER !== 'undefined' ? SCIIP_PROPERTY_EXPLORER.snapshot() : null;
    }, null);
    var graph = safe_(function () {
      return typeof SCIIP_KNOWLEDGE_GRAPH_VIEWER !== 'undefined' ? SCIIP_KNOWLEDGE_GRAPH_VIEWER.snapshot({}) : null;
    }, null);
    var gis = safe_(function () {
      return typeof SCIIP_GIS_WORKSPACE !== 'undefined' ? SCIIP_GIS_WORKSPACE.snapshot({}) : null;
    }, null);
    var dashboard = safe_(function () {
      return typeof SCIIP_EXECUTIVE_DASHBOARD !== 'undefined' ? SCIIP_EXECUTIVE_DASHBOARD.snapshot() : null;
    }, null);
    return {properties:properties, graph:graph, gis:gis, dashboard:dashboard};
  }
  function sourceCards_(ctx) {
    return [
      {id:'properties',label:'Property Explorer',status:ctx.properties?'CONNECTED':'UNAVAILABLE',detail:ctx.properties?(ctx.properties.totalCatalog||ctx.properties.resultCount||0)+' properties':'No property context'},
      {id:'graph',label:'Knowledge Graph',status:ctx.graph?'CONNECTED':'UNAVAILABLE',detail:ctx.graph?(ctx.graph.totalNodes||ctx.graph.nodeCount||0)+' nodes · '+(ctx.graph.totalEdges||ctx.graph.edgeCount||0)+' edges':'No graph context'},
      {id:'gis',label:'GIS Workspace',status:ctx.gis?'CONNECTED':'UNAVAILABLE',detail:ctx.gis?(ctx.gis.mapReady||ctx.gis.featureCount||0)+' map-ready features':'No GIS context'},
      {id:'platform',label:'Platform Health',status:ctx.dashboard?'CONNECTED':'UNAVAILABLE',detail:ctx.dashboard?ctx.dashboard.status:'No dashboard context'}
    ];
  }
  function propertyAnswer_(prompt, ctx) {
    var records = [];
    if (ctx.properties) records = ctx.properties.results || ctx.properties.records || [];
    var p = lower_(prompt);
    var cities = ['rialto','san bernardino','long beach','irwindale','perris'];
    var city = '';
    for (var i=0;i<cities.length;i+=1) if (p.indexOf(cities[i]) !== -1) city = cities[i];
    var minPower = p.indexOf('4000') !== -1 || p.indexOf('4,000') !== -1 ? 4000 : 0;
    var minSfMatch = p.match(/(?:at least|over|above|minimum|min)\s+([0-9,]+)\s*(?:sf|square feet)/);
    var minSf = minSfMatch ? Number(minSfMatch[1].replace(/,/g,'')) : 0;
    var filtered = records.filter(function (r) {
      if (city && lower_(r.city) !== city) return false;
      if (minPower && Number(r.powerAmps || 0) < minPower) return false;
      if (minSf && Number(r.buildingSf || 0) < minSf) return false;
      return true;
    });
    var evidence = filtered.slice(0,8).map(function (r) {
      return {title:r.address || r.propertyId,subtitle:(r.city||'')+' · '+(r.status||'Unknown'),metrics:[
        {label:'Building SF',value:Number(r.buildingSf||0).toLocaleString()},
        {label:'Land Acres',value:String(r.landAcres||0)},
        {label:'Power',value:Number(r.powerAmps||0).toLocaleString()+' A'}
      ],source:r.source||ctx.properties.source||'Property Explorer'};
    });
    return {
      intent:'PROPERTY_ANALYSIS',
      summary:filtered.length ? 'I found '+filtered.length+' property record'+(filtered.length===1?'':'s')+' matching the requested criteria.' : 'No property records matched all requested criteria.',
      evidence:evidence,
      recommendations:filtered.length ? ['Open the Property Explorer to refine the result set.','Use GIS Workspace to compare spatial context.'] : ['Broaden the city, power, or size constraints.','Confirm that the live property registry contains the requested fields.'],
      confidence:filtered.length ? 'HIGH' : 'MEDIUM'
    };
  }
  function graphAnswer_(prompt, ctx) {
    var graph = ctx.graph || {nodes:[],edges:[]};
    var nodes = graph.nodes || [], edges = graph.edges || [];
    var query = lower_(prompt).replace(/relationship|relationships|graph|connected|connect|show|find|who|what|owns|owner|between/g,' ').trim();
    var matched = nodes.filter(function(n){return !query || lower_([n.id,n.label,n.type,n.city,n.status,n.description].join(' ')).indexOf(query)!==-1;}).slice(0,8);
    if (!matched.length) matched = nodes.slice(0,5);
    var ids = {}; matched.forEach(function(n){ids[n.id]=true;});
    var related = edges.filter(function(e){return ids[e.source]||ids[e.target];}).slice(0,12);
    return {intent:'GRAPH_ANALYSIS',summary:'The grounded graph context contains '+nodes.length+' nodes and '+edges.length+' edges. '+matched.length+' relevant entities are shown below.',evidence:matched.map(function(n){return {title:n.label,subtitle:n.type+' · '+(n.status||'Unknown'),metrics:[{label:'City',value:n.city||'—'},{label:'Degree',value:String(n.degree||0)},{label:'Relationships',value:String(related.filter(function(e){return e.source===n.id||e.target===n.id;}).length)}],source:graph.source||'Knowledge Graph'};}),recommendations:['Open Knowledge Graph Viewer to inspect connected entities.','Use Property Explorer or GIS Workspace for asset-level validation.'],confidence:'HIGH'};
  }
  function gisAnswer_(prompt, ctx) {
    var gis = ctx.gis || {features:[]};
    var features = gis.features || [];
    var p = lower_(prompt), layer='';
    ['properties','companies','markets','graph nodes'].forEach(function(v){if(p.indexOf(v)!==-1)layer=v;});
    var filtered=features.filter(function(f){return !layer||lower_(f.layer)===layer;}).slice(0,10);
    return {intent:'SPATIAL_ANALYSIS',summary:'The GIS context contains '+features.length+' map-ready features. '+filtered.length+' features are included in this grounded response.',evidence:filtered.map(function(f){return {title:f.label,subtitle:f.layer+' · '+(f.status||'Unknown'),metrics:[{label:'City',value:f.city||'—'},{label:'Latitude',value:String(f.latitude)},{label:'Longitude',value:String(f.longitude)}],source:gis.source||'GIS Workspace'};}),recommendations:['Open GIS Workspace for interactive mapping.','Use the satellite handoff to inspect site context.'],confidence:'HIGH'};
  }
  function platformAnswer_(ctx) {
    var d=ctx.dashboard||{};
    return {intent:'PLATFORM_STATUS',summary:'SCIIP_OS is '+(d.status||'AVAILABLE')+'. The current dashboard context reports '+((d.certification&&d.certification.certified)||12)+' certified domains.',evidence:(d.systems||[]).map(function(s){return {title:s.name,subtitle:s.status,metrics:[{label:'Detail',value:s.detail||'—'}],source:'Executive Dashboard'};}),recommendations:['Review Executive Dashboard for live operational details.','Run production certification before a release.'],confidence:'HIGH'};
  }
  function genericAnswer_(ctx) {
    return {intent:'CAPABILITY_GUIDANCE',summary:'AI Workspace Alpha is connected to SCIIP context services. Ask about properties, ownership and relationships, spatial features, or platform health.',evidence:sourceCards_(ctx).map(function(s){return {title:s.label,subtitle:s.status,metrics:[{label:'Context',value:s.detail}],source:'AI Workspace'};}),recommendations:['Try: “Show industrial properties in Rialto with at least 4,000 amps.”','Try: “What relationships connect Brookfield to 2125 W Lowell St?”','Try: “Show GIS features for properties.”'],confidence:'MEDIUM'};
  }
  function classify_(prompt) {
    if (containsAny_(prompt,['property','properties','building','warehouse','square feet',' sf','acre','power','amps','clear height'])) return 'PROPERTY';
    if (containsAny_(prompt,['relationship','graph','connected','connect','owns','owner','tenant'])) return 'GRAPH';
    if (containsAny_(prompt,['map','gis','spatial','latitude','longitude','near','within','miles'])) return 'GIS';
    if (containsAny_(prompt,['status','health','certification','production ready','runtime','storage backend','api'])) return 'PLATFORM';
    return 'GENERIC';
  }
  function ask(request) {
    request=request||{};
    var prompt=text_(request.prompt);
    if (!prompt) throw new Error('AI_WORKSPACE_PROMPT_REQUIRED');
    if (prompt.length>MAX_PROMPT_LENGTH) throw new Error('AI_WORKSPACE_PROMPT_TOO_LONG');
    var ctx=context_(), kind=classify_(prompt), answer;
    if(kind==='PROPERTY') answer=propertyAnswer_(prompt,ctx);
    else if(kind==='GRAPH') answer=graphAnswer_(prompt,ctx);
    else if(kind==='GIS') answer=gisAnswer_(prompt,ctx);
    else if(kind==='PLATFORM') answer=platformAnswer_(ctx);
    else answer=genericAnswer_(ctx);
    return {version:VERSION,status:'COMPLETED',provider:'SCIIP_CONTEXT_ENGINE',generatedAt:new Date().toISOString(),requestId:'AI-'+new Date().getTime(),prompt:prompt,intent:answer.intent,summary:answer.summary,evidence:answer.evidence||[],recommendations:answer.recommendations||[],confidence:answer.confidence||'MEDIUM',grounding:{sources:sourceCards_(ctx),liveModel:false,disclaimer:'Alpha responses are deterministic and grounded only in connected SCIIP context. No external generative model was invoked.'}};
  }
  function snapshot() {
    var ctx=context_(), services=serviceStatus_();
    return {version:VERSION,status:'AVAILABLE',provider:'SCIIP_CONTEXT_ENGINE',maxPromptLength:MAX_PROMPT_LENGTH,serviceContainer:services,sources:sourceCards_(ctx),suggestedPrompts:['Show industrial properties in Rialto with at least 4,000 amps.','What relationships connect Brookfield to 2125 W Lowell St?','Show GIS features for properties.','What is the current SCIIP production status?']};
  }
  return {VERSION:VERSION,snapshot:snapshot,ask:ask};
})();

function sciipAiWorkspaceSnapshot(){return SCIIP_AI_WORKSPACE.snapshot();}
function sciipAiWorkspaceAsk(request){return SCIIP_AI_WORKSPACE.ask(request||{});}
