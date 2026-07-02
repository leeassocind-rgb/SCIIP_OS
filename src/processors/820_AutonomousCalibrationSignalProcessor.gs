/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 820_AutonomousCalibrationSignalProcessor
 *
 * AUTONOMOUS_IMPROVEMENT_MEMORY → AUTONOMOUS_CALIBRATION_SIGNALS
 *
 * Migration note:
 * Preserves original 820 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousCalibrationSignalProcessorName820_() {
  return '820_AutonomousCalibrationSignalProcessor';
}

function sciipGetAutonomousCalibrationSignalHeaders820_() {
  return [
    'Calibration_Signal_ID',
    'Business_Key',
    'Signal_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Signal_Title',
    'Signal_Type',
    'Calibration_Finding',
    'Calibration_Recommendation',
    'Affected_System_Area',
    'Priority',
    'Confidence',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsureAutonomousCalibrationSignalSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_CALIBRATION_SIGNALS',
    sciipGetAutonomousCalibrationSignalHeaders820_()
  );
}

function sciipRunAutonomousCalibrationSignalProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
    action: 'AUTONOMOUS_CALIBRATION_SIGNAL_BUILD',
    sourceSheet: 'AUTONOMOUS_IMPROVEMENT_MEMORY',
    targetSheet: 'AUTONOMOUS_CALIBRATION_SIGNALS',
    ledgerSheet: 'AUTONOMOUS_CALIBRATION_SIGNALS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousImprovementMemory = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_IMPROVEMENT_MEMORY');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousImprovementMemory.length,
        outputCount: autonomousImprovementMemory.length ? 1 : 0,
        summary: 'Autonomous calibration signal runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
          inputSheets: ['AUTONOMOUS_IMPROVEMENT_MEMORY']
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
      const outputSheet = sciipEnsureAutonomousCalibrationSignalSchema();
      const signalDate =
        sciipResolveLatestRuntimeProcessingDate820_('AUTONOMOUS_IMPROVEMENT_MEMORY', 'Memory_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousCalibrationSignalBusinessKey = 'AUTONOMOUS_CALIBRATION_SIGNAL|' + signalDate;

      if (sciipRuntimeBusinessKeyPrefixExists820_(definition.targetSheet, autonomousCalibrationSignalBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementMemoryReviewed: 0,
            autonomousCalibrationSignalsCreated: 0,
            skippedDuplicate: 1,
            autonomousCalibrationSignalBusinessKey: autonomousCalibrationSignalBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousImprovementMemory = sciipGetRuntimeRecordsByDate820_(
        'AUTONOMOUS_IMPROVEMENT_MEMORY',
        'Memory_Date',
        signalDate
      );

      if (!autonomousImprovementMemory.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousImprovementMemoryReviewed: 0,
            autonomousCalibrationSignalsCreated: 0,
            skippedNoInputs: 1,
            signalDate: signalDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const signal = sciipCreateAutonomousCalibrationSignal820_({
        businessKey: autonomousCalibrationSignalBusinessKey,
        signalDate: signalDate,
        sourceRows: autonomousImprovementMemory,
        processor: sciipGetAutonomousCalibrationSignalProcessorName820_()
      });

      outputSheet.appendRow(signal);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousCalibrationSignalProcessorName820_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousImprovementMemory.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousImprovementMemoryReviewed: autonomousImprovementMemory.length,
          autonomousCalibrationSignalsCreated: 1,
          skippedDuplicate: 0,
          autonomousCalibrationSignalBusinessKey: autonomousCalibrationSignalBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists820_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate820_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue820_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate820_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue820_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue820_(value) {
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

function sciipCreateAutonomousCalibrationSignal820_(args) {
  return [
    sciipGenerateId820_('AUTONOMOUS_CALIBRATION_SIGNAL'),
    args.businessKey,
    args.signalDate,
    'AUTONOMOUS_IMPROVEMENT_MEMORY',
    args.sourceRows.length,
    'Autonomous Calibration Signal — ' + args.signalDate,
    'PROCESSING_DATE_STANDARD',
    sciipCreateAutonomousCalibrationFinding820_(args.sourceRows),
    sciipCreateAutonomousCalibrationRecommendation820_(args.sourceRows),
    'DOWNSTREAM_PROCESSOR_DATE_RESOLUTION',
    'HIGH',
    sciipResolveAutonomousCalibrationSignalConfidence820_(args.sourceRows),
    new Date().toISOString(),
    args.processor
  ];
}

function sciipCreateAutonomousCalibrationFinding820_(sourceRows) {
  return [
    'SCIIP_OS reviewed ' + sourceRows.length + ' autonomous improvement memory record(s).',
    'The durable memory confirms that downstream processors must resolve the latest completed upstream processing date instead of assuming the current execution date.',
    'This prevents false SKIPPED_NO_INPUTS results when processors run after midnight or on a later calendar date.'
  ].join(' ');
}

function sciipCreateAutonomousCalibrationRecommendation820_(sourceRows) {
  return [
    'Adopt sciipResolveLatestProcessingDate_(sheetName, dateColumnName) as the standard date resolver for downstream processors.',
    'Use the resolved upstream date in business keys, source-row filters, and test expectations.',
    'Continue using sciipBusinessKeyPrefixExists_() for multi-row or batch-oriented processors.'
  ].join(' ');
}

function sciipResolveAutonomousCalibrationSignalConfidence820_(sourceRows) {
  if (!sourceRows.length) return 'LOW';

  const hasHighMemory = sourceRows.some(function(row) {
    return String(row.Confidence || '').trim().toUpperCase() === 'HIGH';
  });

  return hasHighMemory ? 'HIGH' : 'MEDIUM';
}

function sciipGenerateId820_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousCalibrationSignalProcessor() {
  const result = sciipRunAutonomousCalibrationSignalProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousCalibrationSignalProcessor',
    result: result
  }));

  return result;
}
