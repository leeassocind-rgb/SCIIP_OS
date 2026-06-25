/*******************************************************
 * SCIIP_OS v4.1
 * 1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR =
  '1270_AutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_HEADERS = [
  'Ledger_Entry_ID',
  'Business_Key',
  'Run_State_Date',
  'Daily_Brief_ID',
  'Brief_Type',
  'Brief_Status',
  'Brief_Severity',
  'Brief_Title',
  'Brief_Text',
  'Executive_Headline',
  'Executive_Status',
  'Executive_Severity',
  'Operational_Risk',
  'Leadership_Interpretation',
  'Governance_Interpretation',
  'Recommended_Action',
  'Autonomous_Action_Allowed',
  'Human_Review_Required',
  'Command_Center_Status',
  'Governance_Posture',
  'Orchestration_Posture',
  'Decisioning_Posture',
  'Signals_Reviewed',
  'Critical_Signal_Count',
  'High_Signal_Count',
  'Medium_Signal_Count',
  'Low_Signal_Count',
  'Source_Executive_Summary_ID',
  'Source_Ledger_Entry_ID',
  'Source_Daily_Brief_Business_Key',
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
function sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefLedgerSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF_LEDGER|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const briefRows =
    sciipReadAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateDailyBriefLedgerRowsByDate_(
      briefRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDailyBriefLedgerEntriesCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestBrief =
    sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRow_(
      sourceRows
    );

  const ledgerRow =
    sciipBuildAutonomousProcessorExecutionRunStateDailyBriefLedgerEntry_(
      latestBrief,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(ledgerRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDailyBriefLedgerEntriesCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefLedgerSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_OUTPUT_HEADERS.filter(
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
function sciipBuildAutonomousProcessorExecutionRunStateDailyBriefLedgerEntry_(
  brief,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const ledgerEntryId = 'APRSDBL_' + Utilities.getUuid();

  const ledgerSummaryJson = {
    runStateDate: resolvedRunStateDate,
    dailyBriefId: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Daily_Brief_ID'
    ]),
    briefType: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Type'
    ]),
    briefStatus: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Status'
    ]),
    briefSeverity: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Severity'
    ]),
    briefTitle: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Brief_Title'
    ]),
    executiveStatus: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Executive_Status'
    ]),
    operationalRisk: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Operational_Risk'
    ]),
    recommendedAction: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Recommended_Action'
    ]),
    autonomousActionAllowed: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Autonomous_Action_Allowed'
    ]),
    humanReviewRequired: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Human_Review_Required'
    ]),
    sourceDailyBriefBusinessKey: sciipGetRunStateDailyBriefLedgerInputValue_(
      brief,
      ['Business_Key']
    ),
    sourceBusinessKey: sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Source_Business_Key'
    ])
  };

  return [
    ledgerEntryId,
    businessKey,
    resolvedRunStateDate,
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Daily_Brief_ID']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Type']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Status']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Severity']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Title']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Brief_Text']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Executive_Headline']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Executive_Status']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Executive_Severity']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Operational_Risk']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Leadership_Interpretation'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Governance_Interpretation'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Recommended_Action']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Autonomous_Action_Allowed'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Human_Review_Required'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Command_Center_Status'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Governance_Posture']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Orchestration_Posture'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Decisioning_Posture']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Signals_Reviewed']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Critical_Signal_Count'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['High_Signal_Count']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Medium_Signal_Count']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Low_Signal_Count']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Source_Executive_Summary_ID'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, [
      'Source_Ledger_Entry_ID'
    ]),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Business_Key']),
    sciipGetRunStateDailyBriefLedgerInputValue_(brief, ['Source_Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN,
    JSON.stringify(ledgerSummaryJson),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRows_(
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
function sciipFilterAutonomousProcessorExecutionRunStateDailyBriefLedgerRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateDailyBriefLedgerInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_LEDGER_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Brief_Date',
      'Daily_Brief_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateDailyBriefLedgerDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefLedgerInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateDailyBriefLedgerInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateDailyBriefLedgerInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateDailyBriefLedgerInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateDailyBriefLedgerDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDailyBriefLedgerProcessor',
    result: result
  }));

  return result;
}