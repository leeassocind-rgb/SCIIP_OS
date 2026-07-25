function sciipTestV8Sprint3ValidationEntityResolutionReviewWorkspace() {
  var framework = 'SCIIP_V8_SPRINT3_VALIDATION_ENTITY_RESOLUTION_REVIEW_WORKSPACE';
  var version = 'v8.0-sprint3.0';
  var failures = [];
  var testsRun = 0;
  function test_(name, fn) { testsRun++; try { fn(); } catch (e) { failures.push({ test: name, error: String(e && e.message || e) }); } }
  function assert_(condition, message) { if (!condition) throw new Error(message); }

  var engine = SCIIP_V8_SPRINT3_REVIEW_ENGINE;
  var result;
  test_('EngineAvailable', function(){ assert_(!!engine, 'Review engine unavailable'); });
  test_('ValidationSummary', function(){ var x=engine.buildValidationSummary({rowsDiscovered:240}); assert_(x.rowsEvaluated===240 && x.issues===2, 'Validation summary mismatch'); });
  test_('DuplicateDetection', function(){ var x=engine.detectDuplicates({}); assert_(x.candidateCount===2 && x.highConfidence===1, 'Duplicate detection mismatch'); });
  test_('EntityResolution', function(){ var x=engine.resolveEntities({}); assert_(x.suggestionsCount===3 && x.unresolved===1, 'Entity resolution mismatch'); });
  test_('CanonicalPreview', function(){ var x=engine.buildCanonicalPreview({}); assert_(x.sourceAndCanonicalVisible && x.rowsPreviewed===2, 'Canonical preview mismatch'); });
  test_('GraphImpactPreview', function(){ var x=engine.buildGraphImpactPreview({}); assert_(x.newEdges===4 && x.destructiveGraphChanges===0, 'Graph preview mismatch'); });
  test_('BulkApprovalAudit', function(){ var x=engine.applyBulkDecision({decision:'APPROVE'}); assert_(x.auditRecorded && x.reversibleBeforeCommit, 'Bulk decision governance mismatch'); });
  test_('ReadinessBlocked', function(){ var x=engine.evaluateCommitReadiness({}); assert_(x.status==='REVIEW_REQUIRED' && !x.destructiveCommitEnabled, 'Readiness should be blocked'); });
  test_('ReadinessPassLogic', function(){ var x=engine.evaluateCommitReadiness({validation:{blockingIssues:0},duplicates:{reviewRequired:false},resolution:{unresolved:0},approvals:1}); assert_(x.status==='COMMIT_READY' && x.executionMode==='PREVIEW_ONLY', 'Readiness pass logic mismatch'); });
  test_('WorkspaceAssembly', function(){ result=engine.runReviewWorkspace({}); assert_(result.workspace==='data-review' && result.stage==='ENTITY_RESOLUTION_REVIEW', 'Workspace assembly mismatch'); });
  test_('LineagePreserved', function(){ assert_(result.lineagePreserved===true, 'Lineage must be preserved'); });
  test_('DestructiveCommitBlocked', function(){ assert_(result.destructiveCommitEnabled===false, 'Destructive commit must be disabled'); });
  test_('ReviewRequired', function(){ assert_(result.reviewRequired===true, 'Review must be required'); });
  test_('ResultMetrics', function(){ assert_(result.validation.rowsEvaluated===240 && result.graphImpact.newEdges===4, 'Result metrics mismatch'); });

  var output = {
    framework: framework,
    version: version,
    status: failures.length ? 'FAILED' : 'PASSED',
    testsRun: testsRun,
    failures: failures,
    result: failures.length ? null : {
      workspace: result.workspace,
      workflowStatus: result.workflowStatus,
      stage: result.stage,
      rowsEvaluated: result.validation.rowsEvaluated,
      validationIssues: result.validation.issues,
      blockingIssues: result.validation.blockingIssues,
      duplicateCandidates: result.duplicates.candidateCount,
      highConfidenceDuplicates: result.duplicates.highConfidence,
      entitySuggestions: result.resolution.suggestionsCount,
      unresolvedEntities: result.resolution.unresolved,
      graphNewNodes: result.graphImpact.newNodes,
      graphUpdatedNodes: result.graphImpact.updatedNodes,
      graphNewEdges: result.graphImpact.newEdges,
      commitReadiness: result.commitReadiness.status,
      reviewRequired: result.reviewRequired,
      lineagePreserved: result.lineagePreserved,
      destructiveCommitEnabled: result.destructiveCommitEnabled
    }
  };
  console.log(JSON.stringify(output));
  return output;
}
