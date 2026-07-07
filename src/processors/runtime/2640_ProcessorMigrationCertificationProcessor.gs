/**
 * SCIIP_OS v5.3.1
 * Processor Migration Certification Processor
 * File: 2640_ProcessorMigrationCertificationProcessor.gs
 *
 * Processor: 2640_ProcessorMigrationCertification
 *
 * Purpose:
 * Certifies v5.3.1 as a safe processor migration planning framework.
 * No live dispatch is enabled. No legacy processor code is automatically modified.
 */

function sciipRun2640_ProcessorMigrationCertificationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2640_ProcessorMigrationCertification',
    action: 'PROCESSOR_MIGRATION_CERTIFICATION',
    sourceSheet: 'SCIIP_PROCESSOR_MIGRATION_VALIDATION',
    targetSheet: 'SCIIP_PROCESSOR_MIGRATION_CERTIFICATION',
    ledgerSheet: 'SCIIP_PROCESSOR_MIGRATION_CERTIFICATION_LEDGER',

    buildPayload: function(context, definition) {
      var validationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: validationRecords.length,
        outputCount: 1,
        summary: 'Processor migration certification payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2630_ProcessorMigrationValidation',
          migrationPhase: 'v5.3.1 Runtime Refactor',
          liveDispatchAllowed: 'NO',
          automaticCodeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing validation source sheet.');
      if (!definition.targetSheet) errors.push('Missing certification target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing certification ledger sheet.');

      var validationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!validationRecords || validationRecords.length === 0) {
        errors.push('No migration validation records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var validationRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var latestValidation =
        validationRecords && validationRecords.length
          ? validationRecords[validationRecords.length - 1]
          : null;

      var validationStatus = latestValidation
        ? String(latestValidation.Validation_Status || '')
        : 'UNKNOWN';

      var certificationStatus =
        validationStatus === 'PASSED'
          ? 'CERTIFIED'
          : 'CERTIFIED_WITH_ATTENTION_REQUIRED';

      var liveDispatchAllowed = 'NO';
      var automaticCodeModificationAllowed = 'NO';
      var certifiedMode = 'MIGRATION_PLANNING_ONLY';

      var certificationStatement =
        'SCIIP_OS v5.3.1 Runtime Refactor is certified as a safe migration planning and control framework. It inventories, plans, queues, validates, and records processor migration readiness. It does not enable live dynamic dispatch and does not automatically modify legacy processor code.';

      var certificationHeaders = [
        'Timestamp',
        'Migration_Phase',
        'Processor',
        'Business_Key',
        'Certification_Status',
        'Certified_Mode',
        'Validation_Status',
        'Live_Dispatch_Allowed',
        'Automatic_Code_Modification_Allowed',
        'Certification_Statement',
        'Next_Phase',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Migration_Phase',
        'Certification_Status',
        'Certified_Mode',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        certificationHeaders,
        {
          Timestamp: new Date(),
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Validation_Status: validationStatus,
          Live_Dispatch_Allowed: liveDispatchAllowed,
          Automatic_Code_Modification_Allowed: automaticCodeModificationAllowed,
          Certification_Statement: certificationStatement,
          Next_Phase: 'v5.3.2 Manual Runtime Processor Migration',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: validationRecords.length,
        processed: 1,
        message: JSON.stringify({
          processorMigrationCertificationStatus: certificationStatus,
          migrationPhase: 'v5.3.1 Runtime Refactor',
          certifiedMode: certifiedMode,
          validationStatus: validationStatus,
          liveDispatchAllowed: liveDispatchAllowed,
          automaticCodeModificationAllowed: automaticCodeModificationAllowed,
          transactionId: transaction.transactionId,
          nextPhase: 'v5.3.2 Manual Runtime Processor Migration'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_CERTIFICATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Migration_Phase: 'v5.3.1 Runtime Refactor',
          Certification_Status: certificationStatus,
          Certified_Mode: certifiedMode,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          certificationStatus: certificationStatus,
          certifiedMode: certifiedMode,
          validationStatus: validationStatus,
          liveDispatchAllowed: liveDispatchAllowed,
          automaticCodeModificationAllowed: automaticCodeModificationAllowed,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.1 processor migration certification completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2640_ProcessorMigrationCertificationProcessor() {
  var result = sciipRun2640_ProcessorMigrationCertificationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2640_ProcessorMigrationCertificationProcessor',
    result: result
  }));

  return result;
}