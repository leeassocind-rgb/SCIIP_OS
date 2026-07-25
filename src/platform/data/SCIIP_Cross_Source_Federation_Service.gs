var SCIIP_CROSS_SOURCE_FEDERATION_SERVICE = (function () {
  'use strict';
  function create(dataAccess, planner) {
    return { execute:function(request){
      var plan=planner.plan(request);
      var results=[];
      plan.sources.forEach(function(source){
        var response=dataAccess.execute({providerId:source,operation:request.operation||'QUERY',resource:request.resource,criteria:request.criteria||{},context:request.context||{}});
        (response.result||[]).forEach(function(record){var copy=JSON.parse(JSON.stringify(record));copy._source=source;results.push(copy);});
      });
      if(request.dedupeKey){var seen={};results=results.filter(function(r){var key=String(r[request.dedupeKey]);if(seen[key])return false;seen[key]=true;return true;});}
      if(request.limit!=null)results=results.slice(0,request.limit);
      return { plan:plan, records:results, sourcesQueried:plan.sources.length, federated:true };
    }};
  }
  return { create:create };
})();
