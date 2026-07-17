/** SCIIP_OS v7.0 Integration Sprint 2B — activity instrumentation wiring. */
var SCIIP_SPRINT2B_WIRING=(function(){
 'use strict';var VERSION='v7.0-integration-sprint-2b',wired=false;
 function wire(){if(wired)return true;wired=true;
  if(typeof SCIIP_APP_EVENTS!=='undefined'&&SCIIP_APP_EVENTS.subscribe)SCIIP_APP_EVENTS.subscribe('*',function(event){SCIIP_ACTIVITY_TIMELINE.append(event.type,event.payload||{},{source:'APP_EVENT_BUS',workspace:event.payload&&event.payload.workspaceId||null,entityId:event.payload&&event.payload.id||null});});
  if(typeof SCIIP_APP_STATE!=='undefined'&&SCIIP_APP_STATE.subscribe)SCIIP_APP_STATE.subscribe(function(change){SCIIP_ACTIVITY_TIMELINE.append('STATE_CHANGED',{changedKeys:change.changedKeys||[],revision:change.state&&change.state.revision},{source:'APP_STATE'});});
  return true;
 }
 wire();return {VERSION:VERSION,wire:wire};
})();
