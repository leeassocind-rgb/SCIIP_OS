/**
 * SCIIP_OS v7.0 — Epic 3 Sprint 5
 * Relationship Intelligence Engine
 *
 * Cohesive application service. No direct sheet writes. Duplicate-safe,
 * deterministic, and compatible with Apps Script and Node certification.
 */
var SCIIP_RELATIONSHIP_INTELLIGENCE = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint5.0';

  function text_(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  function number_(value, fallback) {
    var n = Number(value);
    return isFinite(n) ? n : (fallback || 0);
  }

  function upper_(value) {
    return text_(value).toUpperCase();
  }

  function stableId_(parts) {
    var input = parts.join('|');
    var hash = 2166136261;
    var i;
    for (i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return 'REL-' + ('00000000' + (hash >>> 0).toString(16).toUpperCase()).slice(-8);
  }

  function normalizeEntity_(entity) {
    entity = entity || {};
    return {
      id: text_(entity.id || entity.entityId || entity.companyId || entity.contactId),
      name: text_(entity.name || entity.label),
      type: upper_(entity.type || entity.entityType || 'UNKNOWN'),
      market: text_(entity.market || entity.submarket),
      attributes: entity.attributes || {}
    };
  }

  function normalizeRelationship_(relationship) {
    relationship = relationship || {};
    var sourceId = text_(relationship.sourceId || relationship.fromId);
    var targetId = text_(relationship.targetId || relationship.toId);
    var relationshipType = upper_(relationship.type || relationship.relationshipType || 'RELATED_TO');
    var observedAt = text_(relationship.observedAt || relationship.date || '');
    var confidence = Math.max(0, Math.min(100, number_(relationship.confidence, 50)));
    return {
      id: text_(relationship.id) || stableId_([sourceId, targetId, relationshipType, observedAt]),
      sourceId: sourceId,
      targetId: targetId,
      type: relationshipType,
      strength: Math.max(0, Math.min(100, number_(relationship.strength, confidence))),
      confidence: confidence,
      observedAt: observedAt,
      evidence: relationship.evidence || [],
      metadata: relationship.metadata || {}
    };
  }

  function deduplicateRelationships_(relationships) {
    var index = {};
    var output = [];
    (relationships || []).forEach(function (raw) {
      var item = normalizeRelationship_(raw);
      var key = [item.sourceId, item.targetId, item.type, item.observedAt].join('|');
      if (!index[key]) {
        index[key] = item;
        output.push(item);
      } else {
        index[key].strength = Math.max(index[key].strength, item.strength);
        index[key].confidence = Math.max(index[key].confidence, item.confidence);
        index[key].evidence = index[key].evidence.concat(item.evidence || []);
      }
    });
    return output;
  }

  function buildGraph(input) {
    input = input || {};
    var entities = (input.entities || []).map(normalizeEntity_);
    var relationships = deduplicateRelationships_(input.relationships || []);
    var entityIndex = {};
    var adjacency = {};
    entities.forEach(function (entity) {
      if (!entity.id) return;
      entityIndex[entity.id] = entity;
      adjacency[entity.id] = adjacency[entity.id] || [];
    });
    relationships.forEach(function (relationship) {
      if (!relationship.sourceId || !relationship.targetId) return;
      adjacency[relationship.sourceId] = adjacency[relationship.sourceId] || [];
      adjacency[relationship.targetId] = adjacency[relationship.targetId] || [];
      adjacency[relationship.sourceId].push(relationship);
      adjacency[relationship.targetId].push(relationship);
    });
    return {
      version: VERSION,
      entities: entities,
      relationships: relationships,
      entityIndex: entityIndex,
      adjacency: adjacency
    };
  }

  function calculateInfluence(graph) {
    var scores = [];
    Object.keys(graph.adjacency || {}).forEach(function (entityId) {
      var links = graph.adjacency[entityId] || [];
      var weighted = links.reduce(function (sum, link) {
        return sum + (link.strength * link.confidence / 100);
      }, 0);
      scores.push({
        entityId: entityId,
        relationshipCount: links.length,
        influenceScore: Math.round((links.length * 12 + weighted) * 100) / 100
      });
    });
    scores.sort(function (a, b) {
      return b.influenceScore - a.influenceScore || a.entityId.localeCompare(b.entityId);
    });
    return scores;
  }

  function detectOpportunities(graph) {
    var opportunities = [];
    var entities = graph.entities || [];
    var direct = {};
    (graph.relationships || []).forEach(function (link) {
      direct[link.sourceId + '|' + link.targetId] = true;
      direct[link.targetId + '|' + link.sourceId] = true;
    });
    entities.forEach(function (left, i) {
      entities.slice(i + 1).forEach(function (right) {
        if (!left.id || !right.id || direct[left.id + '|' + right.id]) return;
        var leftLinks = graph.adjacency[left.id] || [];
        var rightLinks = graph.adjacency[right.id] || [];
        var leftNeighbors = {};
        leftLinks.forEach(function (link) {
          leftNeighbors[link.sourceId === left.id ? link.targetId : link.sourceId] = true;
        });
        var shared = [];
        rightLinks.forEach(function (link) {
          var neighbor = link.sourceId === right.id ? link.targetId : link.sourceId;
          if (leftNeighbors[neighbor]) shared.push(neighbor);
        });
        if (shared.length) {
          opportunities.push({
            id: stableId_([left.id, right.id, 'INTRODUCTION']),
            sourceId: left.id,
            targetId: right.id,
            sharedConnections: shared,
            opportunityType: 'WARM_INTRODUCTION',
            score: Math.min(100, 55 + shared.length * 15)
          });
        }
      });
    });
    opportunities.sort(function (a, b) { return b.score - a.score; });
    return opportunities;
  }

  function analyze(input) {
    var graph = buildGraph(input);
    var influence = calculateInfluence(graph);
    var opportunities = detectOpportunities(graph);
    return {
      framework: 'SCIIP_V7_EPIC_3_SPRINT_5_RELATIONSHIP_INTELLIGENCE',
      version: VERSION,
      status: 'AVAILABLE',
      generatedAt: new Date().toISOString(),
      entities: graph.entities.length,
      relationships: graph.relationships.length,
      influence: influence,
      opportunities: opportunities,
      topInfluencer: influence.length ? influence[0] : null
    };
  }

  return {
    VERSION: VERSION,
    normalizeEntity: normalizeEntity_,
    normalizeRelationship: normalizeRelationship_,
    deduplicateRelationships: deduplicateRelationships_,
    buildGraph: buildGraph,
    calculateInfluence: calculateInfluence,
    detectOpportunities: detectOpportunities,
    analyze: analyze
  };
})();

function sciipRelationshipIntelligenceAnalyze(input) {
  return SCIIP_RELATIONSHIP_INTELLIGENCE.analyze(input || {});
}
