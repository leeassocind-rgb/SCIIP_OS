/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor
 *
 * Migration note:
 * Preserves original processor business logic by executing
 * the original implementation inside SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
    action: 'AUTONOMOUS_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_BUILD',
    sourceSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER',
    targetSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH',
    ledgerSheet: 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_RUNTIME_LEDGER',

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
          originalProcessor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
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
      var legacyResult = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessorLegacy1520_();
      return sciipWrapLegacyRuntimeResult1520_(legacyResult, context, transaction);
    }
  });
}

function sciipWrapLegacyRuntimeResult1520_(legacyResult, context, transaction) {
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
 * 1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH
 */

const SCIIP_1520_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHIVE_LEDGER';
const SCIIP_1520_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH';
const SCIIP_1520_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH';

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessorLegacy1520_() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1520ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1520_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1520EnsureSheet_(ss, SCIIP_1520_TARGET_SHEET, sciip1520TargetHeaders_());

  if (sciip1520BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1520_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1520HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1520Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1520Get_(row, map, [
      'Ledger_Date',
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1520NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceBusinessKeys = [];

  const archiveStates = {};
  const archiveDecisions = {};
  const archiveSeverities = {};
  const closureStates = {};
  const closureDecisions = {};
  const finalizationStates = {};
  const finalizationDecisions = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let archivesReviewed = 0;
  let closureLedgerEntriesArchived = 0;
  let closuresReviewed = 0;
  let finalizationLedgerEntriesReviewed = 0;
  let finalizationsReviewed = 0;
  let dailyBriefLedgerEntriesReviewed = 0;
  let dailyBriefsReviewed = 0;
  let executiveSummaryLedgerEntriesReviewed = 0;
  let commandCenterLedgerEntriesReviewed = 0;
  let commandCenterUpdatesReviewed = 0;
  let underlyingLedgerEntriesReviewed = 0;
  let successfulEntries = 0;
  let duplicateEntries = 0;
  let failedEntries = 0;

  const archiveSummaries = [];
  const ledgerSummaries = [];
  const closureSummaries = [];
  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1520Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const sourceBusinessKey = sciip1520Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));

    sciip1520CollectList_(archiveStates, sciip1520Get_(row, map, ['Archive_States', 'Archive_State']));
    sciip1520CollectList_(archiveDecisions, sciip1520Get_(row, map, ['Archive_Decisions', 'Archive_Decision']));
    sciip1520CollectList_(archiveSeverities, sciip1520Get_(row, map, ['Archive_Severities', 'Archive_Severity']));
    sciip1520CollectList_(closureStates, sciip1520Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1520CollectList_(closureDecisions, sciip1520Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1520CollectList_(finalizationStates, sciip1520Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1520CollectList_(finalizationDecisions, sciip1520Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1520CollectList_(operationalStates, sciip1520Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1520CollectList_(executiveStatuses, sciip1520Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1520CollectList_(priorities, sciip1520Get_(row, map, ['Priorities', 'Priority']));
    sciip1520CollectList_(signalTypes, sciip1520Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1520CollectList_(severities, sciip1520Get_(row, map, ['Severities', 'Severity']));
    sciip1520CollectList_(sourceStatuses, sciip1520Get_(row, map, ['Source_Statuses', 'Status']));

    const archiveSummary = sciip1520Get_(row, map, ['Archive_Summaries', 'Archive_Summary']);
    const ledgerSummary = sciip1520Get_(row, map, ['Ledger_Summary']);
    const closureSummary = sciip1520Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const finalizationSummary = sciip1520Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1520Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1520Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);

    if (archiveSummary) archiveSummaries.push(String(archiveSummary));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));

    archivesReviewed += Number(sciip1520Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1520Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1520Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1520Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1520Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1520Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1520Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1520Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1520Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1520Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const graphRecordId = `APRSC_KG_${Utilities.getUuid()}`;
  const graphNodeId = `KG_NODE_RUN_STATE_CONTINUITY_${dateKey}`;
  const graphNodeType = 'RUN_STATE_CONTINUITY_ARCHIVE';
  const graphEdgeType = 'SUMMARIZES_ARCHIVED_CONTINUITY_CHAIN';
  const graphSubject = `RUN_STATE_CONTINUITY|${dateKey}`;
  const graphObject = sourceBusinessKeys.join(', ');

  const graphState =
    Object.keys(archiveStates).indexOf('CONTINUITY_ARCHIVED_WITH_REVIEW_FLAG') !== -1
      ? 'GRAPH_REVIEW_REQUIRED'
      : Object.keys(archiveStates).indexOf('CONTINUITY_ARCHIVED_NO_ACTIVITY') !== -1
        ? 'GRAPH_NO_ACTIVITY'
        : 'GRAPH_HEALTHY';

  const graphStatus = graphState === 'GRAPH_REVIEW_REQUIRED' ? 'REVIEW_REQUIRED' : 'SUCCESS';

  const graphSummary =
    `Knowledge graph projection for run state continuity ${dateKey}: ${graphState}. ` +
    `${relevantRows.length} archive ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} projected; ` +
    `archive states: ${Object.keys(archiveStates).join(', ') || 'NONE'}; ` +
    `closure states: ${Object.keys(closureStates).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    graphRecordId,
    businessKey,
    dateKey,
    SCIIP_1520_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceBusinessKeys.join(', '),
    graphNodeId,
    graphNodeType,
    graphEdgeType,
    graphSubject,
    graphObject,
    graphState,
    Object.keys(archiveStates).join(', '),
    Object.keys(archiveDecisions).join(', '),
    Object.keys(archiveSeverities).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(closureDecisions).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(finalizationDecisions).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    archivesReviewed,
    closureLedgerEntriesArchived,
    closuresReviewed,
    finalizationLedgerEntriesReviewed,
    finalizationsReviewed,
    dailyBriefLedgerEntriesReviewed,
    dailyBriefsReviewed,
    executiveSummaryLedgerEntriesReviewed,
    commandCenterLedgerEntriesReviewed,
    commandCenterUpdatesReviewed,
    underlyingLedgerEntriesReviewed,
    successfulEntries,
    duplicateEntries,
    failedEntries,
    archiveSummaries.join(' | '),
    ledgerSummaries.join(' | '),
    closureSummaries.join(' | '),
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    graphSummary,
    graphStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1520_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityKnowledgeGraphRecordsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphProcessor',
    result
  }));
  return result;
}

function sciip1520TargetHeaders_() {
  return [
    'Knowledge_Graph_Record_Id',
    'Business_Key',
    'Graph_Date',
    'Source_Sheet',
    'Archive_Ledger_Entries_Projected',
    'Source_Ledger_Entry_Ids',
    'Source_Business_Keys',
    'Graph_Node_Id',
    'Graph_Node_Type',
    'Graph_Edge_Type',
    'Graph_Subject',
    'Graph_Object',
    'Graph_State',
    'Archive_States',
    'Archive_Decisions',
    'Archive_Severities',
    'Closure_States',
    'Closure_Decisions',
    'Finalization_States',
    'Finalization_Decisions',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'Archives_Reviewed',
    'Closure_Ledger_Entries_Archived',
    'Closures_Reviewed',
    'Finalization_Ledger_Entries_Reviewed',
    'Finalizations_Reviewed',
    'Daily_Brief_Ledger_Entries_Reviewed',
    'Daily_Briefs_Reviewed',
    'Executive_Summary_Ledger_Entries_Reviewed',
    'Command_Center_Ledger_Entries_Reviewed',
    'Command_Center_Updates_Reviewed',
    'Underlying_Ledger_Entries_Reviewed',
    'Underlying_Successful_Continuity_Ledger_Entries',
    'Underlying_Duplicate_Continuity_Ledger_Entries',
    'Underlying_Failed_Continuity_Ledger_Entries',
    'Archive_Summaries',
    'Source_Ledger_Summaries',
    'Closure_Summaries',
    'Finalization_Summaries',
    'Recommended_Actions',
    'Recommended_Next_Steps',
    'Graph_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1520EnsureSheet_(ss, sheetName, headers) {
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

function sciip1520HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1520Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1520CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1520BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1520_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1520HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1520ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1520_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1520ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1520HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1520Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1520Get_(row, map, [
      'Ledger_Date',
      'Archive_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1520NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1520NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1520ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1520ResolveDateKey_(value) {
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

function sciip1520NormalizeDateKey_(value) {
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