/**
 * SCIIP_OS v5.3.4
 * Runtime Migration Candidate Expansion Processor
 * File: 2700_RuntimeMigrationCandidateExpansionProcessor.gs
 *
 * Processor: 2700_RuntimeMigrationCandidateExpansion
 *
 * Purpose:
 * Expands runtime migration candidates beyond the current autonomous runtime
 * registry by creating a controlled candidate intake surface for legacy
 * processors. This does not modify code or execute generated migrations.
 */

function sciipRun2700_RuntimeMigrationCandidateExpansionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2700_RuntimeMigrationCandidateExpansion',
    action: 'RUNTIME_MIGRATION_CANDIDATE_EXPANSION',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATES',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_EXPANSION_LEDGER',

    buildPayload: function(context, definition) {
      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: 1,
        outputCount: 1,
        summary: 'Runtime migration candidate expansion payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorPhase: 'v5.3.3 Runtime Migration Toolkit',
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
      if (!definition.targetSheet) errors.push('Missing migration candidate target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing candidate expansion ledger sheet.');

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var candidateHeaders = [
        'Timestamp',
        'Expansion_Phase',
        'Candidate_Key',
        'Processor_Id',
        'Processor_Name',
        'File_Name',
        'Run_Function',
        'Test_Function',
        'Processor_Layer',
        'Migration_Source',
        'Candidate_Status',
        'Migration_Priority',
        'Risk_Level',
        'Recommended_Action',
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
        'Candidates_Created',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
        definition.targetSheet,
        candidateHeaders
      );

      var seedCandidates = [
        {
          Processor_Id: '320',
          Processor_Name: 'BriefingDigestProcessor',
          File_Name: '320_BriefingDigestProcessor.gs',
          Run_Function: 'sciipRunBriefingDigestProcessor',
          Test_Function: 'sciipTestBriefingDigestProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'MANUAL_CONFIRMED_MIGRATED',
          Candidate_Status: 'MIGRATED_RUNTIME_NATIVE',
          Migration_Priority: 1,
          Risk_Level: 'LOW',
          Recommended_Action: 'Record as migrated runtime-native baseline.',
          Notes: 'Already migrated successfully in v5.3.2.'
        },
        {
          Processor_Id: '330',
          Processor_Name: 'ExecutiveSummaryProcessor',
          File_Name: '330_ExecutiveSummaryProcessor.gs',
          Run_Function: 'sciipRunExecutiveSummaryProcessor',
          Test_Function: 'sciipTestExecutiveSummaryProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'MANUAL_CONFIRMED_MIGRATED',
          Candidate_Status: 'MIGRATED_RUNTIME_NATIVE',
          Migration_Priority: 1,
          Risk_Level: 'LOW',
          Recommended_Action: 'Record as migrated runtime-native baseline.',
          Notes: 'Already migrated successfully in v5.3.2.'
        },
        {
          Processor_Id: '340',
          Processor_Name: 'PlatformDailyReportProcessor',
          File_Name: '340_PlatformDailyReportProcessor.gs',
          Run_Function: 'sciipRunPlatformDailyReportProcessor',
          Test_Function: 'sciipTestPlatformDailyReportProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'LEGACY_LAYER_EXPANSION',
          Candidate_Status: 'CANDIDATE_FOR_REVIEW',
          Migration_Priority: 2,
          Risk_Level: 'MEDIUM',
          Recommended_Action: 'Review existing file and migrate to RuntimeProcessorBase if behavior is clear.',
          Notes: 'Likely follows 320/330 digest/report pattern.'
        },
        {
          Processor_Id: '350',
          Processor_Name: 'ExecutiveDashboardProcessor',
          File_Name: '350_ExecutiveDashboardProcessor.gs',
          Run_Function: 'sciipRunExecutiveDashboardProcessor',
          Test_Function: 'sciipTestExecutiveDashboardProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'LEGACY_LAYER_EXPANSION',
          Candidate_Status: 'CANDIDATE_FOR_REVIEW',
          Migration_Priority: 3,
          Risk_Level: 'MEDIUM',
          Recommended_Action: 'Review dashboard output schema before migration.',
          Notes: 'Dashboard processors may require stricter output parity review.'
        },
        {
          Processor_Id: '360',
          Processor_Name: 'CommandBriefProcessor',
          File_Name: '360_CommandBriefProcessor.gs',
          Run_Function: 'sciipRunCommandBriefProcessor',
          Test_Function: 'sciipTestCommandBriefProcessor',
          Processor_Layer: 'INTELLIGENCE_DIGEST',
          Migration_Source: 'LEGACY_LAYER_EXPANSION',
          Candidate_Status: 'CANDIDATE_FOR_REVIEW',
          Migration_Priority: 4,
          Risk_Level: 'MEDIUM',
          Recommended_Action: 'Review command brief inputs and migrate after dashboard/report processors.',
          Notes: 'Candidate for runtime-base migration after report layer stabilizes.'
        }
      ];

      seedCandidates.forEach(function(candidate) {
        var candidateKey = SCIIP_RUNTIME.makeBusinessKey([
          'MIGRATION_CANDIDATE',
          candidate.Processor_Id,
          candidate.Processor_Name,
          SCIIP_RUNTIME.getDateKey({})
        ]);

        SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
          definition.targetSheet,
          candidateHeaders,
          {
            Timestamp: new Date(),
            Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
            Candidate_Key: candidateKey,
            Processor_Id: candidate.Processor_Id,
            Processor_Name: candidate.Processor_Name,
            File_Name: candidate.File_Name,
            Run_Function: candidate.Run_Function,
            Test_Function: candidate.Test_Function,
            Processor_Layer: candidate.Processor_Layer,
            Migration_Source: candidate.Migration_Source,
            Candidate_Status: candidate.Candidate_Status,
            Migration_Priority: candidate.Migration_Priority,
            Risk_Level: candidate.Risk_Level,
            Recommended_Action: candidate.Recommended_Action,
            Code_Execution_Allowed: 'NO',
            Code_Modification_Allowed: 'NO',
            Notes: candidate.Notes,
            Source_Business_Key: context.businessKey
          }
        );
      });

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: seedCandidates.length,
        processed: seedCandidates.length,
        message: JSON.stringify({
          candidateExpansionStatus: 'EXPANDED',
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          candidatesCreated: seedCandidates.length,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextProcessor: '2710_RuntimeMigrationCandidateAnalyzer'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_CANDIDATE_EXPANSION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Candidates_Created: seedCandidates.length,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          candidatesCreated: seedCandidates.length,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.4 runtime migration candidate expansion completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2700_RuntimeMigrationCandidateExpansionProcessor() {
  var result = sciipRun2700_RuntimeMigrationCandidateExpansionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2700_RuntimeMigrationCandidateExpansionProcessor',
    result: result
  }));

  return result;
}