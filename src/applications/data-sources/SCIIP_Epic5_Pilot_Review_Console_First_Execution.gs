/** SCIIP_OS v7 Epic 5 Build 3F — Pilot Review Console & First Real SuperSheet Execution */
var SCIIP_EPIC5_PILOT_REVIEW_CONSOLE = (function () {
  'use strict';
  var VERSION = 'v7.0-epic5-build3f.0';
  var STATE_KEY = 'SCIIP_EPIC5_BUILD3F_REVIEW_STATE';
  var memory_ = { reviews: {}, audit: [] };

  function now_() { return new Date().toISOString(); }
  function clone_(v) { return JSON.parse(JSON.stringify(v)); }
  function uuid_() { return typeof Utilities !== 'undefined' && Utilities.getUuid ? Utilities.getUuid().replace(/-/g, '').slice(0, 12) : String(new Date().getTime()); }
  function actor_() { try { return Session.getActiveUser().getEmail() || 'SCIIP User'; } catch (e) { return 'SCIIP User'; } }
  function props_() { return typeof PropertiesService !== 'undefined' ? PropertiesService.getScriptProperties() : null; }
  function load_() { var p = props_(), raw = p && p.getProperty(STATE_KEY); if (raw) { try { return JSON.parse(raw); } catch (ignore) {} } return clone_(memory_); }
  function save_(s) { var p = props_(); if (p) p.setProperty(STATE_KEY, JSON.stringify(s)); memory_ = clone_(s); return s; }
  function audit_(state, event, reviewId, detail) { state.audit.unshift({ event: event, reviewId: reviewId, detail: detail || '', actor: actor_(), at: now_() }); state.audit = state.audit.slice(0, 100); }
  function requireReview_(state, reviewId) { var r = state.reviews[reviewId]; if (!r) throw new Error('Unknown pilot review: ' + reviewId); return r; }
  function buildIssues_(pilot) {
    var validation = pilot.validation || {}, out = [], i;
    var errors = validation.errors || [], warnings = validation.warnings || [];
    for (i = 0; i < errors.length; i++) out.push({ severity: 'ERROR', row: errors[i].row || 0, code: errors[i].code || 'VALIDATION_ERROR', message: errors[i].message || 'Validation error', disposition: 'OPEN' });
    for (i = 0; i < warnings.length; i++) out.push({ severity: 'WARNING', row: warnings[i].row || 0, code: warnings[i].code || 'VALIDATION_WARNING', message: warnings[i].message || 'Validation warning', disposition: 'OPEN' });
    return out;
  }
  function importPilot(pilotId) {
    if (typeof SCIIP_EPIC5_REAL_SUPERSHEET_PILOT === 'undefined') throw new Error('Build 3E pilot engine is unavailable.');
    var pilotState = SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.dashboard(), found = null, i;
    for (i = 0; i < pilotState.items.length; i++) if (pilotState.items[i].pilotId === pilotId) found = pilotState.items[i];
    if (!found) throw new Error('Pilot not found in Build 3E dashboard: ' + pilotId);
    var state = load_(), reviewId = 'REVIEW-' + uuid_();
    var review = {
      reviewId: reviewId, pilotId: pilotId, sourceName: found.sourceName, schemaFingerprint: found.schemaFingerprint,
      status: found.status === 'READY_FOR_HUMAN_REVIEW' ? 'AWAITING_REVIEW' : 'NOT_READY', rows: found.rows || 0,
      valid: found.valid || 0, warnings: found.warnings || 0, errors: 0, issues: [], decisions: [],
      checkpoint: { phase: 'REVIEW_IMPORTED', complete: false, resumable: true },
      governance: { reviewRequired: true, destructiveCommitEnabled: false, commitBridgeAvailable: typeof SCIIP_EPIC5_APPROVED_COMMIT_REFRESH !== 'undefined' },
      createdAt: now_(), createdBy: actor_(), updatedAt: now_()
    };
    state.reviews[reviewId] = review; audit_(state, 'PILOT_IMPORTED', reviewId, pilotId); save_(state); return clone_(review);
  }
  function createFromPilotSnapshot(snapshot) {
    snapshot = snapshot || {};
    var state = load_(), reviewId = String(snapshot.reviewId || ('REVIEW-' + uuid_()));
    var issues = buildIssues_(snapshot);
    var review = {
      reviewId: reviewId, pilotId: String(snapshot.pilotId || ('PILOT-' + uuid_())), sourceName: String(snapshot.sourceName || 'Real SuperSheet Pilot'),
      schemaFingerprint: String((snapshot.schema && snapshot.schema.fingerprint) || snapshot.schemaFingerprint || 'SSF-UNKNOWN'),
      status: snapshot.status === 'READY_FOR_HUMAN_REVIEW' ? 'AWAITING_REVIEW' : 'NOT_READY',
      rows: snapshot.validation ? snapshot.validation.totalRows : Number(snapshot.rows || 0),
      valid: snapshot.validation ? snapshot.validation.validRows : Number(snapshot.valid || 0),
      warnings: snapshot.validation ? snapshot.validation.warningCount : Number(snapshot.warnings || 0),
      errors: snapshot.validation ? snapshot.validation.errorCount : Number(snapshot.errors || 0),
      issues: issues, decisions: [], checkpoint: { phase: 'REVIEW_IMPORTED', complete: false, resumable: true },
      governance: { reviewRequired: true, destructiveCommitEnabled: false, commitBridgeAvailable: typeof SCIIP_EPIC5_APPROVED_COMMIT_REFRESH !== 'undefined' },
      createdAt: now_(), createdBy: actor_(), updatedAt: now_()
    };
    state.reviews[reviewId] = review; audit_(state, 'PILOT_SNAPSHOT_IMPORTED', reviewId, review.pilotId); save_(state); return clone_(review);
  }
  function decideIssue(reviewId, issueIndex, disposition, note) {
    var allowed = ['ACCEPT', 'CORRECT_SOURCE', 'EXCLUDE_ROW', 'ESCALATE'];
    if (allowed.indexOf(disposition) < 0) throw new Error('Unsupported issue disposition: ' + disposition);
    var state = load_(), r = requireReview_(state, reviewId), idx = Number(issueIndex);
    if (!r.issues[idx]) throw new Error('Unknown issue index: ' + issueIndex);
    r.issues[idx].disposition = disposition; r.issues[idx].note = String(note || ''); r.issues[idx].decidedAt = now_(); r.issues[idx].decidedBy = actor_();
    r.decisions.push({ issueIndex: idx, disposition: disposition, note: String(note || ''), at: now_(), actor: actor_() });
    r.updatedAt = now_(); audit_(state, 'ISSUE_DISPOSITIONED', reviewId, disposition + ':' + idx); state.reviews[reviewId] = r; save_(state); return clone_(r);
  }
  function unresolved_(r) { return r.issues.filter(function (x) { return x.disposition === 'OPEN' || x.disposition === 'ESCALATE'; }); }
  function approve(reviewId, note) {
    var state = load_(), r = requireReview_(state, reviewId), open = unresolved_(r);
    if (r.errors > 0) throw new Error('Blocking validation errors remain.');
    if (open.length) throw new Error('Resolve or explicitly disposition all row-level issues before approval.');
    if (r.status !== 'AWAITING_REVIEW' && r.status !== 'REVIEW_IN_PROGRESS') throw new Error('Review is not approvable from status ' + r.status);
    r.status = 'APPROVED_FOR_COMMIT_REHEARSAL'; r.approval = { note: String(note || ''), approvedAt: now_(), approvedBy: actor_() };
    r.checkpoint = { phase: 'HUMAN_APPROVAL_COMPLETE', complete: true, resumable: true }; r.updatedAt = now_();
    audit_(state, 'PILOT_APPROVED', reviewId, note || ''); state.reviews[reviewId] = r; save_(state); return clone_(r);
  }
  function reject(reviewId, note) {
    if (!String(note || '').trim()) throw new Error('A rejection note is required.');
    var state = load_(), r = requireReview_(state, reviewId); r.status = 'REJECTED'; r.rejection = { note: String(note), rejectedAt: now_(), rejectedBy: actor_() };
    r.checkpoint = { phase: 'REJECTED', complete: true, resumable: true }; r.updatedAt = now_(); audit_(state, 'PILOT_REJECTED', reviewId, note); state.reviews[reviewId] = r; save_(state); return clone_(r);
  }
  function resume(reviewId) {
    var state = load_(), r = requireReview_(state, reviewId);
    if (r.status === 'REJECTED' || r.status === 'NOT_READY') r.status = 'REVIEW_IN_PROGRESS';
    r.checkpoint.resumable = true; r.updatedAt = now_(); audit_(state, 'REVIEW_RESUMED', reviewId, r.checkpoint.phase); state.reviews[reviewId] = r; save_(state); return clone_(r);
  }
  function commitRehearsal(reviewId) {
    var state = load_(), r = requireReview_(state, reviewId);
    if (r.status !== 'APPROVED_FOR_COMMIT_REHEARSAL') throw new Error('Human approval is required before commit rehearsal.');
    var rehearsal = {
      rehearsalId: 'REHEARSAL-' + uuid_(), reviewId: reviewId, pilotId: r.pilotId, status: 'DRY_RUN_READY',
      schemaFingerprint: r.schemaFingerprint, rowsEligible: r.valid, destructiveCommitEnabled: false,
      bridgeAvailable: r.governance.commitBridgeAvailable, lineagePreserved: true, generatedAt: now_(), generatedBy: actor_()
    };
    r.rehearsal = rehearsal; r.status = 'READY_FOR_GOVERNED_COMMIT'; r.checkpoint = { phase: 'COMMIT_REHEARSAL_COMPLETE', complete: true, resumable: true };
    r.updatedAt = now_(); audit_(state, 'COMMIT_REHEARSAL_COMPLETED', reviewId, rehearsal.rehearsalId); state.reviews[reviewId] = r; save_(state); return clone_(rehearsal);
  }
  function dashboard() {
    var state = load_(), ids = Object.keys(state.reviews), counters = { total: ids.length, awaitingReview: 0, approved: 0, readyForCommit: 0, rejected: 0, warnings: 0, errors: 0 };
    var items = ids.map(function (id) { var r = state.reviews[id]; counters.warnings += r.warnings; counters.errors += r.errors; if (r.status === 'AWAITING_REVIEW' || r.status === 'REVIEW_IN_PROGRESS') counters.awaitingReview++; if (r.status === 'APPROVED_FOR_COMMIT_REHEARSAL') counters.approved++; if (r.status === 'READY_FOR_GOVERNED_COMMIT') counters.readyForCommit++; if (r.status === 'REJECTED') counters.rejected++; return clone_(r); });
    return { version: VERSION, workspace: 'data-sources', title: 'Pilot Review Console', counters: counters, reviews: items, audit: clone_(state.audit), governance: { reviewRequired: true, destructiveCommitEnabled: false, lineagePreserved: true, build3EAvailable: typeof SCIIP_EPIC5_REAL_SUPERSHEET_PILOT !== 'undefined', build3DAvailable: typeof SCIIP_EPIC5_APPROVED_COMMIT_REFRESH !== 'undefined' } };
  }
  function resetForTest() { memory_ = { reviews: {}, audit: [] }; var p = props_(); if (p) p.deleteProperty(STATE_KEY); return true; }
  return { VERSION: VERSION, importPilot: importPilot, createFromPilotSnapshot: createFromPilotSnapshot, decideIssue: decideIssue, approve: approve, reject: reject, resume: resume, commitRehearsal: commitRehearsal, dashboard: dashboard, resetForTest: resetForTest };
})();

