/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor
 *******************************************************/

function sciipGet3400ProcessorName_() {
  return '3400_SuperSheetImportExecutionProductionTestResultLedger';
}

function sciipGet3400SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULTS';
}

function sciipGet3400TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_SUMMARY';
}

function sciipGet3400Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_SUMMARY';
}

function sciipGet3400Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Result_Ready_Count',
    'Result_Blocked_Count',
    'Review_Required_Count',
    'Result_Ledger_Status',
    'Result_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3400TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3400TargetSheet_(),
    sciipGet3400Headers_()
  );
}

function sciipRun3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3400ProcessorName_(),
    action: sciipGet3400Action_(),
    sourceSheet: sciipGet3400SourceSheet_(),
    targetSheet: sciipGet3400TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_RUNTIME_LEDGER',

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
          'SuperSheet import execution production test result ledger runtime payload created.',
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

      return {
        valid: errors.length === 0,
        errors: errors
      };
    },

    execute: function(payload, context, transaction, definition) {

      const targetSheet = sciipEnsure3400TargetSheet_();

      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {

        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3400ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            resultLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3390_SuperSheetImportExecutionProductionTestResultProcessor after 3380 creates production test execution ledger summaries.'
          })
        });

      }

      const ledgerDate =
        context.dateKey || SCIIP_RUNTIME.getDateKey({});

      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER|' +
        ledgerDate;

      if (sciip3400BusinessKeyExists_(
            definition.targetSheet,
            ledgerBusinessKey)) {

        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3400ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            resultLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });

      }

      const counts =
        sciip3400CountProductionTestResultLedgerRecords_(sourceRecords);

      const posture =
        sciip3400ResolveProductionTestResultLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_LEDGER_' +
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
        sciipGet3400ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3400ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          resultLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          resultReadyCount: counts.ready,
          resultBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          resultLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3410_SuperSheetImportExecutionProductionCertificationProcessor'
        })
      });

    }
  });
}

function sciip3400BusinessKeyExists_(sheetName, businessKey) {

  const records =
    SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];

  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });

}

function sciip3400CountProductionTestResultLedgerRecords_(records) {

  return records.reduce(function(counts, record) {

    const statusText = Object.keys(record)
      .map(function(key) {
        return String(record[key] || '').toUpperCase();
      })
      .join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_RESULT_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_LEDGER_READY') !== -1
    ) {

      counts.ready++;

    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_BLOCKED') !== -1
    ) {

      counts.blocked++;

    } else {

      counts.reviewRequired++;

    }

    return counts;

  }, {
    ready: 0,
    blocked: 0,
    reviewRequired: 0
  });

}

function sciip3400ResolveProductionTestResultLedgerPosture_(counts, total) {

  if (counts.blocked > 0) {

    return {
      status: 'PRODUCTION_TEST_RESULT_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_CERTIFICATION_BLOCKED',
      summary:
        'SuperSheet import execution production test result ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production test result records before production certification.'
    };

  }

  if (counts.ready > 0 && counts.ready === total) {

    return {
      status: 'PRODUCTION_TEST_RESULT_LEDGER_READY',
      posture: 'PRODUCTION_CERTIFICATION_READY',
      summary:
        'All production test results are ready for production certification.',
      nextAction:
        'Proceed to production certification.'
    };

  }

  if (counts.ready > 0) {

    return {
      status: 'PRODUCTION_TEST_RESULT_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
      summary:
        'Some production test results are ready, but production certification requires review.',
      nextAction:
        'Review production test results before certification.'
    };

  }

  return {
    status: 'PRODUCTION_TEST_RESULT_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_CERTIFICATION_REVIEW_REQUIRED',
    summary:
      'No production-certification-ready production test results were found.',
    nextAction:
      'Run upstream production test result processor with production-ready input.'
  };

}

/*******************************************************
 * Test
 *******************************************************/

function sciipTest3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor() {

  const result =
    sciipRun3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor',
    result: result
  }));

  return result;

}