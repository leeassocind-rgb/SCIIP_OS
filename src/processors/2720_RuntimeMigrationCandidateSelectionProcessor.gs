/**
 * SCIIP_OS v5.3.4
 * Runtime Migration Candidate Selection Processor
 * File: 2720_RuntimeMigrationCandidateSelectionProcessor.gs
 *
 * Processor: 2720_RuntimeMigrationCandidateSelection
 *
 * Purpose:
 * Selects the next processor migration target from candidate analysis.
 * This records the selected processor for manual runtime migration.
 *
 * This processor does not execute candidate code.
 * This processor does not modify source files.
 */

function sciipRun2720_RuntimeMigrationCandidateSelectionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '2720_RuntimeMigrationCandidateSelection',
    action: 'RUNTIME_MIGRATION_CANDIDATE_SELECTION',
    sourceSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_ANALYSIS',
    targetSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_SELECTION',
    ledgerSheet: 'SCIIP_RUNTIME_MIGRATION_CANDIDATE_SELECTION_LEDGER',

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
        outputCount: 1,
        summary: 'Runtime migration candidate selection payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          priorProcessor: '2710_RuntimeMigrationCandidateAnalyzer',
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
      if (!definition.sourceSheet) errors.push('Missing candidate analysis source sheet.');
      if (!definition.targetSheet) errors.push('Missing candidate selection target sheet.');
      if (!definition.ledgerSheet) errors.push('Missing candidate selection ledger sheet.');

      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      if (!analysisRecords || analysisRecords.length === 0) {
        errors.push('No runtime migration candidate analysis records available.');
      }

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {
      var analysisRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet);

      var eligibleRecords = analysisRecords.filter(function(record) {
        return String(record.Migration_Readiness || '').toUpperCase() ===
          'READY_FOR_MANUAL_MIGRATION';
      });

      eligibleRecords.sort(function(a, b) {
        var aOrder = Number(a.Recommended_Order || 999);
        var bOrder = Number(b.Recommended_Order || 999);

        if (aOrder !== bOrder) return aOrder - bOrder;

        return String(a.Processor_Id || '').localeCompare(
          String(b.Processor_Id || '')
        );
      });

      var selected = eligibleRecords.length ? eligibleRecords[0] : null;

      var selectionStatus = selected
        ? 'SELECTED'
        : 'NO_ELIGIBLE_CANDIDATE';

      var selectedProcessor = selected
        ? selected.Processor_Id + '_' + selected.Processor_Name
        : '';

      var selectionReason = selected
        ? 'Highest-priority ready-for-manual-migration candidate selected.'
        : 'No candidate with READY_FOR_MANUAL_MIGRATION readiness was available.';

      var selectionHeaders = [
        'Timestamp',
        'Expansion_Phase',
        'Processor',
        'Business_Key',
        'Selection_Status',
        'Selected_Processor_Id',
        'Selected_Processor_Name',
        'Selected_File_Name',
        'Selected_Run_Function',
        'Selected_Test_Function',
        'Selected_Processor',
        'Selection_Reason',
        'Recommended_Migration_Mode',
        'Code_Execution_Allowed',
        'Code_Modification_Allowed',
        'Next_Action',
        'Transaction_Id',
        'Payload_JSON'
      ];

      var ledgerHeaders = [
        'Timestamp',
        'Processor',
        'Business_Key',
        'Ledger_Status',
        'Transaction_Id',
        'Expansion_Phase',
        'Selection_Status',
        'Selected_Processor',
        'Result_JSON'
      ];

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.targetSheet,
        selectionHeaders,
        {
          Timestamp: new Date(),
          Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Processor: context.processor,
          Business_Key: context.businessKey,
          Selection_Status: selectionStatus,
          Selected_Processor_Id: selected ? selected.Processor_Id || '' : '',
          Selected_Processor_Name: selected ? selected.Processor_Name || '' : '',
          Selected_File_Name: selected ? selected.File_Name || '' : '',
          Selected_Run_Function: selected ? selected.Run_Function || '' : '',
          Selected_Test_Function: selected ? selected.Test_Function || '' : '',
          Selected_Processor: selectedProcessor,
          Selection_Reason: selectionReason,
          Recommended_Migration_Mode: selected
            ? selected.Recommended_Migration_Mode || ''
            : '',
          Code_Execution_Allowed: 'NO',
          Code_Modification_Allowed: 'NO',
          Next_Action: selected
            ? 'Manually review and migrate selected processor using SCIIP_RuntimeProcessorBase.'
            : 'Expand candidate set or review analysis inputs.',
          Transaction_Id: transaction.transactionId,
          Payload_JSON: payload
        }
      );

      var result = SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: context.processor,
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: analysisRecords.length,
        processed: eligibleRecords.length,
        message: JSON.stringify({
          candidateSelectionStatus: selectionStatus,
          expansionPhase: 'v5.3.4 Runtime Migration Candidate Expansion',
          analysisRecordsRead: analysisRecords.length,
          eligibleCandidates: eligibleRecords.length,
          selectedProcessor: selectedProcessor,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          transactionId: transaction.transactionId,
          nextAction: selected
            ? 'Migrate ' + selectedProcessor
            : 'Expand candidate set'
        })
      });

      SCIIP_RUNTIME_SHEET_FACTORY.appendObject(
        definition.ledgerSheet,
        ledgerHeaders,
        {
          Timestamp: new Date(),
          Processor: context.processor,
          Business_Key: context.businessKey,
          Ledger_Status: 'MIGRATION_CANDIDATE_SELECTION_RECORDED',
          Transaction_Id: transaction.transactionId,
          Expansion_Phase: 'v5.3.4 Runtime Migration Candidate Expansion',
          Selection_Status: selectionStatus,
          Selected_Processor: selectedProcessor,
          Result_JSON: result
        }
      );

      SCIIP_RUNTIME_LOGGING.audit({
        context: context,
        payload: {
          selectionStatus: selectionStatus,
          selectedProcessor: selectedProcessor,
          codeExecutionAllowed: 'NO',
          codeModificationAllowed: 'NO',
          result: SCIIP_RUNTIME.compactPayload(result)
        },
        message: 'SCIIP_OS v5.3.4 runtime migration candidate selection completed.'
      });

      return result;
    }
  });
}

/**
 * Standalone validation test.
 */
function sciipTest2720_RuntimeMigrationCandidateSelectionProcessor() {
  var result = sciipRun2720_RuntimeMigrationCandidateSelectionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2720_RuntimeMigrationCandidateSelectionProcessor',
    result: result
  }));

  return result;
}