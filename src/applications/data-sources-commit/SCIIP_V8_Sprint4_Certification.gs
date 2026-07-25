function sciipTestV8Sprint4GovernedCommitEventLedgerGraphSyncLiveRefresh() {
  var framework = 'SCIIP_V8_SPRINT4_GOVERNED_COMMIT_EVENT_LEDGER_GRAPH_SYNC_LIVE_REFRESH';
  var failures = [];
  var testsRun = 0;

  function assert_(condition, message) {
    testsRun += 1;
    if (!condition) failures.push(message);
  }

  var blockedPlan = SCIIP_V8_SPRINT4_GOVERNED_COMMIT_ENGINE.createPlan({
    approval: { status: 'PENDING' },
    review: { blockingIssues: 1, unresolvedEntities: 1 }
  });
  var blockedExecution = SCIIP_V8_SPRINT4_GOVERNED_COMMIT_ENGINE.execute(blockedPlan, { dryRun: true });
  var plan = SCIIP_V8_SPRINT4_GOVERNED_COMMIT_ENGINE.createPlan({
    approval: { status: 'APPROVED', approvedBy: 'certification-user' },
    review: { blockingIssues: 0, unresolvedEntities: 0 },
    rowsApproved: 239,
    rowsRejected: 1
  });
  var execution = SCIIP_V8_SPRINT4_GOVERNED_COMMIT_ENGINE.execute(plan, { dryRun: true });
  var ledger = SCIIP_V8_SPRINT4_GOVERNED_COMMIT_ENGINE.buildEventLedger(plan, execution);
  var graph = SCIIP_V8_SPRINT4_GOVERNED_COMMIT_ENGINE.synchronizeGraph(execution);
  var refresh = SCIIP_V8_SPRINT4_GOVERNED_COMMIT_ENGINE.publishRefresh(execution);
  var result = SCIIP_V8_SPRINT4_GOVERNED_COMMIT_ENGINE.assembleCommandCenter(plan, execution, ledger, graph, refresh);

  assert_(blockedPlan.status === 'REVIEW_REQUIRED', 'Unapproved plan must require review.');
  assert_(blockedExecution.status === 'BLOCKED_GOVERNANCE', 'Governance must block non-ready commits.');
  assert_(plan.status === 'COMMIT_READY', 'Approved clean plan must be commit-ready.');
  assert_(execution.status === 'DRY_RUN_COMPLETED', 'Certification must execute in dry-run mode.');
  assert_(execution.idempotent === true, 'Execution must be idempotent.');
  assert_(execution.duplicateSafe === true, 'Execution must be duplicate-safe.');
  assert_(ledger.length === 4, 'Four immutable events must be appended.');
  assert_(ledger.every(function (event) { return event.immutable === true; }), 'Ledger events must be immutable.');
  assert_(graph.status === 'SYNCHRONIZED', 'Knowledge graph must synchronize.');
  assert_(graph.orphanEdges === 0, 'Knowledge graph must not create orphan edges.');
  assert_(refresh.status === 'PUBLISHED', 'Refresh signals must publish.');
  assert_(refresh.workspaces.length === 5, 'Five workspaces must refresh.');
  assert_(result.lineagePreserved === true, 'Lineage must be preserved.');
  assert_(result.rollbackMetadataCaptured === true, 'Rollback metadata must be captured.');
  assert_(result.destructiveCommitEnabled === false, 'Destructive commit must remain disabled.');
  assert_(result.reviewRequired === false, 'Approved certification scenario must not require further review.');

  var output = {
    framework: framework,
    version: 'v8.0-sprint4.0',
    status: failures.length ? 'FAILED' : 'PASSED',
    testsRun: testsRun,
    failures: failures,
    result: result
  };

  console.log(JSON.stringify(output));
  return output;
}
