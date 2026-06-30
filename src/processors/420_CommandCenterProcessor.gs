/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 420_CommandCenterProcessor
 *
 * OPERATOR_CONSOLE → COMMAND_CENTER
 *
 * Migration note:
 * Preserves original 420 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const COMMAND_CENTER_PROCESSOR = '420_CommandCenterProcessor';
const COMMAND_CENTER_SOURCE_SHEET = 'OPERATOR_CONSOLE';
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

function sciipRunCommandCenterProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: COMMAND_CENTER_PROCESSOR,
    action: 'COMMAND_CENTER_BUILD',
    sourceSheet: COMMAND_CENTER_SOURCE_SHEET,
    targetSheet: COMMAND_CENTER_SHEET,
    ledgerSheet: 'COMMAND_CENTER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: records.length,
        outputCount: records.length,
        summary: 'Command center runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: COMMAND_CENTER_PROCESSOR
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Missing OPERATOR_CONSOLE sheet. Run 410 first.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        COMMAND_CENTER_HEADERS
      );

      const consoles = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);
      let created = 0;
      let skippedDuplicate = 0;
      let skippedNoConsole = 0;

      consoles.forEach(function(console) {
        const consoleId = console.ID || console.Operator_Console_ID;

        if (!consoleId) {
          skippedNoConsole++;
          return;
        }

        const commandBusinessKey = 'COMMAND_CENTER|' + consoleId;
        const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
          definition.targetSheet,
          commandBusinessKey
        );

        if (existing) {
          skippedDuplicate++;
          return;
        }

        const command = sciipBuildCommandCenter_(console, commandBusinessKey);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          COMMAND_CENTER_HEADERS,
          command
        );

        created++;
      });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          operatorConsolesReviewed: consoles.length,
          commandCenterRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoConsole: skippedNoConsole,
          transactionId: transaction.transactionId
        },
        message: '420 CommandCenterProcessor runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: COMMAND_CENTER_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: consoles.length,
        processed: consoles.length,
        skippedDuplicate: skippedDuplicate,
        skippedNoInputs: skippedNoConsole,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          operatorConsolesReviewed: consoles.length,
          commandCenterRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoConsole: skippedNoConsole,
          transactionId: transaction.transactionId
        })
      });
    }
  });
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

function sciipCommandCenterTitle_(console) {
  const date = console.Console_Date || new Date().toISOString().slice(0, 10);
  return 'SCIIP Command Center — ' + date;
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
    'Open workload: ' + (console.Open_Work_Items || 0),
    'Critical: ' + (console.Critical_Count || 0),
    'High: ' + (console.High_Count || 0),
    'Medium: ' + (console.Medium_Count || 0),
    'Low: ' + (console.Low_Count || 0),
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

function sciipGenerateCommandCenterId_() {
  return 'COMMAND_' + Utilities.getUuid().replace(/-/g, '').slice(0, 16).toUpperCase();
}

function sciipTestCommandCenterProcessor() {
  const result = sciipRunCommandCenterProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestCommandCenterProcessor',
    result: result
  }));

  return result;
}
