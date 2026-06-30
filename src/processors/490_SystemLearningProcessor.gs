/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 490_SystemLearningProcessor
 *
 * AUTONOMOUS_OPERATIONS + SYSTEM_HEALTH + WORK_QUEUE
 * + PLATFORM_DAILY_REPORT → SYSTEM_LEARNING
 *
 * Migration note:
 * Preserves original 490 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const SYSTEM_LEARNING_PROCESSOR = '490_SystemLearningProcessor';
const SYSTEM_LEARNING_SHEET = 'SYSTEM_LEARNING';

const SYSTEM_LEARNING_HEADERS = [
  'Learning_ID',
  'Business_Key',
  'Learning_Date',
  'Learning_Type',
  'Autonomous_Operation_ID',
  'System_Health_ID',
  'Work_Queue_ID',
  'Platform_Daily_Report_ID',
  'Learning_Status',
  'Operating_Lesson',
  'System_Improvement_Signal',
  'Workflow_Improvement_Signal',
  'Risk_Learning',
  'Automation_Learning',
  'Recommended_System_Adjustment',
  'Confidence',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureSystemLearningSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    SYSTEM_LEARNING_SHEET,
    SYSTEM_LEARNING_HEADERS
  );
}

function sciipRunSystemLearningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SYSTEM_LEARNING_PROCESSOR,
    action: 'SYSTEM_LEARNING_BUILD',
    sourceSheet: null,
    targetSheet: SYSTEM_LEARNING_SHEET,
    ledgerSheet: 'SYSTEM_LEARNING_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousOperations = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_OPERATIONS');
      const systemHealthRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SYSTEM_HEALTH');
      const workQueueItems = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('WORK_QUEUE');
      const platformReports = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('PLATFORM_DAILY_REPORT');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount:
          autonomousOperations.length +
          systemHealthRecords.length +
          workQueueItems.length +
          platformReports.length,
        outputCount: 1,
        summary: 'System learning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: SYSTEM_LEARNING_PROCESSOR,
          inputSheets: [
            'AUTONOMOUS_OPERATIONS',
            'SYSTEM_HEALTH',
            'WORK_QUEUE',
            'PLATFORM_DAILY_REPORT'
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
      const outputSheet = sciipEnsureSystemLearningSchema();

      const autonomousOperation = sciipGetLatestRuntimeRecordByCreatedAt_('AUTONOMOUS_OPERATIONS');
      const systemHealth = sciipGetLatestRuntimeRecordByCreatedAt_('SYSTEM_HEALTH');
      const workQueue = sciipGetLatestRuntimeRecordByCreatedAt_('WORK_QUEUE');
      const platformReport = sciipGetLatestRuntimeRecordByCreatedAt_('PLATFORM_DAILY_REPORT');

      if (!autonomousOperation && !systemHealth && !workQueue && !platformReport) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: SYSTEM_LEARNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            systemLearningsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const learningDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const systemLearningBusinessKey = 'SYSTEM_LEARNING|' + learningDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        systemLearningBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: SYSTEM_LEARNING_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 4,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            systemLearningsCreated: 0,
            skippedDuplicate: 1,
            systemLearningBusinessKey: systemLearningBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const learning = sciipCreateSystemLearning_({
        businessKey: systemLearningBusinessKey,
        learningDate: learningDate,
        autonomousOperation: autonomousOperation,
        systemHealth: systemHealth,
        workQueue: workQueue,
        platformReport: platformReport,
        processor: SYSTEM_LEARNING_PROCESSOR
      });

      outputSheet.appendRow(learning);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SYSTEM_LEARNING_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 4,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousOperationFound: !!autonomousOperation,
          systemHealthFound: !!systemHealth,
          workQueueFound: !!workQueue,
          platformReportFound: !!platformReport,
          systemLearningsCreated: 1,
          skippedDuplicate: 0,
          systemLearningBusinessKey: systemLearningBusinessKey,
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

function sciipCreateSystemLearning_(args) {
  const now = new Date();

  const learningStatus = sciipInferSystemLearningStatus_({
    autonomousOperation: args.autonomousOperation,
    systemHealth: args.systemHealth,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  const operatingLesson = sciipComposeOperatingLesson_({
    autonomousOperation: args.autonomousOperation,
    systemHealth: args.systemHealth,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  const systemImprovementSignal = sciipComposeSystemImprovementSignal_({
    systemHealth: args.systemHealth,
    platformReport: args.platformReport
  });

  const workflowImprovementSignal = sciipComposeWorkflowImprovementSignal_({
    autonomousOperation: args.autonomousOperation,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  const riskLearning = sciipComposeRiskLearning_({
    autonomousOperation: args.autonomousOperation,
    systemHealth: args.systemHealth,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  const automationLearning = sciipComposeAutomationLearning_({
    autonomousOperation: args.autonomousOperation,
    platformReport: args.platformReport
  });

  const recommendedSystemAdjustment = sciipComposeRecommendedSystemAdjustment_({
    learningStatus,
    systemImprovementSignal,
    workflowImprovementSignal,
    riskLearning,
    automationLearning
  });

  const confidence = sciipInferSystemLearningConfidence_({
    autonomousOperation: args.autonomousOperation,
    systemHealth: args.systemHealth,
    workQueue: args.workQueue,
    platformReport: args.platformReport
  });

  return [
    sciipGenerateId_('SLR'),
    args.businessKey,
    args.learningDate,
    'DAILY_SYSTEM_LEARNING',
    sciipExtractFirstAvailable_(args.autonomousOperation, [
      'Autonomous_Operation_ID',
      'Operation_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.systemHealth, [
      'System_Health_ID',
      'Health_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Work_Queue_ID',
      'Queue_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Report_ID',
      'Platform_Daily_Report_ID',
      'Record_ID',
      'ID'
    ]),
    learningStatus,
    operatingLesson,
    systemImprovementSignal,
    workflowImprovementSignal,
    riskLearning,
    automationLearning,
    recommendedSystemAdjustment,
    confidence,
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferSystemLearningStatus_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.autonomousOperation, [
      'Operation_Status',
      'Detected_Operating_State',
      'Escalation_Required',
      'Blocked_Items'
    ]),
    sciipExtractFirstAvailable_(args.systemHealth, [
      'Health_Status',
      'System_Status',
      'Status',
      'Health_Summary'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Queue_Status',
      'Status',
      'Blocked_Reason',
      'Priority'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Platform_Status',
      'Key_Risks',
      'Priority_Actions'
    ])
  ].join(' ').toLowerCase();

  if (
    combined.includes('critical') ||
    combined.includes('failed') ||
    combined.includes('error') ||
    combined.includes('attention_required')
  ) {
    return 'LEARNING_FROM_EXCEPTION';
  }

  if (
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog') ||
    combined.includes('watch')
  ) {
    return 'LEARNING_FROM_FRICTION';
  }

  return 'LEARNING_FROM_NORMAL_OPERATIONS';
}

function sciipComposeOperatingLesson_(args) {
  const parts = [];

  const operatingState = sciipExtractFirstAvailable_(args.autonomousOperation, [
    'Detected_Operating_State',
    'Operation_Status'
  ]);

  const platformStatus = sciipExtractFirstAvailable_(args.platformReport, [
    'Platform_Status',
    'Executive_Summary'
  ]);

  if (operatingState) {
    parts.push(`Autonomous operating state observed: ${operatingState}.`);
  }

  if (platformStatus) {
    parts.push(`Platform condition observed: ${platformStatus}.`);
  }

  if (parts.length === 0) {
    parts.push('SCIIP completed the cycle without a specific operating exception.');
  }

  return parts.join('\n');
}

function sciipComposeSystemImprovementSignal_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.systemHealth, [
      'Health_Summary',
      'System_Health_Summary',
      'System_Status',
      'Status'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'System_Health_Summary',
      'Key_Risks',
      'Executive_Summary'
    ])
  ].join(' ').toLowerCase();

  if (combined.includes('error') || combined.includes('failed')) {
    return 'Improve processor fault detection, recovery notes, and operator escalation around failed system components.';
  }

  if (combined.includes('critical') || combined.includes('attention_required')) {
    return 'Strengthen daily health checks and make critical system states more visible in command outputs.';
  }

  return 'No major system architecture adjustment detected from today’s health cycle.';
}

function sciipComposeWorkflowImprovementSignal_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.autonomousOperation, [
      'Executable_Directives',
      'Blocked_Items',
      'Recommended_Operator_Actions'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Queue_Status',
      'Status',
      'Blocked_Reason',
      'Priority',
      'Task'
    ]),
    sciipExtractFirstAvailable_(args.platformReport, [
      'Work_Queue_Summary',
      'Priority_Actions'
    ])
  ].join(' ').toLowerCase();

  if (combined.includes('blocked')) {
    return 'Workflow should better expose blockers and require explicit owner, next step, and unblock condition.';
  }

  if (combined.includes('overdue') || combined.includes('backlog')) {
    return 'Workflow prioritization should elevate overdue and backlog items earlier in the daily command cycle.';
  }

  return 'Workflow appears stable; continue current prioritization and review cadence.';
}

function sciipComposeRiskLearning_(args) {
  const risks = [];

  const autoRisk = sciipExtractFirstAvailable_(args.autonomousOperation, [
    'Blocked_Items',
    'Escalation_Required'
  ]);

  const healthRisk = sciipExtractFirstAvailable_(args.systemHealth, [
    'Risk',
    'Key_Risks',
    'Health_Summary',
    'Status'
  ]);

  const platformRisk = sciipExtractFirstAvailable_(args.platformReport, [
    'Key_Risks',
    'Decision_Required'
  ]);

  if (autoRisk) risks.push(`Autonomous operations risk signal: ${autoRisk}`);
  if (healthRisk) risks.push(`System health risk signal: ${healthRisk}`);
  if (platformRisk) risks.push(`Platform report risk signal: ${platformRisk}`);

  if (risks.length === 0) {
    risks.push('No material risk learning identified.');
  }

  return risks.join('\n');
}

function sciipComposeAutomationLearning_(args) {
  const autonomyMode = sciipExtractFirstAvailable_(args.autonomousOperation, [
    'Autonomy_Mode',
    'Human_Review_Status'
  ]);

  const directives = sciipExtractFirstAvailable_(args.autonomousOperation, [
    'Executable_Directives',
    'Recommended_Operator_Actions'
  ]);

  if (autonomyMode || directives) {
    return [
      autonomyMode ? `Autonomy mode observed: ${autonomyMode}.` : '',
      directives ? `Automation directive learning: ${directives}` : '',
      'SCIIP should continue requiring human review before execution while the operating loop matures.'
    ].filter(Boolean).join('\n');
  }

  return 'No autonomous operations learning available for this cycle.';
}

function sciipComposeRecommendedSystemAdjustment_(args) {
  const combined = [
    args.learningStatus,
    args.systemImprovementSignal,
    args.workflowImprovementSignal,
    args.riskLearning,
    args.automationLearning
  ].join(' ').toLowerCase();

  if (combined.includes('failed') || combined.includes('error') || combined.includes('critical')) {
    return 'Add or strengthen recovery logic, exception summaries, and operator-visible diagnostics.';
  }

  if (combined.includes('blocked') || combined.includes('overdue') || combined.includes('backlog')) {
    return 'Improve work queue schema to track blocker owner, unblock condition, and escalation date.';
  }

  return 'No structural system adjustment required; continue collecting daily learning records.';
}

function sciipInferSystemLearningConfidence_(args) {
  let score = 0;

  if (args.autonomousOperation) score++;
  if (args.systemHealth) score++;
  if (args.workQueue) score++;
  if (args.platformReport) score++;

  if (score >= 4) return 'HIGH';
  if (score >= 2) return 'MEDIUM';
  return 'LOW';
}

function sciipTestSystemLearningProcessor() {
  const result = sciipRunSystemLearningProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestSystemLearningProcessor',
    result
  }));
  return result;
}

function sciipExtractFirstAvailable_(record, fieldNames) {
  if (!record || !fieldNames) return '';

  for (var i = 0; i < fieldNames.length; i++) {
    var fieldName = fieldNames[i];
    var value = record[fieldName];

    if (value !== null && value !== undefined && String(value).trim() !== '') {
      return value;
    }
  }

  return '';
}

