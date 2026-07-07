/*******************************************************
 * SCIIP_OS v5.3.2 Runtime Migration
 * 840_AutonomousStandardizationProcessor
 *
 * AUTONOMOUS_CALIBRATION_DECISIONS → AUTONOMOUS_STANDARDIZATIONS
 *
 * Migration note:
 * Preserves original 840 business logic and migrates
 * execution to SCIIP_RuntimeProcessorBase.
 *******************************************************/

function sciipGetAutonomousStandardizationProcessorName840_() {
  return '840_AutonomousStandardizationProcessor';
}

function sciipGetAutonomousStandardizationHeaders840_() {
  return ['Standardization_ID',
    'Business_Key',
    'Standard_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Standard_Title',
    'Standard_Type',
    'Standard_Name',
    'Standard_Description',
    'Required_Pattern',
    'Applies_To',
    'Status',
    'Created_At',
    'Processor'];
}

function sciipEnsureAutonomousStandardizationSchema() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    'AUTONOMOUS_STANDARDIZATIONS',
    sciipGetAutonomousStandardizationHeaders840_()
  );
}

function sciipRunAutonomousStandardizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGetAutonomousStandardizationProcessorName840_(),
    action: 'AUTONOMOUS_STANDARDIZATION_BUILD',
    sourceSheet: 'AUTONOMOUS_CALIBRATION_DECISIONS',
    targetSheet: 'AUTONOMOUS_STANDARDIZATIONS',
    ledgerSheet: 'AUTONOMOUS_STANDARDIZATIONS_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const autonomousCalibrationDecisions = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('AUTONOMOUS_CALIBRATION_DECISIONS');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: autonomousCalibrationDecisions.length,
        outputCount: autonomousCalibrationDecisions.length ? 1 : 0,
        summary: 'Autonomous standardization runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.3.2',
          originalProcessor: sciipGetAutonomousStandardizationProcessorName840_(),
          inputSheets: ['AUTONOMOUS_CALIBRATION_DECISIONS']
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
      const outputSheet = sciipEnsureAutonomousStandardizationSchema();
      const standardDate =
        sciipResolveLatestRuntimeProcessingDate840_('AUTONOMOUS_CALIBRATION_DECISIONS', 'Decision_Date') ||
        context.dateKey ||
        SCIIP_RUNTIME.getDateKey({});

      const autonomousStandardizationBusinessKey = 'AUTONOMOUS_STANDARDIZATION|' + standardDate;

      if (sciipRuntimeBusinessKeyPrefixExists840_(definition.targetSheet, autonomousStandardizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGetAutonomousStandardizationProcessorName840_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousCalibrationDecisionsReviewed: 0,
            autonomousStandardizationsCreated: 0,
            skippedDuplicate: 1,
            autonomousStandardizationBusinessKey: autonomousStandardizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const autonomousCalibrationDecisions = sciipGetRuntimeRecordsByDate840_(
        'AUTONOMOUS_CALIBRATION_DECISIONS',
        'Decision_Date',
        standardDate
      );

      if (!autonomousCalibrationDecisions.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGetAutonomousStandardizationProcessorName840_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            migrationVersion: 'v5.3.2',
            processorMigrated: true,
            autonomousCalibrationDecisionsReviewed: 0,
            autonomousStandardizationsCreated: 0,
            skippedNoInputs: 1,
            standardDate: standardDate,
            transactionId: transaction.transactionId
          })
        });
      }

      const outputRecord = sciipBuildAutonomousStandardization840_({
        standardDate: standardDate,
        businessKey: autonomousStandardizationBusinessKey,
        sourceRows: autonomousCalibrationDecisions,
        startedAt: new Date()
      });

      outputSheet.appendRow(sciipGetAutonomousStandardizationHeaders840_().map(function(header) {
        return outputRecord[header] || '';
      }));

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGetAutonomousStandardizationProcessorName840_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: autonomousCalibrationDecisions.length,
        processed: 1,
        skippedDuplicate: 0,
        message: JSON.stringify({
          migrationVersion: 'v5.3.2',
          processorMigrated: true,
          autonomousCalibrationDecisionsReviewed: autonomousCalibrationDecisions.length,
          autonomousStandardizationsCreated: 1,
          skippedDuplicate: 0,
          autonomousStandardizationBusinessKey: autonomousStandardizationBusinessKey,
          transactionId: transaction.transactionId
        })
      });
    }
  });
}

