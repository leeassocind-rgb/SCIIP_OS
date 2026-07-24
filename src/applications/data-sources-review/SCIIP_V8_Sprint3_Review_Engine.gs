var SCIIP_V8_SPRINT3_REVIEW_ENGINE = (function () {
  'use strict';

  function clamp_(n, min, max) { return Math.max(min, Math.min(max, Number(n) || 0)); }
  function copy_(v) { return JSON.parse(JSON.stringify(v)); }

  function buildValidationSummary(input) {
    input = input || {};
    var rows = Number(input.rowsDiscovered || 240);
    var errors = Array.isArray(input.errors) ? input.errors : [
      { row: 37, field: 'address', code: 'REQUIRED_VALUE_MISSING', severity: 'ERROR', fixable: true },
      { row: 112, field: 'available_sf', code: 'NUMBER_FORMAT_NORMALIZED', severity: 'WARNING', fixable: true }
    ];
    var blocking = errors.filter(function (e) { return e.severity === 'ERROR'; }).length;
    return {
      status: blocking ? 'REVIEW_REQUIRED' : 'PASSED',
      rowsEvaluated: rows,
      issues: errors.length,
      blockingIssues: blocking,
      fixableIssues: errors.filter(function (e) { return e.fixable; }).length,
      errorRatePct: Number(((errors.length / Math.max(rows, 1)) * 100).toFixed(2)),
      issuesDetail: copy_(errors)
    };
  }

  function detectDuplicates(input) {
    input = input || {};
    var candidates = input.candidates || [
      { sourceRow: 18, candidateId: 'PROP-RIALTO-2125-LOWELL', confidence: 0.97, reason: 'Normalized address and APN match', action: 'MERGE' },
      { sourceRow: 88, candidateId: 'COMP-ACME-INDUSTRIAL', confidence: 0.81, reason: 'Company name and domain similarity', action: 'REVIEW' }
    ];
    return {
      candidates: copy_(candidates),
      candidateCount: candidates.length,
      highConfidence: candidates.filter(function (c) { return c.confidence >= 0.9; }).length,
      reviewRequired: candidates.some(function (c) { return c.action === 'REVIEW'; })
    };
  }

  function resolveEntities(input) {
    input = input || {};
    var suggestions = input.suggestions || [
      { sourceRow: 18, entityType: 'PROPERTY', canonicalId: 'PROP-RIALTO-2125-LOWELL', decision: 'MATCH', confidence: 0.97 },
      { sourceRow: 88, entityType: 'COMPANY', canonicalId: 'COMP-ACME-INDUSTRIAL', decision: 'REVIEW', confidence: 0.81 },
      { sourceRow: 121, entityType: 'PROPERTY', canonicalId: null, decision: 'CREATE', confidence: 0.94 }
    ];
    var avg = suggestions.reduce(function (s, x) { return s + x.confidence; }, 0) / Math.max(suggestions.length, 1);
    return {
      suggestions: copy_(suggestions),
      suggestionsCount: suggestions.length,
      matches: suggestions.filter(function (x) { return x.decision === 'MATCH'; }).length,
      creates: suggestions.filter(function (x) { return x.decision === 'CREATE'; }).length,
      unresolved: suggestions.filter(function (x) { return x.decision === 'REVIEW'; }).length,
      averageConfidence: Number(avg.toFixed(2))
    };
  }

  function buildCanonicalPreview(input) {
    input = input || {};
    var rows = input.rows || [
      { source: { Address: '2125 W Lowell St', City: 'Rialto', Available_SF: '664,859' }, canonical: { address: '2125 W Lowell St', city: 'Rialto', availableSf: 664859 }, changes: 1 },
      { source: { Address: '100 Commerce Way', City: 'Ontario', Available_SF: '250000' }, canonical: { address: '100 Commerce Way', city: 'Ontario', availableSf: 250000 }, changes: 0 }
    ];
    return {
      rows: copy_(rows),
      rowsPreviewed: rows.length,
      fieldsChanged: rows.reduce(function (s, r) { return s + Number(r.changes || 0); }, 0),
      sourceAndCanonicalVisible: true
    };
  }

  function buildGraphImpactPreview(input) {
    input = input || {};
    var newNodes = Number(input.newNodes == null ? 1 : input.newNodes);
    var updatedNodes = Number(input.updatedNodes == null ? 2 : input.updatedNodes);
    var newEdges = Number(input.newEdges == null ? 4 : input.newEdges);
    return {
      status: 'PREVIEW_AVAILABLE',
      newNodes: newNodes,
      updatedNodes: updatedNodes,
      newEdges: newEdges,
      destructiveGraphChanges: 0,
      lineageEdges: newNodes + updatedNodes
    };
  }

  function applyBulkDecision(input) {
    input = input || {};
    var ids = input.ids || ['row-18', 'row-121'];
    var decision = input.decision || 'APPROVE';
    if (['APPROVE', 'REJECT', 'DEFER'].indexOf(decision) < 0) throw new Error('Unsupported decision');
    return {
      decision: decision,
      affected: ids.length,
      ids: copy_(ids),
      auditRecorded: true,
      reversibleBeforeCommit: true
    };
  }

  function evaluateCommitReadiness(input) {
    input = input || {};
    var validation = input.validation || buildValidationSummary(input);
    var duplicates = input.duplicates || detectDuplicates(input);
    var resolution = input.resolution || resolveEntities(input);
    var approvals = Number(input.approvals == null ? 2 : input.approvals);
    var unresolved = Number(resolution.unresolved || 0) + Number(validation.blockingIssues || 0);
    var ready = unresolved === 0 && approvals > 0 && !duplicates.reviewRequired;
    return {
      status: ready ? 'COMMIT_READY' : 'REVIEW_REQUIRED',
      approvals: approvals,
      unresolvedItems: unresolved + (duplicates.reviewRequired ? 1 : 0),
      validationPassed: validation.blockingIssues === 0,
      duplicateReviewComplete: !duplicates.reviewRequired,
      entityResolutionComplete: resolution.unresolved === 0,
      destructiveCommitEnabled: false,
      executionMode: 'PREVIEW_ONLY'
    };
  }

  function runReviewWorkspace(input) {
    input = input || {};
    var validation = buildValidationSummary(input.validationInput || input);
    var duplicates = detectDuplicates(input.duplicateInput || input);
    var resolution = resolveEntities(input.resolutionInput || input);
    var preview = buildCanonicalPreview(input.previewInput || input);
    var graph = buildGraphImpactPreview(input.graphInput || input);
    var readiness = evaluateCommitReadiness({
      validation: validation,
      duplicates: duplicates,
      resolution: resolution,
      approvals: input.approvals
    });
    return {
      workspace: 'data-review',
      workflowStatus: readiness.status,
      stage: 'ENTITY_RESOLUTION_REVIEW',
      validation: validation,
      duplicates: duplicates,
      resolution: resolution,
      canonicalPreview: preview,
      graphImpact: graph,
      commitReadiness: readiness,
      reviewRequired: true,
      lineagePreserved: true,
      destructiveCommitEnabled: false
    };
  }

  return {
    buildValidationSummary: buildValidationSummary,
    detectDuplicates: detectDuplicates,
    resolveEntities: resolveEntities,
    buildCanonicalPreview: buildCanonicalPreview,
    buildGraphImpactPreview: buildGraphImpactPreview,
    applyBulkDecision: applyBulkDecision,
    evaluateCommitReadiness: evaluateCommitReadiness,
    runReviewWorkspace: runReviewWorkspace
  };
})();
