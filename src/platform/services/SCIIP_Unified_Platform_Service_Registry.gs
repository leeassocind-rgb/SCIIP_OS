/** SCIIP_OS v7.0 — Epic 4 Sprint 1: Unified Platform Service Registry */
var SCIIP_UNIFIED_PLATFORM_SERVICE_REGISTRY=(function(){
  'use strict';
  var VERSION='v7.0-epic4-sprint1.0',services={},history=[];
  function text(v){return v===null||v===undefined?'':String(v).trim();}
  function upper(v){return text(v).toUpperCase();}
  function clone(v){return JSON.parse(JSON.stringify(v));}
  function register(def){
    def=def||{};var id=upper(def.serviceId),version=text(def.version||'1.0.0');
    if(!id) return {status:'REJECTED',reason:'SERVICE_ID_REQUIRED'};
    if(!text(def.domain)) return {status:'REJECTED',reason:'DOMAIN_REQUIRED'};
    if(!Array.isArray(def.capabilities)||!def.capabilities.length) return {status:'REJECTED',reason:'CAPABILITIES_REQUIRED'};
    var key=id+'@'+version,normalized={serviceId:id,version:version,domain:upper(def.domain),capabilities:def.capabilities.map(upper).filter(Boolean),owner:text(def.owner||'SCIIP_OS'),status:upper(def.status||'AVAILABLE'),requiresHumanApproval:def.requiresHumanApproval!==false,destructiveCommitEnabled:false,autonomousExecution:false,registeredAt:def.registeredAt||new Date().toISOString()};
    if(services[key]) return {status:'DUPLICATE_SAFE',service:clone(services[key])};
    services[key]=normalized;history.push({eventType:'PLATFORM_SERVICE_REGISTERED',serviceKey:key,occurredAt:normalized.registeredAt,appendOnly:true});
    return {status:'REGISTERED',service:clone(normalized)};
  }
  function resolve(serviceId,capability){var id=upper(serviceId),cap=upper(capability),rows=Object.keys(services).map(function(k){return services[k];}).filter(function(s){return s.serviceId===id&&s.status==='AVAILABLE'&&(!cap||s.capabilities.indexOf(cap)>=0);});rows.sort(function(a,b){return b.version.localeCompare(a.version);});return rows.length?clone(rows[0]):null;}
  function discover(capability){var cap=upper(capability);return Object.keys(services).map(function(k){return services[k];}).filter(function(s){return s.status==='AVAILABLE'&&s.capabilities.indexOf(cap)>=0;}).map(clone);}
  function list(){return Object.keys(services).sort().map(function(k){return clone(services[k]);});}
  function audit(){return history.map(clone);}
  function clearForTest(){services={};history=[];}
  return {VERSION:VERSION,register:register,resolve:resolve,discover:discover,list:list,audit:audit,clearForTest:clearForTest};
}());
