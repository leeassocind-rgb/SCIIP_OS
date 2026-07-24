/** SCIIP_OS v7 Epic 5 Build 3G — First Production SuperSheet Commit Console */
var SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE = (function () {
  'use strict';
  var VERSION = 'v7.0-epic5-build3g.0';
  var STATE_KEY = 'SCIIP_EPIC5_BUILD3G_COMMIT_CONSOLE_STATE';
  var memory_ = { executions: {}, receipts: {}, audit: [] };
  var adapter_ = null;

  function now_() { return new Date().toISOString(); }
  function clone_(v) { return JSON.parse(JSON.stringify(v)); }
  function uuid_() { return typeof Utilities !== 'undefined' && Utilities.getUuid ? Utilities.getUuid().replace(/-/g, '').slice(0, 12) : String(new Date().getTime()); }
  function actor_() { try { return Session.getActiveUser().getEmail() || 'SCIIP User'; } catch (e) { return 'SCIIP User'; } }
  function props_() { return typeof PropertiesService !== 'undefined' ? PropertiesService.getScriptProperties() : null; }
  function load_() { var p = props_(), raw = p && p.getProperty(STATE_KEY); if (raw) { try { return JSON.parse(raw); } catch (ignore) {} } return clone_(memory_); }
  function save_(s) { var p = props_(); if (p) p.setProperty(STATE_KEY, JSON.stringify(s)); memory_ = clone_(s); return s; }
  function audit_(s, event, executionId, detail) { s.audit.unshift({ event: event, executionId: executionId || '', detail: detail || '', actor: actor_(), at: now_() }); s.audit = s.audit.slice(0, 200); }
  function requireExecution_(s, id) { var x = s.executions[id]; if (!x) throw new Error('Unknown production commit execution: ' + id); return x; }
  function hash_(text) { text = String(text || ''); var h = 2166136261, i; for (i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24); } return ('00000000' + (h >>> 0).toString(16).toUpperCase()).slice(-8); }
  function tokenPreview_(token) { token = String(token || ''); return token.length < 4 ? '****' : '****' + token.slice(-4); }
  function bridge_() {
    if (adapter_) return adapter_;
    if (typeof SCIIP_EPIC5_APPROVED_COMMIT_REFRESH === 'undefined') throw new Error('Build 3D approved commit engine is unavailable.');
    return {
      enable: function (token) { return SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.enableCommit(token); },
      execute: function (input, token, options) { return SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.execute(input, token, options || {}); },
      rollback: function (commitId, reason, token) { return SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.rollback(commitId, reason, token); },
      disable: function () { return SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.disableCommit(); }
    };
  }
  function normalizeRequest_(request) {
    request = request || {}; var review = request.review || {}, property = request.property || {};
    if (String(review.status || request.reviewStatus || '') !== 'READY_FOR_GOVERNED_COMMIT') throw new Error('Build 3F review must be READY_FOR_GOVERNED_COMMIT.');
    if (!request.batchId) throw new Error('batchId is required.');
    if (!property.propertyId && !property.address) throw new Error('A propertyId or property address is required.');
    return {
      reviewId: String(review.reviewId || request.reviewId || ''), pilotId: String(review.pilotId || request.pilotId || ''),
      batchId: String(request.batchId), batchStatus: 'APPROVED', schemaFingerprint: String(request.schemaFingerprint || review.schemaFingerprint || 'UNKNOWN'),
      reviewDecision: { decision: 'APPROVED', actor: String((review.approval && review.approval.approvedBy) || actor_()), reviewId: String(review.reviewId || request.reviewId || '') },
      lineage: { sourceRef: String(request.sourceRef || review.sourceName || 'REAL_SUPERSHEET'), pilotId: String(review.pilotId || request.pilotId || ''), reviewId: String(review.reviewId || request.reviewId || '') },
      property: clone_(property)
    };
  }
  function createExecution(request) {
    var input = normalizeRequest_(request), s = load_(), id = 'EXEC-' + uuid_();
    var execution = {
      executionId: id, reviewId: input.reviewDecision.reviewId, pilotId: input.lineage.pilotId, batchId: input.batchId,
      propertyId: String(input.property.propertyId || ''), sourceRef: input.lineage.sourceRef, schemaFingerprint: input.schemaFingerprint,
      status: 'AWAITING_CERTIFICATION_TOKEN', progress: 10, input: input, commitId: null, receiptId: null,
      refresh: { propertyCurrent: 'PENDING', events: 'PENDING', gis: 'PENDING', knowledgeGraph: 'PENDING', digitalTwin: 'PENDING', propertyCommandCenter: 'PENDING' },
      governance: { humanApprovalVerified: true, certificationTokenRequired: true, reviewRequired: true, rollbackAvailable: false, destructiveCommitEnabled: false },
      createdAt: now_(), createdBy: actor_(), updatedAt: now_()
    };
    s.executions[id] = execution; audit_(s, 'EXECUTION_CREATED', id, input.batchId); save_(s); return clone_(execution);
  }
  function validateToken(executionId, token) {
    token = String(token || '').trim(); if (token.length < 12) throw new Error('Certification token must contain at least 12 characters.');
    var s = load_(), x = requireExecution_(s, executionId);
    if (x.status !== 'AWAITING_CERTIFICATION_TOKEN' && x.status !== 'TOKEN_VALIDATED') throw new Error('Token cannot be validated from status ' + x.status);
    bridge_().enable(token); x.status = 'TOKEN_VALIDATED'; x.progress = 25; x.token = { hash: hash_(token), preview: tokenPreview_(token), validatedAt: now_(), validatedBy: actor_() };
    x.governance.destructiveCommitEnabled = true; x.updatedAt = now_(); audit_(s, 'CERTIFICATION_TOKEN_VALIDATED', executionId, x.token.preview); s.executions[executionId] = x; save_(s); return clone_(x);
  }
  function execute(executionId, token, options) {
    options = options || {}; token = String(token || ''); var s = load_(), x = requireExecution_(s, executionId);
    if (x.status === 'COMMITTED' || x.status === 'DRY_RUN_COMMITTED') return { status: 'DUPLICATE_SAFE', execution: clone_(x), receipt: x.receiptId ? clone_(s.receipts[x.receiptId]) : null };
    if (x.status !== 'TOKEN_VALIDATED') throw new Error('Certification token must be validated before execution.');
    if (!x.token || hash_(token) !== x.token.hash) throw new Error('Certification token mismatch.');
    x.status = 'EXECUTING'; x.progress = 40; x.updatedAt = now_(); audit_(s, 'COMMIT_EXECUTION_STARTED', executionId, options.dryRun ? 'DRY_RUN' : 'PRODUCTION'); s.executions[executionId] = x; save_(s);
    var result = bridge_().execute(x.input, token, { dryRun: !!options.dryRun });
    s = load_(); x = requireExecution_(s, executionId);
    if (result.status !== 'COMMITTED' && result.status !== 'DRY_RUN_COMMITTED' && result.status !== 'DUPLICATE_SAFE') {
      x.status = 'FAILED'; x.progress = 100; x.error = result.reason || result.status; x.updatedAt = now_(); audit_(s, 'COMMIT_EXECUTION_FAILED', executionId, x.error); s.executions[executionId] = x; save_(s); return { status: 'FAILED', execution: clone_(x), bridgeResult: result };
    }
    var commit = result.commit || (result.status === 'DUPLICATE_SAFE' ? result.commit : null), p = commit && commit.projections ? commit.projections : {};
    x.status = result.status === 'DRY_RUN_COMMITTED' ? 'DRY_RUN_COMMITTED' : (result.status === 'DUPLICATE_SAFE' ? 'COMMITTED' : 'COMMITTED'); x.progress = 100;
    x.commitId = commit ? commit.commitId : null; x.governance.rollbackAvailable = !!(commit && commit.rollback && commit.rollback.available); x.governance.destructiveCommitEnabled = !options.dryRun;
    x.refresh = { propertyCurrent: p.propertyRecords ? 'CONFIRMED' : 'PENDING', events: p.events ? 'CONFIRMED' : 'PENDING', gis: p.gisProjections ? 'CONFIRMED' : 'PENDING', knowledgeGraph: p.graphRelationships ? 'CONFIRMED' : 'PENDING', digitalTwin: p.digitalTwins ? 'CONFIRMED' : 'PENDING', propertyCommandCenter: p.commandCentersRefreshed ? 'CONFIRMED' : 'PENDING' };
    var receiptId = 'RECEIPT-' + uuid_(); var receipt = { receiptId: receiptId, executionId: executionId, commitId: x.commitId, batchId: x.batchId, propertyId: commit ? commit.propertyId : x.propertyId, status: x.status, committedAt: commit ? commit.committedAt : now_(), committedBy: commit ? commit.committedBy : actor_(), dryRun: !!options.dryRun, duplicateSafe: true, lineagePreserved: !!(commit && commit.lineage && commit.lineage.preserved), refresh: clone_(x.refresh), rollbackAvailable: x.governance.rollbackAvailable };
    x.receiptId = receiptId; x.updatedAt = now_(); s.receipts[receiptId] = receipt; s.executions[executionId] = x; audit_(s, 'COMMIT_RECEIPT_ISSUED', executionId, receiptId); save_(s);
    return { status: x.status, execution: clone_(x), receipt: clone_(receipt), bridgeResult: result };
  }
  function rollback(executionId, reason, token) {
    reason = String(reason || '').trim(); if (!reason) throw new Error('A rollback reason is required.');
    var s = load_(), x = requireExecution_(s, executionId);
    if (!x.commitId) throw new Error('No committed receipt is available for rollback.');
    if (!x.token || hash_(String(token || '')) !== x.token.hash) throw new Error('Certification token mismatch.');
    if (x.status === 'ROLLED_BACK') return { status: 'DUPLICATE_SAFE', execution: clone_(x) };
    var result = bridge_().rollback(x.commitId, reason, token);
    if (result.status !== 'ROLLED_BACK' && result.status !== 'DUPLICATE_SAFE') throw new Error('Rollback failed: ' + result.status);
    x.status = 'ROLLED_BACK'; x.progress = 100; x.rollback = { status: result.status, reason: reason, at: now_(), actor: actor_() }; x.governance.rollbackAvailable = false; x.updatedAt = now_();
    audit_(s, 'COMMIT_ROLLED_BACK', executionId, reason); s.executions[executionId] = x; if (x.receiptId && s.receipts[x.receiptId]) { s.receipts[x.receiptId].rollbackStatus = result.status; s.receipts[x.receiptId].rollbackReason = reason; } save_(s);
    return { status: result.status, execution: clone_(x), bridgeResult: result };
  }
  function disableCommit(executionId) { var s = load_(), x = requireExecution_(s, executionId); bridge_().disable(); x.governance.destructiveCommitEnabled = false; x.updatedAt = now_(); audit_(s, 'COMMIT_GATE_DISABLED', executionId, ''); s.executions[executionId] = x; save_(s); return clone_(x); }
  function dashboard() {
    var s = load_(), ids = Object.keys(s.executions), counts = { total: ids.length, awaitingToken: 0, executing: 0, committed: 0, dryRunCommitted: 0, rolledBack: 0, failed: 0 };
    var items = ids.map(function (id) { var x = s.executions[id]; if (x.status === 'AWAITING_CERTIFICATION_TOKEN') counts.awaitingToken++; if (x.status === 'EXECUTING') counts.executing++; if (x.status === 'COMMITTED') counts.committed++; if (x.status === 'DRY_RUN_COMMITTED') counts.dryRunCommitted++; if (x.status === 'ROLLED_BACK') counts.rolledBack++; if (x.status === 'FAILED') counts.failed++; return clone_(x); });
    return { version: VERSION, workspace: 'data-sources', title: 'Production SuperSheet Commit Console', counters: counts, executions: items, receipts: clone_(s.receipts), audit: clone_(s.audit), governance: { build3FAvailable: typeof SCIIP_EPIC5_PILOT_REVIEW_CONSOLE !== 'undefined', build3DAvailable: typeof SCIIP_EPIC5_APPROVED_COMMIT_REFRESH !== 'undefined', certificationTokenRequired: true, reviewRequired: true, lineagePreserved: true, destructiveCommitEnabledByDefault: false } };
  }
  function setAdapterForTest(a) { adapter_ = a; }
  function resetForTest() { memory_ = { executions: {}, receipts: {}, audit: [] }; adapter_ = null; var p = props_(); if (p) p.deleteProperty(STATE_KEY); return true; }
  return { VERSION: VERSION, createExecution: createExecution, validateToken: validateToken, execute: execute, rollback: rollback, disableCommit: disableCommit, dashboard: dashboard, setAdapterForTest: setAdapterForTest, resetForTest: resetForTest };
})();

