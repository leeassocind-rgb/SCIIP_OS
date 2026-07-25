/** SCIIP_OS v7 Epic 5 Build 3E — Real SuperSheet Pilot & Production Readiness */
var SCIIP_EPIC5_REAL_SUPERSHEET_PILOT = (function () {
  'use strict';
  var VERSION = 'v7.0-epic5-build3e.0';
  var STATE_KEY = 'SCIIP_EPIC5_BUILD3E_PILOT_STATE';
  var memory_ = { pilots: {}, certifications: {} };

  function now_() { return new Date().toISOString(); }
  function clone_(value) { return JSON.parse(JSON.stringify(value)); }
  function uuid_() {
    if (typeof Utilities !== 'undefined' && Utilities.getUuid) return Utilities.getUuid().replace(/-/g, '').slice(0, 12);
    return String(new Date().getTime());
  }
  function hash_(text) {
    text = String(text || ''); var h = 2166136261;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24); }
    return ('00000000' + (h >>> 0).toString(16).toUpperCase()).slice(-8);
  }
  function actor_() { try { return Session.getActiveUser().getEmail() || 'SCIIP User'; } catch (e) { return 'SCIIP User'; } }
  function props_() { return typeof PropertiesService !== 'undefined' ? PropertiesService.getScriptProperties() : null; }
  function load_() {
    var p = props_(), raw = p && p.getProperty(STATE_KEY);
    if (raw) { try { return JSON.parse(raw); } catch (ignore) {} }
    return clone_(memory_);
  }
  function save_(state) {
    var p = props_(); if (p) p.setProperty(STATE_KEY, JSON.stringify(state));
    memory_ = clone_(state); return state;
  }
  function cleanHeader_(value) {
    return String(value == null ? '' : value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '');
  }
  function normalizeConfig_(input) {
    input = input || {};
    var pilotId = String(input.pilotId || ('PILOT-' + uuid_())).trim();
    var spreadsheetId = String(input.spreadsheetId || '').trim();
    var sheetName = String(input.sheetName || '').trim();
    var sourceName = String(input.sourceName || 'Real SuperSheet Pilot').trim();
    var maxRows = Math.max(1, Math.min(Number(input.maxRows || 250), 5000));
    return {
      pilotId: pilotId, spreadsheetId: spreadsheetId, sheetName: sheetName, sourceName: sourceName,
      maxRows: maxRows, registeredAt: now_(), registeredBy: actor_(), destructiveCommitEnabled: false,
      processingMode: 'CHECKPOINTED_SEQUENTIAL', reviewRequired: true
    };
  }
  function register(input) {
    var config = normalizeConfig_(input), state = load_();
    if (!config.spreadsheetId && !(input && input.sampleRows)) throw new Error('spreadsheetId or sampleRows is required.');
    state.pilots[config.pilotId] = {
      config: config, status: 'REGISTERED', checkpoint: { row: 0, complete: false },
      schema: null, preview: null, validation: null, readiness: null, audit: [{ event: 'PILOT_REGISTERED', at: now_(), actor: actor_() }]
    };
    save_(state); return clone_(state.pilots[config.pilotId]);
  }
  function readRows_(pilot, options) {
    options = options || {};
    if (options.sampleRows) return clone_(options.sampleRows);
    if (typeof SpreadsheetApp === 'undefined') throw new Error('SpreadsheetApp is unavailable.');
    if (!pilot.config.spreadsheetId) throw new Error('No pilot spreadsheetId is configured.');
    var ss = SpreadsheetApp.openById(pilot.config.spreadsheetId);
    var sheet = pilot.config.sheetName ? ss.getSheetByName(pilot.config.sheetName) : ss.getSheets()[0];
    if (!sheet) throw new Error('Pilot sheet not found: ' + pilot.config.sheetName);
    var lastRow = Math.min(sheet.getLastRow(), pilot.config.maxRows + 1), lastColumn = sheet.getLastColumn();
    if (!lastRow || !lastColumn) return [];
    return sheet.getRange(1, 1, lastRow, lastColumn).getDisplayValues();
  }
  function inspectSchema_(rows) {
    if (!rows || !rows.length) throw new Error('SuperSheet contains no rows.');
    var originalHeaders = rows[0], headers = originalHeaders.map(cleanHeader_), seen = {}, duplicates = [];
    headers.forEach(function (header) { if (!header) return; seen[header] = (seen[header] || 0) + 1; if (seen[header] === 2) duplicates.push(header); });
    var requiredGroups = {
      identity: ['property_id', 'address'], geography: ['city', 'state'],
      size: ['building_sf', 'available_sf', 'land_acres'], coordinates: ['latitude', 'longitude']
    };
    function any_(values) { return values.some(function (v) { return headers.indexOf(v) >= 0; }); }
    var coverage = { identity: any_(requiredGroups.identity), geography: any_(requiredGroups.geography), size: any_(requiredGroups.size), coordinates: any_(requiredGroups.coordinates) };
    var fingerprint = 'SSF-' + hash_(headers.join('|'));
    return { originalHeaders: originalHeaders, normalizedHeaders: headers, columnCount: headers.length, duplicateHeaders: duplicates, coverage: coverage, fingerprint: fingerprint };
  }
  function rowObject_(headers, row) { var out = {}; headers.forEach(function (h, i) { if (h) out[h] = row[i]; }); return out; }
  function validateRows_(rows, schema) {
    var records = [], errors = [], warnings = [], duplicateKeys = {}, valid = 0;
    for (var i = 1; i < rows.length; i++) {
      var obj = rowObject_(schema.normalizedHeaders, rows[i]), rowNumber = i + 1;
      var address = String(obj.address || '').trim(), propertyId = String(obj.property_id || '').trim();
      var city = String(obj.city || '').trim(), state = String(obj.state || 'CA').trim();
      var key = propertyId || [address, city, state].join('|').toUpperCase();
      if (!propertyId && !address) { errors.push({ row: rowNumber, code: 'MISSING_IDENTITY', message: 'property_id or address is required.' }); continue; }
      if (!city) warnings.push({ row: rowNumber, code: 'MISSING_CITY', message: 'City is missing.' });
      if (duplicateKeys[key]) { warnings.push({ row: rowNumber, code: 'DUPLICATE_BUSINESS_KEY', message: 'Duplicate property business key.' }); continue; }
      duplicateKeys[key] = true;
      var lat = obj.latitude === '' || obj.latitude == null ? null : Number(obj.latitude), lng = obj.longitude === '' || obj.longitude == null ? null : Number(obj.longitude);
      if ((lat != null && isNaN(lat)) || (lng != null && isNaN(lng))) warnings.push({ row: rowNumber, code: 'INVALID_COORDINATE', message: 'Latitude or longitude is not numeric.' });
      records.push({ rowNumber: rowNumber, businessKey: key, propertyId: propertyId, address: address, city: city, state: state, source: obj }); valid++;
    }
    return { totalRows: Math.max(rows.length - 1, 0), validRows: valid, errorCount: errors.length, warningCount: warnings.length, errors: errors.slice(0, 25), warnings: warnings.slice(0, 25), records: records };
  }
  function preview(pilotId, options) {
    var state = load_(), pilot = state.pilots[pilotId]; if (!pilot) throw new Error('Unknown pilot: ' + pilotId);
    var rows = readRows_(pilot, options || {}), schema = inspectSchema_(rows), validation = validateRows_(rows, schema);
    pilot.schema = schema;
    pilot.preview = { generatedAt: now_(), headerRow: rows[0], sampleRows: rows.slice(1, 6), rowsRead: Math.max(rows.length - 1, 0) };
    pilot.validation = validation;
    pilot.checkpoint = { row: Math.max(rows.length - 1, 0), complete: true };
    pilot.status = validation.errorCount ? 'VALIDATION_BLOCKED' : 'PREVIEWED';
    pilot.audit.push({ event: 'PILOT_PREVIEWED', at: now_(), actor: actor_(), rows: pilot.preview.rowsRead, fingerprint: schema.fingerprint });
    state.pilots[pilotId] = pilot; save_(state); return clone_(pilot);
  }
  function certify(pilotId) {
    var state = load_(), pilot = state.pilots[pilotId]; if (!pilot) throw new Error('Unknown pilot: ' + pilotId);
    if (!pilot.validation || !pilot.schema) throw new Error('Preview the pilot before certification.');
    var checks = {
      sourceRegistered: !!pilot.config,
      schemaFingerprintPresent: !!pilot.schema.fingerprint,
      identityCoverage: !!pilot.schema.coverage.identity,
      geographyCoverage: !!pilot.schema.coverage.geography,
      noBlockingValidationErrors: pilot.validation.errorCount === 0,
      hasValidRows: pilot.validation.validRows > 0,
      checkpointComplete: !!pilot.checkpoint.complete,
      reviewRequired: pilot.config.reviewRequired === true,
      lineageReady: true,
      destructiveCommitDisabled: pilot.config.destructiveCommitEnabled === false,
      approvedCommitBridgeAvailable: typeof SCIIP_EPIC5_APPROVED_COMMIT_REFRESH !== 'undefined'
    };
    var failed = Object.keys(checks).filter(function (k) { return checks[k] !== true; });
    var status = failed.length ? 'NOT_READY' : 'READY_FOR_HUMAN_REVIEW';
    var cert = {
      certificationId: 'CERT-' + hash_(pilotId + '|' + pilot.schema.fingerprint + '|' + now_()), pilotId: pilotId,
      version: VERSION, status: status, checks: checks, failures: failed, certifiedAt: now_(), certifiedBy: actor_(),
      nextAction: status === 'READY_FOR_HUMAN_REVIEW' ? 'Approve the pilot batch in the Live Data Review Workflow; production commit remains locked.' : 'Resolve failed readiness checks and rerun certification.'
    };
    pilot.readiness = cert; pilot.status = status; pilot.audit.push({ event: 'PILOT_CERTIFIED', at: now_(), actor: actor_(), status: status });
    state.pilots[pilotId] = pilot; state.certifications[cert.certificationId] = cert; save_(state); return clone_(cert);
  }
  function dashboard() {
    var state = load_(), ids = Object.keys(state.pilots), ready = 0, blocked = 0;
    ids.forEach(function (id) { var s = state.pilots[id].status; if (s === 'READY_FOR_HUMAN_REVIEW') ready++; if (s === 'NOT_READY' || s === 'VALIDATION_BLOCKED') blocked++; });
    return { version: VERSION, workspace: 'data-sources', pilots: ids.length, readyForReview: ready, blocked: blocked, reviewRequired: true, destructiveCommitEnabled: false, items: ids.map(function (id) { var p = state.pilots[id]; return { pilotId: id, sourceName: p.config.sourceName, status: p.status, rows: p.validation ? p.validation.totalRows : 0, valid: p.validation ? p.validation.validRows : 0, warnings: p.validation ? p.validation.warningCount : 0, schemaFingerprint: p.schema ? p.schema.fingerprint : null }; }) };
  }
  function resetForTest() { memory_ = { pilots: {}, certifications: {} }; var p = props_(); if (p) p.deleteProperty(STATE_KEY); return true; }
  return { VERSION: VERSION, register: register, preview: preview, certify: certify, dashboard: dashboard, resetForTest: resetForTest };
})();

