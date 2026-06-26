/**
 * 1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER
 */

const SCIIP_1530_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH';
const SCIIP_1530_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER';
const SCIIP_1530_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_KNOWLEDGE_GRAPH_LEDGER';

function sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1530ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1530_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1530EnsureSheet_(ss, SCIIP_1530_TARGET_SHEET, sciip1530TargetHeaders_());

  if (sciip1530BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1530_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1530HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1530Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1530Get_(row, map, [
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1530NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceGraphRecordIds = [];
  const sourceBusinessKeys = [];
  const sourceLedgerEntryIds = [];
  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};

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

  let archiveLedgerEntriesProjected = 0;
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
  const sourceLedgerSummaries = [];
  const closureSummaries = [];
  const finalizationSummaries = [];
  const recommendedActions = [];
  const recommendedNextSteps = [];
  const graphSummaries = [];

  relevantRows.forEach(row => {
    const graphRecordId = sciip1530Get_(row, map, ['Knowledge_Graph_Record_Id', 'Graph_Record_Id']);
    const sourceBusinessKey = sciip1530Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const sourceLedgerEntryId = sciip1530Get_(row, map, ['Source_Ledger_Entry_Ids', 'Source_Ledger_Entry_Id']);

    if (graphRecordId) sourceGraphRecordIds.push(String(graphRecordId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (sourceLedgerEntryId) sourceLedgerEntryIds.push(String(sourceLedgerEntryId));

    sciip1530CollectList_(graphNodeIds, sciip1530Get_(row, map, ['Graph_Node_Id']));
    sciip1530CollectList_(graphNodeTypes, sciip1530Get_(row, map, ['Graph_Node_Type']));
    sciip1530CollectList_(graphEdgeTypes, sciip1530Get_(row, map, ['Graph_Edge_Type']));
    sciip1530CollectList_(graphSubjects, sciip1530Get_(row, map, ['Graph_Subject']));
    sciip1530CollectList_(graphObjects, sciip1530Get_(row, map, ['Graph_Object']));
    sciip1530CollectList_(graphStates, sciip1530Get_(row, map, ['Graph_State']));

    sciip1530CollectList_(archiveStates, sciip1530Get_(row, map, ['Archive_States', 'Archive_State']));
    sciip1530CollectList_(archiveDecisions, sciip1530Get_(row, map, ['Archive_Decisions', 'Archive_Decision']));
    sciip1530CollectList_(archiveSeverities, sciip1530Get_(row, map, ['Archive_Severities', 'Archive_Severity']));
    sciip1530CollectList_(closureStates, sciip1530Get_(row, map, ['Closure_States', 'Closure_State']));
    sciip1530CollectList_(closureDecisions, sciip1530Get_(row, map, ['Closure_Decisions', 'Closure_Decision']));
    sciip1530CollectList_(finalizationStates, sciip1530Get_(row, map, ['Finalization_States', 'Finalization_State']));
    sciip1530CollectList_(finalizationDecisions, sciip1530Get_(row, map, ['Finalization_Decisions', 'Finalization_Decision']));
    sciip1530CollectList_(operationalStates, sciip1530Get_(row, map, ['Operational_States', 'Operational_State']));
    sciip1530CollectList_(executiveStatuses, sciip1530Get_(row, map, ['Executive_Statuses', 'Executive_Status']));
    sciip1530CollectList_(priorities, sciip1530Get_(row, map, ['Priorities', 'Priority']));
    sciip1530CollectList_(signalTypes, sciip1530Get_(row, map, ['Signal_Types', 'Signal_Type']));
    sciip1530CollectList_(severities, sciip1530Get_(row, map, ['Severities', 'Severity']));
    sciip1530CollectList_(sourceStatuses, sciip1530Get_(row, map, ['Source_Statuses', 'Status']));

    const archiveSummary = sciip1530Get_(row, map, ['Archive_Summaries', 'Archive_Summary']);
    const sourceLedgerSummary = sciip1530Get_(row, map, ['Source_Ledger_Summaries', 'Ledger_Summary']);
    const closureSummary = sciip1530Get_(row, map, ['Closure_Summaries', 'Closure_Summary']);
    const finalizationSummary = sciip1530Get_(row, map, ['Finalization_Summaries', 'Finalization_Summary']);
    const recommendedAction = sciip1530Get_(row, map, ['Recommended_Actions', 'Recommended_Action']);
    const recommendedNextStep = sciip1530Get_(row, map, ['Recommended_Next_Steps', 'Recommended_Next_Step']);
    const graphSummary = sciip1530Get_(row, map, ['Graph_Summary']);

    if (archiveSummary) archiveSummaries.push(String(archiveSummary));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (closureSummary) closureSummaries.push(String(closureSummary));
    if (finalizationSummary) finalizationSummaries.push(String(finalizationSummary));
    if (recommendedAction) recommendedActions.push(String(recommendedAction));
    if (recommendedNextStep) recommendedNextSteps.push(String(recommendedNextStep));
    if (graphSummary) graphSummaries.push(String(graphSummary));

    archiveLedgerEntriesProjected += Number(sciip1530Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1530Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1530Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1530Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1530Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Daily_Brief_Ledger_Entries_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1530Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    executiveSummaryLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Executive_Summary_Ledger_Entries_Reviewed']) || 0);
    commandCenterLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Command_Center_Ledger_Entries_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1530Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1530Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1530Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1530Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1530Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const ledgerEntryId = `APRSC_KG_LEDGER_${Utilities.getUuid()}`;

  const ledgerStatus =
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(graphStates).indexOf('GRAPH_REVIEW_REQUIRED') !== -1
      ? 'REVIEW_REQUIRED'
      : 'SUCCESS';

  const ledgerSummary =
    `Continuity knowledge graph ledger entry for ${dateKey}: ` +
    `${relevantRows.length} graph projection entr${relevantRows.length === 1 ? 'y' : 'ies'} recorded; ` +
    `graph states: ${Object.keys(graphStates).join(', ') || 'NONE'}; ` +
    `graph nodes: ${Object.keys(graphNodeIds).join(', ') || 'NONE'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    ledgerEntryId,
    businessKey,
    dateKey,
    SCIIP_1530_SOURCE_SHEET,
    relevantRows.length,
    sourceGraphRecordIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceLedgerEntryIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
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
    archiveLedgerEntriesProjected,
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
    sourceLedgerSummaries.join(' | '),
    closureSummaries.join(' | '),
    finalizationSummaries.join(' | '),
    recommendedActions.join(' | '),
    recommendedNextSteps.join(' | '),
    graphSummaries.join(' | '),
    ledgerSummary,
    ledgerStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1530_AutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityKnowledgeGraphLedgerProcessor',
    result
  }));
  return result;
}

function sciip1530TargetHeaders_() {
  return [
    'Ledger_Entry_Id',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Knowledge_Graph_Records_Reviewed',
    'Source_Knowledge_Graph_Record_Ids',
    'Source_Business_Keys',
    'Source_Ledger_Entry_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
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
    'Archive_Ledger_Entries_Projected',
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
    'Graph_Summaries',
    'Ledger_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1530EnsureSheet_(ss, sheetName, headers) {
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

function sciip1530HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1530Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1530CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1530BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1530_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1530HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1530ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1530_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1530ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1530HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1530Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const graphDate = sciip1530Get_(row, map, [
      'Graph_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1530NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1530NormalizeDateKey_(graphDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1530ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1530ResolveDateKey_(value) {
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

function sciip1530NormalizeDateKey_(value) {
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