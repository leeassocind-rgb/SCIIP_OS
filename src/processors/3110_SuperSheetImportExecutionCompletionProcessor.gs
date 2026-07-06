/***************************************
 * 3110_SuperSheetImportExecutionCompletionProcessor
 * SCIIP_OS v5.4
 ***************************************/

function run3110_SuperSheetImportExecutionCompletionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: '3110_SuperSheetImportExecutionCompletionProcessor',
    action: 'BUILD_SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS',

    execute: function(runtime) {
      const sourceSheet = 'SUPERSHEET_IMPORT_EXECUTION_STATUS_LEDGER_SUMMARY';
      const targetSheet = 'SUPERSHEET_IMPORT_EXECUTION_COMPLETIONS';

const today = Utilities.formatDate(
  new Date(),
  Session.getScriptTimeZone(),
  'yyyy-MM-dd'
);

      const targetHeaders = [
        'business_key',
        'completion_date',
        'source_sheet',
        'target_sheet',
        'execution_status',
        'completion_status',
        'completion_payload',
        'transaction_id',
        'created_at'
      ];

      SCIIP_SheetUtilities.ensureSheet(targetSheet, targetHeaders);

      const sourceRows = SCIIP_SheetUtilities.getRowsAsObjects(sourceSheet);

      if (!sourceRows || sourceRows.length === 0) {
        return {
          processor: '3110_SuperSheetImportExecutionCompletionProcessor',
          status: 'SKIPPED_NO_INPUTS',
          businessKey:
            '3110_SUPERSHEETIMPORTEXECUTIONCOMPLETION|' + targetSheet + '|' + today,
          recordsCreated: 0,
          recordsUpdated: 0,
          recordsRead: 0,
          processed: 0,
          skippedDuplicate: 0,
          skippedNoInputs: 0,
          skippedValidation: 0,
          errors: 0,
          message: JSON.stringify({
            executionCompletionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: sourceSheet,
            targetSheet: targetSheet,
            transactionId: runtime.transactionId,
            nextAction:
              'Run 3100_SuperSheetImportExecutionStatusLedgerProcessor after execution status records are available.'
          })
        };
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

        if (SCIIP_BusinessKeyUtilities.businessKeyExists(targetSheet, businessKey)) {
          skippedDuplicate++;
          return;
        }

        const payload = {
          executionCompletionStatus: 'COMPLETED',
          upstreamExecutionStatus: executionStatus,
          sourceSheet: sourceSheet,
          targetSheet: targetSheet,
          transactionId: runtime.transactionId,
          completedAt: new Date().toISOString(),
          nextAction:
            'Run 3120_SuperSheetImportExecutionCompletionLedgerProcessor.'
        };

        SCIIP_SheetUtilities.appendObjectRow(targetSheet, {
          business_key: businessKey,
          completion_date: today,
          source_sheet: sourceSheet,
          target_sheet: targetSheet,
          execution_status: executionStatus,
          completion_status: 'COMPLETED',
          completion_payload: JSON.stringify(payload),
          transaction_id: runtime.transactionId,
          created_at: new Date().toISOString()
        });

        created++;
      });

      return {
        processor: '3110_SuperSheetImportExecutionCompletionProcessor',
        status: created > 0 ? 'SUCCESS' : 'SKIPPED_NO_INPUTS',
        businessKey:
          '3110_SUPERSHEETIMPORTEXECUTIONCOMPLETION|' + targetSheet + '|' + today,
        recordsCreated: created,
        recordsUpdated: 0,
        recordsRead: sourceRows.length,
        processed: created,
        skippedDuplicate: skippedDuplicate,
        skippedNoInputs: created === 0 ? 1 : 0,
        skippedValidation: skippedValidation,
        errors: 0,
        message: JSON.stringify({
          executionCompletionStatus: created > 0 ? 'SUCCESS' : 'SKIPPED_NO_INPUTS',
          sourceSheet: sourceSheet,
          targetSheet: targetSheet,
          transactionId: runtime.transactionId,
          recordsCreated: created,
          skippedDuplicate: skippedDuplicate,
          skippedValidation: skippedValidation,
          nextAction:
            'Run 3120_SuperSheetImportExecutionCompletionLedgerProcessor.'
        })
      };
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