/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 830_AutonomousCalibrationDecisionProcessor
 *
 * AUTONOMOUS_CALIBRATION_SIGNALS → AUTONOMOUS_CALIBRATION_DECISIONS
 *
 * Migration note:
 * Preserves original 830 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousCalibrationDecisionProcessorName830_() {
  return '830_AutonomousCalibrationDecisionProcessor';
}

function sciipGetAutonomousCalibrationDecisionHeaders830_() {
  return [
    'Calibration_Decision_ID',
    'Business_Key',
    'Decision_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Decision_Title',
    'Decision_Type',
    'Decision',
    'Decision_Rationale',
    'Implementation_Standard',
    'Priority',
    'Status',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousCalibrationDecisionSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_CALIBRATION_DECISIONS',
    sciipGetAutonomousCalibrationDecisionHeaders830_()
  );
}

function sciipRunAutonomousCalibrationDecisionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
    action: 'AUTONOMOUS_CALIBRATION_DECISION_BUILD',
    sourceSheet: 'AUTONOMOUS_CALIBRATION_SIGNALS',
    targetSheet: 'AUTONOMOUS_CALIBRATION_DECISIONS',
    ledgerSheet: 'AUTONOMOUS_CALIBRATION_DECISIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousCalibrationSignals = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_CALIBRATION_SIGNALS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousCalibrationSignals.length,
        outputCount: autonomousCalibrationSignals.length ? 1 : 0,
        summary: 'Autonomous calibration decision runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
          inputSheets: ['AUTONOMOUS_CALIBRATION_SIGNALS']
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
      const outputSheet = sciipEnsureAutonomousCalibrationDecisionSchema();
      const decisionDate =
        sciipResolveLatestRuntimeProcessingDate830_('AUTONOMOUS_CALIBRATION_SIGNALS', 'Signal_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousCalibrationDecisionBusinessKey = 'AUTONOMOUS_CALIBRATION_DECISION|' + decisionDate;

      if (sciipRuntimeBusinessKeyPrefixExists830_(definition.targetSheet, autonomousCalibrationDecisionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousCalibrationSignalsReviewed: 0,
            autonomousCalibrationDecisionsCreated: 0,
            skippedDuplicate: 1,
            autonomousCalibrationDecisionBusinessKey: autonomousCalibrationDecisionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousCalibrationSignals = sciipGetRuntimeRecordsByDate830_(
        'AUTONOMOUS_CALIBRATION_SIGNALS',
        'Signal_Date',
        decisionDate
      );

      if (!autonomousCalibrationSignals.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousCalibrationSignalsReviewed: 0,
            autonomousCalibrationDecisionsCreated: 0,
            skippedNoInputs: 1,
            decisionDate: decisionDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const decision = sciipCreateAutonomousCalibrationDecision830_({
        businessKey: autonomousCalibrationDecisionBusinessKey,
        decisionDate: decisionDate,
        sourceRows: autonomousCalibrationSignals,
        processor: sciipGetAutonomousCalibrationDecisionProcessorName830_()
      });

      outputSheet.appendRow(decision);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousCalibrationDecisionProcessorName830_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousCalibrationSignals.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousCalibrationSignalsReviewed: autonomousCalibrationSignals.length,
          autonomousCalibrationDecisionsCreated: 1,
          skippedDuplicate: 0,
          autonomousCalibrationDecisionBusinessKey: autonomousCalibrationDecisionBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists830_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate830_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue830_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate830_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue830_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue830_(value) {
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

function sciipCreateAutonomousCalibrationDecision830_(args) {
  return [
    sciipGenerateId830_('AUTONOMOUS_CALIBRATION_DECISION'),
    args.businessKey,
    args.decisionDate,
    'AUTONOMOUS_CALIBRATION_SIGNALS',
    args.sourceRows.length,
    'Autonomous Calibration Decision — ' + args.decisionDate,
    'PROCESSOR_STANDARDIZATION',
    sciipCreateAutonomousCalibrationDecisionText830_(args.sourceRows),
    sciipCreateAutonomousCalibrationDecisionRationale830_(args.sourceRows),
    sciipCreateAutonomousCalibrationImplementationStandard830_(args.sourceRows),
    sciipResolveAutonomousCalibrationDecisionPriority830_(args.sourceRows),
    'APPROVED',
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousCalibrationDecisionText830_(sourceRows) {
  return [
    'SCIIP_OS approves ' + sourceRows.length + ' autonomous calibration signal record(s) for implementation.',
    'The downstream processor date-resolution standard is now treated as an operating-system calibration decision.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationDecisionRationale830_(sourceRows) {
  return [
    'The validated 750 fix demonstrated that downstream processors can falsely skip valid upstream batches when they use the current execution date instead of the latest completed upstream processing date.',
    'The calibration signal confirms that latest-date resolution improves processor continuity, idempotency, and batch reliability.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationImplementationStandard830_(sourceRows) {
  return [
    'Downstream processors must resolve their processing date from the latest available upstream date column whenever consuming prior processor output.',
    'Required pattern: sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN) || sciipFormatDateKey_(startedAt).',
    'The resolved date must be used consistently in business keys and source-row filters.',
    'Batch-oriented duplicate checks must use sciipBusinessKeyPrefixExists_().'
  ].join('\n');
}

function sciipResolveAutonomousCalibrationDecisionPriority830_(sourceRows) {
  const hasHighPrioritySignal = sourceRows.some(function(row) {
    return String(row.Priority || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighPrioritySignal ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId830_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousCalibrationDecisionProcessor() {
  const result = sciipRunAutonomousCalibrationDecisionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousCalibrationDecisionProcessor',
    result: result
  }));

  return result;
}
