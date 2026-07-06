/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3390_SuperSheetImportExecutionProductionTestResultProcessor
 *******************************************************/

function sciipGet3390ProcessorName_() {
  return '3390_SuperSheetImportExecutionProductionTestResult';
}

function sciipGet3390SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_SUMMARY';
}

function sciipGet3390TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULTS';
}

function sciipGet3390Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULTS';
}

function sciipGet3390Headers_() {
  return [
    'Production_Test_Result_ID',
    'Business_Key',
    'Result_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Result_Ready_Count',
    'Result_Blocked_Count',
    'Review_Required_Count',
    'Result_Status',
    'Result_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3390TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3390TargetSheet_(),
    sciipGet3390Headers_()
  );
}

function sciipRun3390_SuperSheetImportExecutionProductionTestResultProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3390ProcessorName_(),
    action: sciipGet3390Action_(),
    sourceSheet: sciipGet3390SourceSheet_(),
    targetSheet: sciipGet3390TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_RUNTIME_LEDGER',

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
          'SuperSheet import execution production test result runtime payload created.',
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
      const targetSheet = sciipEnsure3390TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3390ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestResultStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor after 3370 creates production test execution records.'
          })
        });
      }

      const resultDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const resultBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT|' + resultDate;

      if (sciip3390BusinessKeyExists_(definition.targetSheet, resultBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3390ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestResultStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            resultBusinessKey: resultBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3390CountProductionTestResultRecords_(sourceRecords);

      const posture =
        sciip3390ResolveProductionTestResultPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_RESULT_' +
          Utilities.getUuid(),
        resultBusinessKey,
        resultDate,
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
        sciipGet3390ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3390ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestResultStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          resultReadyCount: counts.ready,
          resultBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          resultPosture: posture.posture,
          resultBusinessKey: resultBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3400_SuperSheetImportExecutionProductionTestResultLedgerProcessor'
        })
      });
    }
  });
}

function sciip3390BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3390CountProductionTestResultRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_CAPTURE_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_RESULT_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3390ResolveProductionTestResultPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_RESULT_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_BLOCKED',
      summary:
        'SuperSheet import execution production test result capture is blocked by production test execution ledger conditions.',
      nextAction:
        'Review blocked production test execution ledger records before production test result ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_RESULT_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_READY',
      summary:
        'SuperSheet import execution production test result capture is ready.',
      nextAction:
        'Proceed to SuperSheet import execution production test result ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_RESULT_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
      summary:
        'Some production test execution ledger records are result-ready, but result capture requires review.',
      nextAction:
        'Review production test execution ledger records before production test result ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
    summary:
      'No production-test-result-ready SuperSheet import execution records were found.',
    nextAction:
      'Run upstream production test execution ledger processor with result-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3390_SuperSheetImportExecutionProductionTestResultProcessor() {
  const result =
    sciipRun3390_SuperSheetImportExecutionProductionTestResultProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3390_SuperSheetImportExecutionProductionTestResultProcessor',
    result: result
  }));

  return result;
}