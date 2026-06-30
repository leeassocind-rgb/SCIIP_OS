/**
 * SCIIP_OS v5.3.3
 * Processor Parity Validator Processor
 * File: 2670_ProcessorParityValidatorProcessor.gs
 *
 * Processor: 2670_ProcessorParityValidator
 *
 * Purpose:
 * Validates generated runtime migration skeleton records for review-only
 * parity readiness. Handles zero generated skeletons safely.
 *
 * This processor does not execute generated code.
 * This processor does not modify source files.
 */

function sciipRun2670_ProcessorParityValidatorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2670_ProcessorParityValidator',
    action: 'PROCESSOR_PARITY_VALIDATION',
    sourceSheet: 'SCIIP_RUNTIME_MIGRATION_GENERATOR',
    targetSheet: 'SCIIP_PROCESSOR_PARITY_VALIDATION',
    ledgerSheet: 'SCIIP_PROCESSOR_PARITY_VALIDATION_LEDGER',

    buildPayload: function(context, definition) {
      var generatorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: generatorRecords.length,
        outputCount: 0,
        summary: 'Processor parity validator payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationToolkitVersion: 'v5.3.3',
          priorProcessor: '2660_RuntimeMigrationGenerator',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration generator source sheet.');
      if (!definition.targetSheet) errors.push('Missing parity validation target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing parity validation ledger sheet.');

      var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      if (!ss.getSheetByName(definition.sourceSheet)) {
        errors.push('Runtime migration generator sheet does not exist.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var generatorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var validationHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Parity_Key',
        'Processor_Id',
        'Processor_Name',
        'Generation_Status',
        'Parity_Status',
        'Parity_Mode',
        'Skeleton_Present',
        'Run_Function_Present',
        'Test_Function_Present',
        'Requires_Approval',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Validation_Notes',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Generator_Records_Read',
        'Parity_Records_Created',
        'Candidates_Validated',
        'Candidates_Skipped',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        validationHeaders
      );

      var parityRecordsCreated = 0;
      var candidatesValidated = 0;
      var candidatesSkipped = 0;

      generatorRecords.forEach(function(record) {
        var generationStatus =
          String(record.Generation_Status || '').toUpperCase();

        var skeleton = String(record.Generated_Skeleton_Code || '').trim();
        var runFunction = String(record.Proposed_Run_Function || '').trim();
        var testFunction = String(record.Proposed_Test_Function || '').trim();

        var skeletonPresent = skeleton ? 'YES' : 'NO';
        var runFunctionPresent = runFunction ? 'YES' : 'NO';
        var testFunctionPresent = testFunction ? 'YES' : 'NO';

        var parityStatus = 'SKIPPED';
        var parityMode = 'NO_CODE_EXECUTION';
        var validationNotes = 'No generated skeleton available for parity validation.';

        if (generationStatus === 'SKELETON_GENERATED_FOR_REVIEW') {
          if (skeleton && runFunction && testFunction) {
            parityStatus = 'READY_FOR_MANUAL_PARITY_REVIEW';
            validationNotes =
              'Generated skeleton has run/test functions and requires manual parity review.';
            candidatesValidated++;
          } else {
            parityStatus = 'INCOMPLETE_GENERATED_SKELETON';
            validationNotes =
              'Generated skeleton is missing required run/test code.';
            candidatesSkipped++;
          }
        } else {
          candidatesSkipped++;
        }

        var parityKey = SCIIP_RUNTIME.makeBusinessKey([
          'PROCESSOR_PARITY',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          validationHeaders,
          {
            Timestamp: new Date(),
            Toolkit_Version: 'v5.3.3',
            Parity_Key: parityKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Generation_Status: record.Generation_Status || '',
            Parity_Status: parityStatus,
            Parity_Mode: parityMode,
            Skeleton_Present: skeletonPresent,
            Run_Function_Present: runFunctionPresent,
            Test_Function_Present: testFunctionPresent,
            Requires_Approval: record.Requires_Approval || '',
            Code_Execution_Allowed: 'NO',
            Code_Modification_Allowed: 'NO',
            Validation_Notes: validationNotes,
            Source_Business_Key: context.businessKey
          }
        );

        parityRecordsCreated++;
      });

      var overallStatus = 'COMPLETED';

      if (generatorRecords.length === 0) {
        overallStatus = 'COMPLETED_NO_GENERATOR_RECORDS';
      } else if (candidatesValidated === 0) {
        overallStatus = 'COMPLETED_NO_PARITY_CANDIDATES';
      }

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: parityRecordsCreated,
        recordsRead: generatorRecords.length,
        processed: generatorRecords.length,
        message: JSON.stringify({
          processorParityValidationStatus: overallStatus,
          toolkitVersion: 'v5.3.3',
          generatorRecordsRead: generatorRecords.length,
          parityRecordsCreated: parityRecordsCreated,
          candidatesValidated: candidatesValidated,
          candidatesSkipped: candidatesSkipped,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2680_RuntimeMigrationReport'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'PROCESSOR_PARITY_VALIDATION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Generator_Records_Read: generatorRecords.length,
          Parity_Records_Created: parityRecordsCreated,
          Candidates_Validated: candidatesValidated,
          Candidates_Skipped: candidatesSkipped,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          generatorRecordsRead: generatorRecords.length,
          parityRecordsCreated: parityRecordsCreated,
          candidatesValidated: candidatesValidated,
          candidatesSkipped: candidatesSkipped,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 processor parity validator completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2670_ProcessorParityValidatorProcessor() {
  var result = sciipRun2670_ProcessorParityValidatorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2670_ProcessorParityValidatorProcessor',
    result: result
  }));

  return result;
}