/**
 * 1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor
 *
 * Consumes:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER
 *
 * Produces:
 *  AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX
 */

const SCIIP_1560_SOURCE_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_MAP_LEDGER';
const SCIIP_1560_TARGET_SHEET = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX';
const SCIIP_1560_BUSINESS_KEY_PREFIX = 'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_SYSTEM_INDEX';

function sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor() {
  const ss = sciipGetSpreadsheet_();
  const dateKey = sciip1560ResolveLatestSourceDateKey_(ss);
  const businessKey = `${SCIIP_1560_BUSINESS_KEY_PREFIX}|${dateKey}`;
  const startedAt = new Date();

  const targetSheet = sciip1560EnsureSheet_(ss, SCIIP_1560_TARGET_SHEET, sciip1560TargetHeaders_());

  if (sciip1560BusinessKeyExists_(targetSheet, businessKey)) {
    return {
      processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceSheet = ss.getSheetByName(SCIIP_1560_SOURCE_SHEET);
  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return {
      processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1560HeaderMap_(headers);

  const relevantRows = rows.filter(row => {
    const rowBusinessKey = sciip1560Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const rowDate = sciip1560Get_(row, map, [
      'Ledger_Date',
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    return String(rowBusinessKey || '').indexOf(`|${dateKey}`) !== -1 ||
           sciip1560NormalizeDateKey_(rowDate) === dateKey;
  });

  if (!relevantRows.length) {
    return {
      processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 0,
      businessKey,
      completedAt: new Date().toISOString()
    };
  }

  const sourceLedgerEntryIds = [];
  const sourceSystemMapIds = [];
  const sourceBusinessKeys = [];
  const sourceKnowledgeGraphRecordIds = [];

  const graphNodeIds = {};
  const graphNodeTypes = {};
  const graphEdgeTypes = {};
  const graphSubjects = {};
  const graphObjects = {};
  const graphStates = {};
  const systemMapStates = {};
  const systemMapSeverities = {};

  const archiveStates = {};
  const closureStates = {};
  const finalizationStates = {};
  const operationalStates = {};
  const executiveStatuses = {};
  const priorities = {};
  const signalTypes = {};
  const severities = {};
  const sourceStatuses = {};

  let systemMapsReviewed = 0;
  let knowledgeGraphLedgerEntriesMapped = 0;
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
  const sourceLedgerSummaries = [];
  const systemMapSummaries = [];
  const ledgerSummaries = [];

  relevantRows.forEach(row => {
    const ledgerEntryId = sciip1560Get_(row, map, ['Ledger_Entry_Id', 'Ledger_ID', 'ledgerEntryId']);
    const systemMapId = sciip1560Get_(row, map, ['Source_System_Map_Ids', 'System_Map_Id']);
    const sourceBusinessKey = sciip1560Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const sourceKgRecordId = sciip1560Get_(row, map, ['Source_Knowledge_Graph_Record_Ids', 'Source_Knowledge_Graph_Record_Id']);

    if (ledgerEntryId) sourceLedgerEntryIds.push(String(ledgerEntryId));
    if (systemMapId) sourceSystemMapIds.push(String(systemMapId));
    if (sourceBusinessKey) sourceBusinessKeys.push(String(sourceBusinessKey));
    if (sourceKgRecordId) sourceKnowledgeGraphRecordIds.push(String(sourceKgRecordId));

    sciip1560CollectList_(graphNodeIds, sciip1560Get_(row, map, ['Graph_Node_Ids']));
    sciip1560CollectList_(graphNodeTypes, sciip1560Get_(row, map, ['Graph_Node_Types']));
    sciip1560CollectList_(graphEdgeTypes, sciip1560Get_(row, map, ['Graph_Edge_Types']));
    sciip1560CollectList_(graphSubjects, sciip1560Get_(row, map, ['Graph_Subjects']));
    sciip1560CollectList_(graphObjects, sciip1560Get_(row, map, ['Graph_Objects']));
    sciip1560CollectList_(graphStates, sciip1560Get_(row, map, ['Graph_States']));
    sciip1560CollectList_(systemMapStates, sciip1560Get_(row, map, ['System_Map_States']));
    sciip1560CollectList_(systemMapSeverities, sciip1560Get_(row, map, ['System_Map_Severities']));

    sciip1560CollectList_(archiveStates, sciip1560Get_(row, map, ['Archive_States']));
    sciip1560CollectList_(closureStates, sciip1560Get_(row, map, ['Closure_States']));
    sciip1560CollectList_(finalizationStates, sciip1560Get_(row, map, ['Finalization_States']));
    sciip1560CollectList_(operationalStates, sciip1560Get_(row, map, ['Operational_States']));
    sciip1560CollectList_(executiveStatuses, sciip1560Get_(row, map, ['Executive_Statuses']));
    sciip1560CollectList_(priorities, sciip1560Get_(row, map, ['Priorities']));
    sciip1560CollectList_(signalTypes, sciip1560Get_(row, map, ['Signal_Types']));
    sciip1560CollectList_(severities, sciip1560Get_(row, map, ['Severities']));
    sciip1560CollectList_(sourceStatuses, sciip1560Get_(row, map, ['Source_Statuses', 'Status']));

    const graphSummary = sciip1560Get_(row, map, ['Graph_Summaries']);
    const sourceLedgerSummary = sciip1560Get_(row, map, ['Source_Ledger_Summaries']);
    const systemMapSummary = sciip1560Get_(row, map, ['System_Map_Summaries']);
    const ledgerSummary = sciip1560Get_(row, map, ['Ledger_Summary']);

    if (graphSummary) graphSummaries.push(String(graphSummary));
    if (sourceLedgerSummary) sourceLedgerSummaries.push(String(sourceLedgerSummary));
    if (systemMapSummary) systemMapSummaries.push(String(systemMapSummary));
    if (ledgerSummary) ledgerSummaries.push(String(ledgerSummary));

    systemMapsReviewed += Number(sciip1560Get_(row, map, ['System_Maps_Reviewed']) || 0);
    knowledgeGraphLedgerEntriesMapped += Number(sciip1560Get_(row, map, ['Knowledge_Graph_Ledger_Entries_Mapped']) || 0);
    knowledgeGraphRecordsReviewed += Number(sciip1560Get_(row, map, ['Knowledge_Graph_Records_Reviewed']) || 0);
    archiveLedgerEntriesProjected += Number(sciip1560Get_(row, map, ['Archive_Ledger_Entries_Projected']) || 0);
    archivesReviewed += Number(sciip1560Get_(row, map, ['Archives_Reviewed']) || 0);
    closureLedgerEntriesArchived += Number(sciip1560Get_(row, map, ['Closure_Ledger_Entries_Archived']) || 0);
    closuresReviewed += Number(sciip1560Get_(row, map, ['Closures_Reviewed']) || 0);
    finalizationLedgerEntriesReviewed += Number(sciip1560Get_(row, map, ['Finalization_Ledger_Entries_Reviewed']) || 0);
    finalizationsReviewed += Number(sciip1560Get_(row, map, ['Finalizations_Reviewed']) || 0);
    dailyBriefsReviewed += Number(sciip1560Get_(row, map, ['Daily_Briefs_Reviewed']) || 0);
    commandCenterUpdatesReviewed += Number(sciip1560Get_(row, map, ['Command_Center_Updates_Reviewed']) || 0);
    underlyingLedgerEntriesReviewed += Number(sciip1560Get_(row, map, ['Underlying_Ledger_Entries_Reviewed']) || 0);
    successfulEntries += Number(sciip1560Get_(row, map, ['Underlying_Successful_Continuity_Ledger_Entries']) || 0);
    duplicateEntries += Number(sciip1560Get_(row, map, ['Underlying_Duplicate_Continuity_Ledger_Entries']) || 0);
    failedEntries += Number(sciip1560Get_(row, map, ['Underlying_Failed_Continuity_Ledger_Entries']) || 0);
  });

  const indexId = `APRSC_SYSTEM_INDEX_${Utilities.getUuid()}`;

  let indexState = 'SYSTEM_INDEX_HEALTHY';
  let indexStatus = 'SUCCESS';
  let indexSeverity = 'INFO';

  if (
    failedEntries > 0 ||
    Object.keys(sourceStatuses).indexOf('REVIEW_REQUIRED') !== -1 ||
    Object.keys(systemMapStates).indexOf('SYSTEM_MAP_REVIEW_REQUIRED') !== -1
  ) {
    indexState = 'SYSTEM_INDEX_REVIEW_REQUIRED';
    indexStatus = 'REVIEW_REQUIRED';
    indexSeverity = 'WARN';
  } else if (
    Object.keys(systemMapStates).indexOf('SYSTEM_MAP_NO_ACTIVITY') !== -1 ||
    underlyingLedgerEntriesReviewed === 0
  ) {
    indexState = 'SYSTEM_INDEX_NO_ACTIVITY';
    indexStatus = 'SUCCESS';
    indexSeverity = 'LOW';
  }

  const searchableTerms = [
    dateKey,
    businessKey,
    Object.keys(graphNodeIds).join(' '),
    Object.keys(graphNodeTypes).join(' '),
    Object.keys(graphEdgeTypes).join(' '),
    Object.keys(graphStates).join(' '),
    Object.keys(systemMapStates).join(' '),
    Object.keys(archiveStates).join(' '),
    Object.keys(closureStates).join(' '),
    Object.keys(finalizationStates).join(' '),
    Object.keys(operationalStates).join(' '),
    Object.keys(executiveStatuses).join(' '),
    Object.keys(priorities).join(' '),
    Object.keys(sourceStatuses).join(' ')
  ].join(' ').trim();

  const indexSummary =
    `Continuity system index for ${dateKey}: ${indexState}. ` +
    `${relevantRows.length} system map ledger entr${relevantRows.length === 1 ? 'y' : 'ies'} indexed; ` +
    `${Object.keys(graphNodeIds).length} graph node key${Object.keys(graphNodeIds).length === 1 ? '' : 's'}; ` +
    `${underlyingLedgerEntriesReviewed} underlying continuity ledger entries reviewed; ` +
    `${failedEntries} failed.`;

  targetSheet.appendRow([
    indexId,
    businessKey,
    dateKey,
    SCIIP_1560_SOURCE_SHEET,
    relevantRows.length,
    sourceLedgerEntryIds.join(', '),
    sourceSystemMapIds.join(', '),
    sourceBusinessKeys.join(', '),
    sourceKnowledgeGraphRecordIds.join(', '),
    Object.keys(graphNodeIds).join(', '),
    Object.keys(graphNodeTypes).join(', '),
    Object.keys(graphEdgeTypes).join(', '),
    Object.keys(graphSubjects).join(', '),
    Object.keys(graphObjects).join(', '),
    Object.keys(graphStates).join(', '),
    Object.keys(systemMapStates).join(', '),
    Object.keys(systemMapSeverities).join(', '),
    indexState,
    indexSeverity,
    Object.keys(archiveStates).join(', '),
    Object.keys(closureStates).join(', '),
    Object.keys(finalizationStates).join(', '),
    Object.keys(operationalStates).join(', '),
    Object.keys(executiveStatuses).join(', '),
    Object.keys(priorities).join(', '),
    Object.keys(signalTypes).join(', '),
    Object.keys(severities).join(', '),
    Object.keys(sourceStatuses).join(', '),
    systemMapsReviewed,
    knowledgeGraphLedgerEntriesMapped,
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
    sourceLedgerSummaries.join(' | '),
    systemMapSummaries.join(' | '),
    ledgerSummaries.join(' | '),
    searchableTerms,
    indexSummary,
    indexStatus,
    startedAt.toISOString(),
    Session.getActiveUser().getEmail(),
    'SCIIP_OS_v4.1'
  ]);

  return {
    processor: '1560_AutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuitySystemIndexesCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString()
  };
}

function sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor() {
  const result = sciipRunAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuitySystemIndexProcessor',
    result
  }));
  return result;
}

function sciip1560TargetHeaders_() {
  return [
    'System_Index_Id',
    'Business_Key',
    'Index_Date',
    'Source_Sheet',
    'System_Map_Ledger_Entries_Indexed',
    'Source_Ledger_Entry_Ids',
    'Source_System_Map_Ids',
    'Source_Business_Keys',
    'Source_Knowledge_Graph_Record_Ids',
    'Graph_Node_Ids',
    'Graph_Node_Types',
    'Graph_Edge_Types',
    'Graph_Subjects',
    'Graph_Objects',
    'Graph_States',
    'System_Map_States',
    'System_Map_Severities',
    'System_Index_State',
    'System_Index_Severity',
    'Archive_States',
    'Closure_States',
    'Finalization_States',
    'Operational_States',
    'Executive_Statuses',
    'Priorities',
    'Signal_Types',
    'Severities',
    'Source_Statuses',
    'System_Maps_Reviewed',
    'Knowledge_Graph_Ledger_Entries_Mapped',
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
    'System_Map_Summaries',
    'Input_Ledger_Summaries',
    'Searchable_Terms',
    'Index_Summary',
    'Status',
    'Created_At',
    'Created_By',
    'SCIIP_Version'
  ];
}

function sciip1560EnsureSheet_(ss, sheetName, headers) {
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

function sciip1560HeaderMap_(headers) {
  const map = {};
  headers.forEach((h, i) => {
    if (h !== null && h !== '') map[String(h).trim()] = i;
  });
  return map;
}

function sciip1560Get_(row, map, names) {
  for (let i = 0; i < names.length; i++) {
    if (map[names[i]] !== undefined) return row[map[names[i]]];
  }
  return '';
}

function sciip1560CollectList_(bucket, value) {
  if (!value) return;

  String(value)
    .split(',')
    .map(item => item.trim())
    .filter(Boolean)
    .forEach(item => {
      bucket[item] = true;
    });
}

function sciip1560BusinessKeyExists_(sheet, businessKey) {
  if (typeof sciipBusinessKeyPrefixExists_ === 'function') {
    try {
      return sciipBusinessKeyPrefixExists_(SCIIP_1560_TARGET_SHEET, businessKey);
    } catch (err) {
      try {
        return sciipBusinessKeyPrefixExists_(sheet, businessKey);
      } catch (ignored) {}
    }
  }

  if (sheet.getLastRow() < 2) return false;

  const headers = sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];
  const map = sciip1560HeaderMap_(headers);
  const businessKeyCol = map.Business_Key;

  if (businessKeyCol === undefined) return false;

  const values = sheet.getRange(2, businessKeyCol + 1, sheet.getLastRow() - 1, 1).getValues();
  return values.some(r => String(r[0]) === String(businessKey));
}

function sciip1560ResolveLatestSourceDateKey_(ss) {
  const sourceSheet = ss.getSheetByName(SCIIP_1560_SOURCE_SHEET);

  if (!sourceSheet || sourceSheet.getLastRow() < 2) {
    return sciip1560ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  const values = sourceSheet.getDataRange().getValues();
  const headers = values[0];
  const rows = values.slice(1);
  const map = sciip1560HeaderMap_(headers);

  const dateKeys = rows.map(row => {
    const businessKey = sciip1560Get_(row, map, ['Business_Key', 'businessKey', 'BUSINESS_KEY']);
    const ledgerDate = sciip1560Get_(row, map, [
      'Ledger_Date',
      'System_Map_Date',
      'Date_Key',
      'Processing_Date',
      'Run_Date',
      'Created_At'
    ]);

    const fromBusinessKey = String(businessKey || '').split('|')[1];
    const normalizedFromBusinessKey = sciip1560NormalizeDateKey_(fromBusinessKey);
    if (normalizedFromBusinessKey) return normalizedFromBusinessKey;

    return sciip1560NormalizeDateKey_(ledgerDate);
  }).filter(Boolean);

  if (!dateKeys.length) {
    return sciip1560ResolveDateKey_(sciipResolveLatestProcessingDate_());
  }

  dateKeys.sort();
  return dateKeys[dateKeys.length - 1];
}

function sciip1560ResolveDateKey_(value) {
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

function sciip1560NormalizeDateKey_(value) {
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