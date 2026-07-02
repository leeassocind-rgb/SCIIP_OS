/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 0,
        outputCount: 0,
        summary: 'Runtime migration wrapper payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
          preservedLegacyImplementation: true
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessorLegacy1540_();
      return sciipWrapLegacyRuntimeResult1540_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1540_(legacyResult, context, transaction) {
  legacyResult = legacyResult || {};

  var message = JSON.stringify({
    migrationVersion: 'v5.3.2',
    processorMigrated: true,
    legacyResult: legacyResult,
    transactionId: transaction.transactionId
  });

  var config = {
    processor: context.processor,
    businessKey: context.businessKey,
    recordsCreated: legacyResult.recordsCreated || legacyResult.autonomousGovernanceMonitoringCreated || legacyResult.created || 0,
    recordsUpdated: legacyResult.recordsUpdated || 0,
    recordsRead: legacyResult.recordsRead || 0,
    processed: legacyResult.processed || 0,
    skippedDuplicate: legacyResult.skippedDuplicate || 0,
    skippedNoInputs: legacyResult.skippedNoInputs || (legacyResult.status === 'SKIPPED_NO_INPUTS' ? 1 : 0),
    skippedValidation: legacyResult.skippedValidation || 0,
    errors: legacyResult.errors || 0,
    message: message
  };

  if (legacyResult.status === 'SKIPPED_NO_INPUTS') {
    return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs(config);
  }

  if (legacyResult.skippedDuplicate) {
    return SCIIP_RUNTIME_RESULT_FACTORY.duplicate(config);
  }

  if (legacyResult.status === 'ERROR') {
    return SCIIP_RUNTIME_RESULT_FACTORY.error(config);
  }

  return SCIIP_RUNTIME_RESULT_FACTORY.success(config);
}

/**
 * 1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP
 */

