/** SCIIP_OS v7.0 Integration Sprint 1C — context continuity, history, and deep links. */
var SCIIP_CONTEXT_CONTINUITY = (function () {
  'use strict';

  var VERSION = 'v7.0-integration-sprint-1c.1';
  var MAX_HISTORY = 50;
  var history = [];
  var cursor = -1;
  var wired = false;
  var restoring = false;

  function clone_(value) { return value == null ? value : JSON.parse(JSON.stringify(value)); }
  function now_() { return new Date().toISOString(); }
  function text_(value) { return String(value == null ? '' : value); }

  function selectedEntity_(state) {
    return state.selectedProperty || state.selectedCompany || state.selectedMarket ||
      state.selectedGraphNode || state.selectedMapFeature || null;
  }

  function envelopeFromState_(state) {
    state = state || {};
    var selected = selectedEntity_(state);
    return {
      version: VERSION,
      workspace: state.currentWorkspace || 'executive-dashboard',
      selectedEntity: clone_(selected),
      selections: {
        property: clone_(state.selectedProperty),
        company: clone_(state.selectedCompany),
        market: clone_(state.selectedMarket),
        graphNode: clone_(state.selectedGraphNode),
        mapFeature: clone_(state.selectedMapFeature)
      },
      searchText: text_(state.globalSearchText),
      filters: clone_(state.activeFilters || {}),
      mapExtent: clone_(state.mapExtent),
      capturedAt: now_()
    };
  }

  function comparable_(envelope) {
    var copy = clone_(envelope || {});
    delete copy.capturedAt;
    delete copy.meta;
    return JSON.stringify(copy);
  }

  function record(snapshot, meta) {
    if (restoring) return current();
    var envelope = snapshot && snapshot.workspace ? clone_(snapshot) : envelopeFromState_(snapshot || SCIIP_APP_STATE.snapshot());
    if (cursor >= 0 && comparable_(history[cursor]) === comparable_(envelope)) return current();
    if (cursor < history.length - 1) history = history.slice(0, cursor + 1);
    envelope.meta = clone_(meta || {});
    history.push(envelope);
    if (history.length > MAX_HISTORY) history.shift();
    cursor = history.length - 1;
    return current();
  }

  function patchFor_(envelope) {
    envelope = envelope || {};
    var selections = envelope.selections || {};
    return {
      currentWorkspace: envelope.workspace || 'executive-dashboard',
      selectedProperty: clone_(selections.property || null),
      selectedCompany: clone_(selections.company || null),
      selectedMarket: clone_(selections.market || null),
      selectedGraphNode: clone_(selections.graphNode || null),
      selectedMapFeature: clone_(selections.mapFeature || null),
      globalSearchText: text_(envelope.searchText),
      activeFilters: clone_(envelope.filters || {}),
      mapExtent: clone_(envelope.mapExtent || null)
    };
  }

  function restore(envelope, meta) {
    if (!envelope || typeof envelope !== 'object') throw new Error('SCIIP context restoration requires an envelope.');
    restoring = true;
    try {
      SCIIP_APP_STATE.patch(patchFor_(envelope), {source:'CONTEXT_CONTINUITY', reason:(meta && meta.reason) || 'RESTORE'});
      if (typeof SCIIP_WORKSPACE_SYNCHRONIZATION !== 'undefined') {
        SCIIP_WORKSPACE_SYNCHRONIZATION.applyState(SCIIP_APP_STATE.snapshot(), {eventType:'CONTEXT_RESTORED'});
      }
    } finally {
      restoring = false;
    }
    return {status:'RESTORED', envelope:clone_(envelope), state:SCIIP_APP_STATE.snapshot()};
  }

  function back() {
    if (cursor <= 0) return {status:'AT_START', cursor:cursor, context:current()};
    cursor -= 1;
    var result = restore(history[cursor], {reason:'BACK'});
    result.status = 'RESTORED_BACK';
    result.cursor = cursor;
    return result;
  }

  function forward() {
    if (cursor >= history.length - 1) return {status:'AT_END', cursor:cursor, context:current()};
    cursor += 1;
    var result = restore(history[cursor], {reason:'FORWARD'});
    result.status = 'RESTORED_FORWARD';
    result.cursor = cursor;
    return result;
  }

  function current() { return cursor >= 0 ? clone_(history[cursor]) : null; }

  function encode(envelope) {
    var json = JSON.stringify(envelope || envelopeFromState_(SCIIP_APP_STATE.snapshot()));
    if (typeof Utilities !== 'undefined' && Utilities.base64EncodeWebSafe) {
      return Utilities.base64EncodeWebSafe(json, Utilities.Charset.UTF_8).replace(/=+$/,'');
    }
    return json;
  }

  function decode(token) {
    token = text_(token);
    if (!token) throw new Error('SCIIP context token is required.');
    if (token.charAt(0) === '{') return JSON.parse(token);
    if (typeof Utilities !== 'undefined' && Utilities.base64DecodeWebSafe) {
      var bytes = Utilities.base64DecodeWebSafe(token);
      return JSON.parse(Utilities.newBlob(bytes).getDataAsString('UTF-8'));
    }
    throw new Error('SCIIP context token decoding is unavailable in this runtime.');
  }

  function deepLink(envelope) {
    var e = envelope || envelopeFromState_(SCIIP_APP_STATE.snapshot());
    var selected = e.selectedEntity || null;
    var parts = ['workspace=' + encodeURIComponent(e.workspace || 'executive-dashboard')];
    if (selected && selected.entityType) parts.push('entityType=' + encodeURIComponent(selected.entityType));
    if (selected && selected.id) parts.push('entityId=' + encodeURIComponent(selected.id));
    parts.push('context=' + encodeURIComponent(encode(e)));
    return '#' + parts.join('&');
  }

  function parseDeepLink(hash) {
    var value = text_(hash).replace(/^#/, '');
    var params = {};
    value.split('&').forEach(function (part) {
      if (!part) return;
      var pair = part.split('=');
      params[decodeURIComponent(pair[0])] = decodeURIComponent(pair.slice(1).join('=') || '');
    });
    if (params.context) return decode(params.context);
    return {version:VERSION, workspace:params.workspace || 'executive-dashboard', selectedEntity:params.entityId ? {id:params.entityId, entityType:params.entityType || 'ENTITY', label:params.entityId} : null, selections:{}, searchText:'', filters:{}, mapExtent:null, capturedAt:now_()};
  }

  function snapshot() {
    return {version:VERSION,status:'AVAILABLE',cursor:cursor,count:history.length,canGoBack:cursor>0,canGoForward:cursor>=0&&cursor<history.length-1,current:current(),history:clone_(history)};
  }

  function reset() { history=[]; cursor=-1; return snapshot(); }

  function wire() {
    if (wired) return true;
    wired = true;
    record(SCIIP_APP_STATE.snapshot(), {reason:'INITIAL'});
    SCIIP_APP_STATE.subscribe(function (change) {
      if (restoring) return;
      var meaningful = change.changedKeys.some(function (key) {
        return ['selectedProperty','selectedCompany','selectedMarket','selectedGraphNode','selectedMapFeature','currentWorkspace','globalSearchText','activeFilters','mapExtent'].indexOf(key) !== -1;
      });
      if (meaningful) record(change.state, change.meta || {});
    });
    return true;
  }

  return {VERSION:VERSION,wire:wire,record:record,restore:restore,back:back,forward:forward,current:current,encode:encode,decode:decode,deepLink:deepLink,parseDeepLink:parseDeepLink,snapshot:snapshot,reset:reset,envelopeFromState:envelopeFromState_};
})();

SCIIP_CONTEXT_CONTINUITY.wire();

function sciipContextContinuitySnapshotV7(){return SCIIP_CONTEXT_CONTINUITY.snapshot();}
function sciipContextBackV7(){return SCIIP_CONTEXT_CONTINUITY.back();}
function sciipContextForwardV7(){return SCIIP_CONTEXT_CONTINUITY.forward();}
function sciipContextDeepLinkV7(){return SCIIP_CONTEXT_CONTINUITY.deepLink();}
function sciipContextRestoreTokenV7(token){return SCIIP_CONTEXT_CONTINUITY.restore(SCIIP_CONTEXT_CONTINUITY.decode(token),{reason:'PUBLIC_TOKEN_RESTORE'});}
