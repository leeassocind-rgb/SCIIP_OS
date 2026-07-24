var SCIIP_CACHE_MANAGER = (function () {
  'use strict';
  function create(clock) {
    var entries={}, hits=0, misses=0; clock=clock||function(){return Date.now();};
    return {
      put:function(key,value,ttlMs){entries[key]={value:JSON.parse(JSON.stringify(value)),expiresAt:clock()+(ttlMs||60000)};return {status:'CACHED',key:key};},
      get:function(key){var e=entries[key];if(!e||e.expiresAt<=clock()){if(e)delete entries[key];misses++;return {hit:false,value:null};}hits++;return {hit:true,value:JSON.parse(JSON.stringify(e.value))};},
      invalidate:function(prefix){var count=0;Object.keys(entries).forEach(function(k){if(!prefix||k.indexOf(prefix)===0){delete entries[k];count++;}});return {invalidated:count};},
      metrics:function(){return {entries:Object.keys(entries).length,hits:hits,misses:misses};}
    };
  }
  return { create:create };
})();
