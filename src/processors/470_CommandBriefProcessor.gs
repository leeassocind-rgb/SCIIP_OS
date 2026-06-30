/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 470_CommandBriefProcessor
 *
 * EXECUTIVE_DASHBOARD + PLATFORM_DAILY_REPORT + STRATEGIC_DECISION
 * → COMMAND_BRIEF
 *
 * Migration note:
 * Preserves original 470 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const COMMAND_BRIEF_PROCESSOR = '470_CommandBriefProcessor';
const COMMAND_BRIEF_SHEET = 'COMMAND_BRIEF';

const COMMAND_BRIEF_HEADERS = [
  'Command_Brief_ID',
  'Business_Key',
  'Brief_Date',
  'Brief_Type',
  'Executive_Dashboard_ID',
  'Platform_Daily_Report_ID',
  'Strategic_Decision_ID',
  'Command_Status',
  'Situation',
  'Mission',
  'Execution',
  'Risks',
  'Decisions',
  'Priority_Actions',
  'Commander_Intent',
  'Decision_Required',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureCommandBriefSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    COMMAND_BRIEF_SHEET,
    COMMAND_BRIEF_HEADERS
  );
}

function sciipRunCommandBriefProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: COMMAND_BRIEF_PROCESSOR,
    action: 'COMMAND_BRIEF_BUILD',
    sourceSheet: null,
    targetSheet: COMMAND_BRIEF_SHEET,
    ledgerSheet: 'COMMAND_BRIEF_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const dashboards = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('EXECUTIVE_DASHBOARD');
      const platformReports = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('PLATFORM_DAILY_REPORT');
      const strategicDecisions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('STRATEGIC_DECISION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: dashboards.length + platformReports.length + strategicDecisions.length,
        outputCount: 1,
        summary: 'Command brief runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: COMMAND_BRIEF_PROCESSOR,
          inputSheets: [
            'EXECUTIVE_DASHBOARD',
            'PLATFORM_DAILY_REPORT',
            'STRATEGIC_DECISION'
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
      sciipEnsureCommandBriefSchema();

      const dashboard = sciipGetLatestRuntimeRecordByCreatedAt_('EXECUTIVE_DASHBOARD');
      const platformReport = sciipGetLatestRuntimeRecordByCreatedAt_('PLATFORM_DAILY_REPORT');
      const strategicDecision = sciipGetLatestRuntimeRecordByCreatedAt_('STRATEGIC_DECISION');

      if (!dashboard && !platformReport && !strategicDecision) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: COMMAND_BRIEF_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandBriefsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const briefDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const commandBriefBusinessKey = 'COMMAND_BRIEF|' + briefDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        commandBriefBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: COMMAND_BRIEF_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 3,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            commandBriefsCreated: 0,
            skippedDuplicate: 1,
            commandBriefBusinessKey: commandBriefBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const commandBrief = sciipCreateCommandBrief_({
        businessKey: commandBriefBusinessKey,
        briefDate: briefDate,
        dashboard: dashboard,
        platformReport: platformReport,
        strategicDecision: strategicDecision,
        processor: COMMAND_BRIEF_PROCESSOR
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendRecord(
        definition.targetSheet,
        COMMAND_BRIEF_HEADERS,
        commandBrief
      );

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: COMMAND_BRIEF_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 3,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          dashboardFound: !!dashboard,
          platformReportFound: !!platformReport,
          strategicDecisionFound: !!strategicDecision,
          commandBriefsCreated: 1,
          skippedDuplicate: 0,
          commandBriefBusinessKey: commandBriefBusinessKey,
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

function sciipCreateCommandBrief_(args) {
  const now = new Date();

  const commandStatus = sciipInferCommandBriefStatus_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const situation = sciipComposeCommandSituation_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const mission = sciipComposeCommandMission_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const execution = sciipComposeCommandExecution_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const risks = sciipComposeCommandRisks_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const decisions = sciipComposeCommandDecisions_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const priorityActions = sciipComposeCommandPriorityActions_({
    dashboard: args.dashboard,
    platformReport: args.platformReport,
    strategicDecision: args.strategicDecision
  });

  const commanderIntent = sciipComposeCommanderIntent_({
    commandStatus,
    situation,
    mission,
    execution,
    risks,
    decisions,
    priorityActions
  });

  const decisionRequired = sciipInferCommandBriefDecisionRequired_({
    commandStatus,
    decisions,
    risks
  });

  return [
    sciipGenerateId_('CBR'),
    args.businessKey,
    args.briefDate,
    'DAILY_COMMAND_BRIEF',
    sciipExtractFirstAvailable_(args.dashboard, [
      'Dashboard_ID',
      'Executive_Dashboard_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Report_ID',
      'Platform_Daily_Report_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.strategicDecision, [
      'Strategic_Decision_ID',
      'Decision_ID',
      'Record_ID',
      'ID'
    ]),
    commandStatus,
    situation,
    mission,
    execution,
    risks,
    decisions,
    priorityActions,
    commanderIntent,
    decisionRequired,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipComposeCommandSituation_(args) {
  const parts = [];

  const dashboardNarrative = sciipExtractFirstAvailable_(args.dashboard, [
    'Executive_Narrative',
    'Executive_Summary',
    'Summary'
  ]);

  const platformSummary = sciipExtractFirstAvailable_(args.platformReport, [
    'Executive_Summary',
    'System_Health_Summary',
    'Work_Queue_Summary',
    'Market_Intelligence_Summary'
  ]);

  const decisionSummary = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Strategic_Decision',
    'Decision_Summary',
    'Executive_Summary',
    'Summary'
  ]);

  if (dashboardNarrative) parts.push(`Executive dashboard: ${dashboardNarrative}`);
  if (platformSummary) parts.push(`Platform report: ${platformSummary}`);
  if (decisionSummary) parts.push(`Strategic decision context: ${decisionSummary}`);

  if (parts.length === 0) {
    parts.push('No current situation inputs available.');
  }

  return parts.join('\n\n');
}

function sciipComposeCommandMission_(args) {
  const status = sciipExtractFirstAvailable_(args.dashboard, [
    'Executive_Status',
    'Platform_Status',
    'Status'
  ]);

  if (String(status).toUpperCase() === 'ATTENTION_REQUIRED') {
    return 'Stabilize SCIIP operating layer, resolve executive risks, and restore normal platform cadence.';
  }

  if (String(status).toUpperCase() === 'WATCH') {
    return 'Maintain platform continuity while actively monitoring flagged risks, queue pressure, and decision items.';
  }

  return 'Maintain SCIIP operating cadence and convert daily platform intelligence into actionable execution.';
}

function sciipComposeCommandExecution_(args) {
  const actions = [];

  const dashboardActions = sciipExtractFirstAvailable_(args.dashboard, [
    'Recommended_Actions',
    'Top_Priorities',
    'Priority_Actions'
  ]);

  const platformActions = sciipExtractFirstAvailable_(args.platformReport, [
    'Priority_Actions',
    'Recommended_Actions',
    'Top_Priorities'
  ]);

  const decisionActions = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Recommended_Action',
    'Execution_Action',
    'Priority_Action',
    'Action'
  ]);

  if (dashboardActions) actions.push(`Dashboard actions: ${dashboardActions}`);
  if (platformActions) actions.push(`Platform actions: ${platformActions}`);
  if (decisionActions) actions.push(`Strategic decision actions: ${decisionActions}`);

  if (actions.length === 0) {
    actions.push('Continue normal command cadence. No special execution items identified.');
  }

  return actions.join('\n');
}

function sciipComposeCommandRisks_(args) {
  const risks = [];

  const dashboardRisks = sciipExtractFirstAvailable_(args.dashboard, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  const platformRisks = sciipExtractFirstAvailable_(args.platformReport, [
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  const decisionRisks = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Risk',
    'Key_Risks',
    'Risks',
    'Risk_Summary'
  ]);

  if (dashboardRisks) risks.push(`Executive dashboard: ${dashboardRisks}`);
  if (platformRisks) risks.push(`Platform report: ${platformRisks}`);
  if (decisionRisks) risks.push(`Strategic decision: ${decisionRisks}`);

  if (risks.length === 0) {
    risks.push('No material command risks identified.');
  }

  return risks.join('\n');
}

function sciipComposeCommandDecisions_(args) {
  const decisions = [];

  const dashboardDecisions = sciipExtractFirstAvailable_(args.dashboard, [
    'Critical_Decisions',
    'Decision_Required',
    'Decision_Items'
  ]);

  const platformDecisions = sciipExtractFirstAvailable_(args.platformReport, [
    'Decision_Required',
    'Critical_Decisions',
    'Decision_Items'
  ]);

  const strategicDecision = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Strategic_Decision',
    'Decision',
    'Decision_Summary',
    'Recommendation'
  ]);

  if (dashboardDecisions && String(dashboardDecisions).toUpperCase() !== 'NO') {
    decisions.push(`Executive dashboard: ${dashboardDecisions}`);
  }

  if (platformDecisions && String(platformDecisions).toUpperCase() !== 'NO') {
    decisions.push(`Platform report: ${platformDecisions}`);
  }

  if (strategicDecision) {
    decisions.push(`Strategic decision: ${strategicDecision}`);
  }

  if (decisions.length === 0) {
    decisions.push('No command-level decisions required.');
  }

  return decisions.join('\n');
}

function sciipComposeCommandPriorityActions_(args) {
  const priorities = [];

  const dashboardPriorities = sciipExtractFirstAvailable_(args.dashboard, [
    'Top_Priorities',
    'Priority_Actions',
    'Recommended_Actions'
  ]);

  const platformPriorities = sciipExtractFirstAvailable_(args.platformReport, [
    'Priority_Actions',
    'Top_Priorities',
    'Recommended_Actions'
  ]);

  const strategicPriorities = sciipExtractFirstAvailable_(args.strategicDecision, [
    'Priority',
    'Priority_Action',
    'Recommended_Action',
    'Action'
  ]);

  if (dashboardPriorities) priorities.push(`Executive dashboard: ${dashboardPriorities}`);
  if (platformPriorities) priorities.push(`Platform report: ${platformPriorities}`);
  if (strategicPriorities) priorities.push(`Strategic decision: ${strategicPriorities}`);

  if (priorities.length === 0) {
    priorities.push('Continue normal SCIIP operating cadence.');
  }

  return priorities.join('\n');
}

function sciipComposeCommanderIntent_(args) {
  if (args.commandStatus === 'ATTENTION_REQUIRED') {
    return 'Focus command attention on restoring platform confidence, resolving critical decisions, and clearing risk items before expanding autonomous execution.';
  }

  if (args.commandStatus === 'WATCH') {
    return 'Maintain operating tempo while monitoring flagged issues and keeping priority actions visible to the operator.';
  }

  return 'Preserve operating rhythm, keep the intelligence loop active, and convert SCIIP outputs into disciplined execution.';
}

function sciipInferCommandBriefStatus_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.dashboard, ['Executive_Status', 'Platform_Status', 'Status']),
    sciipExtractFirstAvailable_(args.platformReport, ['Platform_Status', 'Status']),
    sciipExtractFirstAvailable_(args.strategicDecision, ['Status', 'Decision_Status']),
    sciipExtractFirstAvailable_(args.dashboard, ['Key_Risks', 'Critical_Decisions']),
    sciipExtractFirstAvailable_(args.platformReport, ['Key_Risks', 'Decision_Required'])
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

function sciipInferCommandBriefDecisionRequired_(args) {
  const combined = [
    args.commandStatus,
    args.decisions,
    args.risks
  ].join(' ').toLowerCase();

  if (
    combined.includes('attention_required') ||
    combined.includes('critical') ||
    (
      combined.includes('decision') &&
      !combined.includes('no command-level decisions required')
    )
  ) {
    return 'YES';
  }

  return 'NO';
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

function sciipTestCommandBriefProcessor() {
  const result = sciipRunCommandBriefProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestCommandBriefProcessor',
    result: result
  }));
  return result;
}
