/*******************************************************
 * SCIIP_OS v4.1
 * 1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR =
  '1250_AutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Executive_Summary_ID',
  'Summary_Type',
  'Executive_Status',
  'Executive_Severity',
  'Executive_Headline',
  'Executive_Summary',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Operational_Risk',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Display_Severity',
  'Display_Posture',
  'Dashboard_Posture',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Command_Center_Record_ID',
  'Source_Ledger_Entry_ID',
  'Source_Executive_Summary_Business_Key',
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Ledger_Summary_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const summaryRows =
    sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerRowsByDate_(
      summaryRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestSummary =
    sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntry_(
      latestSummary,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntriesCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_OUTPUT_HEADERS.filter(
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
function sciipBuildAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerEntry_(
  summary,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSESL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    executiveSummaryId: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Summary_ID']
    ),
    summaryType: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Summary_Type']
    ),
    executiveStatus: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Status']
    ),
    executiveSeverity: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Severity']
    ),
    executiveHeadline: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Executive_Headline']
    ),
    operationalRisk: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Operational_Risk']
    ),
    recommendedAction: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Recommended_Action']
    ),
    autonomousActionAllowed: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Autonomous_Action_Allowed']
    ),
    humanReviewRequired: sciipGetRunStateExecutiveSummaryLedgerInputValue_(
      summary,
      ['Human_Review_Required']
    ),
    sourceExecutiveSummaryBusinessKey:
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
        'Business_Key'
      ]),
    sourceBusinessKey:
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
        'Source_Business_Key'
      ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Summary_ID'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Summary_Type'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Status'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Severity'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Headline'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Executive_Summary'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Leadership_Interpretation'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Governance_Interpretation'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Operational_Risk'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Recommended_Action'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Command_Center_Status'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Display_Severity'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Display_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Dashboard_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Governance_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Decisioning_Posture'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Signals_Reviewed'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'High_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Medium_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Low_Signal_Count'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Source_Command_Center_Record_ID'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Business_Key'
    ]),
    sciipGetRunStateExecutiveSummaryLedgerInputValue_(summary, [
      'Source_Business_Key'
    ]),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRows_(
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
function sciipFilterAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateExecutiveSummaryLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_EXEC_SUMMARY_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Summary_Date',
      'Executive_Summary_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateExecutiveSummaryLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateExecutiveSummaryLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateExecutiveSummaryLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateExecutiveSummaryLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateExecutiveSummaryLedgerProcessor',
    result: result
  }));

  return result;
}