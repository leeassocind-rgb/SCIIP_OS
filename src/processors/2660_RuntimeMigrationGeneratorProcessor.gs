/**
 * SCIIP_OS v5.3.3
 * Runtime Migration Generator Processor
 * File: 2660_RuntimeMigrationGeneratorProcessor.gs
 *
 * Processor: 2660_RuntimeMigrationGenerator
 *
 * Purpose:
 * Generates review-only runtime migration skeleton records for eligible
 * processor analyzer items. Does not modify code or replace processors.
 */

function sciipRun2660_RuntimeMigrationGeneratorProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2660_RuntimeMigrationGenerator',
    action: 'RUNTIME_MIGRATION_GENERATOR_RUN',
    sourceSheet: 'SCIIP_PROCESSOR_ANALYZER',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_GENERATOR',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_GENERATOR_LEDGER',

    buildPayload: function(context, definition) {
      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: analysisRecords.length,
        outputCount: 0,
        summary: 'Runtime migration generator payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationToolkitVersion: 'v5.3.3',
          priorProcessor: '2650_ProcessorAnalyzer',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing analyzer source sheet.');
      if (!definition.targetSheet) errors.push('Missing migration generator target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration generator ledger sheet.');

      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!analysisRecords || analysisRecords.length === 0) {
        errors.push('No processor analyzer records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var generatorHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Generation_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Automation_Eligibility',
        'Recommended_Migration_Mode',
        'Generation_Status',
        'Generation_Reason',
        'Proposed_File_Name',
        'Proposed_Run_Function',
        'Proposed_Test_Function',
        'Generated_Skeleton_Code',
        'Requires_Approval',
        'Code_Modification_Allowed',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Analysis_Records_Read',
        'Skeletons_Generated',
        'Items_Skipped',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        generatorHeaders
      );

      var skeletonsGenerated = 0;
      var itemsSkipped = 0;

      analysisRecords.forEach(function(record) {
        var eligibility = String(record.Automation_Eligibility || '').toUpperCase();
        var migrationMode = String(record.Recommended_Migration_Mode || '').toUpperCase();

        var shouldGenerate =
          eligibility === 'PARTIAL_AUTOMATION_CANDIDATE' &&
          migrationMode === 'GENERATE_RUNTIME_SKELETON_FOR_REVIEW';

        var generationStatus = shouldGenerate
          ? 'SKELETON_GENERATED_FOR_REVIEW'
          : 'SKIPPED';

        var generationReason = shouldGenerate
          ? 'Eligible for review-only runtime skeleton generation.'
          : 'Item is not eligible for automated skeleton generation.';

        var proposedFileName = shouldGenerate
          ? 'src/processors/' + record.Processor_Id + '_' + record.Processor_Name + 'Processor.gs'
          : '';

        var proposedRunFunction = shouldGenerate
          ? record.Run_Function
          : '';

        var proposedTestFunction = shouldGenerate
          ? record.Test_Function
          : '';

        var skeletonCode = shouldGenerate
          ? sciipGenerateRuntimeMigrationSkeleton2660_(record)
          : '';

        var generationKey = SCIIP_RUNTIME.makeBusinessKey([
          'RUNTIME_MIGRATION_GENERATOR',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          generatorHeaders,
          {
            Timestamp: new Date(),
            Toolkit_Version: 'v5.3.3',
            Generation_Key: generationKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Automation_Eligibility: record.Automation_Eligibility || '',
            Recommended_Migration_Mode: record.Recommended_Migration_Mode || '',
            Generation_Status: generationStatus,
            Generation_Reason: generationReason,
            Proposed_File_Name: proposedFileName,
            Proposed_Run_Function: proposedRunFunction,
            Proposed_Test_Function: proposedTestFunction,
            Generated_Skeleton_Code: skeletonCode,
            Requires_Approval: shouldGenerate ? 'YES' : 'NO',
            Code_Modification_Allowed: 'NO',
            Source_Business_Key: context.businessKey
          }
        );

        if (shouldGenerate) {
          skeletonsGenerated++;
        } else {
          itemsSkipped++;
        }
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: skeletonsGenerated,
        recordsRead: analysisRecords.length,
        processed: analysisRecords.length,
        message: JSON.stringify({
          runtimeMigrationGeneratorStatus: 'COMPLETED',
          toolkitVersion: 'v5.3.3',
          analysisRecordsRead: analysisRecords.length,
          skeletonsGenerated: skeletonsGenerated,
          itemsSkipped: itemsSkipped,
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2670_ProcessorParityValidator'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'RUNTIME_MIGRATION_GENERATOR_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Analysis_Records_Read: analysisRecords.length,
          Skeletons_Generated: skeletonsGenerated,
          Items_Skipped: itemsSkipped,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          analysisRecordsRead: analysisRecords.length,
          skeletonsGenerated: skeletonsGenerated,
          itemsSkipped: itemsSkipped,
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 runtime migration generator completed.'
      });

      return result;
    }
  });
}

function sciipGenerateRuntimeMigrationSkeleton2660_(record) {
  var processorName = record.Processor_Name || 'UnknownProcessor';
  var runFunction = record.Run_Function || 'sciipRunUnknownProcessor';
  var testFunction = record.Test_Function || 'sciipTestUnknownProcessor';

  return [
    '/**',
    ' * SCIIP_OS Runtime Migration Skeleton',
    ' * Processor: ' + processorName,
    ' * Generated for review only. Do not paste without manual validation.',
    ' */',
    '',
    'function ' + runFunction + '() {',
    '  return SCIIP_RUNTIME_PROCESSOR_BASE.run({',
    "    processor: '" + processorName + "',",
    "    action: 'DEFINE_ACTION',",
    "    sourceSheet: 'DEFINE_SOURCE_SHEET',",
    "    targetSheet: 'DEFINE_TARGET_SHEET',",
    "    ledgerSheet: 'DEFINE_LEDGER_SHEET',",
    '',
    '    buildPayload: function(context, definition) {',
    '      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({',
    '        processor: context.processor,',
    '        action: context.action,',
    '        businessKey: context.businessKey,',
    '        sourceSheet: definition.sourceSheet,',
    '        targetSheet: definition.targetSheet,',
    '        ledgerSheet: definition.ledgerSheet,',
    "        summary: 'Runtime migration skeleton payload created.'",
    '      });',
    '    },',
    '',
    '    validate: function(payload, context, definition) {',
    '      var errors = [];',
    '      if (!payload.businessKey) errors.push("Payload missing businessKey.");',
    '      if (!context.businessKey) errors.push("Context missing businessKey.");',
    '      return { valid: errors.length === 0, errors: errors };',
    '    },',
    '',
    '    execute: function(payload, context, transaction, definition) {',
    '      // TODO: migrate legacy business logic here.',
    '      return SCIIP_RUNTIME_RESULT_FACTORY.success({',
    '        processor: context.processor,',
    '        businessKey: context.businessKey,',
    '        recordsCreated: 0,',
    '        processed: 0,',
    "        message: 'Runtime migration skeleton executed.'",
    '      });',
    '    }',
    '  });',
    '}',
    '',
    'function ' + testFunction + '() {',
    '  var result = ' + runFunction + '();',
    "  Logger.log(JSON.stringify({ test: '" + testFunction + "', result: result }));",
    '  return result;',
    '}'
  ].join('\n');
}

/**
 * Standalone validation test.
 */
function sciipTest2660_RuntimeMigrationGeneratorProcessor() {
  var result = sciipRun2660_RuntimeMigrationGeneratorProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2660_RuntimeMigrationGeneratorProcessor',
    result: result
  }));

  return result;
}