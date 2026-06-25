/*******************************************************
 * SCIIP_OS v4.1
 * 1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR =
  '1210_AutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Digest_ID',
  'Digest_Type',
  'Signal_Posture',
  'Digest_Severity',
  'Digest_Status',
  'Digest_Message',
  'Governance_Posture',
  'Orchestration_Posture',
  'Dashboard_Posture',
  'Decisioning_Posture',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Latest_Signal_ID',
  'Latest_Signal_Category',
  'Latest_Signal_Severity',
  'Latest_Signal_Status',
  'Latest_Operational_State',
  'Latest_Source_Business_Key',
  'Source_Digest_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_SIGNAL_DIGEST_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateSignalDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digestRows =
    sciipReadAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateSignalDigestLedgerRowsByDate_(
      digestRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateSignalDigestLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestDigest =
    sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateSignalDigestLedgerEntry_(
      latestDigest,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateSignalDigestLedgerEntriesCreated: 1,
    skippedDuplicate: 0,
    businessKey: businessKey,
    resolvedRunStateDate: resolvedRunStateDate,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

/**
 * Factory: output sheet.
 */
function sciipEnsureAutonomousProcessorExecutionRunStateSignalDigestLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_OUTPUT_HEADERS.filter(
      function(h) {
        return headers.indexOf(h) === -1;
      }
    );

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: ledger entry.
 */
function sciipBuildAutonomousProcessorExecutionRunStateSignalDigestLedgerEntry_(
  digest,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSSDL_' + Utilities.getUuid();

  const summary = {
    runStateDate: resolvedRunStateDate,
    digestId: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_ID']),
    digestType: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Type']),
    signalPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signal_Posture']),
    digestSeverity: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Severity']),
    digestStatus: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Status']),
    governancePosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Governance_Posture']),
    orchestrationPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Orchestration_Posture']),
    dashboardPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Dashboard_Posture']),
    decisioningPosture: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Decisioning_Posture']),
    recommendedAction: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Recommended_Action']),
    autonomousActionAllowed: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Autonomous_Action_Allowed']),
    humanReviewRequired: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Human_Review_Required']),
    signalsReviewed: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signals_Reviewed']),
    sourceDigestBusinessKey: sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Business_Key'])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_ID']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Type']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signal_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Severity']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Status']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Digest_Message']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Governance_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Orchestration_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Dashboard_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Decisioning_Posture']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Recommended_Action']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Autonomous_Action_Allowed']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Human_Review_Required']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Signals_Reviewed']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Critical_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['High_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Medium_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Low_Signal_Count']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_ID']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_Category']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_Severity']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Signal_Status']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Operational_State']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Latest_Source_Business_Key']),
    sciipGetRunStateSignalDigestLedgerInputValue_(digest, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(summary),
    SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRows_(
  sheet
) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0].map(String);

  return values.slice(1).map(function(row) {
    const obj = {};
    headers.forEach(function(header, i) {
      obj[header] = row[i];
    });
    return obj;
  });
}

/**
 * Resolver logic.
 */
function sciipFilterAutonomousProcessorExecutionRunStateSignalDigestLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateSignalDigestLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_SIGNAL_DIGEST_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Digest_Date',
      'Signal_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateSignalDigestLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateSignalDigestLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateSignalDigestLedgerInputValue_(a, ['Created_At', 'createdAt']) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateSignalDigestLedgerInputValue_(b, ['Created_At', 'createdAt']) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateSignalDigestLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateSignalDigestLedgerDateKey_(value) {
  if (!value) return '';

  if (Object.prototype.toString.call(value) === '[object Date]') {
    return sciipFormatDateKey_(value);
  }

  const text = String(value);

  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    return text;
  }

  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return sciipFormatDateKey_(parsed);
  }

  return text;
}

/**
 * Standalone test.
 */
function sciipTestAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateSignalDigestLedgerProcessor',
    result: result
  }));

  return result;
}