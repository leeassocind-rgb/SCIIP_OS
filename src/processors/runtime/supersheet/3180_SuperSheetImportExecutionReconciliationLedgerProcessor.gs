/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3180_SuperSheetImportExecutionReconciliationLedgerProcessor
 *******************************************************/

function sciipGet3180ProcessorName_() {
  return '3180_SuperSheetImportExecutionReconciliationLedger';
}

function sciipGet3180SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATIONS';
}

function sciipGet3180TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_SUMMARY';
}

function sciipGet3180Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_SUMMARY';
}

function sciipGet3180Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Reconciliation_Ready_Count',
    'Reconciliation_Blocked_Count',
    'Review_Required_Count',
    'Reconciliation_Ledger_Status',
    'Reconciliation_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3180TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3180TargetSheet_(),
    sciipGet3180Headers_()
  );
}

function sciipRun3180_SuperSheetImportExecutionReconciliationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3180ProcessorName_(),
    action: sciipGet3180Action_(),
    sourceSheet: sciipGet3180SourceSheet_(),
    targetSheet: sciipGet3180TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution reconciliation ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3180TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3180ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            reconciliationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3170_SuperSheetImportExecutionReconciliationProcessor after 3160 creates reconciliation-ready archive ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER|' + ledgerDate;

      if (sciip3180BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3180ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            reconciliationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3180CountReconciliationLedgerRecords_(sourceRecords);
      const posture = sciip3180ResolveReconciliationLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_RECONCILIATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
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
        sciipGet3180ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3180ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          reconciliationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          reconciliationReadyCount: counts.ready,
          reconciliationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          reconciliationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor'
        })
      });
    }
  });
}

function sciip3180BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3180CountReconciliationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RECONCILIATION_READY') !== -1 ||
      statusText.indexOf('IMPORT_RECONCILIATION_READY') !== -1 ||
      statusText.indexOf('RECONCILIATION_LEDGER_READY') !== -1
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

function sciip3180ResolveReconciliationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'RECONCILIATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'POST_RECONCILIATION_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution reconciliation ledger recorded blocking conditions.',
      nextAction:
        'Review blocked reconciliation records before post-reconciliation certification.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'RECONCILIATION_LEDGER_READY',
      posture: 'POST_RECONCILIATION_CERTIFICATION_READY',
      summary:
        'All SuperSheet import execution reconciliation records are ready for post-reconciliation certification.',
      nextAction:
        'Proceed to SuperSheet import execution post-reconciliation certification.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'RECONCILIATION_LEDGER_PARTIAL_READY',
      posture: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some reconciliation records are ready, but post-reconciliation certification requires review.',
      nextAction:
        'Review reconciliation records before post-reconciliation certification.'
    };
  }

  return {
    status: 'RECONCILIATION_LEDGER_REVIEW_REQUIRED',
    posture: 'POST_RECONCILIATION_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No certification-ready SuperSheet import execution reconciliation records were found.',
    nextAction:
      'Run upstream reconciliation processor with reconciliation-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3180_SuperSheetImportExecutionReconciliationLedgerProcessor() {
  const result =
    sciipRun3180_SuperSheetImportExecutionReconciliationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3180_SuperSheetImportExecutionReconciliationLedgerProcessor',
    result: result
  }));

  return result;
}