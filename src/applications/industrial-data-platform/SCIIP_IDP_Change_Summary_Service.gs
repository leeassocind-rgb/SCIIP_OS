/** Human-readable, evidence-backed "What changed?" summary. */
var SCIIP_IDP_CHANGE_SUMMARY_V7 = SCIIP_IDP_CHANGE_SUMMARY_V7 || {};
SCIIP_IDP_CHANGE_SUMMARY_V7.build = function(events,limit){
  limit=limit||20;return (events||[]).slice().sort(function(a,b){return String(b.occurredAt).localeCompare(String(a.occurredAt));}).slice(0,limit).map(function(e){var after=SCIIP_IDP_RELEASE4_V7.safeJson(e.afterJson,{}),changes=SCIIP_IDP_RELEASE4_V7.safeJson(e.changesJson,[]);return {eventId:e.eventId,eventType:e.eventType,occurredAt:e.occurredAt,actor:e.actor,propertyId:e.aggregateId,address:after.address||'',city:after.city||'',changeCount:changes.length,changedFields:changes.map(function(c){return c.field;}),summary:(after.address||e.aggregateId)+' '+(e.eventType==='PROPERTY_CREATED'?'was added':'was updated')+(changes.length?' ('+changes.length+' fields)':'')};});
};
