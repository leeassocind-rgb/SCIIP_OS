/**
 * SCIIP_OS v7.0 — Epic 3 Sprint 6
 * Network Intelligence Engine
 *
 * Extends Sprint 5 relationship intelligence with governed multi-hop traversal,
 * temporal relationship state, influence propagation, portfolio network value,
 * dashboard-ready summaries, and explainable recommendations.
 */
var SCIIP_NETWORK_INTELLIGENCE = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint6.0';

  function text_(value) {
    return value === null || value === undefined ? '' : String(value).trim();
  }

  function number_(value, fallback) {
    var n = Number(value);
    return isFinite(n) ? n : (fallback || 0);
  }

  function clamp_(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function round_(value) {
    return Math.round(value * 100) / 100;
  }

  function stableId_(parts) {
    var input = parts.join('|');
    var hash = 2166136261;
    var i;
    for (i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash += (hash << 1) + (hash << 4) + (hash << 7) + (hash << 8) + (hash << 24);
    }
    return 'NET-' + ('00000000' + (hash >>> 0).toString(16).toUpperCase()).slice(-8);
  }

  function graph_(input) {
    if (typeof SCIIP_RELATIONSHIP_INTELLIGENCE !== 'undefined' &&
        SCIIP_RELATIONSHIP_INTELLIGENCE &&
        typeof SCIIP_RELATIONSHIP_INTELLIGENCE.buildGraph === 'function') {
      return SCIIP_RELATIONSHIP_INTELLIGENCE.buildGraph(input || {});
    }
    throw new Error('Sprint 5 Relationship Intelligence Engine is required.');
  }

  function otherEnd_(relationship, entityId) {
    return relationship.sourceId === entityId ? relationship.targetId : relationship.sourceId;
  }

  function relationshipState(relationship, asOfDate) {
    relationship = relationship || {};
    var asOf = new Date(asOfDate || new Date().toISOString());
    var metadata = relationship.metadata || {};
    var start = relationship.startDate || metadata.startDate || relationship.observedAt || relationship.date || '';
    var end = relationship.endDate || metadata.endDate || relationship.expiresAt || metadata.expiresAt || '';
    var startDate = start ? new Date(start) : null;
    var endDate = end ? new Date(end) : null;
    var strength = clamp_(number_(relationship.strength, 50), 0, 100);
    var confidence = clamp_(number_(relationship.confidence, 50), 0, 100);
    var decayPerDay = clamp_(number_(relationship.decayPerDay !== undefined ? relationship.decayPerDay : metadata.decayPerDay, 0), 0, 10);
    var active = (!startDate || startDate <= asOf) && (!endDate || endDate >= asOf);
    var ageDays = startDate ? Math.max(0, Math.floor((asOf.getTime() - startDate.getTime()) / 86400000)) : 0;
    var effectiveStrength = active ? clamp_(strength - ageDays * decayPerDay, 0, 100) : 0;
    var state = 'ACTIVE';
    if (!active && startDate && startDate > asOf) state = 'PENDING';
    if (!active && endDate && endDate < asOf) state = 'EXPIRED';
    if (active && effectiveStrength < 35) state = 'WEAKENING';
    if (active && effectiveStrength >= 75) state = 'STRONG';
    return {
      relationshipId: text_(relationship.id),
      state: state,
      active: active,
      ageDays: ageDays,
      originalStrength: strength,
      effectiveStrength: round_(effectiveStrength),
      confidence: confidence,
      weightedStrength: round_(effectiveStrength * confidence / 100)
    };
  }

  function temporalSnapshot(input, asOfDate) {
    var graph = graph_(input);
    var relationships = [];
    graph.relationships.forEach(function (relationship) {
      var state = relationshipState(relationship, asOfDate);
      relationships.push({
        relationship: relationship,
        state: state
      });
    });
    return {
      version: VERSION,
      asOfDate: asOfDate || new Date().toISOString(),
      relationships: relationships,
      active: relationships.filter(function (item) { return item.state.active; }).length,
      expired: relationships.filter(function (item) { return item.state.state === 'EXPIRED'; }).length,
      weakening: relationships.filter(function (item) { return item.state.state === 'WEAKENING'; }).length,
      strong: relationships.filter(function (item) { return item.state.state === 'STRONG'; }).length
    };
  }

  function traverse(input, startId, options) {
    options = options || {};
    var graph = graph_(input);
    var maxDepth = clamp_(number_(options.maxDepth, 3), 1, 5);
    var minimumWeightedStrength = clamp_(number_(options.minimumWeightedStrength, 0), 0, 100);
    var asOfDate = options.asOfDate || new Date().toISOString();
    var queue = [{entityId:startId, depth:0, path:[startId], score:100}];
    var bestDepth = {};
    var paths = [];
    bestDepth[startId] = 0;

    while (queue.length) {
      var current = queue.shift();
      if (current.depth >= maxDepth) continue;
      (graph.adjacency[current.entityId] || []).forEach(function (relationship) {
        var state = relationshipState(relationship, asOfDate);
        if (!state.active || state.weightedStrength < minimumWeightedStrength) return;
        var nextId = otherEnd_(relationship, current.entityId);
        if (current.path.indexOf(nextId) !== -1) return;
        var nextDepth = current.depth + 1;
        var nextScore = round_(current.score * (state.weightedStrength / 100) * (1 / nextDepth));
        var nextPath = current.path.concat([nextId]);
        paths.push({
          id: stableId_(nextPath),
          sourceId: startId,
          targetId: nextId,
          depth: nextDepth,
          path: nextPath,
          relationshipId: relationship.id,
          pathScore: nextScore
        });
        if (bestDepth[nextId] === undefined || nextDepth < bestDepth[nextId]) {
          bestDepth[nextId] = nextDepth;
          queue.push({entityId:nextId, depth:nextDepth, path:nextPath, score:nextScore});
        }
      });
    }

    paths.sort(function (a, b) {
      return b.pathScore - a.pathScore || a.depth - b.depth || a.targetId.localeCompare(b.targetId);
    });

    return {
      version: VERSION,
      startId: startId,
      maxDepth: maxDepth,
      paths: paths,
      reachableEntities: Object.keys(bestDepth).length - 1
    };
  }

  function propagateInfluence(input, options) {
    options = options || {};
    var graph = graph_(input);
    var asOfDate = options.asOfDate || new Date().toISOString();
    var iterations = clamp_(number_(options.iterations, 3), 1, 10);
    var damping = clamp_(number_(options.damping, 0.65), 0, 1);
    var scores = {};
    graph.entities.forEach(function (entity) {
      scores[entity.id] = number_(entity.attributes && entity.attributes.baseInfluence, 1);
    });

    var i;
    for (i = 0; i < iterations; i += 1) {
      var next = {};
      graph.entities.forEach(function (entity) {
        next[entity.id] = (1 - damping) * number_(entity.attributes && entity.attributes.baseInfluence, 1);
      });
      graph.relationships.forEach(function (relationship) {
        var state = relationshipState(relationship, asOfDate);
        if (!state.active) return;
        var weight = state.weightedStrength / 100;
        next[relationship.targetId] = (next[relationship.targetId] || 0) +
          damping * (scores[relationship.sourceId] || 0) * weight;
        next[relationship.sourceId] = (next[relationship.sourceId] || 0) +
          damping * (scores[relationship.targetId] || 0) * weight;
      });
      scores = next;
    }

    var ranking = Object.keys(scores).map(function (entityId) {
      return {entityId:entityId, propagatedInfluence:round_(scores[entityId])};
    });
    ranking.sort(function (a, b) {
      return b.propagatedInfluence - a.propagatedInfluence || a.entityId.localeCompare(b.entityId);
    });

    return {
      version: VERSION,
      iterations: iterations,
      damping: damping,
      ranking: ranking,
      top: ranking.length ? ranking[0] : null
    };
  }

  function scorePortfolio(input, portfolioAssets, options) {
    options = options || {};
    var graph = graph_(input);
    var propagation = propagateInfluence(input, options);
    var influenceIndex = {};
    propagation.ranking.forEach(function (item) {
      influenceIndex[item.entityId] = item.propagatedInfluence;
    });

    var results = (portfolioAssets || []).map(function (asset) {
      var entityId = text_(asset.entityId || asset.id);
      var adjacency = graph.adjacency[entityId] || [];
      var activeLinks = adjacency.filter(function (relationship) {
        return relationshipState(relationship, options.asOfDate).active;
      });
      var relationshipValue = activeLinks.reduce(function (sum, relationship) {
        return sum + relationshipState(relationship, options.asOfDate).weightedStrength;
      }, 0);
      var marketPriority = clamp_(number_(asset.marketPriority, 50), 0, 100);
      var strategicFit = clamp_(number_(asset.strategicFit, 50), 0, 100);
      var influence = number_(influenceIndex[entityId], 0);
      var score = round_(relationshipValue * 0.35 + influence * 0.30 + marketPriority * 0.20 + strategicFit * 0.15);
      return {
        assetId: text_(asset.id || entityId),
        entityId: entityId,
        relationshipCount: activeLinks.length,
        relationshipValue: round_(relationshipValue),
        propagatedInfluence: round_(influence),
        networkValueScore: score
      };
    });

    results.sort(function (a, b) {
      return b.networkValueScore - a.networkValueScore || a.assetId.localeCompare(b.assetId);
    });

    return {
      version: VERSION,
      assets: results.length,
      ranking: results,
      topAsset: results.length ? results[0] : null
    };
  }

  function buildDashboard(input, portfolioAssets, options) {
    var graph = graph_(input);
    var temporal = temporalSnapshot(input, options && options.asOfDate);
    var propagation = propagateInfluence(input, options || {});
    var portfolio = scorePortfolio(input, portfolioAssets || [], options || {});
    return {
      version: VERSION,
      workspace: 'relationship-intelligence',
      title: 'Executive Relationship Intelligence',
      kpis: {
        entities: graph.entities.length,
        relationships: graph.relationships.length,
        activeRelationships: temporal.active,
        weakeningRelationships: temporal.weakening,
        expiredRelationships: temporal.expired,
        portfolioAssets: portfolio.assets
      },
      topInfluencers: propagation.ranking.slice(0, 5),
      topPortfolioAssets: portfolio.ranking.slice(0, 5),
      reviewRequired: true,
      destructiveCommitEnabled: false
    };
  }

  function recommend(input, portfolioAssets, options) {
    options = options || {};
    var graph = graph_(input);
    var portfolio = scorePortfolio(input, portfolioAssets || [], options);
    var recommendations = [];

    portfolio.ranking.slice(0, 3).forEach(function (asset) {
      recommendations.push({
        id: stableId_([asset.assetId, 'PRIORITIZE']),
        action: 'PRIORITIZE_RELATIONSHIP_DEVELOPMENT',
        assetId: asset.assetId,
        priorityScore: asset.networkValueScore,
        confidence: asset.relationshipCount >= 2 ? 'HIGH' : 'MEDIUM',
        evidence: {
          relationshipCount: asset.relationshipCount,
          relationshipValue: asset.relationshipValue,
          propagatedInfluence: asset.propagatedInfluence
        },
        approvalRequired: true
      });
    });

    graph.relationships.forEach(function (relationship) {
      var state = relationshipState(relationship, options.asOfDate);
      if (state.state === 'WEAKENING') {
        recommendations.push({
          id: stableId_([relationship.id, 'REENGAGE']),
          action: 'REENGAGE_RELATIONSHIP',
          relationshipId: relationship.id,
          priorityScore: round_(100 - state.effectiveStrength),
          confidence: state.confidence >= 70 ? 'HIGH' : 'MEDIUM',
          evidence: state,
          approvalRequired: true
        });
      }
    });

    recommendations.sort(function (a, b) {
      return b.priorityScore - a.priorityScore;
    });

    return {
      version: VERSION,
      count: recommendations.length,
      recommendations: recommendations,
      reviewRequired: true
    };
  }

  function analyze(input, portfolioAssets, options) {
    options = options || {};
    var dashboard = buildDashboard(input, portfolioAssets || [], options);
    var recommendations = recommend(input, portfolioAssets || [], options);
    return {
      framework: 'SCIIP_V7_EPIC_3_SPRINT_6_NETWORK_INTELLIGENCE',
      version: VERSION,
      status: 'AVAILABLE',
      generatedAt: new Date().toISOString(),
      dashboard: dashboard,
      recommendations: recommendations
    };
  }

  return {
    VERSION: VERSION,
    relationshipState: relationshipState,
    temporalSnapshot: temporalSnapshot,
    traverse: traverse,
    propagateInfluence: propagateInfluence,
    scorePortfolio: scorePortfolio,
    buildDashboard: buildDashboard,
    recommend: recommend,
    analyze: analyze
  };
})();

function sciipNetworkRelationshipState(relationship, asOfDate) {
  return SCIIP_NETWORK_INTELLIGENCE.relationshipState(relationship || {}, asOfDate);
}

function sciipTraverseRelationshipNetwork(input, startId, options) {
  return SCIIP_NETWORK_INTELLIGENCE.traverse(input || {}, startId, options || {});
}

function sciipRunNetworkIntelligence(input, portfolioAssets, options) {
  return SCIIP_NETWORK_INTELLIGENCE.analyze(input || {}, portfolioAssets || [], options || {});
}
