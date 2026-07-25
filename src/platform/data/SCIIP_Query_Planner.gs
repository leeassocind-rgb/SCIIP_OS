var SCIIP_QUERY_PLANNER = (function () {
  'use strict';
  function create() {
    return {
      plan:function(query){
        query=query||{};
        var sources=(query.sources||[]).slice().sort();
        var steps=sources.map(function(source,index){return { order:index+1, source:source, operation:query.operation||'SCAN', pushdown:!!query.criteria };});
        if (query.join) steps.push({ order:steps.length+1, operation:'JOIN', join:query.join });
        if (query.sort) steps.push({ order:steps.length+1, operation:'SORT', sort:query.sort });
        if (query.limit != null) steps.push({ order:steps.length+1, operation:'LIMIT', limit:query.limit });
        return { planId:'PLAN-' + sources.join('-'), sources:sources, steps:steps, deterministic:true, estimatedCost:steps.length*10 };
      }
    };
  }
  return { create:create };
})();
