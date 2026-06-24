/************************************************************
 * 450_PlatformDailyReportProcessor
 * SCIIP_OS v4.0
 *
 * Inputs:
 * - SYSTEM_HEALTH_DIGEST
 * - WORK_QUEUE_DIGEST
 * - BRIEFING_DIGEST
 *
 * Output:
 * - PLATFORM_DAILY_REPORT
 ************************************************************/

const PLATFORM_DAILY_REPORT_SHEET = 'PLATFORM_DAILY_REPORT';

const PLATFORM_DAILY_REPORT_HEADERS = [
  'Report_ID',
  'Business_Key',
  'Report_Date',
  'Report_Type',
  'System_Health_Digest_ID',
  'Work_Queue_Digest_ID',
  'Briefing_Digest_ID',
  'Platform_Status',
  'Executive_Summary',
  'System_Health_Summary',
  'Work_Queue_Summary',
  'Market_Intelligence_Summary',
  'Key_Risks',
  'Priority_Actions',
  'Decision_Required',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsurePlatformDailyReportSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(PLATFORM_DAILY_REPORT_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(PLATFORM_DAILY_REPORT_SHEET);
  }

  sheet.getRange(1, 1, 1, PLATFORM_DAILY_REPORT_HEADERS.length)
    .setValues([PLATFORM_DAILY_REPORT_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunPlatformDailyReportProcessor() {
  const processor = '450_PlatformDailyReportProcessor';
  const startedAt = new Date();

  const outputSheet = sciipEnsurePlatformDailyReportSchema();

  const healthDigest = sciipGetLatestRecordByCreatedAt_('SYSTEM_HEALTH_DIGEST');
  const workQueueDigest = sciipGetLatestRecordByCreatedAt_('WORK_QUEUE_DIGEST');
  const briefingDigest = sciipGetLatestRecordByCreatedAt_('BRIEFING_DIGEST');

  if (!healthDigest && !workQueueDigest && !briefingDigest) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      platformDailyReportsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const reportDate = sciipFormatDateKey_(startedAt);
  const businessKey = `PLATFORM_DAILY_REPORT|${reportDate}`;

  if (sciipBusinessKeyExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      platformDailyReportsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const report = sciipCreatePlatformDailyReport_({
    businessKey,
    reportDate,
    healthDigest,
    workQueueDigest,
    briefingDigest,
    processor
  });

  outputSheet.appendRow(report);

  const result = {
    processor,
    status: 'SUCCESS',
    platformDailyReportsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreatePlatformDailyReport_(args) {
  const now = new Date();

  const healthSummary = sciipExtractFirstAvailable_(args.healthDigest, [
    'Health_Summary',
    'System_Health_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  const workQueueSummary = sciipExtractFirstAvailable_(args.workQueueDigest, [
    'Work_Queue_Summary',
    'Queue_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  const marketSummary = sciipExtractFirstAvailable_(args.briefingDigest, [
    'Briefing_Summary',
    'Market_Intelligence_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  const platformStatus = sciipInferPlatformStatus_(healthSummary, workQueueSummary);

  const executiveSummary = sciipComposePlatformExecutiveSummary_({
    platformStatus,
    healthSummary,
    workQueueSummary,
    marketSummary
  });

  const keyRisks = sciipComposePlatformRisks_({
    platformStatus,
    healthSummary,
    workQueueSummary,
    marketSummary
  });

  const priorityActions = sciipComposePlatformActions_({
    platformStatus,
    healthSummary,
    workQueueSummary,
    marketSummary
  });

  const decisionRequired = sciipInferDecisionRequired_(platformStatus, keyRisks);

  return [
    sciipGenerateId_('PDR'),
    args.businessKey,
    args.reportDate,
    'DAILY_PLATFORM_REPORT',
    sciipExtractFirstAvailable_(args.healthDigest, ['Digest_ID', 'System_Health_Digest_ID', 'Record_ID', 'ID']),
    sciipExtractFirstAvailable_(args.workQueueDigest, ['Digest_ID', 'Work_Queue_Digest_ID', 'Record_ID', 'ID']),
    sciipExtractFirstAvailable_(args.briefingDigest, ['Digest_ID', 'Briefing_Digest_ID', 'Record_ID', 'ID']),
    platformStatus,
    executiveSummary,
    healthSummary,
    workQueueSummary,
    marketSummary,
    keyRisks,
    priorityActions,
    decisionRequired,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipComposePlatformExecutiveSummary_(args) {
  const parts = [];

  parts.push(`SCIIP platform daily status: ${args.platformStatus}.`);

  if (args.healthSummary) {
    parts.push(`System health: ${args.healthSummary}`);
  }

  if (args.workQueueSummary) {
    parts.push(`Work queue: ${args.workQueueSummary}`);
  }

  if (args.marketSummary) {
    parts.push(`Market intelligence: ${args.marketSummary}`);
  }

  return parts.join('\n\n');
}

function sciipComposePlatformRisks_(args) {
  const risks = [];

  const combined = [
    args.platformStatus,
    args.healthSummary,
    args.workQueueSummary,
    args.marketSummary
  ].join(' ').toLowerCase();

  if (combined.includes('error') || combined.includes('failed') || combined.includes('critical')) {
    risks.push('Potential platform reliability issue requires operator review.');
  }

  if (combined.includes('backlog') || combined.includes('overdue') || combined.includes('blocked')) {
    risks.push('Work queue contains backlog, overdue, or blocked execution items.');
  }

  if (combined.includes('urgent') || combined.includes('risk') || combined.includes('decision')) {
    risks.push('Market intelligence or operating workflow may require executive attention.');
  }

  if (risks.length === 0) {
    risks.push('No material platform risks identified from current digests.');
  }

  return risks.join('\n');
}

function sciipComposePlatformActions_(args) {
  const actions = [];

  const combined = [
    args.platformStatus,
    args.healthSummary,
    args.workQueueSummary,
    args.marketSummary
  ].join(' ').toLowerCase();

  if (combined.includes('error') || combined.includes('failed') || combined.includes('critical')) {
    actions.push('Review failed processors and confirm recovery path.');
  }

  if (combined.includes('backlog') || combined.includes('overdue') || combined.includes('blocked')) {
    actions.push('Prioritize blocked or overdue work queue items.');
  }

  if (combined.includes('decision')) {
    actions.push('Escalate decision items to operator console or command center.');
  }

  if (actions.length === 0) {
    actions.push('Continue normal SCIIP operating cadence.');
  }

  return actions.join('\n');
}

function sciipInferPlatformStatus_(healthSummary, workQueueSummary) {
  const text = [healthSummary, workQueueSummary].join(' ').toLowerCase();

  if (text.includes('critical') || text.includes('failed') || text.includes('error')) {
    return 'ATTENTION_REQUIRED';
  }

  if (text.includes('blocked') || text.includes('overdue') || text.includes('backlog')) {
    return 'WATCH';
  }

  return 'OPERATIONAL';
}

function sciipInferDecisionRequired_(platformStatus, keyRisks) {
  const text = [platformStatus, keyRisks].join(' ').toLowerCase();

  if (
    text.includes('attention_required') ||
    text.includes('critical') ||
    text.includes('blocked') ||
    text.includes('executive attention')
  ) {
    return 'YES';
  }

  return 'NO';
}

function sciipGetLatestRecordByCreatedAt_(sheetName) {
  const ss = sciipGetSpreadsheet_();
  const sheet = ss.getSheetByName(sheetName);

  if (!sheet) return null;

  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return null;

  const headers = values[0];
  const records = values.slice(1)
    .filter(row => row.some(cell => cell !== '' && cell !== null))
    .map(row => sciipRowToObject_(headers, row));

  if (records.length === 0) return null;

  records.sort((a, b) => {
    const aDate = new Date(a.Created_At || a.Completed_At || a.Report_Date || 0).getTime();
    const bDate = new Date(b.Created_At || b.Completed_At || b.Report_Date || 0).getTime();
    return bDate - aDate;
  });

  return records[0];
}

function sciipRowToObject_(headers, row) {
  const obj = {};
  headers.forEach((header, index) => {
    obj[String(header).trim()] = row[index];
  });
  return obj;
}

function sciipExtractFirstAvailable_(record, fields) {
  if (!record) return '';

  for (let i = 0; i < fields.length; i++) {
    const value = record[fields[i]];
    if (value !== undefined && value !== null && String(value).trim() !== '') {
      return String(value).trim();
    }
  }

  return '';
}

function sciipBusinessKeyExists_(sheet, businessKey) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return false;

  const headers = values[0];
  const keyIndex = headers.indexOf('Business_Key');

  if (keyIndex === -1) return false;

  return values.slice(1).some(row => row[keyIndex] === businessKey);
}

function sciipFormatDateKey_(date) {
  return Utilities.formatDate(date, Session.getScriptTimeZone(), 'yyyy-MM-dd');
}

function sciipGenerateId_(prefix) {
  return `${prefix}_${Utilities.getUuid()}`;
}

function sciipGetSpreadsheet_() {
  if (typeof SCIIP_SPREADSHEET_ID !== 'undefined' && SCIIP_SPREADSHEET_ID) {
    return SpreadsheetApp.openById(SCIIP_SPREADSHEET_ID);
  }

  return SpreadsheetApp.getActiveSpreadsheet();
}

function sciipTestPlatformDailyReportProcessor() {
  const result = sciipRunPlatformDailyReportProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestPlatformDailyReportProcessor',
    result
  }));
  return result;
}