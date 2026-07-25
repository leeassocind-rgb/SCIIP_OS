/** SCIIP_OS v7.0 Epic 3 Sprint 4 — Market Intelligence Engine. */
var SCIIP_MARKET_INTELLIGENCE = (function () {
  'use strict';
  var VERSION='v7.0-epic3-sprint4.0';
  var CONTRACT='market-event-v1';
  var EVENT_TYPES={
    NEW_AVAILABILITY:'NEW_AVAILABILITY', REMOVED_FROM_MARKET:'REMOVED_FROM_MARKET', RATE_CHANGE:'RATE_CHANGE',
    STATUS_CHANGE:'STATUS_CHANGE', POWER_CHANGE:'POWER_CHANGE', OWNERSHIP_CHANGE:'OWNERSHIP_CHANGE',
    TENANT_CHANGE:'TENANT_CHANGE', CONSTRUCTION_STARTED:'CONSTRUCTION_STARTED', CONSTRUCTION_COMPLETED:'CONSTRUCTION_COMPLETED',
    LEASE_EXECUTED:'LEASE_EXECUTED', SALE_COMPLETED:'SALE_COMPLETED', FIELD_CHANGE:'FIELD_CHANGE'
  };
  var TRACKED=[
    {field:'status',type:'STATUS_CHANGE'}, {field:'availabilityStatus',type:'STATUS_CHANGE'}, {field:'availableSf',type:'NEW_AVAILABILITY'},
    {field:'askingRate',type:'RATE_CHANGE'}, {field:'powerAmps',type:'POWER_CHANGE'}, {field:'ownerId',type:'OWNERSHIP_CHANGE'},
    {field:'tenantId',type:'TENANT_CHANGE'}, {field:'constructionStatus',type:'STATUS_CHANGE'}
  ];
  function clone_(x){return JSON.parse(JSON.stringify(x==null?null:x));}
  function hash_(s){s=String(s||'');var h=2166136261,i;for(i=0;i<s.length;i++){h^=s.charCodeAt(i);h+=(h<<1)+(h<<4)+(h<<7)+(h<<8)+(h<<24);}return ('00000000'+(h>>>0).toString(16).toUpperCase()).slice(-8);}
  function iso_(v){var d=v?new Date(v):new Date();return isNaN(d.getTime())?new Date().toISOString():d.toISOString();}
  function equal_(a,b){if(a===b)return true;if(a==null&&b==null)return true;return JSON.stringify(a)==JSON.stringify(b);}
  function eventType_(field,oldValue,newValue){
    var ov=String(oldValue==null?'':oldValue).toUpperCase(),nv=String(newValue==null?'':newValue).toUpperCase();
    if(field==='availableSf'&&Number(oldValue||0)<=0&&Number(newValue||0)>0)return EVENT_TYPES.NEW_AVAILABILITY;
    if(field==='availableSf'&&Number(oldValue||0)>0&&Number(newValue||0)<=0)return EVENT_TYPES.REMOVED_FROM_MARKET;
    if(field==='constructionStatus'&&nv.indexOf('UNDER CONSTRUCTION')>=0)return EVENT_TYPES.CONSTRUCTION_STARTED;
    if(field==='constructionStatus'&&(nv.indexOf('COMPLETE')>=0||nv.indexOf('AVAILABLE')>=0))return EVENT_TYPES.CONSTRUCTION_COMPLETED;
    if(field==='status'&&nv.indexOf('LEASED')>=0)return EVENT_TYPES.LEASE_EXECUTED;
    if(field==='status'&&nv.indexOf('SOLD')>=0)return EVENT_TYPES.SALE_COMPLETED;
    for(var i=0;i<TRACKED.length;i++)if(TRACKED[i].field===field)return EVENT_TYPES[TRACKED[i].type]||TRACKED[i].type;
    return EVENT_TYPES.FIELD_CHANGE;
  }
  function confidence_(source,field,oldValue,newValue){var score=70;if(source&&source.sourceId)score+=8;if(source&&source.importJobId)score+=8;if(field==='status'||field==='askingRate'||field==='availableSf')score+=6;if(oldValue!=null&&newValue!=null)score+=4;return Math.min(99,score);}
  function detectChanges(previous,current,source){
    previous=previous||{};current=current||{};source=source||{};
    var propertyId=String(current.propertyId||previous.propertyId||current.id||previous.id||'UNKNOWN');
    var fields={},i,k;for(k in previous)if(previous.hasOwnProperty(k))fields[k]=true;for(k in current)if(current.hasOwnProperty(k))fields[k]=true;
    var changes=[];for(k in fields){if(k==='updatedAt'||k==='createdAt'||k==='source'||k==='provenance')continue;if(equal_(previous[k],current[k]))continue;var type=eventType_(k,previous[k],current[k]);var observedAt=iso_(source.observedAt||current.updatedAt);var eventId='MEVT-'+hash_([propertyId,type,k,JSON.stringify(previous[k]),JSON.stringify(current[k]),observedAt].join('|'));changes.push({
      eventId:eventId,contractVersion:CONTRACT,eventType:type,entityType:'PROPERTY',entityId:propertyId,propertyId:propertyId,field:k,
      oldValue:clone_(previous[k]),newValue:clone_(current[k]),observedAt:observedAt,recordedAt:new Date().toISOString(),
      confidence:confidence_(source,k,previous[k],current[k]),source:{sourceId:String(source.sourceId||'DIRECT'),importJobId:String(source.importJobId||''),sourceName:String(source.sourceName||'SCIIP')},
      evidence:[{kind:'FIELD_DIFF',field:k,oldValue:clone_(previous[k]),newValue:clone_(current[k])}],status:'DETECTED'
    });}
    changes.sort(function(a,b){return a.eventId<b.eventId?-1:1;});return changes;
  }
  function timeline(events,filter){filter=filter||{};return (events||[]).filter(function(e){return (!filter.propertyId||e.propertyId===filter.propertyId)&&(!filter.eventType||e.eventType===filter.eventType)&&(!filter.since||new Date(e.observedAt)>=new Date(filter.since));}).sort(function(a,b){return new Date(b.observedAt)-new Date(a.observedAt);});}
  function summarize(events){var rows=timeline(events,{}),counts={},markets={},high=0;rows.forEach(function(e){counts[e.eventType]=(counts[e.eventType]||0)+1;if(e.marketId)markets[e.marketId]=(markets[e.marketId]||0)+1;if(Number(e.confidence||0)>=90)high++;});var ordered=Object.keys(counts).sort(function(a,b){return counts[b]-counts[a];});var text=rows.length?rows.length+' governed market events detected. '+ordered.slice(0,3).map(function(k){return counts[k]+' '+k.replace(/_/g,' ').toLowerCase();}).join(', ')+'.':'No governed market changes detected.';return {eventCount:rows.length,typeCounts:counts,marketCounts:markets,highConfidence:high,summary:text,generatedAt:new Date().toISOString()};}
  function opportunities(events,currentProperties){var byId={};(currentProperties||[]).forEach(function(p){byId[String(p.propertyId||p.id)]=p;});var out=[];(events||[]).forEach(function(e){var score=0,reasons=[];if(e.eventType===EVENT_TYPES.NEW_AVAILABILITY){score+=45;reasons.push('New availability');}if(e.eventType===EVENT_TYPES.RATE_CHANGE&&Number(e.newValue)<Number(e.oldValue)){score+=35;reasons.push('Asking rate decreased');}if(e.eventType===EVENT_TYPES.POWER_CHANGE&&Number(e.newValue)>Number(e.oldValue)){score+=30;reasons.push('Power capacity increased');}if(e.eventType===EVENT_TYPES.CONSTRUCTION_COMPLETED){score+=25;reasons.push('Construction completed');}var p=byId[e.propertyId]||{};if(Number(p.powerAmps||0)>=4000){score+=10;reasons.push('High-power industrial asset');}if(Number(p.availableSf||0)>=250000){score+=10;reasons.push('Large-block availability');}if(score)out.push({opportunityId:'OPP-'+hash_(e.eventId),propertyId:e.propertyId,eventId:e.eventId,score:Math.min(100,score),priority:score>=70?'HIGH':score>=40?'MEDIUM':'LOW',reasons:reasons,confidence:e.confidence,status:'OPEN'});});out.sort(function(a,b){return b.score-a.score;});return out;}
  function buildSnapshot(previous,current,source,portfolio){var events=detectChanges(previous,current,source),opps=opportunities(events,portfolio||[current]);return {version:VERSION,contractVersion:CONTRACT,status:'AVAILABLE',events:events,timeline:timeline(events,{propertyId:String(current.propertyId||current.id||'UNKNOWN')}),summary:summarize(events),opportunities:opps,reviewRequired:true,destructiveCommitEnabled:false};}
  return {VERSION:VERSION,CONTRACT:CONTRACT,EVENT_TYPES:EVENT_TYPES,detectChanges:detectChanges,timeline:timeline,summarize:summarize,opportunities:opportunities,buildSnapshot:buildSnapshot};
})();
function sciipMarketIntelligenceDetectChanges(previous,current,source){return SCIIP_MARKET_INTELLIGENCE.detectChanges(previous,current,source);}
function sciipMarketIntelligenceSnapshot(previous,current,source,portfolio){return SCIIP_MARKET_INTELLIGENCE.buildSnapshot(previous,current,source,portfolio);}
function sciipMarketIntelligenceRecent(events,filter){return SCIIP_MARKET_INTELLIGENCE.timeline(events,filter||{});}
