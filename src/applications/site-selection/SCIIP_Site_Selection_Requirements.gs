/** SCIIP_OS v7.0 Sprint 11 — site selection requirements. */
var SCIIP_SITE_SELECTION_REQUIREMENTS=(function(){'use strict';
var VERSION='v7.0-integration-sprint-11.0',store={};
function num(v,d){v=Number(v);return isFinite(v)?v:d;}
function clone(v){return JSON.parse(JSON.stringify(v));}
function normalize(input){input=input||{};var id=String(input.id||('requirement-'+(Object.keys(store).length+1))),w=input.weights||{};var weights={power:num(w.power,20),labor:num(w.labor,15),logistics:num(w.logistics,20),cost:num(w.cost,15),building:num(w.building,20),risk:num(w.risk,10)},sum=0,k;for(k in weights)sum+=Math.max(0,weights[k]);if(sum<=0)throw new Error('At least one positive weight is required.');for(k in weights)weights[k]=Math.round((Math.max(0,weights[k])/sum)*10000)/100;return {id:id,name:String(input.name||id),requiredSf:num(input.requiredSf,0),minimumPowerAmps:num(input.minimumPowerAmps,0),minimumClearHeight:num(input.minimumClearHeight,0),minimumDockDoors:num(input.minimumDockDoors,0),maximumOccupancyCost:num(input.maximumOccupancyCost,Infinity),targetMarkets:(input.targetMarkets||[]).slice(),weights:weights,createdAt:input.createdAt||new Date().toISOString()};}
function save(input){var r=normalize(input),existing=store[r.id];if(existing)return {status:'DUPLICATE_SAFE',requirement:clone(existing)};store[r.id]=r;return {status:'CREATED',requirement:clone(r)};}
function get(id){return store[id]?clone(store[id]):null;}function reset(){store={};}
return {VERSION:VERSION,normalize:normalize,save:save,get:get,reset:reset};})();
