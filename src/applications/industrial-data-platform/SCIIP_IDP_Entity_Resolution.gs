/** Deterministic candidate generation for owners, tenants and properties. */
var SCIIP_IDP_ENTITY_RESOLUTION_V7 = SCIIP_IDP_ENTITY_RESOLUTION_V7 || {};
SCIIP_IDP_ENTITY_RESOLUTION_V7.norm = function(v){return String(v==null?'':v).toLowerCase().replace(/\b(llc|lp|l p|inc|corp|corporation|company|co|holdings|properties|property)\b/g,' ').replace(/[^a-z0-9]+/g,' ').trim().replace(/\s+/g,' ');};
SCIIP_IDP_ENTITY_RESOLUTION_V7.tokens = function(v){var n=SCIIP_IDP_ENTITY_RESOLUTION_V7.norm(v);return n?n.split(' '):[];};
SCIIP_IDP_ENTITY_RESOLUTION_V7.similarity = function(a,b){
  var na=SCIIP_IDP_ENTITY_RESOLUTION_V7.norm(a), nb=SCIIP_IDP_ENTITY_RESOLUTION_V7.norm(b); if(!na||!nb)return 0; if(na===nb)return 100;
  var ta=SCIIP_IDP_ENTITY_RESOLUTION_V7.tokens(a), tb=SCIIP_IDP_ENTITY_RESOLUTION_V7.tokens(b), set={}; ta.forEach(function(x){set[x]=true;});
  var overlap=tb.filter(function(x){return set[x];}).length, union={}; ta.concat(tb).forEach(function(x){union[x]=true;});
  return Math.round((overlap/Math.max(1,Object.keys(union).length))*100);
};
SCIIP_IDP_ENTITY_RESOLUTION_V7.candidates = function(value,entities,threshold){
  threshold=threshold==null?55:threshold; return (entities||[]).map(function(e){var score=SCIIP_IDP_ENTITY_RESOLUTION_V7.similarity(value,e.label||e.name);return {candidateId:e.id||'',candidateLabel:e.label||e.name||'',confidence:score};}).filter(function(x){return x.confidence>=threshold;}).sort(function(a,b){return b.confidence-a.confidence;}).slice(0,5);
};
SCIIP_IDP_ENTITY_RESOLUTION_V7.resolveRecord = function(record,entityIndex){
  record=record||{}; entityIndex=entityIndex||{}; var matches=[];
  [{field:'owner',type:'OWNER'},{field:'tenant',type:'TENANT'}].forEach(function(spec){
    if(!record[spec.field])return; var c=SCIIP_IDP_ENTITY_RESOLUTION_V7.candidates(record[spec.field],entityIndex[spec.type]||[],55);
    if(c.length) matches.push({entityType:spec.type,incomingValue:record[spec.field],candidates:c,recommended:c[0],resolutionStatus:c[0].confidence>=90?'AUTO_RECOMMENDED':'REVIEW_REQUIRED'});
  });
  return matches;
};
