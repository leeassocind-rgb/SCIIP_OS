/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 780_AutonomousImprovementTaskProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_PLANS → AUTONOMOUS_IMPROVEMENT_TASKS
 *
 * Migration note:
 * Preserves original 780 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementTaskProcessorName780_() {
  return '780_AutonomousImprovementTaskProcessor';
}

function sciipGetAutonomousImprovementTaskHeaders780_() {
  return [
    'Task_ID',
    'Business_Key',
    'Task_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Task_Title',
    'Task_Description',
    'Task_Type',
    'Priority',
    'Status',
    'Execution_Owner',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementTaskSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_TASKS',
    sciipGetAutonomousImprovementTaskHeaders780_()
  );
}

function sciipRunAutonomousImprovementTaskProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
    action: 'AUTONOMOUS_IMPROVEMENT_TASK_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_PLANS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_TASKS',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_TASKS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementPlans = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_PLANS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementPlans.length,
        outputCount: autonomousImprovementPlans.length ? 1 : 0,
        summary: 'Autonomous improvement task runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementTaskProcessorName780_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_PLANS']
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const outputSheet = sciipEnsureAutonomousImprovementTaskSchema();
      const taskDate =
        sciipResolveLatestRuntimeProcessingDate780_('AUTONOMOUS_IMPROVEMENT_PLANS', 'Plan_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementTaskBusinessKey = 'AUTONOMOUS_IMPROVEMENT_TASK|' + taskDate;

      if (sciipRuntimeBusinessKeyPrefixExists780_(definition.targetSheet, autonomousImprovementTaskBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementPlansReviewed: 0,
            autonomousImprovementTasksCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementTaskBusinessKey: autonomousImprovementTaskBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementPlans = sciipGetRuntimeRecordsByDate780_(
        'AUTONOMOUS_IMPROVEMENT_PLANS',
        'Plan_Date',
        taskDate
      );

      if (!autonomousImprovementPlans.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementPlansReviewed: 0,
            autonomousImprovementTasksCreated: 0,
            skippedNoInputs: 1,
            taskDate: taskDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const task = sciipCreateAutonomousImprovementTask780_({
        businessKey: autonomousImprovementTaskBusinessKey,
        taskDate: taskDate,
        sourceRows: autonomousImprovementPlans,
        processor: sciipGetAutonomousImprovementTaskProcessorName780_()
      });

      outputSheet.appendRow(task);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementTaskProcessorName780_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementPlans.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementPlansReviewed: autonomousImprovementPlans.length,
          autonomousImprovementTasksCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementTaskBusinessKey: autonomousImprovementTaskBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists780_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate780_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue780_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate780_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue780_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue780_(value) {
  if (!value) return '';
  if (Object.prototype.toString.call(value) === '[object Date]') {
    return Utilities.formatDate(value, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  const text = String(value).trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(text)) return text;
  const parsed = new Date(text);
  if (!isNaN(parsed.getTime())) {
    return Utilities.formatDate(parsed, Session.getScriptTimeZone(), 'yyyy-MM-dd');
  }
  return text;
}

function sciipCreateAutonomousImprovementTask780_(args) {
  return [
    sciipGenerateId780_('AUTONOMOUS_IMPROVEMENT_TASK'),
    args.businessKey,
    args.taskDate,
    'AUTONOMOUS_IMPROVEMENT_PLANS',
    args.sourceRows.length,
    'Execute Autonomous Improvement Plan — ' + args.taskDate,
    sciipCreateAutonomousImprovementTaskDescription780_(args.sourceRows),
    'AUTONOMOUS_SYSTEM_IMPROVEMENT',
    sciipResolveAutonomousImprovementTaskPriority780_(args.sourceRows),
    'PENDING',
    'SCIIP_OS',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementTaskDescription780_(sourceRows) {
  return [
    'Create an execution task from ' + sourceRows.length + ' autonomous improvement plan record(s).',
    'Review the proposed improvement objective, actions, and expected system impact.',
    'Route the improvement into downstream execution tracking so SCIIP_OS can close the loop from learning to action.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementTaskPriority780_(sourceRows) {
  const hasHighPriorityPlan = sourceRows.some(function(row) {
    return String(row.Priority || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighPriorityPlan ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId780_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementTaskProcessor() {
  const result = sciipRunAutonomousImprovementTaskProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementTaskProcessor',
    result: result
  }));

  return result;
}
