/************************************************************
 * 480_AutonomousOperationsProcessor
 * SCIIP_OS v4.0
 *
 * Inputs:
 * - COMMAND_BRIEF
 * - EXECUTIVE_DASHBOARD
 * - WORK_QUEUE
 *
 * Output:
 * - AUTONOMOUS_OPERATIONS
 ************************************************************/

const AUTONOMOUS_OPERATIONS_SHEET = 'AUTONOMOUS_OPERATIONS';

const AUTONOMOUS_OPERATIONS_HEADERS = [
  'Autonomous_Operation_ID',
  'Business_Key',
  'Operation_Date',
  'Operation_Type',
  'Command_Brief_ID',
  'Executive_Dashboard_ID',
  'Work_Queue_ID',
  'Autonomy_Mode',
  'Operation_Status',
  'Command_Intent',
  'Detected_Operating_State',
  'Executable_Directives',
  'Blocked_Items',
  'Recommended_Operator_Actions',
  'Escalation_Required',
  'Human_Review_Status',
  'Status',
  'Created_At',
  'Processor'
];

function sciipEnsureAutonomousOperationsSchema() {
  const ss = sciipGetSpreadsheet_();
  let sheet = ss.getSheetByName(AUTONOMOUS_OPERATIONS_SHEET);

  if (!sheet) {
    sheet = ss.insertSheet(AUTONOMOUS_OPERATIONS_SHEET);
  }

  sheet.getRange(1, 1, 1, AUTONOMOUS_OPERATIONS_HEADERS.length)
    .setValues([AUTONOMOUS_OPERATIONS_HEADERS]);

  sheet.setFrozenRows(1);
  return sheet;
}

function sciipRunAutonomousOperationsProcessor() {
  const processor = '480_AutonomousOperationsProcessor';
  const startedAt = new Date();

  const outputSheet = sciipEnsureAutonomousOperationsSchema();

  const commandBrief = sciipGetLatestRecordByCreatedAt_('COMMAND_BRIEF');
  const executiveDashboard = sciipGetLatestRecordByCreatedAt_('EXECUTIVE_DASHBOARD');
  const workQueue = sciipGetLatestRecordByCreatedAt_('WORK_QUEUE');

  if (!commandBrief && !executiveDashboard && !workQueue) {
    const result = {
      processor,
      status: 'SKIPPED_NO_INPUTS',
      autonomousOperationsCreated: 0,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const operationDate = sciipFormatDateKey_(startedAt);
  const businessKey = `AUTONOMOUS_OPERATIONS|${operationDate}`;

  if (sciipBusinessKeyExists_(outputSheet, businessKey)) {
    const result = {
      processor,
      status: 'SUCCESS',
      autonomousOperationsCreated: 0,
      skippedDuplicate: 1,
      businessKey,
      completedAt: new Date().toISOString()
    };
    Logger.log(JSON.stringify(result));
    return result;
  }

  const operation = sciipCreateAutonomousOperation_({
    businessKey,
    operationDate,
    commandBrief,
    executiveDashboard,
    workQueue,
    processor
  });

  outputSheet.appendRow(operation);

  const result = {
    processor,
    status: 'SUCCESS',
    autonomousOperationsCreated: 1,
    skippedDuplicate: 0,
    businessKey,
    completedAt: new Date().toISOString(),
    durationMs: new Date() - startedAt
  };

  Logger.log(JSON.stringify(result));
  return result;
}

function sciipCreateAutonomousOperation_(args) {
  const now = new Date();

  const commandIntent = sciipExtractFirstAvailable_(args.commandBrief, [
    'Commander_Intent',
    'Mission',
    'Execution',
    'Priority_Actions'
  ]);

  const detectedOperatingState = sciipInferAutonomousOperatingState_({
    commandBrief: args.commandBrief,
    executiveDashboard: args.executiveDashboard,
    workQueue: args.workQueue
  });

  const executableDirectives = sciipComposeAutonomousDirectives_({
    commandBrief: args.commandBrief,
    executiveDashboard: args.executiveDashboard,
    workQueue: args.workQueue,
    detectedOperatingState
  });

  const blockedItems = sciipComposeAutonomousBlockedItems_({
    commandBrief: args.commandBrief,
    executiveDashboard: args.executiveDashboard,
    workQueue: args.workQueue
  });

  const recommendedOperatorActions = sciipComposeAutonomousOperatorActions_({
    detectedOperatingState,
    executableDirectives,
    blockedItems
  });

  const escalationRequired = sciipInferAutonomousEscalationRequired_({
    detectedOperatingState,
    blockedItems,
    commandBrief: args.commandBrief,
    executiveDashboard: args.executiveDashboard
  });

  return [
    sciipGenerateId_('AOP'),
    args.businessKey,
    args.operationDate,
    'DAILY_AUTONOMOUS_OPERATIONS_PLAN',
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Command_Brief_ID',
      'Brief_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.executiveDashboard, [
      'Dashboard_ID',
      'Executive_Dashboard_ID',
      'Record_ID',
      'ID'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Work_Queue_ID',
      'Queue_ID',
      'Record_ID',
      'ID'
    ]),
    'HUMAN_REVIEW_REQUIRED',
    detectedOperatingState,
    commandIntent,
    detectedOperatingState,
    executableDirectives,
    blockedItems,
    recommendedOperatorActions,
    escalationRequired,
    'PENDING_OPERATOR_REVIEW',
    'ACTIVE',
    now.toISOString(),
    args.processor
  ];
}

