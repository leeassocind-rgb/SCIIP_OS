/** SCIIP_OS v7.0 Integration Sprint 1B — workspace focus projections. */
var SCIIP_WORKSPACE_SYNCHRONIZATION = (function () {
  'use strict';

  var VERSION = 'v7.0-integration-sprint-1b';
  var projections = defaultProjections_();

  function clone_(value) {
    return value == null ? value : JSON.parse(JSON.stringify(value));
  }

  function now_() {
    return new Date().toISOString();
  }

  function defaultProjection_(workspaceId) {
    return {
      workspaceId: workspaceId,
      status: 'READY',
      focusedEntity: null,
      focusMode: 'NONE',
      filters: {},
      mapExtent: null,
      grounding: null,
      kpis: [],
      updatedAt: null
    };
  }

  function defaultProjections_() {
    return {
      'executive-dashboard': defaultProjection_('executive-dashboard'),
      'property-explorer': defaultProjection_('property-explorer'),
      'knowledge-graph': defaultProjection_('knowledge-graph'),
      'gis-workspace': defaultProjection_('gis-workspace'),
      'ai-workspace': defaultProjection_('ai-workspace'),
      'enterprise-administration': defaultProjection_('enterprise-administration'),
      'mobile-ui': defaultProjection_('mobile-ui')
    };
  }

  function entityFromState_(state) {
    return state.selectedProperty || state.selectedCompany || state.selectedMarket ||
      state.selectedGraphNode || state.selectedMapFeature || null;
  }

  function propertyData_(entity) {
    if (!entity) return null;
    return clone_(entity.data || entity);
  }

  function extentFor_(entity) {
    var data = propertyData_(entity) || {};
    var lat = Number(data.latitude || data.lat || 0);
    var lng = Number(data.longitude || data.lng || data.long || 0);
    if (!isFinite(lat) || !isFinite(lng) || !lat || !lng) return null;
    return {
      minLatitude: lat - 0.012,
      maxLatitude: lat + 0.012,
      minLongitude: lng - 0.016,
      maxLongitude: lng + 0.016,
      centerLatitude: lat,
      centerLongitude: lng,
      zoomHint: 14
    };
  }

  function executiveKpis_(entity) {
    if (!entity) return [];
    var data = propertyData_(entity) || {};
    var kpis = [
      {id:'selected-context', label:'Selected Context', value:entity.label || entity.id, detail:entity.entityType || 'ENTITY'}
    ];
    if (data.buildingSf || data.sf) kpis.push({id:'selected-sf', label:'Building SF', value:String(data.buildingSf || data.sf), detail:'Selected property'});
    if (data.landAcres || data.acres) kpis.push({id:'selected-acres', label:'Land Acres', value:String(data.landAcres || data.acres), detail:'Selected property'});
    if (data.city) kpis.push({id:'selected-city', label:'City', value:String(data.city), detail:'Selected context'});
    return kpis;
  }

  function applyState(state, meta) {
    state = state || {};
    meta = meta || {};
    var entity = entityFromState_(state);
    var property = state.selectedProperty;
    var graphNode = state.selectedGraphNode || property;
    var mapFeature = state.selectedMapFeature || property;
    var updatedAt = now_();

    projections['property-explorer'] = {
      workspaceId:'property-explorer', status:'READY', focusedEntity:clone_(property || entity),
      focusMode:property ? 'SELECTED_PROPERTY' : (entity ? 'RELATED_ENTITY' : 'NONE'),
      filters:clone_(state.activeFilters || {}), mapExtent:null, grounding:null, kpis:[], updatedAt:updatedAt
    };

    projections['knowledge-graph'] = {
      workspaceId:'knowledge-graph', status:'READY', focusedEntity:clone_(graphNode),
      focusMode:graphNode ? 'FOCUSED_NODE_AND_NEIGHBORS' : 'NONE',
      filters:clone_(state.activeFilters || {}), mapExtent:null, grounding:null, kpis:[], updatedAt:updatedAt
    };

    projections['gis-workspace'] = {
      workspaceId:'gis-workspace', status:'READY', focusedEntity:clone_(mapFeature),
      focusMode:mapFeature ? 'FOCUSED_FEATURE' : 'NONE',
      filters:clone_(state.activeFilters || {}), mapExtent:clone_(state.mapExtent || extentFor_(mapFeature)), grounding:null, kpis:[], updatedAt:updatedAt
    };

    projections['ai-workspace'] = {
      workspaceId:'ai-workspace', status:'READY', focusedEntity:clone_(entity),
      focusMode:entity ? 'GROUNDED_CONTEXT' : 'PLATFORM_CONTEXT',
      filters:clone_(state.activeFilters || {}), mapExtent:null,
      grounding:{
        selectedEntity:clone_(entity), selectedProperty:clone_(state.selectedProperty),
        selectedCompany:clone_(state.selectedCompany), selectedMarket:clone_(state.selectedMarket),
        graphNode:clone_(state.selectedGraphNode), mapFeature:clone_(state.selectedMapFeature),
        searchText:String(state.globalSearchText || ''), sourceEvent:meta.eventType || null
      },
      kpis:[], updatedAt:updatedAt
    };

    projections['executive-dashboard'] = {
      workspaceId:'executive-dashboard', status:'READY', focusedEntity:clone_(entity),
      focusMode:entity ? 'SELECTED_CONTEXT_KPIS' : 'PLATFORM_KPIS',
      filters:clone_(state.activeFilters || {}), mapExtent:null, grounding:null,
      kpis:executiveKpis_(entity), updatedAt:updatedAt
    };

    projections['mobile-ui'] = {
      workspaceId:'mobile-ui', status:'READY', focusedEntity:clone_(entity),
      focusMode:entity ? 'SHARED_CONTEXT' : 'NONE', filters:clone_(state.activeFilters || {}),
      mapExtent:clone_(state.mapExtent || extentFor_(mapFeature)), grounding:null, kpis:[], updatedAt:updatedAt
    };

    projections['enterprise-administration'] = {
      workspaceId:'enterprise-administration', status:'READY', focusedEntity:clone_(entity),
      focusMode:entity ? 'READ_ONLY_CONTEXT' : 'NONE', filters:{}, mapExtent:null, grounding:null, kpis:[], updatedAt:updatedAt
    };

    return snapshot();
  }

  function get(workspaceId) {
    return clone_(projections[workspaceId] || defaultProjection_(workspaceId));
  }

  function snapshot() {
    return {version:VERSION, status:'AVAILABLE', projections:clone_(projections), generatedAt:now_()};
  }

  function reset() {
    projections = defaultProjections_();
    return snapshot();
  }

  return {VERSION:VERSION, applyState:applyState, get:get, snapshot:snapshot, reset:reset};
})();

function sciipWorkspaceFocusV7(workspaceId) {
  return SCIIP_WORKSPACE_SYNCHRONIZATION.get(String(workspaceId || ''));
}

function sciipWorkspaceSynchronizationSnapshotV7() {
  return SCIIP_WORKSPACE_SYNCHRONIZATION.snapshot();
}
