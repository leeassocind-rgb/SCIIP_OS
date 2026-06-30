/**
 * SCIIP_OS v5.3.4
 * Runtime Migration Candidate Analyzer Processor
 * File: 2710_RuntimeMigrationCandidateAnalyzerProcessor.gs
 *
 * Processor: 2710_RuntimeMigrationCandidateAnalyzer
 *
 * Purpose:
 * Analyzes expanded runtime migration candidates and recommends
 * the next processor to migrate.
 *
 * This processor does not execute candidate code.
 * This processor does not modify source files.
 */

function sciipRun2710_RuntimeMigrationCandidateAnalyzerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2710_RuntimeMigrationCandidateAnalyzer',
    action: 'RUNTIME_MIGRATION_CANDIDATE_ANALYSIS',
    sourceSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATES',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_ANALYSIS',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_ANALYSIS_LEDGER',

    buildPayload: function(context, definition) {
      var candidateRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: candidateRecords.length,
        outputCount: 0,
        summary: 'Runtime migration candidate analyzer payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2700_RuntimeMigrationCandidateExpansion',
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO'
        }
      });
    },

    validate: function(payload, context, definition) {
      var errors = [];

      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Missing candidate source sheet.');
      if (!definition.targetSheet) errors.push('Missing candidate analysis target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing candidate analysis ledger sheet.');

      var candidateRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!candidateRecords || candidateRecords.length === 0) {
        errors.push('No runtime migration candidate records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var candidateRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var analysisHeaders = [
        'Timestamp',
        'Expansion_Phase',
        'Analysis_Key',
        'Processor_Id',
        'Processor_Name',
        'File_Name',
        'Run_Function',
        'Test_Function',
        'Candidate_Status',
        'Migration_Priority',
        'Risk_Level',
        'Migration_Readiness',
        'Recommended_Order',
        'Recommended_Migration_Mode',
        'Recommended_Next_Action',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Notes',
        'Source_Business_Key'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Expansion_Phase',
        'Candidates_Read',
        'Analysis_Items_Created',
        'Next_Recommended_Processor',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        analysisHeaders
      );

      var sortedCandidates = candidateRecords.slice().sort(function(a, b) {
        var aPriority = Number(a.Migration_Priority || 99);
        var bPriority = Number(b.Migration_Priority || 99);

        if (aPriority !== bPriority) return aPriority - bPriority;

        return String(a.Processor_Id || '').localeCompare(
          String(b.Processor_Id || '')
        );
      });

      var analysisCount = 0;
      var nextRecommendedProcessor = '';

      sortedCandidates.forEach(function(candidate, index) {
        var candidateStatus =
          String(candidate.Candidate_Status || '').toUpperCase();

        var riskLevel =
          String(candidate.Risk_Level || '').toUpperCase();

        var migrationReadiness = 'UNKNOWN';
        var recommendedMode = 'MANUAL_REVIEW';
        var nextAction = 'Review candidate before migration.';

        if (candidateStatus === 'MIGRATED_RUNTIME_NATIVE') {
          migrationReadiness = 'ALREADY_MIGRATED';
          recommendedMode = 'RECORD_BASELINE';
          nextAction = 'No migration required; use as baseline pattern.';
        } else if (candidateStatus === 'CANDIDATE_FOR_REVIEW' && riskLevel !== 'HIGH') {
          migrationReadiness = 'READY_FOR_MANUAL_MIGRATION';
          recommendedMode = 'MANUAL_RUNTIME_BASE_MIGRATION';
          nextAction = 'Review source processor and migrate to SCIIP_RuntimeProcessorBase.';
        } else if (riskLevel === 'HIGH') {
          migrationReadiness = 'HIGH_RISK_REVIEW_REQUIRED';
          recommendedMode = 'ARCHITECTURE_REVIEW_FIRST';
          nextAction = 'Perform architecture review before migration.';
        }

        if (
          !nextRecommendedProcessor &&
          migrationReadiness === 'READY_FOR_MANUAL_MIGRATION'
        ) {
          nextRecommendedProcessor =
            candidate.Processor_Id + '_' + candidate.Processor_Name;
        }

        var analysisKey = SCIIP_RUNTIME.makeBusinessKey([
          'MIGRATION_CANDIDATE_ANALYSIS',
          candidate.Processor_Id || '',
          candidate.Processor_Name || '',
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          analysisHeaders,
          {
            Timestamp: new Date(),
            Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
            Analysis_Key: analysisKey,
            Processor_Id: candidate.Processor_Id || '',
            Processor_Name: candidate.Processor_Name || '',
            File_Name: candidate.File_Name || '',
            Run_Function: candidate.Run_Function || '',
            Test_Function: candidate.Test_Function || '',
            Candidate_Status: candidate.Candidate_Status || '',
            Migration_Priority: candidate.Migration_Priority || '',
            Risk_Level: candidate.Risk_Level || '',
            Migration_Readiness: migrationReadiness,
            Recommended_Order: index + 1,
            Recommended_Migration_Mode: recommendedMode,
            Recommended_Next_Action: nextAction,
            Code_Execution_Allowed: 'NO',
            Code_Modification_Allowed: 'NO',
            Notes: candidate.Notes || '',
            Source_Business_Key: context.businessKey
          }
        );

        analysisCount++;
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: analysisCount,
        recordsRead: candidateRecords.length,
        processed: candidateRecords.length,
        message: JSON.stringify({
          candidateAnalyzerStatus: 'ANALYSIS_COMPLETED',
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          candidatesRead: candidateRecords.length,
          analysisItemsCreated: analysisCount,
          nextRecommendedProcessor: nextRecommendedProcessor,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2720_RuntimeMigrationCandidateSelection'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_CANDIDATE_ANALYSIS_RECORDED',
          Transaction_Id: transaction.transactionId,
          Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Candidates_Read: candidateRecords.length,
          Analysis_Items_Created: analysisCount,
          Next_Recommended_Processor: nextRecommendedProcessor,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          candidatesRead: candidateRecords.length,
          analysisItemsCreated: analysisCount,
          nextRecommendedProcessor: nextRecommendedProcessor,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.4 runtime migration candidate analysis completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2710_RuntimeMigrationCandidateAnalyzerProcessor() {
  var result = sciipRun2710_RuntimeMigrationCandidateAnalyzerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2710_RuntimeMigrationCandidateAnalyzerProcessor',
    result: result
  }));

  return result;
}