/** Append-only, duplicate-safe Sprint 8 persistence adapter. */
var SCIIP_AUTONOMOUS_OPPORTUNITY_PERSISTENCE=(function(){
  'use strict';
  function append(existing,discovery){var rows=(existing||[]).slice(),keys={};rows.forEach(function(r){keys[r.businessKey+'|'+r.observedAt]=1;});var added=0;(discovery.opportunities||[]).forEach(function(o){var k=o.businessKey+'|'+o.observedAt;if(keys[k])return;keys[k]=1;rows.push(JSON.parse(JSON.stringify(o)));added+=1;});return {rows:rows,recordsCreated:added,skippedDuplicate:(discovery.opportunities||[]).length-added,appendOnly:true,permanentHistory:true};}
  return {append:append};
}());
