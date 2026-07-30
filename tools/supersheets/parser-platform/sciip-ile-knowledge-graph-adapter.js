"use strict";

/**
 * SCIIP ILE Sprint 8 — Knowledge Graph Integration Adapter
 * Produces diagnostic graph mutations without committing them.
 */

const { deepFreeze, stableObject } =
  require("./sciip-ile-integration-adapter");

const VERSION = "ile-v1.0.0-sprint8.0";

function hashString(input) {
  let hash = 2166136261;
  for (const char of String(input)) {
    hash ^= char.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, "0");
}

function nodeId(prefix, value) {
  return `${prefix}:${hashString(value)}`;
}

function buildGraphPlan(model, context = {}) {
  if (!model || typeof model !== "object" || !model.asset) {
    throw new TypeError("A canonical property model is required.");
  }

  const propertyId = context.propertyId ||
    nodeId("PROPERTY", context.documentId || JSON.stringify(model.asset));
  const nodes = [{
    id: propertyId,
    type: "INDUSTRIAL_PROPERTY",
    properties: stableObject({
      documentId: context.documentId || null,
      address: context.address || null,
      sourceSystem: "SCIIP_ILE",
      modelVersion: model.version || model.modelVersion || null
    })
  }];

  const edges = [];
  const evidenceLinks = [];

  function addAttribute(concept, value, unit = null) {
    if (value == null) return;
    const attributeId = nodeId("ATTRIBUTE", `${propertyId}|${concept}|${JSON.stringify(value)}|${unit || ""}`);
    nodes.push({
      id: attributeId,
      type: "PROPERTY_ATTRIBUTE",
      properties: { concept, value: stableObject(value), unit }
    });
    edges.push({
      id: nodeId("EDGE", `${propertyId}|HAS_ATTRIBUTE|${attributeId}`),
      from: propertyId,
      to: attributeId,
      type: "HAS_ATTRIBUTE"
    });

    const evidence = Array.isArray(model.evidence)
      ? model.evidence.filter(e => String(e.concept || "").toUpperCase() === concept)
      : [];
    for (const item of evidence) {
      evidenceLinks.push({
        attributeId,
        concept,
        evidence: stableObject(item)
      });
    }
  }

  const a = model.asset;
  addAttribute("BUILDING_AREA", a?.areas?.building?.value, a?.areas?.building?.unit);
  addAttribute("LAND_AREA", a?.areas?.land?.value, a?.areas?.land?.unit);
  addAttribute("CLEAR_HEIGHT", a?.physical?.clearHeight?.value, a?.physical?.clearHeight?.unit);
  addAttribute("COLUMN_SPACING", a?.physical?.columnSpacing || null, null);
  addAttribute("POWER", a?.utilities?.power || null, null);
  addAttribute("DOCK_HIGH", a?.loading?.dockHigh?.value, a?.loading?.dockHigh?.unit);
  addAttribute("GRADE_LEVEL", a?.loading?.gradeLevel?.value, a?.loading?.gradeLevel?.unit);
  addAttribute("TRUCK_COURT", a?.loading?.truckCourt?.value, a?.loading?.truckCourt?.unit);
  addAttribute("AUTO_PARKING", a?.parking?.auto?.value, a?.parking?.auto?.unit);
  addAttribute("TRAILER_PARKING", a?.parking?.trailer?.value, a?.parking?.trailer?.unit);
  addAttribute("ESFR", a?.fireProtection?.esfr?.present, null);

  nodes.sort((x, y) => x.id.localeCompare(y.id));
  edges.sort((x, y) => x.id.localeCompare(y.id));
  evidenceLinks.sort((x, y) =>
    `${x.attributeId}|${x.concept}`.localeCompare(`${y.attributeId}|${y.concept}`)
  );

  return deepFreeze(stableObject({
    version: VERSION,
    executionMode: "DIAGNOSTIC_ONLY",
    propertyId,
    nodes,
    edges,
    evidenceLinks,
    graphMutationPlan: {
      creates: nodes.length + edges.length,
      updates: 0,
      deletes: 0,
      committed: false
    },
    governance: {
      deterministicIds: true,
      duplicateSafe: true,
      commitEnabled: false,
      productionWrites: 0,
      existingKnowledgeGraphAuthoritative: true
    }
  }));
}

function validateGraphPlan(plan) {
  if (!plan || !Array.isArray(plan.nodes) || !Array.isArray(plan.edges)) {
    throw new TypeError("A graph plan is required.");
  }
  const nodeIds = new Set(plan.nodes.map(node => node.id));
  const duplicateNodeIds = plan.nodes.length - nodeIds.size;
  const danglingEdges = plan.edges.filter(
    edge => !nodeIds.has(edge.from) || !nodeIds.has(edge.to)
  );

  return deepFreeze({
    valid: duplicateNodeIds === 0 && danglingEdges.length === 0,
    duplicateNodeIds,
    danglingEdges,
    nodeCount: plan.nodes.length,
    edgeCount: plan.edges.length,
    committed: false
  });
}

module.exports = Object.freeze({
  VERSION,
  hashString,
  nodeId,
  buildGraphPlan,
  validateGraphPlan
});
