/**
 * SCIIP_OS v5.0
 * 1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor
 *
 * Consumes:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX
 *
 * Produces:
 * AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER
 */

const SCIIP_ARCHITECTURE_REVIEW_LEDGER_PROCESSOR =
  '1710_AutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor';

const SCIIP_ARCHITECTURE_REVIEW_INDEX_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_INDEX';

const SCIIP_ARCHITECTURE_REVIEW_LEDGER_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER';

const SCIIP_ARCHITECTURE_REVIEW_LEDGER_HEADERS = [
  'Ledger_ID',
  'Business_Key',
  'Review_Date',
  'Source_Business_Key',
  'Source_Index_ID',
  'Architecture_Domain',
  'Architecture_Principle',
  'Architecture_Decision',
  'System_Impact',
  'Continuity_Impact',
  'Knowledge_Graph_Impact',
  'Risk_Level',
  'Review_Status',
  'Processor',
  'Created_At'
];

function sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor() {
  const startedAt = new Date();

  const reviewDate = sciipNormalizeDateToBusinessDate
    ? sciipNormalizeDateToBusinessDate(new Date())
    : Utilities.formatDate(new Date(), Session.getScriptTimeZone(), 'yyyy-MM-dd');

  sciipEnsureSheetWithHeaders_1710_(
    SCIIP_ARCHITECTURE_REVIEW_LEDGER_SHEET,
    SCIIP_ARCHITECTURE_REVIEW_LEDGER_HEADERS
  );

  const indexRows = sciipGetSheetRecords_1710_(SCIIP_ARCHITECTURE_REVIEW_INDEX_SHEET);

  if (!indexRows.length) {
    const result = {
      processor: SCIIP_ARCHITECTURE_REVIEW_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      architectureReviewLedgerEntriesCreated: 0,
      completedAt: startedAt.toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  let created = 0;
  let skippedDuplicate = 0;
  let lastBusinessKey = null;

  indexRows.forEach(function(row) {
    const sourceBusinessKey =
      row.Business_Key ||
      row.businessKey ||
      row.Source_Business_Key ||
      '';

    const sourceIndexId =
      row.Index_ID ||
      row.Architecture_Review_Index_ID ||
      row.ID ||
      sourceBusinessKey;

    const businessKey =
      'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_CONTINUITY_ARCHITECTURE_REVIEW_LEDGER|' +
      reviewDate +
      '|' +
      sourceBusinessKey;

    lastBusinessKey = businessKey;

    if (sciipBusinessKeyExists_1710_(SCIIP_ARCHITECTURE_REVIEW_LEDGER_SHEET, businessKey)) {
      skippedDuplicate++;
      return;
    }

    const ledgerId = 'ARCH_REVIEW_LEDGER_' + Utilities.getUuid();

    const record = {
      Ledger_ID: ledgerId,
      Business_Key: businessKey,
      Review_Date: reviewDate,
      Source_Business_Key: sourceBusinessKey,
      Source_Index_ID: sourceIndexId,
      Architecture_Domain: row.Architecture_Domain || 'SCIIP_OS_PLATFORM_ARCHITECTURE',
      Architecture_Principle: row.Architecture_Principle || 'EVENT_SOURCED_KNOWLEDGE_GRAPH_NATIVE_PLATFORM',
      Architecture_Decision: row.Architecture_Decision || 'Architecture review index entry promoted into permanent architecture review ledger history.',
      System_Impact: row.System_Impact || 'Creates queryable architectural memory for SCIIP_OS platform evolution.',
      Continuity_Impact: row.Continuity_Impact || 'Preserves design continuity across autonomous processor generations.',
      Knowledge_Graph_Impact: row.Knowledge_Graph_Impact || 'Adds architecture-review facts as durable graph-ready records.',
      Risk_Level: row.Risk_Level || 'LOW',
      Review_Status: row.Review_Status || 'LEDGERED',
      Processor: SCIIP_ARCHITECTURE_REVIEW_LEDGER_PROCESSOR,
      Created_At: startedAt.toISOString()
    };

    sciipAppendRecord_1710_(SCIIP_ARCHITECTURE_REVIEW_LEDGER_SHEET, SCIIP_ARCHITECTURE_REVIEW_LEDGER_HEADERS, record);
    created++;
  });

  const result = {
    processor: SCIIP_ARCHITECTURE_REVIEW_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerEntriesCreated: created,
    skippedDuplicate: skippedDuplicate,
    businessKey: lastBusinessKey,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Test
 */
function sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateContinuityArchitectureReviewLedgerProcessor',
    result: result
  }));

  return result;
}

/**
 * Local compatibility helpers.
 * These defer to shared SCIIP utilities where available.
 */

function sciipEnsureSheetWithHeaders_1710_(sheetName, headers) {
  if (typeof sciipEnsureSheetWithHeaders === 'function') {
    return sciipEnsureSheetWithHeaders(sheetName, headers);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(sheetName);

  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  }

  const existingHeaders = sheet.getLastColumn() > 0
    ? sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0]
    : [];

  if (!existingHeaders.length || existingHeaders[0] === '') {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
  }

  return sheet;
}

function sciipGetSheetRecords_1710_(sheetName) {
  if (typeof sciipGetSheetRecords === 'function') {
    return sciipGetSheetRecords(sheetName);
  }

  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return [];

  const values = sheet.getDataRange().getValues();
  const headers = values.shift();

  return values.map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

function sciipBusinessKeyExists_1710_(sheetName, businessKey) {
  if (typeof sciipBusinessKeyExists === 'function') {
    return sciipBusinessKeyExists(sheetName, businessKey);
  }

  const records = sciipGetSheetRecords_1710_(sheetName);
  return records.some(function(record) {
    return record.Business_Key === businessKey;
  });
}

function sciipAppendRecord_1710_(sheetName, headers, record) {
  const sheet = sciipEnsureSheetWithHeaders_1710_(sheetName, headers);
  const row = headers.map(function(header) {
    return record[header] !== undefined ? record[header] : '';
  });
  sheet.appendRow(row);
}