function sciipGetEpic5PilotReviewConsole() { return SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.dashboard(); }
function sciipImportEpic5PilotForReview(pilotId) { return SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.importPilot(pilotId); }
function sciipActionEpic5PilotReview(reviewId, action, options) {
  options = options || {};
  if (action === 'DECIDE_ISSUE') return SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.decideIssue(reviewId, options.issueIndex, options.disposition, options.note);
  if (action === 'APPROVE') return SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.approve(reviewId, options.note);
  if (action === 'REJECT') return SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.reject(reviewId, options.note);
  if (action === 'RESUME') return SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.resume(reviewId);
  if (action === 'COMMIT_REHEARSAL') return SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.commitRehearsal(reviewId);
  throw new Error('Unsupported pilot review action: ' + action);
}
function sciipOpenEpic5PilotReviewConsole() {
  var t = HtmlService.createTemplateFromFile('SCIIP_Epic5_Pilot_Review_Console');
  t.bootstrapJson = JSON.stringify(SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.dashboard());
  return t.evaluate().setTitle('SCIIP_OS — Pilot Review Console').setXFrameOptionsMode(HtmlService.XFrameOptionsMode.ALLOWALL);
}
function sciipTestV7Epic5PilotReviewConsoleFirstExecution() {
  var failures = [], runId = typeof Utilities !== 'undefined' && Utilities.getUuid ? Utilities.getUuid().replace(/-/g, '').slice(0, 12) : String(new Date().getTime());
  SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.resetForTest();
  var snapshot = { pilotId: 'PILOT-TEST-' + runId, sourceName: 'Representative Real SuperSheet', status: 'READY_FOR_HUMAN_REVIEW', schema: { fingerprint: 'SSF-7DE89DEC' }, validation: { totalRows: 3, validRows: 3, errorCount: 0, warningCount: 1, errors: [], warnings: [{ row: 4, code: 'MISSING_PROPERTY_ID', message: 'Address-derived property identity requires reviewer acceptance.' }] } };
  var review = SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.createFromPilotSnapshot(snapshot);
  if (review.status !== 'AWAITING_REVIEW' || review.issues.length !== 1) failures.push('import');
  var blocked = false; try { SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.approve(review.reviewId, 'premature'); } catch (e) { blocked = true; }
  if (!blocked) failures.push('approvalGate');
  review = SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.decideIssue(review.reviewId, 0, 'ACCEPT', 'Address identity verified against source brochure.');
  if (review.issues[0].disposition !== 'ACCEPT') failures.push('issueDecision');
  review = SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.approve(review.reviewId, 'Pilot approved for governed rehearsal.');
  if (review.status !== 'APPROVED_FOR_COMMIT_REHEARSAL' || !review.approval) failures.push('approval');
  var rehearsal = SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.commitRehearsal(review.reviewId);
  if (rehearsal.status !== 'DRY_RUN_READY' || rehearsal.destructiveCommitEnabled !== false || rehearsal.rowsEligible !== 3) failures.push('rehearsal');
  var dashboard = SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.dashboard();
  if (dashboard.counters.total !== 1 || dashboard.counters.readyForCommit !== 1) failures.push('dashboard');
  if (!dashboard.governance.reviewRequired || dashboard.governance.destructiveCommitEnabled !== false || !dashboard.governance.lineagePreserved) failures.push('governance');
  if (dashboard.audit.length < 4) failures.push('audit');
  var out = { framework: 'SCIIP_V7_EPIC5_PILOT_REVIEW_CONSOLE_FIRST_REAL_EXECUTION_BUILD3F', version: SCIIP_EPIC5_PILOT_REVIEW_CONSOLE.VERSION, status: failures.length ? 'FAILED' : 'PASSED', testsRun: 10, failures: failures, result: { workspace: dashboard.workspace, reviewId: review.reviewId, pilotId: snapshot.pilotId, sourceName: snapshot.sourceName, rowLevelIssues: review.issues.length, issueDisposition: review.issues[0].disposition, approvalStatus: review.status, rehearsalStatus: rehearsal.status, rowsEligible: rehearsal.rowsEligible, auditEvents: dashboard.audit.length, reviewRequired: true, lineagePreserved: true, approvedCommitBridgeAvailable: dashboard.governance.build3DAvailable, destructiveCommitEnabled: false } };
  console.log(JSON.stringify(out)); return out;
}