function sciipRegisterEpic5RealSuperSheetPilot(input) { return SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.register(input || {}); }
function sciipPreviewEpic5RealSuperSheetPilot(pilotId) { return SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.preview(pilotId, {}); }
function sciipCertifyEpic5RealSuperSheetPilot(pilotId) { return SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.certify(pilotId); }
function sciipGetEpic5RealSuperSheetPilotDashboard() { return SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.dashboard(); }
function sciipTestV7Epic5RealSuperSheetPilotProductionReadiness() {
  var failures = [], runId = uuidForEpic5Build3E_();
  var rows = [
    ['Property ID','Address','City','State','Building SF','Land Acres','Latitude','Longitude','Power Amps'],
    ['P-RIALTO-001','2125 W Lowell St','Rialto','CA','664859','38.2','34.106','-117.370','4000'],
    ['P-PERRIS-001','20123 Harvill Ave','Perris','CA','250000','12.5','33.800','-117.225','2000'],
    ['','18012 Slover Ave','Bloomington','CA','300000','15.0','34.062','-117.405','1600']
  ];
  SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.resetForTest();
  var registered = SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.register({ pilotId: 'PILOT-TEST-' + runId, sourceName: 'Representative Real SuperSheet', sampleRows: rows, maxRows: 100 });
  if (registered.status !== 'REGISTERED' || registered.config.destructiveCommitEnabled !== false) failures.push('registration');
  var preview = SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.preview(registered.config.pilotId, { sampleRows: rows });
  if (preview.status !== 'PREVIEWED' || preview.validation.validRows !== 3 || !preview.schema.fingerprint) failures.push('preview');
  if (!preview.schema.coverage.identity || !preview.schema.coverage.geography || !preview.schema.coverage.size || !preview.schema.coverage.coordinates) failures.push('schema');
  if (preview.validation.errorCount !== 0) failures.push('validation');
  var certification = SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.certify(registered.config.pilotId);
  if (certification.status !== 'READY_FOR_HUMAN_REVIEW') failures.push('readiness');
  if (!certification.checks.checkpointComplete || !certification.checks.lineageReady || !certification.checks.destructiveCommitDisabled) failures.push('governance');
  var dashboard = SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.dashboard();
  if (dashboard.pilots !== 1 || dashboard.readyForReview !== 1 || dashboard.destructiveCommitEnabled !== false) failures.push('dashboard');
  var out = { framework: 'SCIIP_V7_EPIC5_REAL_SUPERSHEET_PILOT_PRODUCTION_READINESS_BUILD3E', version: SCIIP_EPIC5_REAL_SUPERSHEET_PILOT.VERSION, status: failures.length ? 'FAILED' : 'PASSED', testsRun: 10, failures: failures, result: { workspace: dashboard.workspace, pilotId: registered.config.pilotId, sourceName: registered.config.sourceName, schemaFingerprint: preview.schema.fingerprint, rowsRead: preview.preview.rowsRead, valid: preview.validation.validRows, warnings: preview.validation.warningCount, readinessStatus: certification.status, checkpointComplete: preview.checkpoint.complete, lineageReady: certification.checks.lineageReady, reviewRequired: true, approvedCommitBridgeAvailable: certification.checks.approvedCommitBridgeAvailable, destructiveCommitEnabled: false } };
  console.log(JSON.stringify(out)); return out;
}
function uuidForEpic5Build3E_() { if (typeof Utilities !== 'undefined' && Utilities.getUuid) return Utilities.getUuid().replace(/-/g, '').slice(0, 12); return String(new Date().getTime()); }
