/**
 * SCIIP_OS v7.0 — Relationship Intelligence AI Bridge
 * Produces evidence-grounded prompts; no model call is performed here.
 */
var SCIIP_RELATIONSHIP_INTELLIGENCE_AI_BRIDGE = (function () {
  'use strict';

  var VERSION = 'v7.0-epic3-sprint5.0';

  function buildBriefingRequest(analysis) {
    analysis = analysis || {};
    var evidence = [];
    (analysis.influence || []).slice(0, 5).forEach(function (item) {
      evidence.push({
        type: 'INFLUENCE',
        entityId: item.entityId,
        score: item.influenceScore,
        relationshipCount: item.relationshipCount
      });
    });
    (analysis.opportunities || []).slice(0, 5).forEach(function (item) {
      evidence.push({
        type: 'OPPORTUNITY',
        sourceId: item.sourceId,
        targetId: item.targetId,
        score: item.score,
        sharedConnections: item.sharedConnections
      });
    });
    return {
      version: VERSION,
      task: 'RELATIONSHIP_INTELLIGENCE_BRIEFING',
      grounded: true,
      evidenceRequired: true,
      evidence: evidence,
      instruction: 'Summarize the strongest relationships, explainable opportunities, and recommended broker follow-up actions. Do not invent facts.'
    };
  }

  return { VERSION: VERSION, buildBriefingRequest: buildBriefingRequest };
})();

function sciipRelationshipIntelligenceBriefingRequest(analysis) {
  return SCIIP_RELATIONSHIP_INTELLIGENCE_AI_BRIDGE.buildBriefingRequest(analysis || {});
}
