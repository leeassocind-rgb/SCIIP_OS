/*******************************************************
 * SCIIP_OS v4.0
 * 410_OperatorConsoleProcessor
 *
 * WORK_QUEUE_DIGEST → OPERATOR_CONSOLE
 *******************************************************/

const OPERATOR_CONSOLE_SHEET = 'OPERATOR_CONSOLE';

const OPERATOR_CONSOLE_HEADERS = [
  'ID',
  'Business_Key',
  'Work_Queue_Digest_ID',
  'Console_Date',
  'Console_Title',
  'Operating_Status',
  'Open_Work_Items',
  'Critical_Count',
  'High_Count',
  'Medium_Count',
  'Low_Count',
  'Primary_Focus',
  'Top_Items',
  'Escalations',
  'Recommended_Operator_Action',
  'Console_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const OPERATOR_CONSOLE_PROCESSOR = '410_OperatorConsoleProcessor';

function sciipRunOperatorConsoleProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const digestSheet = ss.getSheetByName('WORK_QUEUE_DIGEST');
  if (!digestSheet) throw new Error('Missing WORK_QUEUE_DIGEST sheet');

  const consoleSheet = sciipEnsureOperatorConsoleSheet_();

  const digests = sciipReadSheetObjects_(digestSheet);
  const existingConsoles = sciipReadSheetObjects_(consoleSheet);

  const existingKeys = new Set(
    existingConsoles.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoDigest = 0;

  digests.forEach(digest => {
    const digestId = digest.ID || digest.Work_Queue_Digest_ID;

    if (!digestId) {
      skippedNoDigest++;
      return;
    }

    const businessKey = `OPERATOR_CONSOLE|${digestId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const console = sciipBuildOperatorConsole_(digest, businessKey);

    consoleSheet.appendRow(
      OPERATOR_CONSOLE_HEADERS.map(h => console[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: OPERATOR_CONSOLE_PROCESSOR,
    status: 'SUCCESS',
    workQueueDigestsReviewed: digests.length,
    operatorConsolesCreated: created,
    skippedDuplicate,
    skippedNoDigest,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildOperatorConsole_(digest, businessKey) {
  const now = new Date().toISOString();

  return {
    ID: sciipGenerateOperatorConsoleId_(),
    Business_Key: businessKey,
    Work_Queue_Digest_ID: digest.ID || '',
    Console_Date: digest.Digest_Date || now,
    Console_Title: sciipOperatorConsoleTitle_(digest),
    Operating_Status: sciipOperatingStatus_(digest),
    Open_Work_Items: digest.Open_Items || 0,
    Critical_Count: digest.Critical_Items || 0,
    High_Count: digest.High_Items || 0,
    Medium_Count: digest.Medium_Items || 0,
    Low_Count: digest.Low_Items || 0,
    Primary_Focus: digest.Execution_Focus || '',
    Top_Items: digest.Top_Work_Items || '',
    Escalations: digest.Escalation_Summary || '',
    Recommended_Operator_Action: digest.Recommended_Next_Step || '',
    Console_Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: OPERATOR_CONSOLE_PROCESSOR,
    Notes: 'Generated from WORK_QUEUE_DIGEST'
  };
}

function sciipOperatorConsoleTitle_(digest) {
  const date = digest.Digest_Date || new Date().toISOString().slice(0, 10);
  return `SCIIP Operator Console — ${date}`;
}

function sciipOperatingStatus_(digest) {
  const critical = Number(digest.Critical_Items || 0);
  const high = Number(digest.High_Items || 0);
  const open = Number(digest.Open_Items || 0);

  if (critical > 0) return 'ESCALATION_REQUIRED';
  if (high > 0) return 'ACTIVE_REVIEW';
  if (open > 0) return 'NORMAL_OPERATIONS';

  return 'CLEAR';
}

/**
 * Sheet setup
 */
function sciipEnsureOperatorConsoleSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(OPERATOR_CONSOLE_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(OPERATOR_CONSOLE_SHEET);
    sheet.appendRow(OPERATOR_CONSOLE_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== OPERATOR_CONSOLE_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(OPERATOR_CONSOLE_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateOperatorConsoleId_() {
  return 'OP_CONSOLE_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
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
function sciipTestOperatorConsoleProcessor() {
  const result = sciipRunOperatorConsoleProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestOperatorConsoleProcessor',
    result
  }));

  return result;
}