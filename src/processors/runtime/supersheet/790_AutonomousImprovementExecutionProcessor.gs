/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 790_AutonomousImprovementExecutionProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_TASKS → AUTONOMOUS_IMPROVEMENT_EXECUTIONS
 *
 * Migration note:
 * Preserves original 790 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementExecutionProcessorName790_() {
  return '790_AutonomousImprovementExecutionProcessor';
}

function sciipGetAutonomousImprovementExecutionHeaders790_() {
  return [
    'Execution_ID',
    'Business_Key',
    'Execution_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Title',
    'Execution_Summary',
    'Execution_Status',
    'Execution_Result',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementExecutionSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    sciipGetAutonomousImprovementExecutionHeaders790_()
  );
}

function sciipRunAutonomousImprovementExecutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
    action: 'AUTONOMOUS_IMPROVEMENT_EXECUTION_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_TASKS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementTasks = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_TASKS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementTasks.length,
        outputCount: autonomousImprovementTasks.length ? 1 : 0,
        summary: 'Autonomous improvement execution runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_TASKS']
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
      const outputSheet = sciipEnsureAutonomousImprovementExecutionSchema();
      const executionDate =
        sciipResolveLatestRuntimeProcessingDate790_('AUTONOMOUS_IMPROVEMENT_TASKS', 'Task_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementExecutionBusinessKey = 'AUTONOMOUS_IMPROVEMENT_EXECUTION|' + executionDate;

      if (sciipRuntimeBusinessKeyPrefixExists790_(definition.targetSheet, autonomousImprovementExecutionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementTasksReviewed: 0,
            autonomousImprovementExecutionsCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementExecutionBusinessKey: autonomousImprovementExecutionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementTasks = sciipGetRuntimeRecordsByDate790_(
        'AUTONOMOUS_IMPROVEMENT_TASKS',
        'Task_Date',
        executionDate
      );

      if (!autonomousImprovementTasks.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementTasksReviewed: 0,
            autonomousImprovementExecutionsCreated: 0,
            skippedNoInputs: 1,
            executionDate: executionDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const execution = sciipCreateAutonomousImprovementExecution790_({
        businessKey: autonomousImprovementExecutionBusinessKey,
        executionDate: executionDate,
        sourceRows: autonomousImprovementTasks,
        processor: sciipGetAutonomousImprovementExecutionProcessorName790_()
      });

      outputSheet.appendRow(execution);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementExecutionProcessorName790_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementTasks.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementTasksReviewed: autonomousImprovementTasks.length,
          autonomousImprovementExecutionsCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementExecutionBusinessKey: autonomousImprovementExecutionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists790_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate790_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue790_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate790_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue790_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue790_(value) {
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

function sciipCreateAutonomousImprovementExecution790_(args) {
  return [
    sciipGenerateId790_('AUTONOMOUS_IMPROVEMENT_EXECUTION'),
    args.businessKey,
    args.executionDate,
    'AUTONOMOUS_IMPROVEMENT_TASKS',
    args.sourceRows.length,
    'Autonomous Improvement Execution — ' + args.executionDate,
    sciipCreateAutonomousImprovementExecutionSummary790_(args.sourceRows),
    'RECORDED',
    sciipCreateAutonomousImprovementExecutionResult790_(args.sourceRows),
    sciipCreateAutonomousImprovementExecutionNextAction790_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementExecutionSummary790_(sourceRows) {
  return [
    'SCIIP_OS recorded execution tracking for ' + sourceRows.length + ' autonomous improvement task record(s).',
    'This preserves the transition from proposed system improvement into an execution-stage operating record.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementExecutionResult790_(sourceRows) {
  const pendingCount = sourceRows.filter(function(row) {
    return String(row.Status || '').trim().toUpperCase() === 'PENDING';
  }).length;

  return [
    pendingCount + ' source task record(s) were pending at execution-record creation.',
    'Execution has been recorded for downstream monitoring and outcome learning.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementExecutionNextAction790_(sourceRows) {
  return [
    'Monitor execution outcome.',
    'Route completed execution records into autonomous improvement outcome learning.',
    'Preserve result history without overwriting the original improvement task.'
  ].join(' ');
}

function sciipGenerateId790_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementExecutionProcessor() {
  const result = sciipRunAutonomousImprovementExecutionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementExecutionProcessor',
    result: result
  }));

  return result;
}
