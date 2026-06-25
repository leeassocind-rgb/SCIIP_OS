/*******************************************************
 * SCIIP_OS v4.1
 * 1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor
 *******************************************************/

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR =
  '1260_AutonomousProcessorExecutionRunStateDailyBriefProcessor';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_EXECUTIVE_SUMMARY_LEDGER';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_SHEET =
  'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN =
  'Run_State_Date';

const SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_HEADERS = [
  'Daily_Brief_ID',
  'Business_Key',
  'Run_State_Date',
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
  'Source_Business_Key',
  'Source_Sheet',
  'Source_Date_Column',
  'Daily_Brief_JSON',
  'Processor',
  'Created_At'
];

/**
 * Main processor.
 */
function sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessor() {
  const startedAt = new Date();
  const ss = sciipGetSpreadsheet_();

  const inputSheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET
  );

  if (!inputSheet) {
    throw new Error(
      'Missing input sheet: ' +
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET
    );
  }

  const outputSheet =
    sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefSheet_();

  const resolvedRunStateDate =
    sciipResolveLatestProcessingDate_(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET,
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN
    ) || sciipFormatDateKey_(startedAt);

  const businessKey =
    'AUTONOMOUS_PROCESSOR_EXECUTION_RUN_STATE_DAILY_BRIEF|' +
    resolvedRunStateDate;

  if (sciipBusinessKeyPrefixExists_(outputSheet, businessKey)) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
      status: 'SUCCESS',
      autonomousProcessorExecutionRunStateDailyBriefsCreated: 0,
      skippedDuplicate: 1,
      businessKey: businessKey,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const ledgerRows =
    sciipReadAutonomousProcessorExecutionRunStateDailyBriefInputRows_(
      inputSheet
    );

  const sourceRows =
    sciipFilterAutonomousProcessorExecutionRunStateDailyBriefRowsByDate_(
      ledgerRows,
      resolvedRunStateDate
    );

  if (!sourceRows.length) {
    const result = {
      processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
      status: 'SKIPPED_NO_INPUTS',
      autonomousProcessorExecutionRunStateDailyBriefsCreated: 0,
      skippedDuplicate: 0,
      businessKey: businessKey,
      resolvedRunStateDate: resolvedRunStateDate,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const latestLedgerRow =
    sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefInputRow_(
      sourceRows
    );

  const dailyBriefRow =
    sciipBuildAutonomousProcessorExecutionRunStateDailyBrief_(
      latestLedgerRow,
      resolvedRunStateDate,
      businessKey,
      startedAt
    );

  outputSheet.appendRow(dailyBriefRow);

  const result = {
    processor: SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
    status: 'SUCCESS',
    autonomousProcessorExecutionRunStateDailyBriefsCreated: 1,
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
function sciipEnsureAutonomousProcessorExecutionRunStateDailyBriefSheet_() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_SHEET
  );

  if (!sheet) {
    sheet = ss.insertSheet(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_SHEET
    );
  }

  if (sheet.getLastRow() === 0) {
    sheet.appendRow(
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_HEADERS
    );
  }

  const headers =
    sheet.getRange(1, 1, 1, sheet.getLastColumn()).getValues()[0];

  const missing =
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_OUTPUT_HEADERS.filter(function(h) {
      return headers.indexOf(h) === -1;
    });

  if (missing.length) {
    sheet
      .getRange(1, headers.length + 1, 1, missing.length)
      .setValues([missing]);
  }

  return sheet;
}

/**
 * Factory: daily brief.
 */
function sciipBuildAutonomousProcessorExecutionRunStateDailyBrief_(
  row,
  resolvedRunStateDate,
  businessKey,
  startedAt
) {
  const executiveStatus =
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Status']);

  const executiveSeverity =
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Severity']);

  const operationalRisk =
    sciipGetRunStateDailyBriefInputValue_(row, ['Operational_Risk']);

  const recommendedAction =
    sciipGetRunStateDailyBriefInputValue_(row, ['Recommended_Action']);

  const humanReviewRequired =
    sciipGetRunStateDailyBriefInputValue_(row, ['Human_Review_Required']);

  const autonomousAllowed =
    sciipGetRunStateDailyBriefInputValue_(row, ['Autonomous_Action_Allowed']);

  const briefStatus =
    sciipResolveAutonomousProcessorExecutionRunStateDailyBriefStatus_(
      executiveStatus,
      executiveSeverity
    );

  const briefTitle =
    sciipResolveAutonomousProcessorExecutionRunStateDailyBriefTitle_(
      executiveSeverity
    );

  const briefText =
    sciipResolveAutonomousProcessorExecutionRunStateDailyBriefText_(
      row,
      resolvedRunStateDate,
      recommendedAction,
      humanReviewRequired,
      autonomousAllowed
    );

  const dailyBriefId = 'APRSDB_' + Utilities.getUuid();

  const briefJson = {
    runStateDate: resolvedRunStateDate,
    briefType: 'AUTONOMOUS_RUN_STATE_DAILY_BRIEF',
    briefStatus: briefStatus,
    briefSeverity: executiveSeverity,
    briefTitle: briefTitle,
    briefText: briefText,
    executiveStatus: executiveStatus,
    executiveSeverity: executiveSeverity,
    operationalRisk: operationalRisk,
    recommendedAction: recommendedAction,
    autonomousActionAllowed: autonomousAllowed,
    humanReviewRequired: humanReviewRequired,
    sourceExecutiveSummaryId: sciipGetRunStateDailyBriefInputValue_(row, [
      'Executive_Summary_ID'
    ]),
    sourceLedgerEntryId: sciipGetRunStateDailyBriefInputValue_(row, [
      'Ledger_Entry_ID'
    ]),
    sourceBusinessKey: sciipGetRunStateDailyBriefInputValue_(row, [
      'Business_Key'
    ])
  };

  return [
    dailyBriefId,
    businessKey,
    resolvedRunStateDate,
    'AUTONOMOUS_RUN_STATE_DAILY_BRIEF',
    briefStatus,
    executiveSeverity,
    briefTitle,
    briefText,
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Headline']),
    executiveStatus,
    executiveSeverity,
    operationalRisk,
    sciipGetRunStateDailyBriefInputValue_(row, [
      'Leadership_Interpretation'
    ]),
    sciipGetRunStateDailyBriefInputValue_(row, [
      'Governance_Interpretation'
    ]),
    recommendedAction,
    autonomousAllowed,
    humanReviewRequired,
    sciipGetRunStateDailyBriefInputValue_(row, ['Command_Center_Status']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Governance_Posture']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Orchestration_Posture']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Decisioning_Posture']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Signals_Reviewed']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Critical_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['High_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Medium_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Low_Signal_Count']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Summary_ID']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Ledger_Entry_ID']),
    sciipGetRunStateDailyBriefInputValue_(row, ['Business_Key']),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_SHEET,
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN,
    JSON.stringify(briefJson),
    SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_PROCESSOR,
    startedAt.toISOString()
  ];
}

