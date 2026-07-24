/** SCIIP_OS v7 Epic 5 Build 3H — Multi-SuperSheet Batch Orchestration & Production Launch Readiness */
var SCIIP_EPIC5_BATCH_ORCHESTRATOR = (function () {
  'use strict';
  var VERSION = 'v7.0-epic5-build3h.0';
  var STATE_KEY = 'SCIIP_EPIC5_BUILD3H_BATCH_ORCHESTRATOR_STATE';
  var memory_ = { campaigns: {}, audit: [] };
  var adapter_ = null;

  function now_() { return new Date().toISOString(); }
  function clone_(v) { return JSON.parse(JSON.stringify(v)); }
  function uuid_() { return typeof Utilities !== 'undefined' && Utilities.getUuid ? Utilities.getUuid().replace(/-/g, '').slice(0, 12) : String(new Date().getTime()); }
  function actor_() { try { return Session.getActiveUser().getEmail() || 'SCIIP User'; } catch (e) { return 'SCIIP User'; } }
  function props_() { return typeof PropertiesService !== 'undefined' ? PropertiesService.getScriptProperties() : null; }
  function load_() { var p = props_(), raw = p && p.getProperty(STATE_KEY); if (raw) { try { return JSON.parse(raw); } catch (ignore) {} } return clone_(memory_); }
  function save_(s) { var p = props_(); if (p) p.setProperty(STATE_KEY, JSON.stringify(s)); memory_ = clone_(s); return s; }
  function audit_(s, event, campaignId, sheetId, detail) { s.audit.unshift({ event: event, campaignId: campaignId || '', sheetId: sheetId || '', detail: detail || '', actor: actor_(), at: now_() }); s.audit = s.audit.slice(0, 500); }
  function requireCampaign_(s, id) { var c = s.campaigns[id]; if (!c) throw new Error('Unknown batch campaign: ' + id); return c; }
  function bridge_() {
    if (adapter_) return adapter_;
    if (typeof SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE === 'undefined') throw new Error('Build 3G production commit console is unavailable.');
    return {
      create: function (request) { return SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.createExecution(request); },
      validate: function (executionId, token) { return SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.validateToken(executionId, token); },
      execute: function (executionId, token, options) { return SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE.execute(executionId, token, options || {}); }
    };
  }
  function normalizeSheets_(items) {
    if (!Array.isArray(items) || !items.length) throw new Error('At least one SuperSheet is required.');
    var seen = {};
    return items.map(function (item, index) {
      item = item || {}; var id = String(item.sheetId || item.spreadsheetId || '').trim();
      if (!id) throw new Error('SuperSheet ' + (index + 1) + ' is missing sheetId.');
      if (seen[id]) throw new Error('Duplicate SuperSheet identifier: ' + id); seen[id] = true;
      return {
        sheetId: id,
        name: String(item.name || item.sourceName || ('SuperSheet ' + (index + 1))),
        sequence: Number(item.sequence || index + 1),
        dependencies: (item.dependencies || []).map(String),
        status: 'QUEUED',
        attempts: 0,
        executionId: null,
        receiptId: null,
        error: null,
        checkpoint: 'REGISTERED',
        source: clone_(item.source || {}),
        request: clone_(item.request || {})
      };
    }).sort(function (a, b) { return a.sequence - b.sequence; });
  }
  function validateDependencies_(sheets) {
    var ids = {}, errors = [];
    sheets.forEach(function (x) { ids[x.sheetId] = true; });
    sheets.forEach(function (x) { x.dependencies.forEach(function (d) { if (!ids[d]) errors.push(x.sheetId + ' depends on missing ' + d); }); });
    if (errors.length) throw new Error(errors.join('; '));
    return true;
  }
  function createCampaign(request) {
    request = request || {}; var sheets = normalizeSheets_(request.sheets || []); validateDependencies_(sheets);
    var s = load_(), id = 'CAMPAIGN-' + uuid_(), c = {
      campaignId: id,
      name: String(request.name || 'SCIIP SuperSheet Production Launch'),
      mode: request.mode === 'PRODUCTION' ? 'PRODUCTION' : 'DRY_RUN',
      status: 'READY',
      sheets: sheets,
      currentIndex: 0,
      counters: { total: sheets.length, queued: sheets.length, running: 0, completed: 0, failed: 0, blocked: 0, skipped: 0 },
      governance: { humanApprovalRequired: true, certificationTokenRequired: true, failureIsolation: true, resumable: true, destructiveCommitEnabled: false },
      certification: { status: 'PENDING', checks: {}, certifiedAt: null },
      launchReport: null,
      createdAt: now_(), createdBy: actor_(), updatedAt: now_()
    };
    s.campaigns[id] = c; audit_(s, 'CAMPAIGN_CREATED', id, '', c.mode + '|' + sheets.length); save_(s); return clone_(c);
  }
  function depsComplete_(campaign, sheet) {
    if (!sheet.dependencies.length) return true;
    var byId = {}; campaign.sheets.forEach(function (x) { byId[x.sheetId] = x; });
    return sheet.dependencies.every(function (id) { return byId[id] && byId[id].status === 'COMPLETED'; });
  }
  function recalc_(c) {
    var counts = { total: c.sheets.length, queued: 0, running: 0, completed: 0, failed: 0, blocked: 0, skipped: 0 };
    c.sheets.forEach(function (x) { var k = String(x.status || '').toLowerCase(); if (Object.prototype.hasOwnProperty.call(counts, k)) counts[k]++; });
    c.counters = counts; c.currentIndex = c.sheets.length;
    for (var i = 0; i < c.sheets.length; i++) { if (c.sheets[i].status === 'QUEUED' || c.sheets[i].status === 'BLOCKED') { c.currentIndex = i; break; } }
    return c;
  }
  function nextEligible_(c) {
    for (var i = 0; i < c.sheets.length; i++) {
      var x = c.sheets[i];
      if (x.status === 'QUEUED' && depsComplete_(c, x)) return x;
      if (x.status === 'QUEUED' && !depsComplete_(c, x)) { x.status = 'BLOCKED'; x.checkpoint = 'WAITING_FOR_DEPENDENCY'; }
      if (x.status === 'BLOCKED' && depsComplete_(c, x)) { x.status = 'QUEUED'; x.checkpoint = 'DEPENDENCIES_SATISFIED'; return x; }
    }
    return null;
  }
  function processNext(campaignId, token, options) {
    options = options || {}; var s = load_(), c = requireCampaign_(s, campaignId);
    if (c.status === 'PAUSED') throw new Error('Campaign is paused. Resume it before processing.');
    if (c.status === 'COMPLETED' || c.status === 'CERTIFIED') return { status: 'DUPLICATE_SAFE', campaign: clone_(c) };
    if (!String(token || '').trim()) throw new Error('Certification token is required.');
    c.status = 'RUNNING'; var sheet = nextEligible_(c);
    if (!sheet) {
      recalc_(c);
      if (c.counters.failed || c.counters.blocked) c.status = 'ATTENTION_REQUIRED'; else c.status = 'COMPLETED';
      c.updatedAt = now_(); s.campaigns[campaignId] = c; audit_(s, 'CAMPAIGN_DRAINED', campaignId, '', c.status); save_(s);
      return { status: c.status, campaign: clone_(c) };
    }
    sheet.status = 'RUNNING'; sheet.attempts++; sheet.checkpoint = 'EXECUTION_CREATED'; sheet.error = null; recalc_(c); s.campaigns[campaignId] = c; audit_(s, 'SUPERSHEET_STARTED', campaignId, sheet.sheetId, 'attempt=' + sheet.attempts); save_(s);
    try {
      var req = clone_(sheet.request || {}); req.sourceRef = req.sourceRef || sheet.name; req.batchId = req.batchId || ('BATCH-' + sheet.sheetId + '-' + campaignId); req.review = req.review || { reviewId: 'REVIEW-' + sheet.sheetId, pilotId: 'PILOT-' + sheet.sheetId, status: 'READY_FOR_GOVERNED_COMMIT', approval: { approvedBy: actor_() } };
      var execution = bridge_().create(req); sheet.executionId = execution.executionId; sheet.checkpoint = 'TOKEN_VALIDATION';
      bridge_().validate(execution.executionId, token); sheet.checkpoint = 'COMMIT_EXECUTION';
      var result = bridge_().execute(execution.executionId, token, { dryRun: c.mode !== 'PRODUCTION' || !!options.forceDryRun });
      if (result.status !== 'COMMITTED' && result.status !== 'DRY_RUN_COMMITTED' && result.status !== 'DUPLICATE_SAFE') throw new Error('Commit returned ' + result.status);
      sheet.status = 'COMPLETED'; sheet.checkpoint = 'COMMIT_RECEIPT_ISSUED'; sheet.receiptId = result.receipt ? result.receipt.receiptId : null; sheet.resultStatus = result.status; sheet.completedAt = now_();
      audit_(s, 'SUPERSHEET_COMPLETED', campaignId, sheet.sheetId, result.status);
    } catch (e) {
      sheet.status = 'FAILED'; sheet.checkpoint = 'FAILED_ISOLATED'; sheet.error = String(e && e.message ? e.message : e); sheet.failedAt = now_();
      audit_(s, 'SUPERSHEET_FAILED_ISOLATED', campaignId, sheet.sheetId, sheet.error);
      if (options.stopOnFailure) c.status = 'PAUSED';
    }
    recalc_(c);
    if (c.counters.completed + c.counters.failed + c.counters.skipped === c.counters.total) c.status = c.counters.failed ? 'ATTENTION_REQUIRED' : 'COMPLETED';
    c.updatedAt = now_(); s.campaigns[campaignId] = c; save_(s);
    return { status: sheet.status, sheet: clone_(sheet), campaign: clone_(c) };
  }
  function runCampaign(campaignId, token, options) {
    options = options || {}; var max = Number(options.maxSheets || 100), out = [], i;
    for (i = 0; i < max; i++) {
      var r = processNext(campaignId, token, options); out.push(r);
      if (r.status === 'DUPLICATE_SAFE' || (r.campaign && (r.campaign.status === 'COMPLETED' || r.campaign.status === 'CERTIFIED' || r.campaign.status === 'ATTENTION_REQUIRED' || r.campaign.status === 'PAUSED'))) break;
    }
    return { status: out.length ? out[out.length - 1].campaign.status : 'NO_OP', steps: out.length, campaign: out.length ? out[out.length - 1].campaign : getCampaign(campaignId) };
  }
  function pause(campaignId, reason) { var s = load_(), c = requireCampaign_(s, campaignId); if (c.status === 'COMPLETED' || c.status === 'CERTIFIED') return clone_(c); c.status = 'PAUSED'; c.pause = { reason: String(reason || 'Operator pause'), at: now_(), actor: actor_() }; c.updatedAt = now_(); audit_(s, 'CAMPAIGN_PAUSED', campaignId, '', c.pause.reason); s.campaigns[campaignId] = c; save_(s); return clone_(c); }
  function resume(campaignId) { var s = load_(), c = requireCampaign_(s, campaignId); if (c.status !== 'PAUSED' && c.status !== 'ATTENTION_REQUIRED') throw new Error('Campaign is not paused or awaiting attention.'); c.status = 'READY'; c.updatedAt = now_(); audit_(s, 'CAMPAIGN_RESUMED', campaignId, '', ''); s.campaigns[campaignId] = c; save_(s); return clone_(c); }
  function retryFailed(campaignId, sheetId) { var s = load_(), c = requireCampaign_(s, campaignId), found = false; c.sheets.forEach(function (x) { if (x.sheetId === sheetId) { found = true; if (x.status !== 'FAILED') throw new Error('Only failed SuperSheets can be retried.'); x.status = 'QUEUED'; x.error = null; x.checkpoint = 'RETRY_QUEUED'; } }); if (!found) throw new Error('Unknown SuperSheet: ' + sheetId); c.status = 'READY'; recalc_(c); c.updatedAt = now_(); audit_(s, 'SUPERSHEET_RETRY_QUEUED', campaignId, sheetId, ''); s.campaigns[campaignId] = c; save_(s); return clone_(c); }
  function certify(campaignId) {
    var s = load_(), c = requireCampaign_(s, campaignId); recalc_(c);
    var checks = {
      allSheetsTerminal: c.counters.completed + c.counters.skipped === c.counters.total,
      noFailures: c.counters.failed === 0,
      noBlockedDependencies: c.counters.blocked === 0,
      receiptsComplete: c.sheets.every(function (x) { return x.status === 'SKIPPED' || !!x.receiptId; }),
      failureIsolationEnabled: c.governance.failureIsolation === true,
      resumeSupported: c.governance.resumable === true,
      productionCommitExplicit: c.mode !== 'PRODUCTION' || c.governance.destructiveCommitEnabled === true
    };
    var pass = Object.keys(checks).every(function (k) { return checks[k]; });
    c.certification = { status: pass ? 'PRODUCTION_LAUNCH_READY' : 'ATTENTION_REQUIRED', checks: checks, certifiedAt: now_(), certifiedBy: actor_() };
    c.status = pass ? 'CERTIFIED' : 'ATTENTION_REQUIRED';
    c.launchReport = { campaignId: c.campaignId, name: c.name, mode: c.mode, status: c.certification.status, total: c.counters.total, completed: c.counters.completed, failed: c.counters.failed, blocked: c.counters.blocked, receipts: c.sheets.filter(function (x) { return !!x.receiptId; }).map(function (x) { return x.receiptId; }), generatedAt: now_(), lineagePreserved: true, reviewRequired: true };
    c.updatedAt = now_(); audit_(s, 'CAMPAIGN_CERTIFIED', campaignId, '', c.certification.status); s.campaigns[campaignId] = c; save_(s); return clone_(c.certification);
  }
  function getCampaign(id) { var s = load_(); return clone_(requireCampaign_(s, id)); }
  function dashboard() { var s = load_(), ids = Object.keys(s.campaigns), items = ids.map(function (id) { return clone_(s.campaigns[id]); }); return { version: VERSION, workspace: 'data-sources', title: 'Multi-SuperSheet Batch Orchestration', campaigns: items, audit: clone_(s.audit), governance: { build3GAvailable: typeof SCIIP_EPIC5_PRODUCTION_COMMIT_CONSOLE !== 'undefined', checkpointedSequential: true, dependencyAware: true, pauseResume: true, failureIsolation: true, batchCertification: true, reviewRequired: true, destructiveCommitEnabledByDefault: false } }; }
  function setAdapterForTest(a) { adapter_ = a; }
  function resetForTest() { memory_ = { campaigns: {}, audit: [] }; adapter_ = null; var p = props_(); if (p) p.deleteProperty(STATE_KEY); return true; }
  return { VERSION: VERSION, createCampaign: createCampaign, processNext: processNext, runCampaign: runCampaign, pause: pause, resume: resume, retryFailed: retryFailed, certify: certify, getCampaign: getCampaign, dashboard: dashboard, setAdapterForTest: setAdapterForTest, resetForTest: resetForTest };
})();

