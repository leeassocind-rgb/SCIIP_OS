/***************************************
 * 3110_SuperSheetImportExecutionCompletionProcessor
 * SCIIP_OS v5.4
 ***************************************/

function run3110_SuperSheetImportExecutionCompletionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processorId: '3110',
    processorName: '3110_SuperSheetImportExecutionCompletionProcessor',

    sourceSheetName: 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY',
    targetSheetName: 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS',

    targetHeaders: [
      'business_key',
      'completion_date',
      'source_sheet',
      'target_sheet',
      'execution_status',
      'completion_status',
      'completion_payload',
      'transaction_id',
      'created_at'
    ],

    process: function(ctx) {
      const today = SCIIP_DateUtilities.getTodayIsoDate();
      const sourceRows = ctx.readSourceRows();

      if (!sourceRows || sourceRows.length === 0) {
        return ctx.runtimeResult({
          status: 'SKIPPED_NO_INPUTS',
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsRead: 0,
          processed: 0,
          skippedDuplicate: 0,
          skippedNoInputs: 0,
          skippedValidation: 0,
          errors: 0,
          businessKey:
            '3110_SUPERSHEETIMPORTEXECUTIONCOMPLETION|SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS|' + today,
          message: JSON.stringify({
            executionCompletionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY',
            targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS',
            transactionId: ctx.transactionId,
            nextAction:
              'Run 3100_SuperSheetImportExecutionStatusLedgerProcessor after execution status records are available.'
          })
        });
      }

      let created = 0;
      let skippedDuplicate = 0;
      let skippedValidation = 0;

      sourceRows.forEach(function(row) {
        const executionStatus =
          row.execution_status ||
          row.status ||
          row.executionStatusLedgerStatus ||
          '';

        if (!executionStatus) {
          skippedValidation++;
          return;
        }

        const businessKey =
          'SUPERSHEET_IMPORT_EXECUTION_COMPLETION|' +
          today + '|' +
          executionStatus;

        if (ctx.businessKeyExists(businessKey)) {
          skippedDuplicate++;
          return;
        }

        const payload = {
          executionCompletionStatus: 'COMPLETED',
          upstreamExecutionStatus: executionStatus,
          sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY',
          targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS',
          transactionId: ctx.transactionId,
          completedAt: new Date().toISOString(),
          nextAction:
            'Advance to SuperSheet import execution archival, reconciliation, or knowledge graph ingestion processor.'
        };

        ctx.appendTargetRow({
          business_key: businessKey,
          completion_date: today,
          source_sheet: 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY',
          target_sheet: 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS',
          execution_status: executionStatus,
          completion_status: 'COMPLETED',
          completion_payload: JSON.stringify(payload),
          transaction_id: ctx.transactionId,
          created_at: new Date().toISOString()
        });

        created++;
      });

      return ctx.runtimeResult({
        status: created > 0 ? 'SUCCESS' : 'SKIPPED_NO_INPUTS',
        recordsCreated: created,
        recordsUpdated: 0,
        recordsRead: sourceRows.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        skippedNoInputs: created === 0 ? 1 : 0,
        skippedValidation: skippedValidation,
        errors: 0,
        businessKey:
          '3110_SUPERSHEETIMPORTEXECUTIONCOMPLETION|SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS|' + today,
        message: JSON.stringify({
          executionCompletionStatus: created > 0 ? 'SUCCESS' : 'SKIPPED_NO_INPUTS',
          sourceSheet: 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY',
          targetSheet: 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS',
          transactionId: ctx.transactionId,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedValidation: skippedValidation,
          nextAction:
            'Run 3120_SuperSheetImportExecutionCompletionLedgerProcessor.'
        })
      });
    }
  });
}


/***************************************
 * Standalone Test
 ***************************************/

function sciipTest3110_SuperSheetImportExecutionCompletionProcessor() {
  const result = run3110_SuperSheetImportExecutionCompletionProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3110_SuperSheetImportExecutionCompletionProcessor',
    result: result
  }));

  return {
    test: 'sciipTest3110_SuperSheetImportExecutionCompletionProcessor',
    result: result
  };
}