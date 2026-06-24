/************************************************************
 * 490_SystemLearningProcessor
 * SCIIP_OS v4.0
 *
 * Inputs:
 * - AUTONOMOUS_OPERATIONS
 * - SYSTEM_HEALTH
 * - WORK_QUEUE
 * - PLATFORM_DAILY_REPORT
 *
 * Output:
 * - SYSTEM_LEARNING
 ************************************************************/

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
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(SYSTEM_LEARNING_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(SYSTEM_LEARNING_SHEET);
  }

  sheet.getRange(1, 1, 1, SYSTEM_LEARNING_HEADERS.length)
    .setValues([SYSTEM_LEARNING_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunSystemLearningProcessor() {
  const processor = '490_SystemLearningProcessor';
  const startedAt = new Date();

  const outputSheet = sciipEnsureSystemLearningSchema();

  const autonomousOperation = sciipGetLatestRecordByCreatedAt_('AUTONOMOUS_OPERATIONS');
  const systemHealth = sciipGetLatestRecordByCreatedAt_('SYSTEM_HEALTH');
  const workQueue = sciipGetLatestRecordByCreatedAt_('WORK_QUEUE');
  const platformReport = sciipGetLatestRecordByCreatedAt_('PLATFORM_DAILY_REPORT');

  if (!autonomousOperation && !systemHealth && !workQueue && !platformReport) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      systemLearningsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const learningDate = sciipFormatDateKey_(startedAt);
  const businessKey = `SYSTEM_LEARNING|${learningDate}`;

  if (sciipBusinessKeyExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      systemLearningsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const learning = sciipCreateSystemLearning_({
    businessKey,
    learningDate,
    autonomousOperation,
    systemHealth,
    workQueue,
    platformReport,
    processor
  });

  outputSheet.appendRow(learning);

  const result = {
    processor,
    status: 'SUCCESS',
    systemLearningsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
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