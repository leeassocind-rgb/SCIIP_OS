var SCIIP_DIGITAL_TWIN_STATE_REGISTRY=(function(){
  var states={},events=[];
  function upsert(entity){if(!entity||!entity.id)throw new Error('ENTITY_ID_REQUIRED');var prior=states[entity.id]||null;var version=(prior?prior.version:0)+1;var next={id:entity.id,type:entity.type||'UNKNOWN',version:version,attributes:Object.assign({},entity.attributes||{}),geometry:entity.geometry||null,effectiveAt:entity.effectiveAt||new Date().toISOString(),updatedAt:new Date().toISOString()};states[entity.id]=next;events.push({kind:'STATE_UPSERTED',entityId:entity.id,version:version});return next;}
  function get(id){return states[id]||null;} function list(){return Object.keys(states).map(function(k){return states[k];});}
  function reset(){states={};events=[];} return {upsert:upsert,get:get,list:list,events:function(){return events.slice();},reset:reset};
})();