function sciipInferAutonomousOperatingState_(args) {
  const combined = [
    sciipExtractFirstAvailable_(args.commandBrief, [
      'Command_Status',
      'Commander_Intent',
      'Risks',
      'Decisions',
      'Priority_Actions'
    ]),
    sciipExtractFirstAvailable_(args.executiveDashboard, [
      'Executive_Status',
      'Key_Risks',
      'Critical_Decisions',
      'Top_Priorities'
    ]),
    sciipExtractFirstAvailable_(args.workQueue, [
      'Queue_Status',
      'Priority',
      'Status',
      'Work_Item_Status',
      'Blocked_Reason'
    ])
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
    combined.includes('blocked') ||
    combined.includes('overdue') ||
    combined.includes('backlog') ||
    combined.includes('watch')
  ) {
    return 'WATCH';
  }

  return 'NORMAL_OPERATIONS';
}

function sciipComposeAutonomousDirectives_(args) {
  const directives = [];

  const commandActions = sciipExtractFirstAvailable_(args.commandBrief, [
    'Priority_Actions',
    'Execution',
    'Recommended_Actions'
  ]);

  const dashboardActions = sciipExtractFirstAvailable_(args.executiveDashboard, [
    'Recommended_Actions',
    'Top_Priorities',
    'Priority_Actions'
  ]);

  const workQueueAction = sciipExtractFirstAvailable_(args.workQueue, [
    'Task',
    'Work_Item',
    'Action',
    'Next_Action',
    'Priority_Action'
  ]);

  if (commandActions) {
    directives.push(`Convert command brief priorities into operator-reviewed tasks: ${commandActions}`);
  }

  if (dashboardActions) {
    directives.push(`Maintain executive dashboard priorities: ${dashboardActions}`);
  }

  if (workQueueAction) {
    directives.push(`Advance latest work queue item after operator review: ${workQueueAction}`);
  }

  if (args.detectedOperatingState === 'ATTENTION_REQUIRED') {
    directives.push('Pause autonomous expansion and focus on issue resolution, queue stabilization, and executive escalation.');
  }

  if (args.detectedOperatingState === 'WATCH') {
    directives.push('Monitor queue pressure and prepare follow-up tasks for blocked or overdue items.');
  }

  if (directives.length === 0) {
    directives.push('Maintain normal SCIIP cadence and prepare the next operating cycle.');
  }

  return directives.join('\n');
}

function sciipComposeAutonomousBlockedItems_(args) {
  const blocked = [];

  const commandRisks = sciipExtractFirstAvailable_(args.commandBrief, [
    'Risks',
    'Decisions',
    'Decision_Required'
  ]);

  const dashboardRisks = sciipExtractFirstAvailable_(args.executiveDashboard, [
    'Key_Risks',
    'Critical_Decisions',
    'Decision_Required'
  ]);

  const queueBlocker = sciipExtractFirstAvailable_(args.workQueue, [
    'Blocked_Reason',
    'Blocker',
    'Status',
    'Work_Item_Status'
  ]);

  if (commandRisks && String(commandRisks).toLowerCase().includes('blocked')) {
    blocked.push(`Command brief blocker: ${commandRisks}`);
  }

  if (dashboardRisks && String(dashboardRisks).toLowerCase().includes('blocked')) {
    blocked.push(`Executive dashboard blocker: ${dashboardRisks}`);
  }

  if (
    queueBlocker &&
    (
      String(queueBlocker).toLowerCase().includes('blocked') ||
      String(queueBlocker).toLowerCase().includes('overdue')
    )
  ) {
    blocked.push(`Work queue blocker: ${queueBlocker}`);
  }

  if (blocked.length === 0) {
    blocked.push('No blocked autonomous operations detected.');
  }

  return blocked.join('\n');
}

function sciipComposeAutonomousOperatorActions_(args) {
  const actions = [];

  if (args.detectedOperatingState === 'ATTENTION_REQUIRED') {
    actions.push('Operator should review critical state before allowing additional automation.');
    actions.push('Confirm owner, next action, and resolution path for any failed or blocked item.');
  }

  if (args.detectedOperatingState === 'WATCH') {
    actions.push('Operator should review watch items and clear queue pressure before next daily cycle.');
  }

  actions.push('Review executable directives and approve, defer, or convert them into execution tasks.');

  return actions.join('\n');
}

function sciipInferAutonomousEscalationRequired_(args) {
  const combined = [
    args.detectedOperatingState,
    args.blockedItems,
    sciipExtractFirstAvailable_(args.commandBrief, ['Decision_Required', 'Decisions']),
    sciipExtractFirstAvailable_(args.executiveDashboard, ['Decision_Required', 'Critical_Decisions'])
  ].join(' ').toLowerCase();

  if (
    combined.includes('attention_required') ||
    combined.includes('critical') ||
    combined.includes('blocked') ||
    (
      combined.includes('decision') &&
      !combined.includes('no command-level decisions required') &&
      !combined.includes('no critical executive decisions')
    )
  ) {
    return 'YES';
  }

  return 'NO';
}

function sciipTestAutonomousOperationsProcessor() {
  const result = sciipRunAutonomousOperationsProcessor();
  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOperationsProcessor',
    result
  }));
  return result;
}