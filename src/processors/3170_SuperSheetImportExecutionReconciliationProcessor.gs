/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3170_SuperSheetImportExecutionReconciliationProcessor
 *******************************************************/

function sciipGet3170ProcessorName_() {
  return '3170_SuperSheetImportExecutionReconciliation';
}

function sciipGet3170SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_ARCHIVE_LEDGER_SUMMARY';
}

function sciipGet3170TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATIONS';
}

function sciipGet3170Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATIONS';
}

function sciipGet3170Headers_() {
  return [
    'Reconciliation_ID',
    'Business_Key',
    'Reconciliation_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Reconciliation_Ready_Count',
    'Reconciliation_Blocked_Count',
    'Review_Required_Count',
    'Reconciliation_Status',
    'Reconciliation_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3170TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3170TargetSheet_(),
    sciipGet3170Headers_()
  );
}

function sciipRun3170_SuperSheetImportExecutionReconciliationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3170ProcessorName_(),
    action: sciipGet3170Action_(),
    sourceSheet: sciipGet3170SourceSheet_(),
    targetSheet: sciipGet3170TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import execution reconciliation runtime payload created.',
        refs: {
          context: SCIIP_RUNTIME_CONTEXT.compact(context),
          migrationVersion: 'v5.4',
          inputSheets: [definition.sourceSheet]
        }
      });
    },

    validate: function(payload, context, definition) {
      const errors = [];
      if (!payload.businessKey) errors.push('Payload missing businessKey.');
      if (!context.businessKey) errors.push('Context missing businessKey.');
      if (!definition.sourceSheet) errors.push('Definition missing sourceSheet.');
      if (!definition.targetSheet) errors.push('Definition missing targetSheet.');
      return { valid: errors.length === 0, errors: errors };
    },

    execute: function(payload, context, transaction, definition) {
      const targetSheet = sciipEnsure3170TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3170ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            reconciliationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3160_SuperSheetImportExecutionArchiveLedgerProcessor after 3150 creates archive records.'
          })
        });
      }

      const reconciliationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const reconciliationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION|' + reconciliationDate;

      if (sciip3170BusinessKeyExists_(definition.targetSheet, reconciliationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3170ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            reconciliationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            reconciliationBusinessKey: reconciliationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3170CountReconciliationRecords_(sourceRecords);
      const posture = sciip3170ResolveReconciliationPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_' + Utilities.getUuid(),
        reconciliationBusinessKey,
        reconciliationDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.ready,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet3170ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3170ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          reconciliationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          reconciliationReadyCount: counts.ready,
          reconciliationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          reconciliationPosture: posture.posture,
          reconciliationBusinessKey: reconciliationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3180_SuperSheetImportExecutionReconciliationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3170BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3170CountReconciliationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('ARCHIVE_LEDGER_READY') !== -1 ||
      statusText.indexOf('IMPORT_RECONCILIATION_READY') !== -1 ||
      statusText.indexOf('RECONCILIATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('RECONCILIATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3170ResolveReconciliationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'RECONCILIATION_BLOCKED',
      posture: 'IMPORT_RECONCILIATION_BLOCKED',
      summary:
        'SuperSheet import execution reconciliation is blocked by archive ledger conditions.',
      nextAction:
        'Review blocked archive ledger records before reconciliation ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'RECONCILIATION_READY',
      posture: 'IMPORT_RECONCILIATION_READY',
      summary:
        'SuperSheet import execution is ready for reconciliation.',
      nextAction:
        'Proceed to SuperSheet import execution reconciliation ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'RECONCILIATION_PARTIAL_READY',
      posture: 'IMPORT_RECONCILIATION_REVIEW_REQUIRED',
      summary:
        'Some archive ledger records are reconciliation-ready, but reconciliation requires review.',
      nextAction:
        'Review archive ledger records before reconciliation ledger summary.'
    };
  }

  return {
    status: 'RECONCILIATION_REVIEW_REQUIRED',
    posture: 'IMPORT_RECONCILIATION_REVIEW_REQUIRED',
    summary:
      'No reconciliation-ready SuperSheet import execution archive ledger records were found.',
    nextAction:
      'Run upstream archive ledger processor with reconciliation-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3170_SuperSheetImportExecutionReconciliationProcessor() {
  const result =
    sciipRun3170_SuperSheetImportExecutionReconciliationProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3170_SuperSheetImportExecutionReconciliationProcessor',
    result: result
  }));

  return result;
}