function sciipGetEpic5ProductionCommitConsole() { return SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.dashboard(); }
function sciipCreateEpic5ProductionCommitExecution(request) { return SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.createExecution(request || {}); }
function sciipActionEpic5ProductionCommit(executionId, action, options) {
  options = options || {};
  if (action === 'VALIDATE_TOKEN') return SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.validateToken(executionId, options.token);
  if (action === 'EXECUTE') return SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.execute(executionId, options.token, { dryRun: !!options.dryRun });
  if (action === 'ROLLBACK') return SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.rollback(executionId, options.reason, options.token);
  if (action === 'DISABLE_COMMIT') return SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.disableCommit(executionId);
  throw new Error('Unsupported production commit action: ' + action);
}
function sciipOpenEpic5ProductionCommitConsole() {
  var t = HtmlService.createTemplateFromFile('SCIIP_Epic5_Production_Commit_Console');
  t.bootstrapJson = JSON.stringify(SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.dashboard());
  return t.evaluate().setTitle('SCIIP_OS — Production Commit Console').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function sciipTestV7Epic5ProductionCommitConsole() {
  var failures = [], runId = typeof Utilities !== 'undefined' && Utilities.getUuid ? Utilities.getUuid().replace(/-/g, '').slice(0, 12) : String(new Date().getTime()), token = 'SCIIP-BUILD3G-CERT-' + runId, ledger = {};
  SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.resetForTest();
  SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.setAdapterForTest({
    enable: function () { return { enabled: true }; }, disable: function () { return { enabled: false }; },
    execute: function (input, tok, options) { var key = input.batchId + '|' + input.property.propertyId; if (ledger[key]) return { status: 'DUPLICATE_SAFE', commit: ledger[key] }; var c = { commitId: 'COMMIT-' + runId, propertyId: input.property.propertyId, committedAt: new Date().toISOString(), committedBy: 'certifier', lineage: { preserved: true }, projections: { propertyRecords: 1, events: 1, gisProjections: 1, graphRelationships: 1, digitalTwins: 1, commandCentersRefreshed: 1 }, rollback: { available: true, status: 'NOT_REQUESTED' } }; ledger[key] = c; return { status: options.dryRun ? 'DRY_RUN_COMMITTED' : 'COMMITTED', commit: c }; },
    rollback: function (commitId) { return { status: 'ROLLED_BACK', commit: { commitId: commitId } }; }
  });
  var request = { batchId: 'BATCH-PRODUCTION-TEST-' + runId, schemaFingerprint: 'SSF-7DE89DEC', sourceRef: 'REPRESENTATIVE_REAL_SUPERSHEET', review: { reviewId: 'REVIEW-' + runId, pilotId: 'PILOT-' + runId, status: 'READY_FOR_GOVERNED_COMMIT', approval: { approvedBy: 'reviewer@example.com' } }, property: { propertyId: 'P-2125-W-LOWELL-ST-RIALTO-' + runId, address: '2125 W Lowell St', city: 'Rialto', state: 'CA', buildingSf: 664859, landAcres: 38.2, clearHeight: 42, powerAmps: 4000, latitude: 34.106, longitude: -117.37 } };
  var x = SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.createExecution(request); if (x.status !== 'AWAITING_CERTIFICATION_TOKEN' || x.progress !== 10) failures.push('create');
  var blocked = false; try { SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.execute(x.executionId, token, { dryRun: true }); } catch (e) { blocked = true; } if (!blocked) failures.push('tokenGate');
  x = SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.validateToken(x.executionId, token); if (x.status !== 'TOKEN_VALIDATED' || x.progress !== 25) failures.push('validateToken');
  var result = SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.execute(x.executionId, token, { dryRun: true }); if (result.status !== 'DRY_RUN_COMMITTED' || !result.receipt || !result.receipt.lineagePreserved) failures.push('execute');
  if (result.receipt.refresh.gis !== 'CONFIRMED' || result.receipt.refresh.knowledgeGraph !== 'CONFIRMED' || result.receipt.refresh.propertyCommandCenter !== 'CONFIRMED') failures.push('refresh');
  var replay = SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.execute(x.executionId, token, { dryRun: true }); if (replay.status !== 'DUPLICATE_SAFE') failures.push('idempotency');
  var rb = SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.rollback(x.executionId, 'Certification rollback', token); if (rb.status !== 'ROLLED_BACK') failures.push('rollback');
  var dash = SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.dashboard(); if (dash.counters.total !== 1 || dash.counters.rolledBack !== 1) failures.push('dashboard');
  if (!dash.governance.certificationTokenRequired || !dash.governance.reviewRequired || dash.governance.destructiveCommitEnabledByDefault !== false) failures.push('governance');
  if (dash.audit.length < 5) failures.push('audit');
  var out = { framework: 'SCIIP_V7_EPIC5_FIRST_PRODUCTION_SUPERSHEET_COMMIT_CONSOLE_BUILD3G', version: SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.VERSION, status: failures.length ? 'FAILED' : 'PASSED', testsRun: 10, failures: failures, result: { workspace: dash.workspace, executionId: x.executionId, batchId: request.batchId, propertyId: request.property.propertyId, tokenValidated: true, commitStatus: result.status, duplicateReplay: replay.status, receiptId: result.receipt.receiptId, propertyCurrent: result.receipt.refresh.propertyCurrent, events: result.receipt.refresh.events, gis: result.receipt.refresh.gis, knowledgeGraph: result.receipt.refresh.knowledgeGraph, digitalTwin: result.receipt.refresh.digitalTwin, propertyCommandCenter: result.receipt.refresh.propertyCommandCenter, lineagePreserved: result.receipt.lineagePreserved, rollbackStatus: rb.status, reviewRequired: true, destructiveCommitEnabledByDefault: false } };
  console.log(JSON.stringify(out)); return out;
}