/**
 * Brief resolver logic.
 */
function sciipResolveAutonomousProcessorExecutionRunStateDailyBriefStatus_(
  executiveStatus,
  executiveSeverity
) {
  const status = String(executiveStatus || '').toUpperCase();
  const severity = String(executiveSeverity || '').toUpperCase();

  if (severity === 'CRITICAL' || status.indexOf('ATTENTION_REQUIRED') !== -1) {
    return 'DAILY_BRIEF_CRITICAL';
  }

  if (severity === 'HIGH' || status.indexOf('REVIEW') !== -1) {
    return 'DAILY_BRIEF_REVIEW';
  }

  if (severity === 'MEDIUM' || status.indexOf('MONITOR') !== -1) {
    return 'DAILY_BRIEF_MONITOR';
  }

  return 'DAILY_BRIEF_HEALTHY';
}

function sciipResolveAutonomousProcessorExecutionRunStateDailyBriefTitle_(
  executiveSeverity
) {
  const severity = String(executiveSeverity || '').toUpperCase();

  if (severity === 'CRITICAL') {
    return 'Daily Brief: Autonomous Run State Requires Immediate Attention';
  }

  if (severity === 'HIGH') {
    return 'Daily Brief: Autonomous Run State Requires Governance Review';
  }

  if (severity === 'MEDIUM') {
    return 'Daily Brief: Autonomous Run State Requires Monitoring';
  }

  return 'Daily Brief: Autonomous Run State Healthy';
}

function sciipResolveAutonomousProcessorExecutionRunStateDailyBriefText_(
  row,
  resolvedRunStateDate,
  recommendedAction,
  humanReviewRequired,
  autonomousAllowed
) {
  const headline =
    sciipGetRunStateDailyBriefInputValue_(row, ['Executive_Headline']);

  const leadershipInterpretation =
    sciipGetRunStateDailyBriefInputValue_(row, [
      'Leadership_Interpretation'
    ]);

  const operationalRisk =
    sciipGetRunStateDailyBriefInputValue_(row, ['Operational_Risk']);

  return (
    'For ' +
    resolvedRunStateDate +
    ', ' +
    headline +
    ' Operational risk: ' +
    operationalRisk +
    '. ' +
    leadershipInterpretation +
    ' Recommended action: ' +
    recommendedAction +
    '. Autonomous action allowed: ' +
    autonomousAllowed +
    '. Human review required: ' +
    humanReviewRequired +
    '.'
  );
}

/**
 * Reader logic.
 */
function sciipReadAutonomousProcessorExecutionRunStateDailyBriefInputRows_(
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
function sciipFilterAutonomousProcessorExecutionRunStateDailyBriefRowsByDate_(
  rows,
  resolvedDate
) {
  return rows.filter(function(row) {
    const rawDate = sciipGetRunStateDailyBriefInputValue_(row, [
      SCIIP_AUTONOMOUS_RUN_STATE_DAILY_BRIEF_INPUT_DATE_COLUMN,
      'Processing_Date',
      'Run_Date',
      'Brief_Date',
      'Daily_Brief_Date',
      'Created_At',
      'createdAt'
    ]);

    return sciipNormalizeRunStateDailyBriefDateKey_(rawDate) === resolvedDate;
  });
}

function sciipResolveLatestAutonomousProcessorExecutionRunStateDailyBriefInputRow_(
  rows
) {
  if (!rows.length) return {};

  const sorted = rows.slice().sort(function(a, b) {
    const aDate = new Date(
      sciipGetRunStateDailyBriefInputValue_(a, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    const bDate = new Date(
      sciipGetRunStateDailyBriefInputValue_(b, [
        'Created_At',
        'createdAt'
      ]) || 0
    ).getTime();

    return bDate - aDate;
  });

  return sorted[0];
}

function sciipGetRunStateDailyBriefInputValue_(row, aliases) {
  for (let i = 0; i < aliases.length; i++) {
    if (row.hasOwnProperty(aliases[i]) && row[aliases[i]] !== '') {
      return row[aliases[i]];
    }
  }

  return '';
}

function sciipNormalizeRunStateDailyBriefDateKey_(value) {
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
function sciipTestAutonomousProcessorExecutionRunStateDailyBriefProcessor() {
  const result =
    sciipRunAutonomousProcessorExecutionRunStateDailyBriefProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousProcessorExecutionRunStateDailyBriefProcessor',
    result: result
  }));

  return result;
}