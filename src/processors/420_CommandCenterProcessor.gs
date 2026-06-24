/*******************************************************
 * SCIIP_OS v4.0
 * 420_CommandCenterProcessor
 *
 * OPERATOR_CONSOLE → COMMAND_CENTER
 *******************************************************/

const COMMAND_CENTER_SHEET = 'COMMAND_CENTER';

const COMMAND_CENTER_HEADERS = [
  'ID',
  'Business_Key',
  'Operator_Console_ID',
  'Command_Date',
  'Command_Title',
  'System_Status',
  'Execution_Posture',
  'Open_Workload',
  'Escalation_Level',
  'Leadership_Focus',
  'Command_Summary',
  'Priority_Direction',
  'Immediate_Actions',
  'Monitoring_Instructions',
  'Command_Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const COMMAND_CENTER_PROCESSOR = '420_CommandCenterProcessor';

function sciipRunCommandCenterProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const consoleSheet = ss.getSheetByName('OPERATOR_CONSOLE');
  if (!consoleSheet) throw new Error('Missing OPERATOR_CONSOLE sheet');

  const commandSheet = sciipEnsureCommandCenterSheet_();

  const consoles = sciipReadSheetObjects_(consoleSheet);
  const existingCommands = sciipReadSheetObjects_(commandSheet);

  const existingKeys = new Set(
    existingCommands.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoConsole = 0;

  consoles.forEach(console => {
    const consoleId = console.ID || console.Operator_Console_ID;

    if (!consoleId) {
      skippedNoConsole++;
      return;
    }

    const businessKey = `COMMAND_CENTER|${consoleId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const command = sciipBuildCommandCenter_(console, businessKey);

    commandSheet.appendRow(
      COMMAND_CENTER_HEADERS.map(h => command[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: COMMAND_CENTER_PROCESSOR,
    status: 'SUCCESS',
    operatorConsolesReviewed: consoles.length,
    commandCenterRecordsCreated: created,
    skippedDuplicate,
    skippedNoConsole,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildCommandCenter_(console, businessKey) {
  const now = new Date().toISOString();

  return {
    ID: sciipGenerateCommandCenterId_(),
    Business_Key: businessKey,
    Operator_Console_ID: console.ID || '',
    Command_Date: console.Console_Date || now,
    Command_Title: sciipCommandCenterTitle_(console),
    System_Status: sciipCommandSystemStatus_(console),
    Execution_Posture: sciipExecutionPosture_(console),
    Open_Workload: console.Open_Work_Items || 0,
    Escalation_Level: sciipEscalationLevel_(console),
    Leadership_Focus: sciipLeadershipFocus_(console),
    Command_Summary: sciipCommandSummary_(console),
    Priority_Direction: sciipPriorityDirection_(console),
    Immediate_Actions: sciipImmediateActions_(console),
    Monitoring_Instructions: sciipMonitoringInstructions_(console),
    Command_Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: COMMAND_CENTER_PROCESSOR,
    Notes: 'Generated from OPERATOR_CONSOLE'
  };
}

/**
 * Command logic
 */
function sciipCommandCenterTitle_(console) {
  const date =
    console.Console_Date ||
    new Date().toISOString().slice(0, 10);

  return `SCIIP Command Center — ${date}`;
}

function sciipCommandSystemStatus_(console) {
  const status = String(console.Operating_Status || '').toUpperCase();

  if (status === 'ESCALATION_REQUIRED') return 'ATTENTION_REQUIRED';
  if (status === 'ACTIVE_REVIEW') return 'ACTIVE';
  if (status === 'NORMAL_OPERATIONS') return 'STABLE';

  return 'CLEAR';
}

function sciipExecutionPosture_(console) {
  const critical = Number(console.Critical_Count || 0);
  const high = Number(console.High_Count || 0);
  const open = Number(console.Open_Work_Items || 0);

  if (critical > 0) return 'ESCALATE_AND_ACT';
  if (high > 0) return 'PRIORITIZE_CURRENT_CYCLE';
  if (open > 0) return 'MONITOR_AND_EXECUTE';

  return 'NO_ACTIVE_WORKLOAD';
}

function sciipEscalationLevel_(console) {
  const critical = Number(console.Critical_Count || 0);
  const high = Number(console.High_Count || 0);

  if (critical > 0) return 'LEVEL_1';
  if (high > 0) return 'LEVEL_2';

  return 'LEVEL_3';
}

function sciipLeadershipFocus_(console) {
  return console.Primary_Focus || 'No active leadership focus required.';
}

function sciipCommandSummary_(console) {
  return [
    `Open workload: ${console.Open_Work_Items || 0}`,
    `Critical: ${console.Critical_Count || 0}`,
    `High: ${console.High_Count || 0}`,
    `Medium: ${console.Medium_Count || 0}`,
    `Low: ${console.Low_Count || 0}`,
    '',
    console.Primary_Focus || ''
  ].join('\n');
}

function sciipPriorityDirection_(console) {
  const critical = Number(console.Critical_Count || 0);
  const high = Number(console.High_Count || 0);

  if (critical > 0) {
    return 'Review critical items first and determine whether immediate landlord-facing action is required.';
  }

  if (high > 0) {
    return 'Prioritize high-priority queue items during the current execution cycle.';
  }

  return 'Maintain normal execution cadence and continue monitoring for new escalations.';
}

function sciipImmediateActions_(console) {
  return console.Recommended_Operator_Action || 'No immediate action required.';
}

function sciipMonitoringInstructions_(console) {
  return [
    'Monitor future operator console records for escalation changes.',
    'Compare recurring work items against prior command center snapshots.',
    'Escalate repeated themes into strategic decisions or landlord-ready actions where appropriate.'
  ].join('\n');
}

/**
 * Sheet setup
 */
function sciipEnsureCommandCenterSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(COMMAND_CENTER_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(COMMAND_CENTER_SHEET);
    sheet.appendRow(COMMAND_CENTER_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== COMMAND_CENTER_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(COMMAND_CENTER_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateCommandCenterId_() {
  return 'COMMAND_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
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
function sciipTestCommandCenterProcessor() {
  const result = sciipRunCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestCommandCenterProcessor',
    result
  }));

  return result;
}