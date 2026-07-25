/** SCIIP_OS v7 Epic 3 Sprint 3 — Industrial AI Copilot */
var SCIIP_INDUSTRIAL_AI_COPILOT = (function(){
  'use strict';
  var VERSION='v7.0-epic3-sprint3.0';
  function text_(v){return String(v==null?'':v).trim();}
  function upper_(v){return text_(v).toUpperCase();}
  function num_(v){var n=Number(v);return isFinite(n)?n:null;}
  function arr_(v){return Array.isArray(v)?v:[];}
  function tokens_(q){return upper_(q).replace(/[^A-Z0-9\s'-]/g,' ').split(/\s+/).filter(function(x){return x.length>1;});}
  function scoreText_(q,obj){var hay=upper_(JSON.stringify(obj||{})),t=tokens_(q),score=0;t.forEach(function(x){if(hay.indexOf(x)>=0)score+=1;});return score;}
  function normalizeProperty_(p){p=p||{};return {
    propertyId:text_(p.propertyId||p.id||p.entityId),address:text_(p.address||p.streetAddress),city:text_(p.city),submarket:text_(p.submarket),
    availableSf:num_(p.availableSf||p.availableSF||p.buildingSf),clearHeight:num_(p.clearHeight||p.clearHt),powerAmps:num_(p.powerAmps||p.amps),
    trailerParking:num_(p.trailerParking||p.trailerStalls),status:text_(p.status),latitude:num_(p.latitude),longitude:num_(p.longitude),source:p
  };}
  function inferIntent_(question){var q=upper_(question);if(/COMPARE|VERSUS| VS |SIMILAR/.test(q))return'COMPARE_PROPERTIES';if(/FIND|SHOW|WHICH|SUITABLE|REQUIRE|AT LEAST|WITHIN/.test(q))return'SITE_SELECTION';if(/CHANGED|CHANGE|NEW|TODAY|WEEK|RECENT/.test(q))return'MARKET_CHANGE';if(/WHY|EXPLAIN/.test(q))return'EXPLAIN';return'KNOWLEDGE_QUERY';}
  function constraints_(question){var q=upper_(question),out={};var sf=q.match(/([\d,.]+)\s*(?:SF|SQUARE FEET)/);if(sf)out.minimumSf=Number(sf[1].replace(/,/g,''));var amps=q.match(/([\d,.]+)\s*(?:AMPS|AMP)/);if(amps)out.minimumPowerAmps=Number(amps[1].replace(/,/g,''));var clear=q.match(/([\d.]+)\s*(?:'|FT|FEET)?\s*CLEAR/);if(clear)out.minimumClearHeight=Number(clear[1]);var miles=q.match(/WITHIN\s+([\d.]+)\s*MILES?/);if(miles)out.maximumMiles=Number(miles[1]);return out;}
  function qualify_(p,c){var reasons=[],fails=[];if(c.minimumSf!=null)((p.availableSf||0)>=c.minimumSf?reasons:fails).push('Available SF '+(p.availableSf||0)+' vs '+c.minimumSf);if(c.minimumPowerAmps!=null)((p.powerAmps||0)>=c.minimumPowerAmps?reasons:fails).push('Power '+(p.powerAmps||0)+'A vs '+c.minimumPowerAmps+'A');if(c.minimumClearHeight!=null)((p.clearHeight||0)>=c.minimumClearHeight?reasons:fails).push('Clear height '+(p.clearHeight||0)+' ft vs '+c.minimumClearHeight+' ft');return {qualified:fails.length===0,reasons:reasons,failures:fails};}
  function retrieve(request){request=request||{};var q=text_(request.question),properties=arr_(request.properties).map(normalizeProperty_),entities=arr_(request.entities),events=arr_(request.events),relationships=arr_(request.relationships),c=constraints_(q);
    var evidence=[];properties.forEach(function(p){var match=scoreText_(q,p),qual=qualify_(p,c),score=match*10+(qual.qualified?40:0)+(p.status&&/AVAILABLE|PLANNED|CONSTRUCTION/i.test(p.status)?10:0);if(match||Object.keys(c).length)evidence.push({evidenceType:'PROPERTY',entityId:p.propertyId,title:p.address||p.propertyId,score:score,qualified:qual.qualified,reasons:qual.reasons,failures:qual.failures,data:p});});
    entities.forEach(function(e){var score=scoreText_(q,e)*10;if(score)evidence.push({evidenceType:'ENTITY',entityId:text_(e.entityId||e.id),title:text_(e.name||e.label||e.entityId),score:score,data:e});});
    events.forEach(function(e){var score=scoreText_(q,e)*10;if(score)evidence.push({evidenceType:'EVENT',entityId:text_(e.eventId||e.id),title:text_(e.eventType||e.type||'Event'),score:score,data:e});});
    relationships.forEach(function(e){var score=scoreText_(q,e)*10;if(score)evidence.push({evidenceType:'RELATIONSHIP',entityId:text_(e.relationshipId||e.id),title:text_(e.type||e.relationshipType||'Relationship'),score:score,data:e});});
    evidence.sort(function(a,b){return b.score-a.score;});return {question:q,intent:inferIntent_(q),constraints:c,evidence:evidence.slice(0,25),retrievedAt:new Date().toISOString()};
  }
  function compose_(retrieval){var ev=retrieval.evidence||[],qualified=ev.filter(function(x){return x.evidenceType==='PROPERTY'&&x.qualified;});var selected=qualified.length?qualified:ev.slice(0,5),answer='';
    if(retrieval.intent==='SITE_SELECTION')answer=selected.length?'SCIIP found '+selected.length+' relevant candidate'+(selected.length===1?'':'s')+'. '+selected.map(function(x,i){return (i+1)+'. '+x.title+(x.reasons&&x.reasons.length?' — '+x.reasons.join('; '):'');}).join(' '):'SCIIP did not find a governed record that satisfies the stated requirements.';
    else if(retrieval.intent==='MARKET_CHANGE')answer=selected.length?'SCIIP found '+selected.length+' relevant governed changes or records.':'No matching governed market changes were found in the supplied evidence.';
    else if(retrieval.intent==='COMPARE_PROPERTIES')answer=selected.length?'SCIIP identified '+selected.length+' records for comparison: '+selected.map(function(x){return x.title;}).join(', ')+'.':'No comparable governed records were found.';
    else answer=selected.length?'SCIIP found '+selected.length+' grounded evidence item'+(selected.length===1?'':'s')+'. '+selected.map(function(x){return x.title;}).join(', ')+'.':'SCIIP could not find grounded evidence for this question.';
    return {answer:answer,evidence:selected,confidence:selected.length?Math.min(99,60+selected.length*7):25};
  }
  function ask(request){request=request||{};var r=retrieve(request),c=compose_(r);return {version:VERSION,status:'ANSWERED',question:r.question,intent:r.intent,constraints:r.constraints,answer:c.answer,confidence:c.confidence,evidence:c.evidence,actions:c.evidence.filter(function(x){return x.evidenceType==='PROPERTY';}).map(function(x){return {label:'Open '+x.title,action:'OPEN_DIGITAL_TWIN',propertyId:x.entityId};}),governance:{groundedOnly:true,evidenceRequired:true,externalModelUsed:false},generatedAt:new Date().toISOString()};}
  function snapshot(){return {version:VERSION,status:'AVAILABLE',workspace:'ai-copilot',capabilities:['NATURAL_LANGUAGE_QUERY','GRAPH_AWARE_RETRIEVAL','SPATIAL_CONSTRAINT_EXTRACTION','PROPERTY_RANKING','EVIDENCE_CITATIONS','DIGITAL_TWIN_ACTIONS'],suggestedPrompts:['Find buildings with at least 500,000 SF and 4,000 amps.','Show properties similar to 2125 W Lowell St.','What changed in the Inland Empire this week?','Explain why Slover is a competitor.']};}
  return {VERSION:VERSION,snapshot:snapshot,retrieve:retrieve,ask:ask,inferIntent:inferIntent_,extractConstraints:constraints_};
})();
function sciipIndustrialAICopilotAsk(request){return SCIIP_INDUSTRIAL_AI_COPILOT.ask(request||{});}
function sciipIndustrialAICopilotSnapshot(){return SCIIP_INDUSTRIAL_AI_COPILOT.snapshot();}
