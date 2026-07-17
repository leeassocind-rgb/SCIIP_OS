/**
 * SCIIP_OS v7.0 — Epic 3 Sprint 7
 * Enterprise Relationship Graph Engine
 *
 * Canonical, cross-domain graph for industrial real estate. Unifies properties,
 * companies, people, transactions, markets, municipalities, utilities and
 * infrastructure while preserving evidence, history and spatial context.
 */
var SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint7.0';
  var ENTITY_TYPES = ['PROPERTY','COMPANY','PERSON','LEASE','TRANSACTION','MARKET','MUNICIPALITY','UTILITY','INFRASTRUCTURE'];
  var RELATIONSHIP_TYPES = [
    'OWNS','OCCUPIES','REPRESENTS','PARTICIPATED_IN','LOCATED_IN','SERVED_BY',
    'CONNECTED_TO','NEAR','COMPETES_WITH','SUPPLIES','DEVELOPED','FINANCED','RELATED_TO'
  ];

  function text_(v) { return v === null || v === undefined ? '' : String(v).trim(); }
  function upper_(v) { return text_(v).toUpperCase(); }
  function num_(v, fallback) { if (v === null || v === undefined || v === '') return fallback === undefined ? 0 : fallback; var n = Number(v); return isFinite(n) ? n : (fallback === undefined ? 0 : fallback); }
  function clamp_(v, min, max) { return Math.max(min, Math.min(max, v)); }
  function clone_(v) { return JSON.parse(JSON.stringify(v)); }
  function normalizeKey_(v) { return upper_(v).replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, ''); }
  function stableId_(prefix, parts) {
    var input = parts.join('|'), hash = 2166136261, i;
    for (i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return prefix + '-' + ('00000000' + (hash >>> 0).toString(16).toUpperCase()).slice(-8);
  }
  function validType_(type, allowed, fallback) {
    type = upper_(type);
    return allowed.indexOf(type) !== -1 ? type : fallback;
  }
  function evidence_(items) {
    var seen = {}, result = [];
    (items || []).forEach(function (item) {
      if (!item) return;
      var normalized = {
        sourceId: text_(item.sourceId || item.id),
        sourceType: upper_(item.sourceType || item.type || 'UNKNOWN'),
        observedAt: text_(item.observedAt || item.date),
        reference: text_(item.reference || item.url || item.note),
        confidence: clamp_(num_(item.confidence, 50), 0, 100)
      };
      var key = [normalized.sourceId, normalized.reference, normalized.observedAt].join('|');
      if (!seen[key]) { seen[key] = true; result.push(normalized); }
    });
    return result;
  }

  function canonicalEntity(raw) {
    raw = raw || {};
    var type = validType_(raw.type || raw.entityType, ENTITY_TYPES, 'COMPANY');
    var attrs = clone_(raw.attributes || {});
    var businessKey = text_(raw.businessKey) || [type, normalizeKey_(raw.name || raw.address || raw.id)].join('|');
    var id = text_(raw.id || raw.entityId) || stableId_('ENT', [businessKey]);
    var latitude = raw.latitude !== undefined ? num_(raw.latitude, null) : num_(attrs.latitude, null);
    var longitude = raw.longitude !== undefined ? num_(raw.longitude, null) : num_(attrs.longitude, null);
    var aliases = (raw.aliases || []).map(text_).filter(Boolean);
    if (raw.name && aliases.indexOf(text_(raw.name)) === -1) aliases.unshift(text_(raw.name));
    return {
      id: id,
      businessKey: businessKey,
      type: type,
      name: text_(raw.name || raw.label || raw.address || id),
      aliases: aliases,
      status: upper_(raw.status || 'ACTIVE'),
      latitude: latitude,
      longitude: longitude,
      attributes: attrs,
      evidence: evidence_(raw.evidence),
      effectiveFrom: text_(raw.effectiveFrom || raw.observedAt),
      effectiveTo: text_(raw.effectiveTo),
      metadata: clone_(raw.metadata || {})
    };
  }

  function canonicalRelationship(raw) {
    raw = raw || {};
    var sourceId = text_(raw.sourceId || raw.fromId);
    var targetId = text_(raw.targetId || raw.toId);
    var type = validType_(raw.type || raw.relationshipType, RELATIONSHIP_TYPES, 'RELATED_TO');
    var businessKey = text_(raw.businessKey) || [sourceId, type, targetId, text_(raw.effectiveFrom || raw.observedAt)].join('|');
    return {
      id: text_(raw.id) || stableId_('REL', [businessKey]),
      businessKey: businessKey,
      sourceId: sourceId,
      targetId: targetId,
      type: type,
      direction: upper_(raw.direction || 'DIRECTED'),
      strength: clamp_(num_(raw.strength, 50), 0, 100),
      confidence: clamp_(num_(raw.confidence, 50), 0, 100),
      effectiveFrom: text_(raw.effectiveFrom || raw.observedAt),
      effectiveTo: text_(raw.effectiveTo || raw.expiresAt),
      evidence: evidence_(raw.evidence),
      attributes: clone_(raw.attributes || raw.metadata || {})
    };
  }

  function build(input) {
    input = input || {};
    var entityById = {}, entityByKey = {}, relationshipByKey = {}, entities = [], relationships = [], adjacency = {};
    (input.entities || []).forEach(function (raw) {
      var entity = canonicalEntity(raw);
      var existing = entityByKey[entity.businessKey];
      if (existing) {
        existing.aliases = existing.aliases.concat(entity.aliases).filter(function (v, i, a) { return a.indexOf(v) === i; });
        existing.evidence = evidence_(existing.evidence.concat(entity.evidence));
        Object.keys(entity.attributes).forEach(function (k) { if (existing.attributes[k] === undefined) existing.attributes[k] = entity.attributes[k]; });
        return;
      }
      entityById[entity.id] = entity;
      entityByKey[entity.businessKey] = entity;
      adjacency[entity.id] = [];
      entities.push(entity);
    });
    (input.relationships || []).forEach(function (raw) {
      var rel = canonicalRelationship(raw);
      if (!entityById[rel.sourceId] || !entityById[rel.targetId] || rel.sourceId === rel.targetId) return;
      if (relationshipByKey[rel.businessKey]) return;
      relationshipByKey[rel.businessKey] = rel;
      relationships.push(rel);
      adjacency[rel.sourceId].push(rel);
      adjacency[rel.targetId].push(rel);
    });
    return {
      version: VERSION,
      entities: entities,
      relationships: relationships,
      entityById: entityById,
      entityByKey: entityByKey,
      adjacency: adjacency,
      rejectedRelationships: (input.relationships || []).length - relationships.length,
      duplicateSafe: true,
      permanentHistory: true
    };
  }

  function neighbors(input, entityId, options) {
    options = options || {};
    var graph = build(input), typeFilter = upper_(options.relationshipType), entityType = upper_(options.entityType);
    var result = (graph.adjacency[entityId] || []).map(function (rel) {
      var otherId = rel.sourceId === entityId ? rel.targetId : rel.sourceId;
      return { relationship: rel, entity: graph.entityById[otherId] };
    }).filter(function (item) {
      return (!typeFilter || item.relationship.type === typeFilter) && (!entityType || item.entity.type === entityType);
    });
    return { version: VERSION, entityId: entityId, count: result.length, results: result };
  }

  function query(input, querySpec) {
    querySpec = querySpec || {};
    var graph = build(input);
    var entityType = upper_(querySpec.entityType), relationshipType = upper_(querySpec.relationshipType);
    var market = normalizeKey_(querySpec.market), industry = normalizeKey_(querySpec.industry);
    var minimumConfidence = clamp_(num_(querySpec.minimumConfidence, 0), 0, 100);
    var entities = graph.entities.filter(function (entity) {
      var attrs = entity.attributes || {};
      if (entityType && entity.type !== entityType) return false;
      if (market && normalizeKey_(attrs.market || attrs.city || attrs.region).indexOf(market) === -1) return false;
      if (industry && normalizeKey_(attrs.industry || attrs.sector).indexOf(industry) === -1) return false;
      return true;
    });
    var ids = {};
    entities.forEach(function (e) { ids[e.id] = true; });
    var relationships = graph.relationships.filter(function (rel) {
      if (relationshipType && rel.type !== relationshipType) return false;
      if (rel.confidence < minimumConfidence) return false;
      return ids[rel.sourceId] || ids[rel.targetId];
    });
    return {
      version: VERSION,
      query: clone_(querySpec),
      entities: entities,
      relationships: relationships,
      evidenceCount: relationships.reduce(function (sum, rel) { return sum + rel.evidence.length; }, 0),
      reviewRequired: true
    };
  }

  function shortestPath(input, sourceId, targetId, options) {
    options = options || {};
    var graph = build(input), maxDepth = clamp_(num_(options.maxDepth, 6), 1, 10);
    var queue = [{id:sourceId, path:[sourceId], relationships:[]}], visited = {};
    visited[sourceId] = true;
    while (queue.length) {
      var current = queue.shift();
      if (current.id === targetId) return {version:VERSION, found:true, depth:current.path.length-1, path:current.path, relationships:current.relationships};
      if (current.path.length - 1 >= maxDepth) continue;
      (graph.adjacency[current.id] || []).forEach(function (rel) {
        if (rel.confidence < num_(options.minimumConfidence, 0)) return;
        var next = rel.sourceId === current.id ? rel.targetId : rel.sourceId;
        if (visited[next]) return;
        visited[next] = true;
        queue.push({id:next, path:current.path.concat([next]), relationships:current.relationships.concat([rel.id])});
      });
    }
    return {version:VERSION, found:false, depth:null, path:[], relationships:[]};
  }

  function spatialProjection(input) {
    var graph = build(input), features = [], links = [];
    graph.entities.forEach(function (entity) {
      if (entity.latitude === null || entity.longitude === null) return;
      features.push({
        type:'Feature',
        geometry:{type:'Point', coordinates:[entity.longitude, entity.latitude]},
        properties:{entityId:entity.id, entityType:entity.type, name:entity.name, status:entity.status}
      });
    });
    graph.relationships.forEach(function (rel) {
      var a = graph.entityById[rel.sourceId], b = graph.entityById[rel.targetId];
      if (!a || !b || a.latitude === null || a.longitude === null || b.latitude === null || b.longitude === null) return;
      links.push({
        type:'Feature',
        geometry:{type:'LineString', coordinates:[[a.longitude,a.latitude],[b.longitude,b.latitude]]},
        properties:{relationshipId:rel.id, relationshipType:rel.type, confidence:rel.confidence}
      });
    });
    return {version:VERSION, type:'FeatureCollection', features:features.concat(links), pointCount:features.length, linkCount:links.length};
  }

  function evidenceContext(input, entityIds, options) {
    options = options || {};
    var graph = build(input), ids = {}, context = [];
    (entityIds || []).forEach(function (id) { ids[id] = true; });
    graph.relationships.forEach(function (rel) {
      if (!ids[rel.sourceId] && !ids[rel.targetId]) return;
      context.push({
        statement:[graph.entityById[rel.sourceId].name, rel.type, graph.entityById[rel.targetId].name].join(' '),
        relationshipId:rel.id,
        confidence:rel.confidence,
        evidence:clone_(rel.evidence),
        grounded:rel.evidence.length > 0
      });
    });
    context.sort(function (a,b) { return b.confidence-a.confidence; });
    return {version:VERSION, context:context.slice(0, clamp_(num_(options.limit, 20),1,100)), groundedCount:context.filter(function(x){return x.grounded;}).length, reviewRequired:true};
  }

  function analyze(input) {
    var graph = build(input), spatial = spatialProjection(input);
    var byType = {};
    graph.entities.forEach(function (e) { byType[e.type] = (byType[e.type] || 0) + 1; });
    return {
      framework:'SCIIP_V7_EPIC_3_SPRINT_7_ENTERPRISE_RELATIONSHIP_GRAPH',
      version:VERSION,
      status:'AVAILABLE',
      generatedAt:new Date().toISOString(),
      summary:{entities:graph.entities.length, relationships:graph.relationships.length, entityTypes:byType, spatialEntities:spatial.pointCount, spatialLinks:spatial.linkCount, rejectedRelationships:graph.rejectedRelationships},
      governance:{duplicateSafe:true, permanentHistory:true, reviewRequired:true, destructiveCommitEnabled:false}
    };
  }

  return {
    VERSION:VERSION,
    ENTITY_TYPES:ENTITY_TYPES,
    RELATIONSHIP_TYPES:RELATIONSHIP_TYPES,
    canonicalEntity:canonicalEntity,
    canonicalRelationship:canonicalRelationship,
    build:build,
    neighbors:neighbors,
    query:query,
    shortestPath:shortestPath,
    spatialProjection:spatialProjection,
    evidenceContext:evidenceContext,
    analyze:analyze
  };
})();

function sciipBuildEnterpriseRelationshipGraph(input) { return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.build(input || {}); }
function sciipQueryEnterpriseRelationshipGraph(input, querySpec) { return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.query(input || {}, querySpec || {}); }
function sciipEnterpriseRelationshipShortestPath(input, sourceId, targetId, options) { return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.shortestPath(input || {}, sourceId, targetId, options || {}); }
function sciipRunEnterpriseRelationshipGraph(input) { return SCIIP_ENTERPRISE_RELATIONSHIP_GRAPH.analyze(input || {}); }
