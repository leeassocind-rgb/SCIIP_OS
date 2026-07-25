/** SCIIP_OS v7.0 Integration Sprint 3A — enterprise intelligence orchestration. */
var SCIIP_INTELLIGENCE_ENGINE=(function(){
  'use strict';var VERSION='v7.0-integration-sprint-3a',MAX_PROMPT=3000;
  function text_(v){return String(v==null?'':v).trim();}function lower_(v){return text_(v).toLowerCase();}
  function contains_(v,terms){v=lower_(v);for(var i=0;i<terms.length;i++)if(v.indexOf(terms[i])!==-1)return true;return false;}
  function classify_(prompt){if(contains_(prompt,['site selection','property','building','warehouse','square feet',' sf','acre','power','amps','clear height']))return 'SITE_SELECTION';if(contains_(prompt,['company','tenant','manufacturer','executive','owner','occupier']))return 'COMPANY_ANALYSIS';if(contains_(prompt,['market','vacancy','rent','absorption','inland empire','south bay']))return 'MARKET_ANALYSIS';if(contains_(prompt,['relationship','graph','connected','owns','tenant']))return 'RELATIONSHIP_ANALYSIS';if(contains_(prompt,['status','health','runtime','queue','certification']))return 'PLATFORM_ANALYSIS';return 'GENERAL';}
  function query_(prompt){var stop={show:1,find:1,what:1,which:1,the:1,and:1,with:1,for:1,that:1,from:1,about:1,please:1,industrial:1,properties:1,property:1,company:1,market:1};var terms=lower_(prompt).replace(/[^a-z0-9]+/g,' ').split(/\s+/).filter(function(x){return x.length>2&&!stop[x];});return terms.slice(0,8).join(' ')||prompt;}
  function summarize_(intent,evidence,query){if(!evidence.length)return 'No grounded SCIIP_OS records matched “'+query+'”.';var types={};evidence.forEach(function(e){types[e.entityType]=(types[e.entityType]||0)+1;});var parts=Object.keys(types).sort().map(function(k){return types[k]+' '+k.toLowerCase().replace(/_/g,' ')+' record'+(types[k]===1?'':'s');});return 'The grounded '+intent.toLowerCase().replace(/_/g,' ')+' returned '+evidence.length+' result'+(evidence.length===1?'':'s')+': '+parts.join(', ')+'.';}
  function analyze(request){
    request=request||{};var prompt=text_(request.prompt||request.query);if(!prompt)throw new Error('INTELLIGENCE_PROMPT_REQUIRED');if(prompt.length>MAX_PROMPT)throw new Error('INTELLIGENCE_PROMPT_TOO_LONG');
    var intent=classify_(prompt),query=text_(request.searchQuery||query_(prompt)),context=request.context||((typeof SCIIP_APP_STATE!=='undefined')?SCIIP_APP_STATE.snapshot():{});
    var search=SCIIP_SEMANTIC_SEARCH.search({query:query,limit:request.limit||12,context:context,entityTypes:request.entityTypes||[]});
    var evidenceBundle=SCIIP_EVIDENCE_ENGINE.build(search.results,{limit:request.limit||12});
    var recommendations=SCIIP_RECOMMENDATION_ENGINE.generate({intent:intent,evidence:evidenceBundle.evidence,context:context});
    var explanations=search.results.slice(0,5).map(function(r){return SCIIP_EVIDENCE_ENGINE.explain(r);});
    var actions=recommendations.recommendations.map(function(r){return {label:r.title,workspace:r.workspace,action:'WORKSPACE_CHANGED',payload:{workspaceId:r.workspace}};});
    var output={version:VERSION,status:'COMPLETED',provider:'SCIIP_ENTERPRISE_INTELLIGENCE_ENGINE',requestId:'intel-'+Date.now(),generatedAt:new Date().toISOString(),prompt:prompt,intent:intent,searchQuery:query,summary:summarize_(intent,evidenceBundle.evidence,query),evidence:evidenceBundle.evidence,explanations:explanations,recommendations:recommendations.recommendations,workspaceActions:actions,confidence:evidenceBundle.count?(evidenceBundle.evidence[0].confidence||'MEDIUM'):'LOW',grounding:evidenceBundle.grounding};
    try{if(typeof SCIIP_ACTIVITY_TIMELINE!=='undefined')SCIIP_ACTIVITY_TIMELINE.append('INTELLIGENCE_ANALYSIS_COMPLETED',{requestId:output.requestId,intent:intent,evidenceCount:output.evidence.length},{workspace:'ai-workspace'});}catch(e){}
    return output;
  }
  function snapshot(){return {version:VERSION,status:'AVAILABLE',provider:'SCIIP_ENTERPRISE_INTELLIGENCE_ENGINE',capabilities:['SEMANTIC_SEARCH','GROUNDED_EVIDENCE','EXPLAINABILITY','RECOMMENDATIONS','CROSS_WORKSPACE_ORCHESTRATION'],externalModel:false,maxPromptLength:MAX_PROMPT};}
  return {VERSION:VERSION,analyze:analyze,snapshot:snapshot,classify:classify_};
})();
function sciipEnterpriseIntelligenceAnalyzeV7(request){return SCIIP_INTELLIGENCE_ENGINE.analyze(request||{});}
function sciipEnterpriseIntelligenceSnapshotV7(){return SCIIP_INTELLIGENCE_ENGINE.snapshot();}
