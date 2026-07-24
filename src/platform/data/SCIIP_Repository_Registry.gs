var SCIIP_REPOSITORY_REGISTRY = (function () {
  'use strict';
  function create() {
    var repositories = {};
    return {
      register: function (repository) {
        if (!repository || !repository.id || typeof repository.find !== 'function' || typeof repository.save !== 'function') throw new Error('INVALID_REPOSITORY');
        if (repositories[repository.id]) return { status:'DUPLICATE_SAFE', repositoryId:repository.id };
        repositories[repository.id] = repository;
        return { status:'REGISTERED', repositoryId:repository.id };
      },
      get: function (id) { if (!repositories[id]) throw new Error('UNKNOWN_REPOSITORY:' + id); return repositories[id]; },
      list: function () { return Object.keys(repositories).sort(); },
      count: function () { return Object.keys(repositories).length; }
    };
  }
  function inMemory(id, seed) {
    var records = {};
    (seed || []).forEach(function (record) { records[String(record.id)] = JSON.parse(JSON.stringify(record)); });
    return {
      id:id,
      find:function (criteria) {
        criteria = criteria || {};
        return Object.keys(records).map(function(k){return JSON.parse(JSON.stringify(records[k]));}).filter(function(r){
          return Object.keys(criteria).every(function(key){ return r[key] === criteria[key]; });
        });
      },
      get:function (key) { return records[String(key)] ? JSON.parse(JSON.stringify(records[String(key)])) : null; },
      save:function (record) {
        if (!record || record.id == null) throw new Error('REPOSITORY_ID_REQUIRED');
        var key=String(record.id), exists=!!records[key]; records[key]=JSON.parse(JSON.stringify(record));
        return { status:exists?'UPDATED':'CREATED', id:key };
      },
      count:function(){return Object.keys(records).length;}
    };
  }
  return { create:create, inMemory:inMemory };
})();
