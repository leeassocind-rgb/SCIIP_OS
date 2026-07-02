/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 800_AutonomousImprovementOutcomeProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_EXECUTIONS → AUTONOMOUS_IMPROVEMENT_OUTCOMES
 *
 * Migration note:
 * Preserves original 800 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementOutcomeProcessorName800_() {
  return '800_AutonomousImprovementOutcomeProcessor';
}

function sciipGetAutonomousImprovementOutcomeHeaders800_() {
  return [
    'Outcome_ID',
    'Business_Key',
    'Outcome_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Outcome_Title',
    'Outcome_Summary',
    'Learning_Captured',
    'System_Adjustment_Recommendation',
    'Outcome_Status',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementOutcomeSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    sciipGetAutonomousImprovementOutcomeHeaders800_()
  );
}

function sciipRunAutonomousImprovementOutcomeProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
    action: 'AUTONOMOUS_IMPROVEMENT_OUTCOME_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_OUTCOMES_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementExecutions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_EXECUTIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementExecutions.length,
        outputCount: autonomousImprovementExecutions.length ? 1 : 0,
        summary: 'Autonomous improvement outcome runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_EXECUTIONS']
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
      const outputSheet = sciipEnsureAutonomousImprovementOutcomeSchema();
      const outcomeDate =
        sciipResolveLatestRuntimeProcessingDate800_('AUTONOMOUS_IMPROVEMENT_EXECUTIONS', 'Execution_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementOutcomeBusinessKey = 'AUTONOMOUS_IMPROVEMENT_OUTCOME|' + outcomeDate;

      if (sciipRuntimeBusinessKeyPrefixExists800_(definition.targetSheet, autonomousImprovementOutcomeBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementExecutionsReviewed: 0,
            autonomousImprovementOutcomesCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementOutcomeBusinessKey: autonomousImprovementOutcomeBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementExecutions = sciipGetRuntimeRecordsByDate800_(
        'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
        'Execution_Date',
        outcomeDate
      );

      if (!autonomousImprovementExecutions.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementExecutionsReviewed: 0,
            autonomousImprovementOutcomesCreated: 0,
            skippedNoInputs: 1,
            outcomeDate: outcomeDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outcome = sciipCreateAutonomousImprovementOutcome800_({
        businessKey: autonomousImprovementOutcomeBusinessKey,
        outcomeDate: outcomeDate,
        sourceRows: autonomousImprovementExecutions,
        processor: sciipGetAutonomousImprovementOutcomeProcessorName800_()
      });

      outputSheet.appendRow(outcome);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementOutcomeProcessorName800_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementExecutions.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementExecutionsReviewed: autonomousImprovementExecutions.length,
          autonomousImprovementOutcomesCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementOutcomeBusinessKey: autonomousImprovementOutcomeBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists800_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate800_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue800_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate800_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue800_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue800_(value) {
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

function sciipCreateAutonomousImprovementOutcome800_(args) {
  return [
    sciipGenerateId800_('AUTONOMOUS_IMPROVEMENT_OUTCOME'),
    args.businessKey,
    args.outcomeDate,
    'AUTONOMOUS_IMPROVEMENT_EXECUTIONS',
    args.sourceRows.length,
    'Autonomous Improvement Outcome — ' + args.outcomeDate,
    sciipCreateAutonomousImprovementOutcomeSummary800_(args.sourceRows),
    sciipCreateAutonomousImprovementOutcomeLearning800_(args.sourceRows),
    sciipCreateAutonomousImprovementOutcomeRecommendation800_(args.sourceRows),
    'CAPTURED',
    sciipResolveAutonomousImprovementOutcomeConfidence800_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementOutcomeSummary800_(sourceRows) {
  return [
    'SCIIP_OS captured outcome learning from ' + sourceRows.length + ' autonomous improvement execution record(s).',
    'This completes the improvement loop from learning, to plan, to task, to execution, to outcome history.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementOutcomeLearning800_(sourceRows) {
  const recordedCount = sourceRows.filter(function(row) {
    return String(row.Execution_Status || '').trim().toUpperCase() === 'RECORDED';
  }).length;

  return [
    recordedCount + ' execution record(s) reached RECORDED status.',
    'The system successfully preserved execution-stage activity as permanent downstream learning.',
    'Future processors can now use this outcome layer to improve calibration, prioritization, and autonomous routing.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementOutcomeRecommendation800_(sourceRows) {
  return [
    'Continue using latest completed processing dates for downstream autonomous processors.',
    'Preserve all improvement-loop outputs as event-sourced history.',
    'Route captured outcomes into future strategic memory consolidation and model calibration processors.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementOutcomeConfidence800_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasRecordedExecution = sourceRows.some(function(row) {
    return String(row.Execution_Status || '').trim().toUpperCase() === 'RECORDED';
  });

  return hasRecordedExecution ? 'MEDIUM' : 'LOW';
}

function sciipGenerateId800_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementOutcomeProcessor() {
  const result = sciipRunAutonomousImprovementOutcomeProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementOutcomeProcessor',
    result: result
  }));

  return result;
}
