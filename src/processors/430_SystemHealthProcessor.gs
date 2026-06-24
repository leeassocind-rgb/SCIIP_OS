/*******************************************************
 * SCIIP_OS v4.0
 * 430_SystemHealthProcessor
 *
 * COMMAND_CENTER → SYSTEM_HEALTH
 *******************************************************/

const SYSTEM_HEALTH_SHEET = 'SYSTEM_HEALTH';

const SYSTEM_HEALTH_HEADERS = [
  'ID',
  'Business_Key',
  'Command_Center_ID',
  'Health_Date',
  'System_Status',
  'Execution_Posture',
  'Escalation_Level',
  'Open_Workload',
  'Health_Score',
  'Health_Label',
  'Operational_Risk',
  'Health_Summary',
  'Recommended_System_Action',
  'Monitoring_Cadence',
  'Status',
  'Created_At',
  'Updated_At',
  'Processor',
  'Notes'
];

const SYSTEM_HEALTH_PROCESSOR = '430_SystemHealthProcessor';

function sciipRunSystemHealthProcessor() {
  const ss = sciipGetRuntimeSpreadsheet_();

  const commandSheet = ss.getSheetByName('COMMAND_CENTER');
  if (!commandSheet) throw new Error('Missing COMMAND_CENTER sheet');

  const healthSheet = sciipEnsureSystemHealthSheet_();

  const commands = sciipReadSheetObjects_(commandSheet);
  const existingHealth = sciipReadSheetObjects_(healthSheet);

  const existingKeys = new Set(
    existingHealth.map(r => String(r.Business_Key || '').trim())
  );

  let created = 0;
  let skippedDuplicate = 0;
  let skippedNoCommand = 0;

  commands.forEach(command => {
    const commandId = command.ID || command.Command_Center_ID;

    if (!commandId) {
      skippedNoCommand++;
      return;
    }

    const businessKey = `SYSTEM_HEALTH|${commandId}`;

    if (existingKeys.has(businessKey)) {
      skippedDuplicate++;
      return;
    }

    const health = sciipBuildSystemHealth_(command, businessKey);

    healthSheet.appendRow(
      SYSTEM_HEALTH_HEADERS.map(h => health[h] || '')
    );

    existingKeys.add(businessKey);
    created++;
  });

  const result = {
    processor: SYSTEM_HEALTH_PROCESSOR,
    status: 'SUCCESS',
    commandCenterRecordsReviewed: commands.length,
    systemHealthRecordsCreated: created,
    skippedDuplicate,
    skippedNoCommand,
    completedAt: new Date().toISOString()
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipBuildSystemHealth_(command, businessKey) {
  const now = new Date().toISOString();

  const healthScore = sciipSystemHealthScore_(command);

  return {
    ID: sciipGenerateSystemHealthId_(),
    Business_Key: businessKey,
    Command_Center_ID: command.ID || '',
    Health_Date: command.Command_Date || now,
    System_Status: command.System_Status || '',
    Execution_Posture: command.Execution_Posture || '',
    Escalation_Level: command.Escalation_Level || '',
    Open_Workload: command.Open_Workload || 0,
    Health_Score: healthScore,
    Health_Label: sciipSystemHealthLabel_(healthScore),
    Operational_Risk: sciipOperationalRisk_(command),
    Health_Summary: sciipHealthSummary_(command, healthScore),
    Recommended_System_Action: sciipRecommendedSystemAction_(command, healthScore),
    Monitoring_Cadence: sciipHealthMonitoringCadence_(healthScore),
    Status: 'ACTIVE',
    Created_At: now,
    Updated_At: now,
    Processor: SYSTEM_HEALTH_PROCESSOR,
    Notes: 'Generated from COMMAND_CENTER'
  };
}

/**
 * Health logic
 */
function sciipSystemHealthScore_(command) {
  const systemStatus = String(command.System_Status || '').toUpperCase();
  const posture = String(command.Execution_Posture || '').toUpperCase();
  const escalation = String(command.Escalation_Level || '').toUpperCase();
  const workload = Number(command.Open_Workload || 0);

  let score = 100;

  if (systemStatus === 'ATTENTION_REQUIRED') score -= 35;
  if (systemStatus === 'ACTIVE') score -= 20;
  if (systemStatus === 'STABLE') score -= 5;

  if (posture === 'ESCALATE_AND_ACT') score -= 25;
  if (posture === 'PRIORITIZE_CURRENT_CYCLE') score -= 15;
  if (posture === 'MONITOR_AND_EXECUTE') score -= 5;

  if (escalation === 'LEVEL_1') score -= 20;
  if (escalation === 'LEVEL_2') score -= 10;

  if (workload >= 10) score -= 10;
  if (workload >= 25) score -= 20;

  if (score < 0) score = 0;
  if (score > 100) score = 100;

  return score;
}

function sciipSystemHealthLabel_(score) {
  if (score >= 90) return 'CLEAR';
  if (score >= 75) return 'STABLE';
  if (score >= 55) return 'ACTIVE';
  if (score >= 35) return 'ATTENTION_REQUIRED';

  return 'CRITICAL';
}

function sciipOperationalRisk_(command) {
  const escalation = String(command.Escalation_Level || '').toUpperCase();

  if (escalation === 'LEVEL_1') return 'HIGH';
  if (escalation === 'LEVEL_2') return 'MEDIUM';

  return 'LOW';
}

function sciipHealthSummary_(command, score) {
  return [
    `SCIIP system health score: ${score}`,
    `System status: ${command.System_Status || 'UNKNOWN'}`,
    `Execution posture: ${command.Execution_Posture || 'UNKNOWN'}`,
    `Escalation level: ${command.Escalation_Level || 'UNKNOWN'}`,
    `Open workload: ${command.Open_Workload || 0}`
  ].join('\n');
}

function sciipRecommendedSystemAction_(command, score) {
  if (score < 35) {
    return 'Immediate review required. Escalate command center items and resolve critical workload.';
  }

  if (score < 55) {
    return 'Attention required. Review open command center items and prioritize unresolved escalations.';
  }

  if (score < 75) {
    return 'Active monitoring required. Continue execution cycle and watch for recurring escalation themes.';
  }

  if (score < 90) {
    return 'System stable. Continue normal monitoring and execution cadence.';
  }

  return 'System clear. No immediate action required.';
}

function sciipHealthMonitoringCadence_(score) {
  if (score < 35) return 'Immediate';
  if (score < 55) return 'Current cycle';
  if (score < 75) return 'Next intelligence cycle';

  return 'Routine';
}

/**
 * Sheet setup
 */
function sciipEnsureSystemHealthSheet_() {
  const ss = sciipGetRuntimeSpreadsheet_();
  let sheet = ss.getSheetByName(SYSTEM_HEALTH_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SYSTEM_HEALTH_SHEET);
    sheet.appendRow(SYSTEM_HEALTH_HEADERS);
    return sheet;
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, Math.max(sheet.getLastColumn(), 1))
    .getValues()[0];

  if (existingHeaders.join('|') !== SYSTEM_HEALTH_HEADERS.join('|')) {
    sheet.clear();
    sheet.appendRow(SYSTEM_HEALTH_HEADERS);
  }

  return sheet;
}

/**
 * Helpers
 */
function sciipGenerateSystemHealthId_() {
  return 'SYS_HEALTH_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
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
function sciipTestSystemHealthProcessor() {
  const result = sciipRunSystemHealthProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestSystemHealthProcessor',
    result
  }));

  return result;
}