var SCIIP_STORAGE_PROVIDER_ABSTRACTION = (function () {
  'use strict';
  function memory(id, seed) {
    var rows=(seed||[]).map(function(r){return JSON.parse(JSON.stringify(r));});
    return { id:id, type:'MEMORY', execute:function(request){
      if(request.operation==='QUERY') return rows.filter(function(row){return Object.keys(request.criteria||{}).every(function(k){return row[k]===request.criteria[k];});});
      if(request.operation==='APPEND'){rows.push(JSON.parse(JSON.stringify(request.payload)));return {status:'APPENDED',count:rows.length};}
      if(request.operation==='COUNT') return {count:rows.length};
      throw new Error('UNSUPPORTED_STORAGE_OPERATION:' + request.operation);
    }};
  }
  function governed(id, provider, policy) {
    policy=policy||{};
    return { id:id, type:'GOVERNED', execute:function(request){
      if(policy.readOnly && request.operation!=='QUERY' && request.operation!=='COUNT') throw new Error('READ_ONLY_PROVIDER');
      if(policy.reviewRequired && request.operation==='APPEND' && !(request.context&&request.context.approved===true)) throw new Error('APPROVAL_REQUIRED');
      return provider.execute(request);
    }};
  }
  return { memory:memory, governed:governed };
})();
