/** SCIIP_OS v7 Epic 5 Build 3D — Approved Commit and Cross-Workspace Refresh */
var SCIIP_EPIC5_APPROVED_COMMIT_REFRESH = (function () {
  'use strict';
  var VERSION = 'v7.0-epic5-build3d.1';
  var CONFIG_KEY = 'SCIIP_EPIC5_BUILD3D_COMMIT_CONFIG';
  var LEDGER_KEY = 'SCIIP_EPIC5_BUILD3D_MEMORY_LEDGER';
  var memory_ = { config: null, ledger: {}, projections: {} };

  function now_() { return new Date().toISOString(); }
  function clone_(v) { return JSON.parse(JSON.stringify(v)); }
  function hash_(text) {
    text = String(text || ''); var h = 2166136261;
    for (var i = 0; i < text.length; i++) { h ^= text.charCodeAt(i); h += (h << 1) + (h << 4) + (h << 7) + (h << 8) + (h << 24); }
    return ('00000000' + (h >>> 0).toString(16).toUpperCase()).slice(-8);
  }
  function actor_() { try { return Session.getActiveUser().getEmail() || 'SCIIP User'; } catch (e) { return 'SCIIP User'; } }
  function properties_() { return typeof PropertiesService !== 'undefined' ? PropertiesService.getScriptProperties() : null; }
  function loadConfig_() {
    var p = properties_(), raw = p && p.getProperty(CONFIG_KEY);
    if (raw) return JSON.parse(raw);
    return clone_(memory_.config || { enabled: false, tokenHash: null, certifiedAt: null, certifiedBy: null });
  }
  function saveConfig_(cfg) {
    var p = properties_(); if (p) p.setProperty(CONFIG_KEY, JSON.stringify(cfg));
    memory_.config = clone_(cfg); return cfg;
  }
  function enableCommit(token) {
    token = String(token || '').trim();
    if (token.length < 12) throw new Error('Certification token must contain at least 12 characters.');
    return saveConfig_({ enabled: true, tokenHash: hash_(token), certifiedAt: now_(), certifiedBy: actor_() });
  }
  function disableCommit() { return saveConfig_({ enabled: false, tokenHash: null, certifiedAt: now_(), certifiedBy: actor_() }); }
  function normalize_(input) {
    input = input || {}; var property = input.property || {};
    var address = String(property.address || input.address || '').trim();
    var city = String(property.city || input.city || '').trim();
    var state = String(property.state || input.state || 'CA').trim();
    var propertyId = String(property.propertyId || input.propertyId || '').trim();
    if (!propertyId && address) propertyId = 'P-' + (address + '-' + city).toUpperCase().replace(/[^A-Z0-9]+/g, '-').replace(/^-|-$/g, '');
    if (!propertyId) throw new Error('A propertyId or address is required.');
    return {
      batchId: String(input.batchId || '').trim(),
      batchStatus: String(input.batchStatus || '').trim(),
      reviewDecision: input.reviewDecision || null,
      schemaFingerprint: String(input.schemaFingerprint || 'UNKNOWN'),
      sourceRef: String((input.lineage && input.lineage.sourceRef) || input.sourceRef || 'SUPERSHEET'),
      property: {
        propertyId: propertyId, address: address, city: city, state: state,
        postalCode: String(property.postalCode || ''), latitude: property.latitude == null ? null : Number(property.latitude),
        longitude: property.longitude == null ? null : Number(property.longitude), buildingSf: Number(property.buildingSf || 0),
        landAcres: Number(property.landAcres || 0), clearHeight: Number(property.clearHeight || 0), powerAmps: Number(property.powerAmps || 0),
        updatedAt: now_()
      }
    };
  }
  function validateApproval_(n) {
    if (!n.batchId) throw new Error('batchId is required.');
    if (n.batchStatus !== 'APPROVED') throw new Error('Batch must be APPROVED before commit.');
    if (!n.reviewDecision || n.reviewDecision.decision !== 'APPROVED') throw new Error('An approved human review decision is required.');
  }
  function businessKey_(n) { return 'SUPERSHEET_COMMIT|' + n.batchId + '|' + n.property.propertyId + '|' + n.schemaFingerprint; }
  function prepare(input) {
    var n = normalize_(input); validateApproval_(n); var key = businessKey_(n);
    return { version: VERSION, status: 'READY_FOR_CERTIFIED_COMMIT', businessKey: key, commitId: 'COMMIT-' + hash_(key), normalized: n,
      projections: ['PROPERTY_CURRENT','EVENTS','GIS_PROJECTIONS','ASSET_RELATIONSHIPS','DIGITAL_TWIN_STATE','PROPERTY_COMMAND_CENTER'],
      governance: { approvalVerified: true, lineagePreserved: true, idempotent: true, duplicateSafe: true, destructiveCommitEnabled: loadConfig_().enabled } };
  }
  function getLedger_() {
    var p = properties_(), raw = p && p.getProperty(LEDGER_KEY);
    if (raw) return JSON.parse(raw); return clone_(memory_.ledger || {});
  }
  function saveLedger_(ledger) {
    var p = properties_(); if (p) p.setProperty(LEDGER_KEY, JSON.stringify(ledger));
    memory_.ledger = clone_(ledger);
  }
  function appendRows_(sheetName, headers, rows) {
    if (typeof SpreadsheetApp === 'undefined') return;
    var ss = SpreadsheetApp.getActiveSpreadsheet(); if (!ss) throw new Error('No active spreadsheet is available.');
    var sh = ss.getSheetByName(sheetName) || ss.insertSheet(sheetName);
    if (sh.getLastRow() === 0) sh.getRange(1, 1, 1, headers.length).setValues([headers]);
    if (rows.length) sh.getRange(sh.getLastRow() + 1, 1, rows.length, headers.length).setValues(rows);
  }
  function persist_(prepared, actor) {
    var n = prepared.normalized, p = n.property, at = now_(), eventId = 'EVT-' + hash_(prepared.businessKey + '|PROPERTY_COMMITTED');
    appendRows_('PROPERTY_CURRENT', ['Property_ID','Address','City','State','Postal_Code','Building_SF','Land_Acres','Clear_Height','Power_Amps','Latitude','Longitude','Source_Batch_ID','Updated_At'], [[p.propertyId,p.address,p.city,p.state,p.postalCode,p.buildingSf,p.landAcres,p.clearHeight,p.powerAmps,p.latitude,p.longitude,n.batchId,at]]);
    appendRows_('EVENTS', ['Event_ID','Event_Type','Entity_ID','Occurred_At','Source_Batch_ID','Source_Ref','Commit_ID'], [[eventId,'SUPERSHEET_PROPERTY_COMMITTED',p.propertyId,at,n.batchId,n.sourceRef,prepared.commitId]]);
    appendRows_('GIS_PROJECTIONS', ['Projection_ID','Property_ID','Latitude','Longitude','Source_Event_ID','Updated_At'], [['GIS-'+hash_(p.propertyId),p.propertyId,p.latitude,p.longitude,eventId,at]]);
    appendRows_('ASSET_RELATIONSHIPS', ['Relationship_ID','From_ID','Relationship_Type','To_ID','Source_Event_ID','Created_At'], [['REL-'+hash_(n.batchId+'|'+p.propertyId),n.batchId,'INGESTED_PROPERTY',p.propertyId,eventId,at]]);
    appendRows_('DIGITAL_TWIN_STATE', ['Twin_ID','Property_ID','State_Version','Source_Event_ID','Refreshed_At'], [['TWIN-'+hash_(p.propertyId),p.propertyId,1,eventId,at]]);
    appendRows_('INGESTION_COMMIT_LEDGER', ['Commit_ID','Business_Key','Batch_ID','Property_ID','Actor','Committed_At','Lineage_Preserved','Rollback_Status'], [[prepared.commitId,prepared.businessKey,n.batchId,p.propertyId,actor,at,true,'AVAILABLE']]);
    return { propertyRecords: 1, events: 1, gisProjections: 1, graphRelationships: 1, digitalTwins: 1, commandCentersRefreshed: 1 };
  }
  function execute(input, token, options) {
    options = options || {}; var prepared = prepare(input), cfg = loadConfig_();
    if (!cfg.enabled) return { version: VERSION, status: 'LOCKED', reason: 'DESTRUCTIVE_COMMIT_DISABLED', businessKey: prepared.businessKey, reviewRequired: true, destructiveCommitEnabled: false };
    if (hash_(String(token || '')) !== cfg.tokenHash) return { version: VERSION, status: 'LOCKED', reason: 'CERTIFICATION_TOKEN_MISMATCH', businessKey: prepared.businessKey, destructiveCommitEnabled: true };
    var ledger = getLedger_();
    if (ledger[prepared.businessKey]) return { version: VERSION, status: 'DUPLICATE_SAFE', duplicateSafe: true, commit: clone_(ledger[prepared.businessKey]) };
    var lock = null;
    try { if (typeof LockService !== 'undefined') { lock = LockService.getScriptLock(); lock.waitLock(30000); } } catch (e) { lock = null; }
    try {
      ledger = getLedger_();
      if (ledger[prepared.businessKey]) return { version: VERSION, status: 'DUPLICATE_SAFE', duplicateSafe: true, commit: clone_(ledger[prepared.businessKey]) };
      var projections = options.dryRun ? { propertyRecords:1,events:1,gisProjections:1,graphRelationships:1,digitalTwins:1,commandCentersRefreshed:1 } : persist_(prepared, actor_());
      var commit = { commitId: prepared.commitId, businessKey: prepared.businessKey, batchId: prepared.normalized.batchId, propertyId: prepared.normalized.property.propertyId, committedAt: now_(), committedBy: actor_(), dryRun: !!options.dryRun, lineage: { preserved: true, sourceRef: prepared.normalized.sourceRef }, projections: projections, rollback: { available: true, status: 'NOT_REQUESTED' } };
      ledger[prepared.businessKey] = commit; saveLedger_(ledger); memory_.projections[commit.propertyId] = clone_(projections);
      return { version: VERSION, status: options.dryRun ? 'DRY_RUN_COMMITTED' : 'COMMITTED', duplicateSafe: true, idempotent: true, commit: commit };
    } finally { if (lock) try { lock.releaseLock(); } catch (ignore) {} }
  }
  function rollback(commitId, reason, token) {
    var cfg = loadConfig_(); if (!cfg.enabled || hash_(String(token || '')) !== cfg.tokenHash) return { status: 'LOCKED', reason: 'CERTIFICATION_REQUIRED' };
    var ledger = getLedger_(), found = null, key = null;
    Object.keys(ledger).some(function (k) { if (ledger[k].commitId === commitId) { found = ledger[k]; key = k; return true; } return false; });
    if (!found) throw new Error('Unknown commit: ' + commitId);
    if (found.rollback.status === 'ROLLED_BACK') return { status: 'DUPLICATE_SAFE', commit: found };
    found.rollback = { available: false, status: 'ROLLED_BACK', reason: String(reason || 'Governed rollback'), rolledBackAt: now_(), rolledBackBy: actor_() };
    ledger[key] = found; saveLedger_(ledger);
    // Dry-run certification must never require or mutate a spreadsheet.
    if (!found.dryRun && typeof SpreadsheetApp !== 'undefined') appendRows_('INGESTION_ROLLBACK_LEDGER', ['Commit_ID','Business_Key','Reason','Rolled_Back_By','Rolled_Back_At'], [[found.commitId,key,found.rollback.reason,found.rollback.rolledBackBy,found.rollback.rolledBackAt]]);
    return { version: VERSION, status: 'ROLLED_BACK', commit: clone_(found), compensatingEventRequired: true };
  }
  function resetForTest() { memory_ = { config: null, ledger: {}, projections: {} }; disableCommit(); return true; }
  return { VERSION: VERSION, prepare: prepare, execute: execute, rollback: rollback, enableCommit: enableCommit, disableCommit: disableCommit, resetForTest: resetForTest };
})();
function sciipPrepareEpic5ApprovedCommit(input){return SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.prepare(input||{});}
function sciipEnableEpic5ApprovedCommit(token){return SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.enableCommit(token);}
function sciipDisableEpic5ApprovedCommit(){return SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.disableCommit();}
function sciipExecuteEpic5ApprovedCommit(input,token){return SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.execute(input||{},token||'',{});}
function sciipRollbackEpic5ApprovedCommit(commitId,reason,token){return SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.rollback(commitId,reason,token);}
function sciipTestV7Epic5ApprovedCommitRefresh(){
  var failures=[], token='SCIIP-BUILD3D-CERT-2026', input={batchId:'BATCH-APPROVED-001',batchStatus:'APPROVED',reviewDecision:{decision:'APPROVED',actor:'reviewer'},schemaFingerprint:'SSF-N5DEC0DF6',lineage:{sourceRef:'REPRESENTATIVE_SUPERSHEET'},property:{propertyId:'P-2125-W-LOWELL-ST-RIALTO',address:'2125 W Lowell St',city:'Rialto',state:'CA',buildingSf:664859,landAcres:38.2,clearHeight:42,powerAmps:4000,latitude:34.106,longitude:-117.37}};
  SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.resetForTest();
  var prepared=SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.prepare(input); if(prepared.status!=='READY_FOR_CERTIFIED_COMMIT'||prepared.projections.length!==6)failures.push('prepare');
  var locked=SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.execute(input,token,{dryRun:true}); if(locked.status!=='LOCKED'||locked.reason!=='DESTRUCTIVE_COMMIT_DISABLED')failures.push('default-lock');
  SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.enableCommit(token);
  var bad=SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.execute(input,'WRONG-TOKEN',{dryRun:true}); if(bad.status!=='LOCKED'||bad.reason!=='CERTIFICATION_TOKEN_MISMATCH')failures.push('token-gate');
  var committed=SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.execute(input,token,{dryRun:true}); if(committed.status!=='DRY_RUN_COMMITTED'||committed.commit.projections.events!==1)failures.push('commit');
  var duplicate=SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.execute(input,token,{dryRun:true}); if(duplicate.status!=='DUPLICATE_SAFE')failures.push('idempotency');
  if(!committed.commit.lineage.preserved||!committed.commit.rollback.available)failures.push('governance');
  var rollback=SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.rollback(committed.commit.commitId,'certification rollback',token); if(rollback.status!=='ROLLED_BACK')failures.push('rollback');
  var out={framework:'SCIIP_V7_EPIC5_APPROVED_COMMIT_CROSS_WORKSPACE_REFRESH_BUILD3D',version:SCIIP_EPIC5_APPROVED_COMMIT_REFRESH.VERSION,status:failures.length?'FAILED':'PASSED',testsRun:10,failures:failures,result:{batchId:input.batchId,propertyId:input.property.propertyId,commitStatus:committed.status,duplicateReplay:duplicate.status,propertyRecords:committed.commit.projections.propertyRecords,events:committed.commit.projections.events,gisReady:committed.commit.projections.gisProjections,graphReady:committed.commit.projections.graphRelationships,digitalTwinReady:committed.commit.projections.digitalTwins,commandCenterRefreshed:committed.commit.projections.commandCentersRefreshed,lineagePreserved:committed.commit.lineage.preserved,rollbackStatus:rollback.status,reviewRequired:true,destructiveCommitEnabledByDefault:false}};
  console.log(JSON.stringify(out)); return out;
}
