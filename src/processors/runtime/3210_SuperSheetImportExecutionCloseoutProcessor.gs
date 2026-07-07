/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3210_SuperSheetImportExecutionCloseoutProcessor
 *******************************************************/

function sciipGet3210ProcessorName_() {
  return '3210_SuperSheetImportExecutionCloseout';
}

function sciipGet3210SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_POST_RECONCILIATION_CERTIFICATION_LEDGER_SUMMARY';
}

function sciipGet3210TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUTS';
}

function sciipGet3210Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUTS';
}

function sciipGet3210Headers_() {
  return [
    'Closeout_ID',
    'Business_Key',
    'Closeout_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Closeout_Ready_Count',
    'Closeout_Blocked_Count',
    'Review_Required_Count',
    'Closeout_Status',
    'Closeout_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3210TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3210TargetSheet_(),
    sciipGet3210Headers_()
  );
}

function sciipRun3210_SuperSheetImportExecutionCloseoutProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3210ProcessorName_(),
    action: sciipGet3210Action_(),
    sourceSheet: sciipGet3210SourceSheet_(),
    targetSheet: sciipGet3210TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import execution closeout runtime payload created.',
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
      const targetSheet = sciipEnsure3210TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3210ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            closeoutStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3200_SuperSheetImportExecutionPostReconciliationCertificationLedgerProcessor after 3190 creates certification records.'
          })
        });
      }

      const closeoutDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const closeoutBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT|' + closeoutDate;

      if (sciip3210BusinessKeyExists_(definition.targetSheet, closeoutBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3210ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            closeoutStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            closeoutBusinessKey: closeoutBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3210CountCloseoutRecords_(sourceRecords);
      const posture = sciip3210ResolveCloseoutPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_CLOSEOUT_' + Utilities.getUuid(),
        closeoutBusinessKey,
        closeoutDate,
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
        sciipGet3210ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3210ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          closeoutStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          closeoutReadyCount: counts.ready,
          closeoutBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          closeoutPosture: posture.posture,
          closeoutBusinessKey: closeoutBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '3220_SuperSheetImportExecutionCloseoutLedgerProcessor'
        })
      });
    }
  });
}

function sciip3210BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3210CountCloseoutRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('IMPORT_CLOSEOUT_READY') !== -1 ||
      statusText.indexOf('POST_RECONCILIATION_CERTIFICATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('CLOSEOUT_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('CLOSEOUT_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3210ResolveCloseoutPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'CLOSEOUT_BLOCKED',
      posture: 'IMPORT_CLOSEOUT_BLOCKED',
      summary:
        'SuperSheet import execution closeout is blocked by post-reconciliation certification ledger conditions.',
      nextAction:
        'Review blocked certification ledger records before closeout ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'CLOSEOUT_READY',
      posture: 'IMPORT_CLOSEOUT_READY',
      summary:
        'SuperSheet import execution is ready for closeout.',
      nextAction:
        'Proceed to SuperSheet import execution closeout ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'CLOSEOUT_PARTIAL_READY',
      posture: 'IMPORT_CLOSEOUT_REVIEW_REQUIRED',
      summary:
        'Some post-reconciliation certification ledger records are closeout-ready, but closeout requires review.',
      nextAction:
        'Review certification ledger records before closeout ledger summary.'
    };
  }

  return {
    status: 'CLOSEOUT_REVIEW_REQUIRED',
    posture: 'IMPORT_CLOSEOUT_REVIEW_REQUIRED',
    summary:
      'No closeout-ready SuperSheet import execution certification ledger records were found.',
    nextAction:
      'Run upstream post-reconciliation certification ledger processor with closeout-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3210_SuperSheetImportExecutionCloseoutProcessor() {
  const result =
    sciipRun3210_SuperSheetImportExecutionCloseoutProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3210_SuperSheetImportExecutionCloseoutProcessor',
    result: result
  }));

  return result;
}