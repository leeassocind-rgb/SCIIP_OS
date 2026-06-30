/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration Repair
 * 430_SystemHealthProcessor
 *
 * COMMAND_CENTER → SYSTEM_HEALTH
 *
 * Repair note:
 * Restores the correct 430 processor behavior after the
 * accidental overwrite with WorkQueueDigest logic.
 * Preserves original 430 business logic and migrates runtime
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

const SYSTEM_HEALTH_PROCESSOR = '430_SystemHealthProcessor';
const SYSTEM_HEALTH_SOURCE_SHEET = 'COMMAND_CENTER';
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

function sciipRunSystemHealthProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: SYSTEM_HEALTH_PROCESSOR,
    action: 'SYSTEM_HEALTH_BUILD',
    sourceSheet: SYSTEM_HEALTH_SOURCE_SHEET,
    targetSheet: SYSTEM_HEALTH_SHEET,
    ledgerSheet: 'SYSTEM_HEALTH_RUNTIME_LEDGER',

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
        summary: 'System health runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          repairedOverwrite: true,
          originalProcessor: SYSTEM_HEALTH_PROCESSOR
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      const ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Missing COMMAND_CENTER sheet. Run 420 first.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        SYSTEM_HEALTH_HEADERS
      );

      const commands = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      let created = 0;
      let skippedDuplicate = 0;
      let skippedNoCommand = 0;

      commands.forEach(function(command) {
        const commandId = command.ID || command.Command_Center_ID;

        if (!commandId) {
          skippedNoCommand++;
          return;
        }

        const businessKey = 'SYSTEM_HEALTH|' + commandId;

        const existing = SCIIP_RUNTIME_SHEET_FACTORY.findByBusinessKey(
          definition.targetSheet,
          businessKey
        );

        if (existing) {
          skippedDuplicate++;
          return;
        }

        const health = sciipBuildSystemHealth_(command, businessKey);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          SYSTEM_HEALTH_HEADERS,
          health
        );

        created++;
      });

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          commandCenterRecordsReviewed: commands.length,
          systemHealthRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoCommand: skippedNoCommand,
          transactionId: transaction.transactionId
        },
        message: '430 SystemHealthProcessor repaired runtime execution completed.'
      });

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: SYSTEM_HEALTH_PROCESSOR,
        businessKey: context.businessKey,
        recordsCreated: created,
        recordsRead: commands.length,
        processed: commands.length,
        skippedDuplicate: skippedDuplicate,
        skippedNoInputs: skippedNoCommand,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          repairedOverwrite: true,
          commandCenterRecordsReviewed: commands.length,
          systemHealthRecordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedNoCommand: skippedNoCommand,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipBuildSystemHealth_(command, businessKey) {
  const now = new Date().toISOString();
  const healthScore = sciipSystemHealthScore_(command);

  return {
    ID: sciipGenerateSystemHealthId_(),
    Business_Key: businessKey,
    Command_Center_ID: command.ID || command.Command_Center_ID || '',
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
    Notes: 'Generated from COMMAND_CENTER using SCIIP_RuntimeProcessorBase.'
  };
}

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
    'SCIIP system health score: ' + score,
    'System status: ' + (command.System_Status || 'UNKNOWN'),
    'Execution posture: ' + (command.Execution_Posture || 'UNKNOWN'),
    'Escalation level: ' + (command.Escalation_Level || 'UNKNOWN'),
    'Open workload: ' + (command.Open_Workload || 0)
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

function sciipGenerateSystemHealthId_() {
  return 'SYS_HEALTH_' +
    Utilities.getUuid()
      .replace(/-/g, '')
      .slice(0, 16)
      .toUpperCase();
}

function sciipTestSystemHealthProcessor() {
  const result = sciipRunSystemHealthProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestSystemHealthProcessor',
    result: result
  }));

  return result;
}