const SCIIP_1540_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER';
const SCIIP_1540_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP';
const SCIIP_1540_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessorLegacy1540_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1540ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1540_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1540EnsureSheet_(ss, SCIIP_1540_TARGET_SHEET, sciip1540TargetHeaders_());

  if (sciip1540BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1540_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1540HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1540Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1540Get_(row, map, [
      'Ledger_Date',
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1540NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];
  const sourceGraphRecordIds = [];

  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};

  const archiveStates = {};
  const closureStates = {};
  const finalizationStates = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let knowledgeGraphRecordsReviewed = 0;
  let archiveLedgerEntriesProjected = 0;
  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefsReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const graphSummaries = [];
  const ledgerSummaries = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1540Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1540Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const graphRecordId = sciip1540Get_(row, map, ['Source_Knowledge_Graph_Record_Ids', 'Knowledge_Graph_Record_Id']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (graphRecordId) sourceGraphRecordIds.push(String(graphRecordId));

    sciip1540CollectList_(graphNodeIds, sciip1540Get_(row, map, ['Graph_Node_Ids', 'Graph_Node_Id']));
    sciip1540CollectList_(graphNodeTypes, sciip1540Get_(row, map, ['Graph_Node_Types', 'Graph_Node_Type']));
    sciip1540CollectList_(graphEdgeTypes, sciip1540Get_(row, map, ['Graph_Edge_Types', 'Graph_Edge_Type']));
    sciip1540CollectList_(graphSubjects, sciip1540Get_(row, map, ['Graph_Subjects', 'Graph_Subject']));
    sciip1540CollectList_(graphObjects, sciip1540Get_(row, map, ['Graph_Objects', 'Graph_Object']));
    sciip1540CollectList_(graphStates, sciip1540Get_(row, map, ['Graph_States', 'Graph_State']));

    sciip1540CollectList_(archiveStates, sciip1540Get_(row, map, ['Archive_States']));
    sciip1540CollectList_(closureStates, sciip1540Get_(row, map, ['Closure_States']));
    sciip1540CollectList_(finalizationStates, sciip1540Get_(row, map, ['Finalization_States']));
    sciip1540CollectList_(operationalStates, sciip1540Get_(row, map, ['Operational_States']));
    sciip1540CollectList_(executiveStatuses, sciip1540Get_(row, map, ['Executive_Statuses']));
    sciip1540CollectList_(priorities, sciip1540Get_(row, map, ['Priorities']));
    sciip1540CollectList_(signalTypes, sciip1540Get_(row, map, ['Signal_Types']));
    sciip1540CollectList_(severities, sciip1540Get_(row, map, ['Severities']));
    sciip1540CollectList_(sourceStatuses, sciip1540Get_(row, map, ['Source_Statuses', 'Status']));

    const graphSummary = sciip1540Get_(row, map, ['Graph_Summaries', 'Graph_Summary']);
    const ledgerSummary = sciip1540Get_(row, map, ['Ledger_Summary']);

    if (graphSummary) graphSummaries.push(String(graphSummary));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));

    knowledgeGraphRecordsReviewed += Number(sciip1540Get_(row, map, ['Knowledge_Graph_Records_Reviewed']) || 0);
    archiveLedgerEntriesProjected += Number(sciip1540Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1540Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1540Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1540Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1540Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1540Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1540Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1540Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1540Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1540Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1540Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1540Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const systemMapId = `APRSC_SYSTEM_MAP_${Utilities.getUuid()}`;

  let mapState = 'SYSTEM_MAP_HEALTHY';
  let mapStatus = 'SUCCESS';
  let mapSeverity = 'INFO';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(graphStates).indexOf('GRAPH_REVIEW_REQUIRED') !== -1
  ) {
    mapState = 'SYSTEM_MAP_REVIEW_REQUIRED';
    mapStatus = 'REVIEW_REQUIRED';
    mapSeverity = 'WARN';
  } else if (
    Object.keys(graphStates).indexOf('GRAPH_NO_ACTIVITY') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    mapState = 'SYSTEM_MAP_NO_ACTIVITY';
    mapStatus = 'SUCCESS';
    mapSeverity = 'LOW';
  }

  const systemMapSummary =
    `Continuity system map for ${dateKey}: ${mapState}. ` +
    `${relevantRows.length} knowledge graph ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} mapped; ` +
    `nodes: ${Object.keys(graphNodeIds).join(', ') || 'NONE'}; ` +
    `edges: ${Object.keys(graphEdgeTypes).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    systemMapId,
    businessKey,
    dateKey,
    SCIIP_1540_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceGraphRecordIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    mapState,
    mapSeverity,
    Object.keys(archiveStates).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    knowledgeGraphRecordsReviewed,
    archiveLedgerEntriesProjected,
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefsReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    graphSummaries.join(' | '),
    ledgerSummaries.join(' | '),
    systemMapSummary,
    mapStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1540_AutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemMapsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemMapProcessor',
    result
  }));
  return result;
}

function sciip1540TargetHeaders_() {
  return [
    'System_Map_Id',
    'Business_Key',
    'System_Map_Date',
    'Source_Sheet',
    'Knowledge_Graph_Ledger_Entries_Mapped',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Source_Knowledge_Graph_Record_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'System_Map_State',
    'System_Map_Severity',
    'Archive_States',
    'Closure_States',
    'Finalization_States',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Knowledge_Graph_Records_Reviewed',
    'Archive_Ledger_Entries_Projected',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Briefs_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Graph_Summaries',
    'Source_Ledger_Summaries',
    'System_Map_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1540EnsureSheet_(ss, sheetName, headers) {
  let sheet = ss.getSheetByName(sheetName);
  if (!sheet) sheet = ss.insertSheet(sheetName);

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(headers);
  } else {
    const existingHeaders = sheet.getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1)).getValues()[0];
    if (!existingHeaders[0]) {
      sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    }
  }

  return sheet;
}

function sciip1540HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1540Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1540CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1540BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1540_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1540HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1540ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1540_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1540ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1540HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1540Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1540Get_(row, map, [
      'Ledger_Date',
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1540NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1540NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1540ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1540ResolveDateKey_(value) {
  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}$/.test(trimmed)) {
      return trimmed;
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return sciipFormatDateKey_(new Date());
}

function sciip1540NormalizeDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]' && !isNaN(value.getTime())) {
    return sciipFormatDateKey_(value);
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();

    if (/^\d{4}-\d{2}-\d{2}/.test(trimmed)) {
      return trimmed.substring(0, 10);
    }

    const parsed = new Date(trimmed);
    if (!isNaN(parsed.getTime())) {
      return sciipFormatDateKey_(parsed);
    }
  }

  return '';
}