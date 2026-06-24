/*******************************************************
 * SCIIP_OS v4.0
 * 440_SystemHealthDigestProcessor
 *
 * SYSTEM_HEALTH → SYSTEM_HEALTH_DIGEST
 *******************************************************/

const SYSTEM_HEALTH_DIGEST_SHEET = 'SYSTEM_HEALTH_DIGEST';

const SYSTEM_HEALTH_DIGEST_HEADERS = [
  'ID',
  'Business_Key',
  'Digest_Date',
  'Health_Records_Reviewed',
  'Latest_System_Health_ID',
  'Latest_Health_Label',
  'Latest_Health_Score',
  'Latest_Operational_Risk',
  'Average_Health_Score',
  'Lowest_Health_Score',
  'Highest_Health_Score',
  'Digest_Title',
  'Health_Summary',
  'Risk_Summary',
  'Recommended_System_Action',
  'Monitoring_Cadence',
  'Digest_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const SYSTEM_HEALTH_DIGEST_PROCESSOR = '440_SystemHealthDigestProcessor';

function sciipRunSystemHealthDigestProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const healthSheet = ss.getSheetByName('SYSTEM_HEALTH');
  if (!healthSheet) throw new Error('Missing SYSTEM_HEALTH sheet');

  const digestSheet = sciipEnsureSystemHealthDigestSheet_();

  const healthRecords = sciipReadSheetObjects_(healthSheet);
  const existingDigests = sciipReadSheetObjects_(digestSheet);

  const today = new Date().toISOString().slice(0, 10);
  const businessKey = `SYSTEM_HEALTH_DIGEST|${today}`;

  const existingKeys = new Set(
    existingDigests.map(r => String(r.Business_Key || '').trim())
  );

  if (existingKeys.has(businessKey)) {
    const result = {
      processor: SYSTEM_HEALTH_DIGEST_PROCESSOR,
      status: 'SUCCESS',
      healthRecordsReviewed: healthRecords.length,
      systemHealthDigestsCreated: 0,
      skippedDuplicate: 1,
      completedAt: new Date().toISOString()
    };

    Logger.log(JSON.stringify(result));
    return result;
  }

  const digest = sciipBuildSystemHealthDigest_(healthRecords, businessKey, today);

  digestSheet.appendRow(
    SYSTEM_HEALTH_DIGEST_HEADERS.map(h => digest[h] || '')
  );

  const result = {
    processor: SYSTEM_HEALTH_DIGEST_PROCESSOR,
    status: 'SUCCESS',
    healthRecordsReviewed: healthRecords.length,
    systemHealthDigestsCreated: 1,
    skippedDuplicate: 0,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildSystemHealthDigest_(records, businessKey, today) {
  const now = new Date().toISOString();

  const activeRecords = records.filter(r =>
    String(r.Status || '').toUpperCase() !== 'INACTIVE'
  );

  const latest = sciipLatestSystemHealthRecord_(activeRecords);
  const scores = activeRecords
    .map(r => Number(r.Health_Score || 0))
    .filter(n => !isNaN(n));

  const avg = scores.length
    ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length)
    : 0;

  const low = scores.length ? Math.min.apply(null, scores) : 0;
  const high = scores.length ? Math.max.apply(null, scores) : 0;

  return {
    ID: sciipGenerateSystemHealthDigestId_(),
    Business_Key: businessKey,
    Digest_Date: today,
    Health_Records_Reviewed: activeRecords.length,
    Latest_System_Health_ID: latest.ID || '',
    Latest_Health_Label: latest.Health_Label || 'UNKNOWN',
    Latest_Health_Score: latest.Health_Score || '',
    Latest_Operational_Risk: latest.Operational_Risk || 'UNKNOWN',
    Average_Health_Score: avg,
    Lowest_Health_Score: low,
    Highest_Health_Score: high,
    Digest_Title: `SCIIP System Health Digest — ${today}`,
    Health_Summary: sciipSystemHealthDigestSummary_(latest, avg, low, high),
    Risk_Summary: sciipSystemHealthRiskSummary_(latest),
    Recommended_System_Action: latest.Recommended_System_Action || 'No system action available.',
    Monitoring_Cadence: latest.Monitoring_Cadence || 'Routine',
    Digest_Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SYSTEM_HEALTH_DIGEST_PROCESSOR,
    Notes: 'Generated from SYSTEM_HEALTH'
  };
}

function sciipLatestSystemHealthRecord_(records) {
  if (!records.length) return {};

  return records.slice().sort((a, b) => {
    const dateA = new Date(a.Created_At || a.Health_Date || 0).getTime();
    const dateB = new Date(b.Created_At || b.Health_Date || 0).getTime();
    return dateB - dateA;
  })[0];
}

function sciipSystemHealthDigestSummary_(latest, avg, low, high) {
  if (!latest || !latest.ID) {
    return 'No active system health records were available for digest generation.';
  }

  return [
    `Latest health label: ${latest.Health_Label || 'UNKNOWN'}`,
    `Latest health score: ${latest.Health_Score || 'UNKNOWN'}`,
    `Average health score: ${avg}`,
    `Lowest health score: ${low}`,
    `Highest health score: ${high}`,
    '',
    latest.Health_Summary || ''
  ].join('\n');
}

function sciipSystemHealthRiskSummary_(latest) {
  if (!latest || !latest.ID) {
    return 'No operational risk available.';
  }

  return [
    `Operational risk: ${latest.Operational_Risk || 'UNKNOWN'}`,
    `System status: ${latest.System_Status || 'UNKNOWN'}`,
    `Execution posture: ${latest.Execution_Posture || 'UNKNOWN'}`,
    `Escalation level: ${latest.Escalation_Level || 'UNKNOWN'}`
  ].join('\n');
}

/**
 * Sheet setup
 */
function sciipEnsureSystemHealthDigestSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(SYSTEM_HEALTH_DIGEST_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SYSTEM_HEALTH_DIGEST_SHEET);
    sheet.appendRow(SYSTEM_HEALTH_DIGEST_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== SYSTEM_HEALTH_DIGEST_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(SYSTEM_HEALTH_DIGEST_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateSystemHealthDigestId_() {
  return 'SYS_HEALTH_DIGEST_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipReadSheetObjects_(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];

  const headers = values[0];

  return values.slice(1)
    .filter(row => row.some(v => v !== '' && v !== null))
    .map(row => {
      const obj = {};
      headers.forEach((h, i) => obj[h] = row[i]);
      return obj;
    });
}

function sciipGetRuntimeSpreadsheet_() {
  const props = PropertiesService.getScriptProperties();

  const spreadsheetId =
    props.getProperty('SCIIP_SPREADSHEET_ID') ||
    props.getProperty('SPREADSHEET_ID') ||
    props.getProperty('RUNTIME_SPREADSHEET_ID');

  if (!spreadsheetId) {
    throw new Error(
      'Missing SCIIP_SPREADSHEET_ID in Script Properties. Add your SCIIP runtime Google Sheet ID.'
    );
  }

  return SpreadsheetApp.openById(spreadsheetId);
}

/**
 * Test function
 */
function sciipTestSystemHealthDigestProcessor() {
  const result = sciipRunSystemHealthDigestProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestSystemHealthDigestProcessor',
    result
  }));

  return result;
}