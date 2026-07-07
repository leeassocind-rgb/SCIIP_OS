/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 480_AutonomousOperationsProcessor
 *
 * COMMAND_BRIEF + EXECUTIVE_DASHBOARD + WORK_QUEUE
 * → AUTONOMOUS_OPERATIONS
 *
 * Migration note:
 * Preserves original 480 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const AUTONOMOUS_OPERATIONS_PROCESSOR = '480_AutonomousOperationsProcessor';
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
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    AUTONOMOUS_OPERATIONS_SHEET,
    AUTONOMOUS_OPERATIONS_HEADERS
  );
}

function sciipRunAutonomousOperationsProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: AUTONOMOUS_OPERATIONS_PROCESSOR,
    action: 'AUTONOMOUS_OPERATIONS_BUILD',
    sourceSheet: null,
    targetSheet: AUTONOMOUS_OPERATIONS_SHEET,
    ledgerSheet: 'AUTONOMOUS_OPERATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const commandBriefs = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('COMMAND_BRIEF');
      const executiveDashboards = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('EXECUTIVE_DASHBOARD');
      const workQueueItems = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('WORK_QUEUE');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: commandBriefs.length + executiveDashboards.length + workQueueItems.length,
        outputCount: 1,
        summary: 'Autonomous operations runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: AUTONOMOUS_OPERATIONS_PROCESSOR,
          inputSheets: [
            'COMMAND_BRIEF',
            'EXECUTIVE_DASHBOARD',
            'WORK_QUEUE'
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
      const outputSheet = sciipEnsureAutonomousOperationsSchema();

      const commandBrief = sciipGetLatestRuntimeRecordByCreatedAt_('COMMAND_BRIEF');
      const executiveDashboard = sciipGetLatestRuntimeRecordByCreatedAt_('EXECUTIVE_DASHBOARD');
      const workQueue = sciipGetLatestRuntimeRecordByCreatedAt_('WORK_QUEUE');

      if (!commandBrief && !executiveDashboard && !workQueue) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: AUTONOMOUS_OPERATIONS_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOperationsCreated: 0,
            skippedNoInputs: 1,
            transactionId: transaction.transactionId
          })
        });
      }

      const operationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const autonomousOperationsBusinessKey = 'AUTONOMOUS_OPERATIONS|' + operationDate;

      const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
        definition.targetSheet,
        autonomousOperationsBusinessKey
      );

      if (existing) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: AUTONOMOUS_OPERATIONS_PROCESSOR,
          businessKey: context.businessKey,
          recordsRead: 3,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOperationsCreated: 0,
            skippedDuplicate: 1,
            autonomousOperationsBusinessKey: autonomousOperationsBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const operation = sciipCreateAutonomousOperation_({
        businessKey: autonomousOperationsBusinessKey,
        operationDate: operationDate,
        commandBrief: commandBrief,
        executiveDashboard: executiveDashboard,
        workQueue: workQueue,
        processor: AUTONOMOUS_OPERATIONS_PROCESSOR
      });

      outputSheet.appendRow(operation);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: AUTONOMOUS_OPERATIONS_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: 3,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          commandBriefFound: !!commandBrief,
          executiveDashboardFound: !!executiveDashboard,
          workQueueFound: !!workQueue,
          autonomousOperationsCreated: 1,
          skippedDuplicate: 0,
          autonomousOperationsBusinessKey: autonomousOperationsBusinessKey,
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
    result: result
  }));
  return result;
}
