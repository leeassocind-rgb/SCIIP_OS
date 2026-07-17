/** SCIIP_OS v7.0 Integration Sprint 3A — grounded evidence and explainability. */
var SCIIP_EVIDENCE_ENGINE=(function(){
  'use strict';
  var VERSION='v7.0-integration-sprint-3a';
  function clone_(v){return v==null?v:JSON.parse(JSON.stringify(v));}
  function normalize(input){
    input=input||{};var id=input.evidenceId||input.entityId||input.id||('evidence-'+String(input.source||'SCIIP')+'-'+String(input.label||input.title||'item').replace(/[^a-z0-9]+/gi,'-').toLowerCase());
    return {evidenceId:String(id),label:String(input.label||input.title||input.entityId||input.id||'Evidence'),entityId:input.entityId||input.id||null,entityType:String(input.entityType||input.type||'ENTITY').toUpperCase(),source:String(input.source||input.sourceWorkspace||'SCIIP'),supportingDetail:String(input.supportingDetail||input.detail||input.description||''),score:Number(input.score||0),confidence:String(input.confidence||'MEDIUM').toUpperCase(),provenance:{workspace:input.sourceWorkspace||null,timestamp:input.timestamp||input.updatedAt||input.createdAt||null,live:input.live===true,external:false},attributes:clone_(input.attributes||input.entity||{})};
  }
  function build(items,options){
    options=options||{};var seen={},evidence=[];(items||[]).forEach(function(x){var e=normalize(x),key=e.entityType+'|'+(e.entityId||e.evidenceId);if(seen[key])return;seen[key]=true;if(e.score>=80)e.confidence='HIGH';else if(e.score<25)e.confidence='LOW';evidence.push(e);});
    evidence.sort(function(a,b){return b.score-a.score||a.label.localeCompare(b.label);});var limit=Math.max(1,Math.min(Number(options.limit)||20,100));evidence=evidence.slice(0,limit);
    var sources={};evidence.forEach(function(e){sources[e.source]=(sources[e.source]||0)+1;});
    return {version:VERSION,status:'AVAILABLE',evidence:evidence,count:evidence.length,sources:sources,grounding:{externalModelInvoked:false,externalSourcesUsed:false,deterministic:true,disclaimer:'Evidence is grounded only in connected SCIIP_OS context and certified fallback catalogs.'}};
  }
  function explain(result){result=result||{};var reasons=[];(result.matchReasons||[]).forEach(function(r){reasons.push(String(r).replace(/_/g,' ').toLowerCase());});return {entityId:result.entityId||null,label:result.label||'',score:Number(result.score||0),explanation:reasons.length?'Ranked because of '+reasons.join(', ')+'.':'Included as grounded SCIIP context.',reasons:clone_(result.matchReasons||[])};}
  return {VERSION:VERSION,normalize:normalize,build:build,explain:explain};
})();
function sciipEvidenceBuildV7(items,options){return SCIIP_EVIDENCE_ENGINE.build(items||[],options||{});}
