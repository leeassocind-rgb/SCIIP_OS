/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 460_ExecutiveDashboardProcessor
 *
 * PLATFORM_DAILY_REPORT + COMMAND_CENTER + OPERATOR_CONSOLE
 * → EXECUTIVE_DASHBOARD
 *
 * Migration note:
 * Preserves original 460 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const EXECUTIVE_DASHBOARD_PROCESSOR = '460_ExecutiveDashboardProcessor';
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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    EXECUTIVE_DASHBOARD_SHEET,
    EXECUTIVE_DASHBOARD_HEADERS
  );
}

function sciipRunExecutiveDashboardProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: EXECUTIVE_DASHBOARD_PROCESSOR,
    action: 'EXECUTIVE_DASHBOARD_BUILD',
    sourceSheet: null,
    targetSheet: EXECUTIVE_DASHBOARD_SHEET,
    ledgerSheet: 'EXECUTIVE_DASHBOARD_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const platformReports = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('PLATFORM_DAILY_REPORT');
      const commandCenters = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_CENTER');
      const operatorConsoles = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('OPERATOR_CONSOLE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: platformReports.length + commandCenters.length + operatorConsoles.length,
        outputCount: 1,
        summary: 'Executive dashboard runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: EXECUTIVE_DASHBOARD_PROCESSOR,
          inputSheets: [
            'PLATFORM_DAILY_REPORT',
            'COMMAND_CENTER',
            'OPERATOR_CONSOLE'
          ]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      sciipEnsureExecutiveDashboardSchema();

      const platformReport = sciipGetLatestRuntimeRecordByCreatedAt_('PLATFORM_DAILY_REPORT');
      const commandCenter = sciipGetLatestRuntimeRecordByCreatedAt_('COMMAND_CENTER');
      const operatorConsole = sciipGetLatestRuntimeRecordByCreatedAt_('OPERATOR_CONSOLE');

      if (!platformReport && !commandCenter && !operatorConsole) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: EXECUTIVE_DASHBOARD_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            executiveDashboardsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const dashboardDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const dashboardBusinessKey = 'EXECUTIVE_DASHBOARD|' + dashboardDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        dashboardBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: EXECUTIVE_DASHBOARD_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 3,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            executiveDashboardsCreated: 0,
            skippedDuplicate: 1,
            dashboardBusinessKey: dashboardBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const dashboardRow = sciipCreateExecutiveDashboard_({
        businessKey: dashboardBusinessKey,
        dashboardDate: dashboardDate,
        platformReport: platformReport,
        commandCenter: commandCenter,
        operatorConsole: operatorConsole,
        processor: EXECUTIVE_DASHBOARD_PROCESSOR
      });

      const dashboardObject = sciipExecutiveDashboardRowToObject_(dashboardRow);

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        EXECUTIVE_DASHBOARD_HEADERS,
        dashboardObject
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          platformReportFound: !!platformReport,
          commandCenterFound: !!commandCenter,
          operatorConsoleFound: !!operatorConsole,
          executiveDashboardsCreated: 1,
          skippedDuplicate: 0,
          dashboardBusinessKey: dashboardBusinessKey,
          transactionId: transaction.transactionId
        },
        message: '460 ExecutiveDashboardProcessor runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: EXECUTIVE_DASHBOARD_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 3,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          platformReportFound: !!platformReport,
          commandCenterFound: !!commandCenter,
          operatorConsoleFound: !!operatorConsole,
          executiveDashboardsCreated: 1,
          skippedDuplicate: 0,
          dashboardBusinessKey: dashboardBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipGetLatestRuntimeRecordByCreatedAt_(sheetName) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);

  if (!records || records.length === 0) return null;

  records.sort(function(a, b) {
    const aTime = sciipRuntimeRecordTimestamp_(a);
    const bTime = sciipRuntimeRecordTimestamp_(b);
    return aTime - bTime;
  });

  return records[records.length - 1];
}

function sciipRuntimeRecordTimestamp_(record) {
  if (!record) return 0;

  const raw =
    record.Created_At ||
    record.Updated_At ||
    record.Timestamp ||
    record.completedAt ||
    record.Completed_At ||
    '';

  const time = raw ? new Date(raw).getTime() : 0;
  return isNaN(time) ? 0 : time;
}

function sciipExecutiveDashboardRowToObject_(row) {
  const object = {};

  EXECUTIVE_DASHBOARD_HEADERS.forEach(function(header, index) {
    object[header] = row[index];
  });

  return object;
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


function sciipExtractFirstAvailable_(record, fieldNames) {
  if (!record || !fieldNames || !fieldNames.length) {
    return '';
  }

  for (let i = 0; i < fieldNames.length; i++) {
    const fieldName = fieldNames[i];
    if (
      Object.prototype.hasOwnProperty.call(record, fieldName) &&
      record[fieldName] !== null &&
      record[fieldName] !== undefined &&
      String(record[fieldName]).trim() !== ''
    ) {
      return String(record[fieldName]).trim();
    }
  }

  return '';
}

function sciipGenerateId_(prefix) {
  const cleanPrefix = prefix || 'SCIIP';
  const timestamp = new Date().getTime();
  const random = Math.floor(Math.random() * 1000000)
    .toString()
    .padStart(6, '0');

  return cleanPrefix + '_' + timestamp + '_' + random;
}

function sciipTestExecutiveDashboardProcessor() {
  const result = sciipRunExecutiveDashboardProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestExecutiveDashboardProcessor',
    result
  }));
  return result;
}