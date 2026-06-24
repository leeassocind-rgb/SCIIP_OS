/************************************************************
 * 460_ExecutiveDashboardProcessor
 * SCIIP_OS v4.0
 *
 * Inputs:
 * - PLATFORM_DAILY_REPORT
 * - COMMAND_CENTER
 * - OPERATOR_CONSOLE
 *
 * Output:
 * - EXECUTIVE_DASHBOARD
 ************************************************************/

const EXECUTIVE_DASHBOARD_SHEET = 'EXECUTIVE_DASHBOARD';

const EXECUTIVE_DASHBOARD_HEADERS = [
  'Dashboard_ID',
  'Business_Key',
  'Dashboard_Date',
  'Dashboard_Type',
  'Platform_Daily_Report_ID',
  'Command_Center_ID',
  'Operator_Console_ID',
  'Executive_Status',
  'Platform_Status',
  'Command_Status',
  'Operator_Status',
  'Executive_Narrative',
  'Critical_Decisions',
  'Key_Risks',
  'Top_Priorities',
  'Recommended_Actions',
  'Decision_Required',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureExecutiveDashboardSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(EXECUTIVE_DASHBOARD_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(EXECUTIVE_DASHBOARD_SHEET);
  }

  sheet.getRange(1, 1, 1, EXECUTIVE_DASHBOARD_HEADERS.length)
    .setValues([EXECUTIVE_DASHBOARD_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunExecutiveDashboardProcessor() {
  const processor = '460_ExecutiveDashboardProcessor';
  const startedAt = new Date();

  const outputSheet = sciipEnsureExecutiveDashboardSchema();

  const platformReport = sciipGetLatestRecordByCreatedAt_('PLATFORM_DAILY_REPORT');
  const commandCenter = sciipGetLatestRecordByCreatedAt_('COMMAND_CENTER');
  const operatorConsole = sciipGetLatestRecordByCreatedAt_('OPERATOR_CONSOLE');

  if (!platformReport && !commandCenter && !operatorConsole) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      executiveDashboardsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const dashboardDate = sciipFormatDateKey_(startedAt);
  const businessKey = `EXECUTIVE_DASHBOARD|${dashboardDate}`;

  if (sciipBusinessKeyExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      executiveDashboardsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const dashboard = sciipCreateExecutiveDashboard_({
    businessKey,
    dashboardDate,
    platformReport,
    commandCenter,
    operatorConsole,
    processor
  });

  outputSheet.appendRow(dashboard);

  const result = {
    processor,
    status: 'SUCCESS',
    executiveDashboardsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateExecutiveDashboard_(args) {
  const now = new Date();

  const platformStatus = sciipExtractFirstAvailable_(args.platformReport, [
    'Platform_Status',
    'Executive_Status',
    'Status'
  ]);

  const commandStatus = sciipExtractFirstAvailable_(args.commandCenter, [
    'Command_Status',
    'Command_Center_Status',
    'Executive_Status',
    'Status'
  ]);

  const operatorStatus = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Operator_Status',
    'Console_Status',
    'Executive_Status',
    'Status'
  ]);

  const executiveNarrative = sciipComposeExecutiveDashboardNarrative_({
    platformReport: args.platformReport,
    commandCenter: args.commandCenter,
    operatorConsole: args.operatorConsole,
    platformStatus,
    commandStatus,
    operatorStatus
  });

  const criticalDecisions = sciipComposeExecutiveCriticalDecisions_({
    platformReport: args.platformReport,
    commandCenter: args.commandCenter,
    operatorConsole: args.operatorConsole
  });

  const keyRisks = sciipComposeExecutiveKeyRisks_({
    platformReport: args.platformReport,
    commandCenter: args.commandCenter,
    operatorConsole: args.operatorConsole
  });

  const topPriorities = sciipComposeExecutiveTopPriorities_({
    platformReport: args.platformReport,
    commandCenter: args.commandCenter,
    operatorConsole: args.operatorConsole
  });

  const recommendedActions = sciipComposeExecutiveRecommendedActions_({
    platformStatus,
    commandStatus,
    operatorStatus,
    criticalDecisions,
    keyRisks,
    topPriorities
  });

  const executiveStatus = sciipInferExecutiveDashboardStatus_({
    platformStatus,
    commandStatus,
    operatorStatus,
    keyRisks,
    criticalDecisions
  });

  const decisionRequired = sciipInferExecutiveDashboardDecisionRequired_({
    executiveStatus,
    criticalDecisions,
    keyRisks
  });

  return [
    sciipGenerateId_('EDB'),
    args.businessKey,
    args.dashboardDate,
    'EXECUTIVE_DASHBOARD',
    sciipExtractFirstAvailable_(args.platformReport, [
      'Report_ID',
      'Platform_Daily_Report_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.commandCenter, [
      'Command_Center_ID',
      'Command_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.operatorConsole, [
      'Operator_Console_ID',
      'Console_ID',
      'Record_ID',
      'ID'
    ]),
    executiveStatus,
    platformStatus,
    commandStatus,
    operatorStatus,
    executiveNarrative,
    criticalDecisions,
    keyRisks,
    topPriorities,
    recommendedActions,
    decisionRequired,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipComposeExecutiveDashboardNarrative_(args) {
  const parts = [];

  const platformSummary = sciipExtractFirstAvailable_(args.platformReport, [
    'Executive_Summary',
    'System_Health_Summary',
    'Work_Queue_Summary',
    'Market_Intelligence_Summary'
  ]);

  const commandSummary = sciipExtractFirstAvailable_(args.commandCenter, [
    'Command_Summary',
    'Executive_Summary',
    'Command_Center_Summary',
    'Summary'
  ]);

  const operatorSummary = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Operator_Summary',
    'Console_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  parts.push(
    `SCIIP executive dashboard status: ${sciipSafeText_(args.platformStatus || 'UNKNOWN')}.`
  );

  if (platformSummary) {
    parts.push(`Platform daily report: ${platformSummary}`);
  }

  if (commandSummary) {
    parts.push(`Command center: ${commandSummary}`);
  }

  if (operatorSummary) {
    parts.push(`Operator console: ${operatorSummary}`);
  }

  if (parts.length === 1) {
    parts.push('No detailed executive narrative was available from current input records.');
  }

  return parts.join('\n\n');
}

function sciipComposeExecutiveCriticalDecisions_(args) {
  const decisions = [];

  const platformDecision = sciipExtractFirstAvailable_(args.platformReport, [
    'Decision_Required',
    'Critical_Decisions',
    'Decision_Items'
  ]);

  const commandDecision = sciipExtractFirstAvailable_(args.commandCenter, [
    'Critical_Decisions',
    'Decision_Required',
    'Decision_Items'
  ]);

  const operatorDecision = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Critical_Decisions',
    'Decision_Required',
    'Decision_Items'
  ]);

  if (platformDecision && String(platformDecision).toUpperCase() !== 'NO') {
    decisions.push(`Platform: ${platformDecision}`);
  }

  if (commandDecision && String(commandDecision).toUpperCase() !== 'NO') {
    decisions.push(`Command Center: ${commandDecision}`);
  }

  if (operatorDecision && String(operatorDecision).toUpperCase() !== 'NO') {
    decisions.push(`Operator Console: ${operatorDecision}`);
  }

  if (decisions.length === 0) {
    decisions.push('No critical executive decisions identified.');
  }

  return decisions.join('\n');
}

function sciipComposeExecutiveKeyRisks_(args) {
  const risks = [];

  const platformRisks = sciipExtractFirstAvailable_(args.platformReport, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  const commandRisks = sciipExtractFirstAvailable_(args.commandCenter, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  const operatorRisks = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  if (platformRisks) risks.push(`Platform: ${platformRisks}`);
  if (commandRisks) risks.push(`Command Center: ${commandRisks}`);
  if (operatorRisks) risks.push(`Operator Console: ${operatorRisks}`);

  if (risks.length === 0) {
    risks.push('No material executive risks identified.');
  }

  return risks.join('\n');
}

function sciipComposeExecutiveTopPriorities_(args) {
  const priorities = [];

  const platformPriorities = sciipExtractFirstAvailable_(args.platformReport, [
    'Priority_Actions',
    'Top_Priorities',
    'Recommended_Actions'
  ]);

  const commandPriorities = sciipExtractFirstAvailable_(args.commandCenter, [
    'Top_Priorities',
    'Priority_Actions',
    'Recommended_Actions'
  ]);

  const operatorPriorities = sciipExtractFirstAvailable_(args.operatorConsole, [
    'Top_Priorities',
    'Priority_Actions',
    'Recommended_Actions'
  ]);

  if (platformPriorities) priorities.push(`Platform: ${platformPriorities}`);
  if (commandPriorities) priorities.push(`Command Center: ${commandPriorities}`);
  if (operatorPriorities) priorities.push(`Operator Console: ${operatorPriorities}`);

  if (priorities.length === 0) {
    priorities.push('Continue normal SCIIP operating cadence.');
  }

  return priorities.join('\n');
}

function sciipComposeExecutiveRecommendedActions_(args) {
  const actions = [];

  const combined = [
    args.platformStatus,
    args.commandStatus,
    args.operatorStatus,
    args.criticalDecisions,
    args.keyRisks,
    args.topPriorities
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    actions.push('Review critical operating issues and assign immediate owner.');
  }

  if (
    combined.includes('decision') &&
    !combined.includes('no critical executive decisions')
  ) {
    actions.push('Escalate decision items for executive review.');
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog')
  ) {
    actions.push('Clear blocked or overdue work queue items.');
  }

  if (actions.length === 0) {
    actions.push('Maintain current platform cadence and monitor next daily cycle.');
  }

  return actions.join('\n');
}

function sciipInferExecutiveDashboardStatus_(args) {
  const combined = [
    args.platformStatus,
    args.commandStatus,
    args.operatorStatus,
    args.keyRisks,
    args.criticalDecisions
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    return 'ATTENTION_REQUIRED';
  }

  if (
    combined.includes('watch') ||
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog') ||
    combined.includes('risk')
  ) {
    return 'WATCH';
  }

  return 'OPERATIONAL';
}

function sciipInferExecutiveDashboardDecisionRequired_(args) {
  const combined = [
    args.executiveStatus,
    args.criticalDecisions,
    args.keyRisks
  ].join(' ').toLowerCase();

  if (
    combined.includes('attention_required') ||
    combined.includes('critical') ||
    combined.includes('executive review') ||
    (
      combined.includes('decision') &&
      !combined.includes('no critical executive decisions')
    )
  ) {
    return 'YES';
  }

  return 'NO';
}

function sciipSafeText_(value) {
  if (value === null || value === undefined || value === '') {
    return '';
  }

  return String(value).trim();
}

function sciipTestExecutiveDashboardProcessor() {
  const result = sciipRunExecutiveDashboardProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestExecutiveDashboardProcessor',
    result
  }));
  return result;
}