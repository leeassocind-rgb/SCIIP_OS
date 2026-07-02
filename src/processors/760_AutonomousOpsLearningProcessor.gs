/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 760_AutonomousOpsLearningProcessor
 *
 * AUTONOMOUS_OPS_DIGESTS → AUTONOMOUS_OPS_LEARNINGS
 *
 * Migration note:
 * Preserves original 760 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousOpsLearningProcessorName760_() {
  return '760_AutonomousOpsLearningProcessor';
}

function sciipGetAutonomousOpsLearningsHeaders760_() {
  return [
    'Learning_ID',
    'Business_Key',
    'Learning_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Learning_Title',
    'Operational_Learning',
    'Recommended_Adjustment',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousOpsLearningSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_OPS_LEARNINGS',
    sciipGetAutonomousOpsLearningsHeaders760_()
  );
}

function sciipRunAutonomousOpsLearningProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousOpsLearningProcessorName760_(),
    action: 'AUTONOMOUS_OPS_LEARNING_BUILD',
    sourceSheet: 'AUTONOMOUS_OPS_DIGESTS',
    targetSheet: 'AUTONOMOUS_OPS_LEARNINGS',
    ledgerSheet: 'AUTONOMOUS_OPS_LEARNINGS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousOpsDigests = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_OPS_DIGESTS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousOpsDigests.length,
        outputCount: autonomousOpsDigests.length ? 1 : 0,
        summary: 'Autonomous operations learning runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousOpsLearningProcessorName760_(),
          inputSheets: ['AUTONOMOUS_OPS_DIGESTS']
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
      const outputSheet = sciipEnsureAutonomousOpsLearningSchema();
      const learningDate =
        sciipResolveLatestRuntimeProcessingDate760_('AUTONOMOUS_OPS_DIGESTS', 'Digest_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousOpsLearningBusinessKey = 'AUTONOMOUS_OPS_LEARNING|' + learningDate;

      if (sciipRuntimeBusinessKeyPrefixExists760_(definition.targetSheet, autonomousOpsLearningBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousOpsLearningProcessorName760_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsDigestsReviewed: 0,
            autonomousOpsLearningsCreated: 0,
            skippedDuplicate: 1,
            autonomousOpsLearningBusinessKey: autonomousOpsLearningBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousOpsDigests = sciipGetRuntimeRecordsByDate760_(
        'AUTONOMOUS_OPS_DIGESTS',
        'Digest_Date',
        learningDate
      );

      if (!autonomousOpsDigests.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousOpsLearningProcessorName760_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousOpsDigestsReviewed: 0,
            autonomousOpsLearningsCreated: 0,
            skippedNoInputs: 1,
            learningDate: learningDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const learning = sciipCreateAutonomousOpsLearning760_({
        businessKey: autonomousOpsLearningBusinessKey,
        learningDate: learningDate,
        sourceRows: autonomousOpsDigests,
        processor: sciipGetAutonomousOpsLearningProcessorName760_()
      });

      outputSheet.appendRow(learning);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousOpsLearningProcessorName760_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousOpsDigests.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousOpsDigestsReviewed: autonomousOpsDigests.length,
          autonomousOpsLearningsCreated: 1,
          skippedDuplicate: 0,
          autonomousOpsLearningBusinessKey: autonomousOpsLearningBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists760_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate760_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue760_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate760_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue760_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue760_(value) {
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

function sciipCreateAutonomousOpsLearning760_(args) {
  return [
    sciipGenerateId760_('AUTONOMOUS_OPS_LEARNING'),
    args.businessKey,
    args.learningDate,
    'AUTONOMOUS_OPS_DIGESTS',
    args.sourceRows.length,
    'Autonomous Operations Learning — ' + args.learningDate,
    sciipCreateAutonomousOpsLearningText760_(args.sourceRows),
    sciipCreateAutonomousOpsAdjustmentText760_(args.sourceRows),
    args.sourceRows.length > 0 ? 'MEDIUM' : 'LOW',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousOpsLearningText760_(sourceRows) {
  const digestCount = sourceRows.length;

  const totalSourceRecords = sourceRows.reduce(function(sum, row) {
    const count = Number(row.Source_Record_Count || 0);
    return sum + count;
  }, 0);

  return [
    'SCIIP completed an autonomous operations digest cycle using ' + digestCount + ' digest record(s).',
    'The operating loop reviewed ' + totalSourceRecords + ' upstream command center update record(s).',
    'The system successfully converted operational activity into durable learning history.'
  ].join(' ');
}

function sciipCreateAutonomousOpsAdjustmentText760_(sourceRows) {
  if (!sourceRows.length) {
    return 'No adjustment recommended because no source digest records were available.';
  }

  return [
    'Continue routing completed autonomous operating loops into durable learning records.',
    'Use these learnings to support future memory consolidation, reasoning calibration, and strategic feedback processors.'
  ].join(' ');
}

function sciipGenerateId760_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousOpsLearningProcessor() {
  const result = sciipRunAutonomousOpsLearningProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousOpsLearningProcessor',
    result: result
  }));

  return result;
}
