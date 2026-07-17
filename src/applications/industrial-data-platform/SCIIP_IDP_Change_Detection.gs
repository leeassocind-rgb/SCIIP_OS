/** Pure field-level change detection. */
var SCIIP_IDP_CHANGE_V7 = SCIIP_IDP_CHANGE_V7 || {};
SCIIP_IDP_CHANGE_V7.EMPTY_EQUIVALENTS = {'':true,'null':true,'undefined':true};
SCIIP_IDP_CHANGE_V7.normalize = function(v){
  if(v == null || v === '') return null;
  if(typeof v === 'number') return isFinite(v) ? v : null;
  if(typeof v === 'boolean') return v;
  return String(v).trim().replace(/\s+/g,' ');
};
SCIIP_IDP_CHANGE_V7.same = function(a,b){
  a=SCIIP_IDP_CHANGE_V7.normalize(a); b=SCIIP_IDP_CHANGE_V7.normalize(b);
  if(a===b) return true;
  if(typeof a==='number' || typeof b==='number') return Number(a)===Number(b);
  return String(a).toLowerCase()===String(b).toLowerCase();
};
SCIIP_IDP_CHANGE_V7.detect = function(incoming,current,fields){
  incoming=incoming||{}; current=current||{}; fields=fields||Object.keys(incoming);
  var changes=[];
  fields.forEach(function(field){
    if(!Object.prototype.hasOwnProperty.call(incoming,field)) return;
    var before=current[field], after=incoming[field];
    if(!SCIIP_IDP_CHANGE_V7.same(before,after)) changes.push({field:field,before:before == null ? null : before,after:after == null ? null : after,changeType:(before==null||before==='')?'ADD':((after==null||after==='')?'REMOVE':'UPDATE')});
  });
  return changes;
};
