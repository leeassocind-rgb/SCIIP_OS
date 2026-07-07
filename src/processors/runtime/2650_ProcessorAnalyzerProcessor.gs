/**
 * SCIIP_OS v5.3.3
 * Processor Analyzer Processor
 * File: 2650_ProcessorAnalyzerProcessor.gs
 *
 * Processor: 2650_ProcessorAnalyzer
 *
 * Purpose:
 * Analyzes processor migration queue records and determines whether each
 * processor is suitable for automated runtime migration, manual migration,
 * no-action recording, or future runtime-native build.
 *
 * This processor does not modify code.
 */

function sciipRun2650_ProcessorAnalyzerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2650_ProcessorAnalyzer',
    action: 'PROCESSOR_ANALYZER_RUN',
    sourceSheet: 'SCIIP_PROCESSOR_MIGRATION_QUEUE',
    targetSheet: 'SCIIP_PROCESSOR_ANALYZER',
    ledgerSheet: 'SCIIP_PROCESSOR_ANALYZER_LEDGER',

    buildPayload: function(context, definition) {
      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: queueRecords.length,
        outputCount: 0,
        summary: 'Processor analyzer payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationToolkitVersion: 'v5.3.3',
          priorPhase: 'v5.3.2 Runtime Processor Migration'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing migration queue source sheet.');
      if (!definition.targetSheet) errors.push('Missing processor analyzer target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing processor analyzer ledger sheet.');

      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!queueRecords || queueRecords.length === 0) {
        errors.push('No processor migration queue records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var queueRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var analyzerHeaders = [
        'Timestamp',
        'Toolkit_Version',
        'Analysis_Key',
        'Processor_Id',
        'Processor_Name',
        'Run_Function',
        'Test_Function',
        'Queue_Status',
        'Plan_Status',
        'Migration_Strategy',
        'Risk_Level',
        'Requires_Manual_Review',
        'Analyzer_Status',
        'Automation_Eligibility',
        'Recommended_Migration_Mode',
        'Detected_Patterns',
        'Blockers',
        'Next_Action',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Toolkit_Version',
        'Queue_Records_Read',
        'Analysis_Items_Created',
        'Automation_Candidates',
        'Manual_Review_Items',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        analyzerHeaders
      );

      var analysisCount = 0;
      var automationCandidates = 0;
      var manualReviewItems = 0;

      queueRecords.forEach(function(record) {
        var queueStatus = String(record.Queue_Status || '').toUpperCase();
        var planStatus = String(record.Plan_Status || '').toUpperCase();
        var migrationStrategy = String(record.Migration_Strategy || '').toUpperCase();
        var riskLevel = String(record.Risk_Level || '').toUpperCase();
        var requiresManualReview = String(record.Requires_Manual_Review || '').toUpperCase();
        var runFunction = String(record.Run_Function || '').trim();
        var testFunction = String(record.Test_Function || '').trim();

        var analyzerStatus = 'ANALYZED';
        var automationEligibility = 'MANUAL_REVIEW_REQUIRED';
        var recommendedMigrationMode = 'MANUAL_RUNTIME_MIGRATION';
        var detectedPatterns = [];
        var blockers = [];
        var nextAction = 'Review processor manually before migration.';

        if (!runFunction) {
          analyzerStatus = 'BLOCKED';
          automationEligibility = 'NOT_ELIGIBLE';
          recommendedMigrationMode = 'BLOCKED';
          blockers.push('Missing run function.');
          nextAction = 'Add run function before migration analysis.';
        } else {
          detectedPatterns.push('RUN_FUNCTION_PRESENT');
        }

        if (testFunction) {
          detectedPatterns.push('TEST_FUNCTION_PRESENT');
        } else {
          blockers.push('Missing test function.');
        }

        if (queueStatus === 'RECORDED_NO_ACTION_REQUIRED') {
          automationEligibility = 'NO_ACTION_REQUIRED';
          recommendedMigrationMode = 'RECORD_ONLY';
          nextAction = 'No migration needed; processor already runtime-native.';
        } else if (queueStatus === 'RECORDED_FUTURE_STANDARD') {
          automationEligibility = 'FUTURE_RUNTIME_NATIVE';
          recommendedMigrationMode = 'BUILD_RUNTIME_NATIVE_FROM_START';
          nextAction = 'Use RuntimeProcessorBase when this planned processor is implemented.';
        } else if (
          queueStatus === 'QUEUED' &&
          planStatus === 'READY_FOR_QUEUE' &&
          migrationStrategy === 'REFACTOR_TO_RUNTIME_PROCESSOR_BASE' &&
          riskLevel !== 'HIGH'
        ) {
          automationEligibility = 'PARTIAL_AUTOMATION_CANDIDATE';
          recommendedMigrationMode = 'GENERATE_RUNTIME_SKELETON_FOR_REVIEW';
          nextAction = 'Generate runtime-native skeleton and require manual approval.';
          automationCandidates++;
        } else {
          manualReviewItems++;
        }

        if (requiresManualReview === 'YES') {
          detectedPatterns.push('MANUAL_REVIEW_REQUIRED');
        }

        if (riskLevel === 'HIGH') {
          blockers.push('High-risk migration item.');
          automationEligibility = 'NOT_ELIGIBLE';
          recommendedMigrationMode = 'MANUAL_HIGH_RISK_REVIEW';
          nextAction = 'Manual architecture review required before migration.';
        }

        var analysisKey = SCIIP_RUNTIME.makeBusinessKey([
          'PROCESSOR_ANALYSIS',
          record.Processor_Id || '',
          record.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          analyzerHeaders,
          {
            Timestamp: new Date(),
            Toolkit_Version: 'v5.3.3',
            Analysis_Key: analysisKey,
            Processor_Id: record.Processor_Id || '',
            Processor_Name: record.Processor_Name || '',
            Run_Function: record.Run_Function || '',
            Test_Function: record.Test_Function || '',
            Queue_Status: record.Queue_Status || '',
            Plan_Status: record.Plan_Status || '',
            Migration_Strategy: record.Migration_Strategy || '',
            Risk_Level: record.Risk_Level || '',
            Requires_Manual_Review: record.Requires_Manual_Review || '',
            Analyzer_Status: analyzerStatus,
            Automation_Eligibility: automationEligibility,
            Recommended_Migration_Mode: recommendedMigrationMode,
            Detected_Patterns: detectedPatterns.join(', '),
            Blockers: blockers.join(', '),
            Next_Action: nextAction,
            Source_Business_Key: context.businessKey
          }
        );

        analysisCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: analysisCount,
        recordsRead: queueRecords.length,
        processed: queueRecords.length,
        message: JSON.stringify({
          processorAnalyzerStatus: 'ANALYSIS_COMPLETED',
          toolkitVersion: 'v5.3.3',
          queueRecordsRead: queueRecords.length,
          analysisItemsCreated: analysisCount,
          automationCandidates: automationCandidates,
          manualReviewItems: manualReviewItems,
          transactionId: transaction.transactionId,
          nextProcessor: '2660_RuntimeMigrationGenerator'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'PROCESSOR_ANALYSIS_RECORDED',
          Transaction_Id: transaction.transactionId,
          Toolkit_Version: 'v5.3.3',
          Queue_Records_Read: queueRecords.length,
          Analysis_Items_Created: analysisCount,
          Automation_Candidates: automationCandidates,
          Manual_Review_Items: manualReviewItems,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          queueRecordsRead: queueRecords.length,
          analysisItemsCreated: analysisCount,
          automationCandidates: automationCandidates,
          manualReviewItems: manualReviewItems,
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.3 processor analyzer completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2650_ProcessorAnalyzerProcessor() {
  var result = sciipRun2650_ProcessorAnalyzerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2650_ProcessorAnalyzerProcessor',
    result: result
  }));

  return result;
}