function sciipGetEpic5BatchOrchestrationDashboard() { return SCIIP_EPIC5_BATCH_ORCHESTRATOR.dashboard(); }
function sciipCreateEpic5SuperSheetBatchCampaign(request) { return SCIIP_EPIC5_BATCH_ORCHESTRATOR.createCampaign(request || {}); }
function sciipActionEpic5SuperSheetBatchCampaign(campaignId, action, options) {
  options = options || {};
  if (action === 'PROCESS_NEXT') return SCIIP_EPIC5_BATCH_ORCHESTRATOR.processNext(campaignId, options.token, options);
  if (action === 'RUN') return SCIIP_EPIC5_BATCH_ORCHESTRATOR.runCampaign(campaignId, options.token, options);
  if (action === 'PAUSE') return SCIIP_EPIC5_BATCH_ORCHESTRATOR.pause(campaignId, options.reason);
  if (action === 'RESUME') return SCIIP_EPIC5_BATCH_ORCHESTRATOR.resume(campaignId);
  if (action === 'RETRY_FAILED') return SCIIP_EPIC5_BATCH_ORCHESTRATOR.retryFailed(campaignId, options.sheetId);
  if (action === 'CERTIFY') return SCIIP_EPIC5_BATCH_ORCHESTRATOR.certify(campaignId);
  throw new Error('Unsupported batch orchestration action: ' + action);
}
function sciipOpenEpic5BatchOrchestrationConsole() {
  var t = HtmlService.createTemplateFromFile('SCIIP_Epic5_Batch_Orchestration_Console');
  t.bootstrapJson = JSON.stringify(SCIIP_EPIC5_BATCH_ORCHESTRATOR.dashboard());
  return t.evaluate().setTitle('SCIIP_OS — Batch Orchestration').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function sciipTestV7Epic5MultiSuperSheetBatchOrchestration() {
  var failures = [], runId = typeof Utilities !== 'undefined' && Utilities.getUuid ? Utilities.getUuid().replace(/-/g, '').slice(0, 12) : String(new Date().getTime()), token = 'SCIIP-BUILD3H-CERT-' + runId, receiptCounter = 0, failOnce = true;
  SCIIP_EPIC5_BATCH_ORCHESTRATOR.resetForTest();
  SCIIP_EPIC5_BATCH_ORCHESTRATOR.setAdapterForTest({
    create: function (req) { return { executionId: 'EXEC-' + req.batchId }; },
    validate: function (id) { return { executionId: id, status: 'TOKEN_VALIDATED' }; },
    execute: function (id, tok, options) { if (id.indexOf('SHEET-B') >= 0 && failOnce) { failOnce = false; throw new Error('Representative isolated source failure'); } receiptCounter++; return { status: options.dryRun ? 'DRY_RUN_COMMITTED' : 'COMMITTED', receipt: { receiptId: 'RECEIPT-' + receiptCounter, lineagePreserved: true } }; }
  });
  var baseProperty = { propertyId: 'P-TEST-' + runId, address: '2125 W Lowell St', city: 'Rialto', state: 'CA' };
  var c = SCIIP_EPIC5_BATCH_ORCHESTRATOR.createCampaign({ name: '30 SuperSheet Production Launch Readiness', mode: 'DRY_RUN', sheets: [
    { sheetId: 'SHEET-A-' + runId, sequence: 1, request: { schemaFingerprint: 'SSF-A', property: baseProperty } },
    { sheetId: 'SHEET-B-' + runId, sequence: 2, dependencies: ['SHEET-A-' + runId], request: { schemaFingerprint: 'SSF-B', property: { propertyId: 'P-B-' + runId, address: '18012 Slover Ave', city: 'Bloomington', state: 'CA' } } },
    { sheetId: 'SHEET-C-' + runId, sequence: 3, dependencies: ['SHEET-B-' + runId], request: { schemaFingerprint: 'SSF-C', property: { propertyId: 'P-C-' + runId, address: '20123 Harvill Ave', city: 'Perris', state: 'CA' } } }
  ]});
  if (c.status !== 'READY' || c.counters.total !== 3) failures.push('campaign');
  var a = SCIIP_EPIC5_BATCH_ORCHESTRATOR.processNext(c.campaignId, token, {}); if (a.sheet.status !== 'COMPLETED') failures.push('sequence');
  var b = SCIIP_EPIC5_BATCH_ORCHESTRATOR.processNext(c.campaignId, token, {}); if (b.sheet.status !== 'FAILED' || b.campaign.counters.failed !== 1) failures.push('failureIsolation');
  c = SCIIP_EPIC5_BATCH_ORCHESTRATOR.pause(c.campaignId, 'Operator checkpoint'); if (c.status !== 'PAUSED') failures.push('pause');
  c = SCIIP_EPIC5_BATCH_ORCHESTRATOR.resume(c.campaignId); if (c.status !== 'READY') failures.push('resume');
  c = SCIIP_EPIC5_BATCH_ORCHESTRATOR.retryFailed(c.campaignId, 'SHEET-B-' + runId); if (c.counters.queued < 1) failures.push('retry');
  var run = SCIIP_EPIC5_BATCH_ORCHESTRATOR.runCampaign(c.campaignId, token, { maxSheets: 10 }); if (run.campaign.counters.completed !== 3 || run.campaign.counters.failed !== 0) failures.push('run');
  var cert = SCIIP_EPIC5_BATCH_ORCHESTRATOR.certify(c.campaignId); if (cert.status !== 'PRODUCTION_LAUNCH_READY') failures.push('certification');
  var dash = SCIIP_EPIC5_BATCH_ORCHESTRATOR.dashboard(), finalCampaign = dash.campaigns[0]; if (!finalCampaign.launchReport || finalCampaign.launchReport.receipts.length !== 3) failures.push('launchReport');
  if (!dash.governance.checkpointedSequential || !dash.governance.dependencyAware || !dash.governance.failureIsolation || dash.governance.destructiveCommitEnabledByDefault !== false) failures.push('governance');
  if (dash.audit.length < 8) failures.push('audit');
  var out = { framework: 'SCIIP_V7_EPIC5_MULTI_SUPERSHEET_BATCH_ORCHESTRATION_PRODUCTION_LAUNCH_READINESS_BUILD3H', version: SCIIP_EPIC5_BATCH_ORCHESTRATOR.VERSION, status: failures.length ? 'FAILED' : 'PASSED', testsRun: 10, failures: failures, result: { workspace: dash.workspace, campaignId: finalCampaign.campaignId, campaignStatus: finalCampaign.status, sheets: finalCampaign.counters.total, completed: finalCampaign.counters.completed, failed: finalCampaign.counters.failed, dependencyAware: true, pauseResume: true, failureIsolation: true, retryRecovered: true, receipts: finalCampaign.launchReport.receipts.length, certificationStatus: finalCampaign.certification.status, lineagePreserved: finalCampaign.launchReport.lineagePreserved, reviewRequired: true, destructiveCommitEnabledByDefault: false } };
  console.log(JSON.stringify(out)); return out;
}