function sciipRuntimeBusinessKeyPrefixExists840_(sheetName, businessKeyPrefix) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return false;
  return records.some(function(record) {
    const key = String(record.Business_Key || '').trim();
    return key === businessKeyPrefix || key.indexOf(businessKeyPrefix + '|') === 0;
  });
}

function sciipGetRuntimeRecordsByDate840_(sheetName, dateField, dateValue) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return [];
  return records.filter(function(record) {
    return sciipNormalizeRuntimeDateValue840_(record[dateField]) === String(dateValue);
  });
}

function sciipResolveLatestRuntimeProcessingDate840_(sheetName, dateField) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName);
  if (!records || records.length === 0) return null;

  const dates = records
    .map(function(record) {
      return sciipNormalizeRuntimeDateValue840_(record[dateField]);
    })
    .filter(function(value) {
      return value !== '';
    });

  if (dates.length === 0) return null;

  dates.sort();
  return dates[dates.length - 1];
}

function sciipNormalizeRuntimeDateValue840_(value) {
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

function sciipBuildAutonomousStandardization840_(payload) {
  const standardizationId = `AUTONOMOUS_STANDARDIZATION_${Utilities.getUuid()}`;

  return {
    Standardization_ID: standardizationId,
    Business_Key: payload.businessKey,
    Standard_Date: payload.standardDate,
    Source_Sheet: 'AUTONOMOUS_CALIBRATION_DECISIONS',
    Source_Record_Count: payload.sourceRows.length,
    Standard_Title: `Autonomous Standardization — ${payload.standardDate}`,
    Standard_Type: 'PROCESSOR_ARCHITECTURE_STANDARD',
    Standard_Name: 'Latest Completed Processing Date Standard',
    Standard_Description: sciipCreateAutonomousStandardDescription840_(payload.sourceRows),
    Required_Pattern: sciipCreateAutonomousStandardRequiredPattern840_(payload.sourceRows),
    Applies_To: 'All downstream processors that consume prior processor output sheets',
    Status: 'ACTIVE',
    Created_At: payload.startedAt.toISOString(),
    Processor: sciipGetAutonomousStandardizationProcessorName840_()
  };
}

function sciipCreateAutonomousStandardDescription840_(sourceRows) {
  return [
    `SCIIP_OS converted ${sourceRows.length} approved calibration decision record(s) into an active processor standard.`,
    'The standard requires downstream processors to consume the latest completed upstream processing batch instead of assuming the current calendar date.',
    'This prevents valid upstream records from being skipped when downstream processors run on a later day.'
  ].join(' ');
}

function sciipCreateAutonomousStandardRequiredPattern840_(sourceRows) {
  return [
    'const processingDate =',
    '  sciipResolveLatestProcessingDate_(INPUT_SHEET, INPUT_DATE_COLUMN) || sciipFormatDateKey_(startedAt);',
    '',
    'const businessKey = `PROCESSOR_OUTPUT|${processingDate}`;',
    '',
    'Use processingDate for both:',
    '- Business key generation',
    '- Source-row date filtering',
    '',
    'Use sciipBusinessKeyPrefixExists_() for batch-oriented idempotency checks.'
  ].join('\n');
}

function sciipGenerateId840_(prefix) {
  return prefix + '_' + Utilities.getUuid();
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTestAutonomousStandardizationProcessor() {
  const result = sciipRunAutonomousStandardizationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTestAutonomousStandardizationProcessor',
    result: result
  }));

  return result;
}
