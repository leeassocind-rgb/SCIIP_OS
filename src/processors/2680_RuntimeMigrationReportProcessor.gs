/**
 * SCIIP_OS v5.3.3
 * Runtime Migration Report Processor
 * File: 2680_RuntimeMigrationReportProcessor.gs
 *
 * Processor: 2680_RuntimeMigrationReport
 *
 * Purpose:
 * Summarizes processor analyzer, runtime migration generator,
 * and processor parity validator outputs into a review-ready
 * migration toolkit report.
 *
 * This processor does not execute generated code.
 * This processor does not modify source files.
 */

function sciipRun2680_RuntimeMigrationReportProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2680_RuntimeMigrationReport',
    action: 'RUNTIME_MIGRATION_REPORT_BUILD',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_REPORT',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_REPORT_LEDGER',

    buildPayload: function(context, definition) {
      var analyzerRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_ANALYZER');

      var generatorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_RUNTIME_MIGRATION_GENERATOR');

      var parityRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_PARITY_VALIDATION');

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount:
          analyzerRecords.length +
          generatorRecords.length +
          parityRecords.length,
        outputCount: 1,
        summary: 'Runtime migration report payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationToolkitVersion: 'v5.3.3',
          priorProcessor: '2670_ProcessorParityValidator',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.targetSheet) errors.push('Missing migration report target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing migration report ledger sheet.');

      var ss = SCIIP_RUNTIME_SHEET_FACTORY.getSpreadsheet();

      [
        'SCIIP_PROCESSOR_ANALYZER',
        'SCIIP_RUNTIME_MIGRATION_GENERATOR',
        'SCIIP_PROCESSOR_PARITY_VALIDATION'
      ].forEach(function(sheetName) {
        if (!ss.getSheetByName(sheetName)) {
          errors.push('Missing required report source sheet: ' + sheetName);
        }
      });

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var analyzerRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_ANALYZER');

      var generatorRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_RUNTIME_MIGRATION_GENERATOR');

      var parityRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords('SCIIP_PROCESSOR_PARITY_VALIDATION');

      function countWhere(records, field, expected) {
        return records.filter(function(record) {
          return String(record[field] || '').toUpperCase() === expected;
        }).length;
      }

      var analyzerSummary = {
        totalAnalyzed: analyzerRecords.length,
        partialAutomationCandidates: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'PARTIAL_AUTOMATION_CANDIDATE'
        ),
        noActionRequired: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'NO_ACTION_REQUIRED'
        ),
        futureRuntimeNative: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'FUTURE_RUNTIME_NATIVE'
        ),
        notEligible: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'NOT_ELIGIBLE'
        ),
        manualReviewRequired: countWhere(
          analyzerRecords,
          'Automation_Eligibility',
          'MANUAL_REVIEW_REQUIRED'
        )
      };

      var generatorSummary = {
        totalGeneratorRecords: generatorRecords.length,
        skeletonsGenerated: countWhere(
          generatorRecords,
          'Generation_Status',
          'SKELETON_GENERATED_FOR_REVIEW'
        ),
        skipped: countWhere(
          generatorRecords,
          'Generation_Status',
          'SKIPPED'
        ),
        codeModificationAllowed: 'NO'
      };

      var paritySummary = {
        totalParityRecords: parityRecords.length,
        readyForManualParityReview: countWhere(
          parityRecords,
          'Parity_Status',
          'READY_FOR_MANUAL_PARITY_REVIEW'
        ),
        incompleteGeneratedSkeletons: countWhere(
          parityRecords,
          'Parity_Status',
          'INCOMPLETE_GENERATED_SKELETON'
        ),
        skipped: countWhere(
          parityRecords,
          'Parity_Status',
          'SKIPPED'
        ),
        codeExecutionAllowed: 'NO',
        codeModificationAllowed: 'NO'
      };

      var reportStatus = 'REPORT_COMPLETED';

      if (
        analyzerSummary.partialAutomationCandidates === 0 &&
        generatorSummary.skeletonsGenerated === 0 &&
        paritySummary.readyForManualParityReview === 0
      ) {
        reportStatus = 'REPORT_COMPLETED_NO_AUTOMATION_CANDIDATES';
      }

      var reportNarrative =
        'SCIIP_OS v5.3.3 Runtime Migration Toolkit reviewed migration queue records, generated review-only migration outputs where eligible, and validated parity readiness without executing generated code or modifying source files. Current run identified ' +
        analyzerSummary.partialAutomationCandidates +
        ' partial automation candidates, generated ' +
        generatorSummary.skeletonsGenerated +
        ' skeletons, and found ' +
        paritySummary.readyForManualParityReview +
        ' items ready for manual parity review.';

      var reportHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Processor',
        'Business_Key',
        'Report_Status',
        'Processors_Analyzed',
        'Partial_Automation_Candidates',
        'Skeletons_Generated',
        'Parity_Ready_Items',
        'Items_Skipped',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Report_Narrative',
        'Analyzer_Summary_JSON',
        'Generator_Summary_JSON',
        'Parity_Summary_JSON',
        'Next_Processor',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Report_Status',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        reportHeaders,
        {
          Timestamp: new Date(),
          Toolkit_Version: 'v5.3.3',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Report_Status: reportStatus,
          Processors_Analyzed: analyzerSummary.totalAnalyzed,
          Partial_Automation_Candidates: analyzerSummary.partialAutomationCandidates,
          Skeletons_Generated: generatorSummary.skeletonsGenerated,
          Parity_Ready_Items: paritySummary.readyForManualParityReview,
          Items_Skipped: generatorSummary.skipped,
          Code_Execution_Allowed: 'NO',
          Code_Modification_Allowed: 'NO',
          Report_Narrative: reportNarrative,
          Analyzer_Summary_JSON: analyzerSummary,
          Generator_Summary_JSON: generatorSummary,
          Parity_Summary_JSON: paritySummary,
          Next_Processor: '2690_RuntimeMigrationToolkitCertification',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead:
          analyzerRecords.length +
          generatorRecords.length +
          parityRecords.length,
        processed: 3,
        message: JSON.stringify({
          runtimeMigrationReportStatus: reportStatus,
          toolkitVersion: 'v5.3.3',
          processorsAnalyzed: analyzerSummary.totalAnalyzed,
          partialAutomationCandidates: analyzerSummary.partialAutomationCandidates,
          skeletonsGenerated: generatorSummary.skeletonsGenerated,
          parityReadyItems: paritySummary.readyForManualParityReview,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2690_RuntimeMigrationToolkitCertification'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'RUNTIME_MIGRATION_REPORT_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Report_Status: reportStatus,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          analyzerSummary: analyzerSummary,
          generatorSummary: generatorSummary,
          paritySummary: paritySummary,
          reportStatus: reportStatus,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 runtime migration report completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2680_RuntimeMigrationReportProcessor() {
  var result = sciipRun2680_RuntimeMigrationReportProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2680_RuntimeMigrationReportProcessor',
    result: result
  }));

  return result;
}