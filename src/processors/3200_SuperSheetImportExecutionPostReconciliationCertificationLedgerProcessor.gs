/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor
 *******************************************************/

function sciipGet3200ProcessorName_() {
  return '3200_SuperSheetImportExecutionPostReconciliationCertificationLedger';
}

function sciipGet3200SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATIONS';
}

function sciipGet3200TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3200Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3200Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Certification_Ready_Count',
    'Certification_Blocked_Count',
    'Review_Required_Count',
    'Certification_Ledger_Status',
    'Certification_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3200TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3200TargetSheet_(),
    sciipGet3200Headers_()
  );
}

function sciipRun3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3200ProcessorName_(),
    action: sciipGet3200Action_(),
    sourceSheet: sciipGet3200SourceSheet_(),
    targetSheet: sciipGet3200TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_RUNTIME_LEDGER',

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
        summary:
          'SuperSheet import execution post-reconciliation certification ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3200TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3200ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            certificationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3190_SuperSheetImportExecutionPostReconciliationCertificationProcessor after 3180 creates reconciliation ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER|' +
        ledgerDate;

      if (sciip3200BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3200ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            certificationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3200CountCertificationLedgerRecords_(sourceRecords);
      const posture = sciip3200ResolveCertificationLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_' +
          Utilities.getUuid(),
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
        sciipGet3200ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3200ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          certificationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          certificationReadyCount: counts.ready,
          certificationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          certificationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3210_SuperSheetImportExecutionCloseoutProcessor'
        })
      });
    }
  });
}

function sciip3200BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3200CountCertificationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('POST_RECONCILIATION_CERTIFICATION_READY') !== -1 ||
      statusText.indexOf('POST_RECONCILIATION_CERTIFICATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('CERTIFICATION_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('CERTIFICATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3200ResolveCertificationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_CLOSEOUT_BLOCKED',
      summary:
        'SuperSheet import execution post-reconciliation certification ledger recorded blocking conditions.',
      nextAction:
        'Review blocked certification records before import execution closeout.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_LEDGER_READY',
      posture: 'IMPORT_CLOSEOUT_READY',
      summary:
        'All post-reconciliation certification records are ready for import execution closeout.',
      nextAction:
        'Proceed to SuperSheet import execution closeout.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'POST_RECONCILIATION_CERTIFICATION_LEDGER_PARTIAL_READY',
      posture: 'IMPORT_CLOSEOUT_REVIEW_REQUIRED',
      summary:
        'Some post-reconciliation certification records are ready, but import execution closeout requires review.',
      nextAction:
        'Review post-reconciliation certification records before import execution closeout.'
    };
  }

  return {
    status: 'POST_RECONCILIATION_CERTIFICATION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_CLOSEOUT_REVIEW_REQUIRED',
    summary:
      'No closeout-ready post-reconciliation certification records were found.',
    nextAction:
      'Run upstream post-reconciliation certification processor with certification-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor() {
  const result =
    sciipRun3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor',
    result: result
  }));

  return result;
}