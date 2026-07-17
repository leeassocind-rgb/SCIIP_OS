/** SCIIP_OS v7.0 Integration Sprint 1D — context integrity and conflict governance. */
var SCIIP_CONTEXT_INTEGRITY = (function () {
  'use strict';

  var VERSION = 'v7.0-integration-sprint-1d.1';
  var MAX_AUDIT = 100;
  var audit = [];
  var resolvers = {};

  function clone_(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now_() { return new Date().toISOString(); }
  function text_(value) { return String(value == null ? '' : value); }
  function entityId_(entity) { return entity && text_(entity.id || entity.entityId || entity.propertyId || entity.companyId || entity.marketId || entity.nodeId || entity.featureId); }
  function addAudit_(action, detail) {
    audit.push({action:action, detail:clone_(detail || {}), timestamp:now_()});
    if (audit.length > MAX_AUDIT) audit.shift();
  }
  function canonical_(value) {
    if (Array.isArray(value)) return value.map(canonical_);
    if (!value || typeof value !== 'object') return value;
    var out={}; Object.keys(value).sort().forEach(function(k){if(k!=='updatedAt'&&k!=='revision'&&k!=='capturedAt'&&k!=='meta')out[k]=canonical_(value[k]);}); return out;
  }
  function fingerprint(value) {
    var str=JSON.stringify(canonical_(value || {})), hash=2166136261;
    for(var i=0;i<str.length;i+=1){hash^=str.charCodeAt(i);hash+=(hash<<1)+(hash<<4)+(hash<<7)+(hash<<8)+(hash<<24);}
    return ('00000000'+(hash>>>0).toString(16)).slice(-8);
  }
  function registerResolver(entityType, resolver) {
    if(typeof resolver!=='function')throw new Error('SCIIP context resolver must be a function.');
    resolvers[String(entityType).toUpperCase()]=resolver; return true;
  }
  function defaultExists_(entityType, id) {
    try {
      if(entityType==='PROPERTY' && typeof SCIIP_PROPERTY_EXPLORER!=='undefined'){
        var p=SCIIP_PROPERTY_EXPLORER.snapshot(), list=p.properties||p.results||p.items||[];
        return list.some(function(x){return entityId_(x)===id;});
      }
      if(entityType==='GRAPH_NODE' && typeof SCIIP_KNOWLEDGE_GRAPH_VIEWER!=='undefined'){
        var g=SCIIP_KNOWLEDGE_GRAPH_VIEWER.snapshot({}); return (g.nodes||[]).some(function(x){return entityId_(x)===id;});
      }
      if(entityType==='MAP_FEATURE' && typeof SCIIP_GIS_WORKSPACE!=='undefined') return !!SCIIP_GIS_WORKSPACE.feature(id);
      return true;
    } catch(error) { return true; }
  }
  function exists_(type, entity) {
    if(!entity)return true; var id=entityId_(entity); if(!id)return false;
    var key=String(type).toUpperCase();
    try{return resolvers[key]?resolvers[key](id,clone_(entity))!==false:defaultExists_(key,id);}catch(error){return true;}
  }
  function validate(state) {
    state=state||SCIIP_APP_STATE.snapshot();
    var refs=[
      {key:'selectedProperty',type:'PROPERTY',value:state.selectedProperty},
      {key:'selectedCompany',type:'COMPANY',value:state.selectedCompany},
      {key:'selectedMarket',type:'MARKET',value:state.selectedMarket},
      {key:'selectedGraphNode',type:'GRAPH_NODE',value:state.selectedGraphNode},
      {key:'selectedMapFeature',type:'MAP_FEATURE',value:state.selectedMapFeature}
    ], issues=[];
    refs.forEach(function(ref){
      if(ref.value&&!entityId_(ref.value))issues.push({code:'MISSING_ENTITY_ID',key:ref.key,severity:'ERROR'});
      else if(ref.value&&!exists_(ref.type,ref.value))issues.push({code:'STALE_ENTITY_REFERENCE',key:ref.key,entityId:entityId_(ref.value),severity:'WARNING'});
    });
    if(state.selectedProperty&&state.selectedGraphNode&&entityId_(state.selectedProperty)!==entityId_(state.selectedGraphNode))issues.push({code:'PROPERTY_GRAPH_CONTEXT_MISMATCH',severity:'WARNING'});
    if(state.selectedProperty&&state.selectedMapFeature&&entityId_(state.selectedProperty)!==entityId_(state.selectedMapFeature))issues.push({code:'PROPERTY_MAP_CONTEXT_MISMATCH',severity:'WARNING'});
    var result={version:VERSION,status:issues.length?'ATTENTION_REQUIRED':'VALID',valid:issues.length===0,issues:issues,fingerprint:fingerprint(state),checkedAt:now_()};
    addAudit_('VALIDATE',{status:result.status,issueCount:issues.length,fingerprint:result.fingerprint}); return result;
  }
  function reconcile(options) {
    options=options||{}; var strategy=String(options.strategy||'CLEAR_STALE').toUpperCase(), state=SCIIP_APP_STATE.snapshot(), validation=validate(state), patch={};
    validation.issues.forEach(function(issue){if((issue.code==='STALE_ENTITY_REFERENCE'||issue.code==='MISSING_ENTITY_ID')&&strategy==='CLEAR_STALE')patch[issue.key]=null;});
    if(Object.keys(patch).length)SCIIP_APP_STATE.patch(patch,{source:'CONTEXT_INTEGRITY',strategy:strategy});
    if(validation.issues.length&&typeof SCIIP_APP_EVENTS!=='undefined')SCIIP_APP_EVENTS.publish('NOTIFICATION_CREATED',{id:'context-integrity-'+Date.now(),severity:strategy==='CLEAR_STALE'?'info':'warning',title:'Context integrity reviewed',detail:validation.issues.length+' issue(s) detected; strategy '+strategy+'.',read:false},{source:'CONTEXT_INTEGRITY'});
    var output={status:'RECONCILED',strategy:strategy,clearedKeys:Object.keys(patch),before:validation,after:validate(SCIIP_APP_STATE.snapshot())}; addAudit_('RECONCILE',output); return output;
  }
  function emptyValue_(value) {
    if(value==null||value==='')return true;
    if(Array.isArray(value))return value.length===0;
    if(typeof value==='object')return Object.keys(value).length===0;
    return false;
  }
  function equalCanonical_(left,right) {
    return JSON.stringify(canonical_(left))===JSON.stringify(canonical_(right));
  }
  function detectConflict(baseSnapshot,incomingPatch,currentSnapshot) {
    baseSnapshot=baseSnapshot||{}; incomingPatch=incomingPatch||{}; currentSnapshot=currentSnapshot||SCIIP_APP_STATE.snapshot(); var conflicts=[];
    Object.keys(incomingPatch).forEach(function(key){
      var hasBase=Object.prototype.hasOwnProperty.call(baseSnapshot,key);
      var baseValue=baseSnapshot[key], currentValue=currentSnapshot[key], incomingValue=incomingPatch[key];
      var currentChanged=hasBase?!equalCanonical_(baseValue,currentValue):!emptyValue_(currentValue);
      var differsFromIncoming=!equalCanonical_(currentValue,incomingValue);
      if(currentChanged&&differsFromIncoming)conflicts.push({key:key,base:clone_(baseValue),current:clone_(currentValue),incoming:clone_(incomingValue)});
    });
    var result={status:conflicts.length?'CONFLICT':'NO_CONFLICT',hasConflict:conflicts.length>0,conflicts:conflicts,baseFingerprint:fingerprint(baseSnapshot),currentFingerprint:fingerprint(currentSnapshot),incomingFingerprint:fingerprint(incomingPatch)}; addAudit_('DETECT_CONFLICT',{status:result.status,count:conflicts.length}); return result;
  }
  function resolveConflict(baseSnapshot,incomingPatch,strategy) {
    strategy=String(strategy||'MERGE_NON_CONFLICTING').toUpperCase(); var current=SCIIP_APP_STATE.snapshot(), detected=detectConflict(baseSnapshot,incomingPatch,current), conflictKeys={}; detected.conflicts.forEach(function(x){conflictKeys[x.key]=true;}); var applied={};
    Object.keys(incomingPatch||{}).forEach(function(key){if(strategy==='INCOMING_WINS'||!conflictKeys[key])applied[key]=clone_(incomingPatch[key]);});
    if(strategy==='CURRENT_WINS')detected.conflicts.forEach(function(x){delete applied[x.key];});
    if(Object.keys(applied).length)SCIIP_APP_STATE.patch(applied,{source:'CONTEXT_CONFLICT_RESOLUTION',strategy:strategy});
    var output={status:'RESOLVED',strategy:strategy,conflictCount:detected.conflicts.length,appliedKeys:Object.keys(applied),state:SCIIP_APP_STATE.snapshot()}; addAudit_('RESOLVE_CONFLICT',output); return output;
  }
  function notificationList_(){return SCIIP_APP_STATE.get('notifications')||[];}
  function acknowledgeNotification(id){var changed=false,notes=notificationList_().map(function(n){var copy=clone_(n);if(text_(copy.id)===text_(id)){copy.read=true;copy.acknowledgedAt=now_();changed=true;}return copy;});if(changed)SCIIP_APP_STATE.set('notifications',notes,{source:'NOTIFICATION_ACK'});return {status:changed?'ACKNOWLEDGED':'NOT_FOUND',id:id,unread:notes.filter(function(n){return !n.read;}).length};}
  function dismissNotification(id){var before=notificationList_(),after=before.filter(function(n){return text_(n.id)!==text_(id);});if(after.length!==before.length)SCIIP_APP_STATE.set('notifications',after,{source:'NOTIFICATION_DISMISS'});return {status:after.length!==before.length?'DISMISSED':'NOT_FOUND',id:id,remaining:after.length};}
  function acknowledgeAll(){var notes=notificationList_().map(function(n){var c=clone_(n);c.read=true;c.acknowledgedAt=c.acknowledgedAt||now_();return c;});SCIIP_APP_STATE.set('notifications',notes,{source:'NOTIFICATION_ACK_ALL'});return {status:'ACKNOWLEDGED',count:notes.length};}
  function snapshot(){var state=SCIIP_APP_STATE.snapshot(),validation=validate(state),notes=notificationList_();return {version:VERSION,status:'AVAILABLE',validation:validation,notificationSummary:{total:notes.length,unread:notes.filter(function(n){return !n.read;}).length},audit:clone_(audit),stateFingerprint:fingerprint(state)};}
  function resetForTest(){audit=[];resolvers={};return true;}
  return {VERSION:VERSION,fingerprint:fingerprint,registerResolver:registerResolver,validate:validate,reconcile:reconcile,detectConflict:detectConflict,resolveConflict:resolveConflict,acknowledgeNotification:acknowledgeNotification,dismissNotification:dismissNotification,acknowledgeAll:acknowledgeAll,snapshot:snapshot,resetForTest:resetForTest};
})();

function sciipContextIntegritySnapshotV7(){return SCIIP_CONTEXT_INTEGRITY.snapshot();}
function sciipContextIntegrityReconcileV7(strategy){return SCIIP_CONTEXT_INTEGRITY.reconcile({strategy:strategy||'CLEAR_STALE'});}
function sciipContextConflictResolveV7(baseSnapshot,incomingPatch,strategy){return SCIIP_CONTEXT_INTEGRITY.resolveConflict(baseSnapshot||{},incomingPatch||{},strategy||'MERGE_NON_CONFLICTING');}
function sciipNotificationAcknowledgeV7(id){return SCIIP_CONTEXT_INTEGRITY.acknowledgeNotification(id);}
function sciipNotificationDismissV7(id){return SCIIP_CONTEXT_INTEGRITY.dismissNotification(id);}
