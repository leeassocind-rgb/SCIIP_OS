/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 810_AutonomousImprovementMemoryProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_OUTCOMES → AUTONOMOUS_IMPROVEMENT_MEMORY
 *
 * Migration note:
 * Preserves original 810 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousImprovementMemoryProcessorName810_() {
  return '810_AutonomousImprovementMemoryProcessor';
}

function sciipGetAutonomousImprovementMemoryHeaders810_() {
  return [
    'Memory_ID',
    'Business_Key',
    'Memory_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Memory_Title',
    'Memory_Type',
    'Memory_Summary',
    'Reusable_Learning',
    'Future_Use_Case',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousImprovementMemorySchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_IMPROVEMENT_MEMORY',
    sciipGetAutonomousImprovementMemoryHeaders810_()
  );
}

function sciipRunAutonomousImprovementMemoryProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
    action: 'AUTONOMOUS_IMPROVEMENT_MEMORY_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    targetSheet: 'AUTONOMOUS_IMPROVEMENT_MEMORY',
    ledgerSheet: 'AUTONOMOUS_IMPROVEMENT_MEMORY_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementOutcomes = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_OUTCOMES');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementOutcomes.length,
        outputCount: autonomousImprovementOutcomes.length ? 1 : 0,
        summary: 'Autonomous improvement memory runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_OUTCOMES']
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
      const outputSheet = sciipEnsureAutonomousImprovementMemorySchema();
      const memoryDate =
        sciipResolveLatestRuntimeProcessingDate810_('AUTONOMOUS_IMPROVEMENT_OUTCOMES', 'Outcome_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousImprovementMemoryBusinessKey = 'AUTONOMOUS_IMPROVEMENT_MEMORY|' + memoryDate;

      if (sciipRuntimeBusinessKeyPrefixExists810_(definition.targetSheet, autonomousImprovementMemoryBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementOutcomesReviewed: 0,
            autonomousImprovementMemoryCreated: 0,
            skippedDuplicate: 1,
            autonomousImprovementMemoryBusinessKey: autonomousImprovementMemoryBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementOutcomes = sciipGetRuntimeRecordsByDate810_(
        'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
        'Outcome_Date',
        memoryDate
      );

      if (!autonomousImprovementOutcomes.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementOutcomesReviewed: 0,
            autonomousImprovementMemoryCreated: 0,
            skippedNoInputs: 1,
            memoryDate: memoryDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const memory = sciipCreateAutonomousImprovementMemory810_({
        businessKey: autonomousImprovementMemoryBusinessKey,
        memoryDate: memoryDate,
        sourceRows: autonomousImprovementOutcomes,
        processor: sciipGetAutonomousImprovementMemoryProcessorName810_()
      });

      outputSheet.appendRow(memory);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousImprovementMemoryProcessorName810_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementOutcomes.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementOutcomesReviewed: autonomousImprovementOutcomes.length,
          autonomousImprovementMemoryCreated: 1,
          skippedDuplicate: 0,
          autonomousImprovementMemoryBusinessKey: autonomousImprovementMemoryBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists810_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate810_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue810_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate810_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue810_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue810_(value) {
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

function sciipCreateAutonomousImprovementMemory810_(args) {
  return [
    sciipGenerateId810_('AUTONOMOUS_IMPROVEMENT_MEMORY'),
    args.businessKey,
    args.memoryDate,
    'AUTONOMOUS_IMPROVEMENT_OUTCOMES',
    args.sourceRows.length,
    'Autonomous Improvement Memory — ' + args.memoryDate,
    'AUTONOMOUS_OPERATING_LOOP_LEARNING',
    sciipCreateAutonomousImprovementMemorySummary810_(args.sourceRows),
    sciipCreateAutonomousImprovementReusableLearning810_(args.sourceRows),
    sciipCreateAutonomousImprovementFutureUseCase810_(args.sourceRows),
    sciipResolveAutonomousImprovementMemoryConfidence810_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousImprovementMemorySummary810_(sourceRows) {
  return [
    'SCIIP_OS converted ' + sourceRows.length + ' autonomous improvement outcome record(s) into durable system memory.',
    'The system preserved the full loop from operations, learning, improvement planning, task creation, execution tracking, outcome capture, and memory consolidation.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementReusableLearning810_(sourceRows) {
  return [
    'Downstream processors should consume the latest completed processing date from upstream sheets instead of assuming the current execution date.',
    'Idempotent business keys must preserve one durable record per processing batch.',
    'Autonomous improvement loops should terminate in reusable memory so future processors can avoid repeating known failures.'
  ].join(' ');
}

function sciipCreateAutonomousImprovementFutureUseCase810_(sourceRows) {
  return [
    'Use this memory when designing future autonomous processors.',
    'Use this memory when diagnosing SKIPPED_NO_INPUTS caused by date mismatch.',
    'Use this memory when routing completed operating-loop outcomes into calibration, prioritization, or strategic reasoning layers.'
  ].join(' ');
}

function sciipResolveAutonomousImprovementMemoryConfidence810_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasCapturedOutcome = sourceRows.some(function(row) {
    return String(row.Outcome_Status || '').trim().toUpperCase() === 'CAPTURED';
  });

  return hasCapturedOutcome ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId810_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousImprovementMemoryProcessor() {
  const result = sciipRunAutonomousImprovementMemoryProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousImprovementMemoryProcessor',
    result: result
  }));

  return result;
}
