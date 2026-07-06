/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor
 *******************************************************/

function sciipGet3380ProcessorName_() {
  return '3380_SuperSheetImportExecutionProductionTestExecutionLedger';
}

function sciipGet3380SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTIONS';
}

function sciipGet3380TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_SUMMARY';
}

function sciipGet3380Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_SUMMARY';
}

function sciipGet3380Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Ready_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Ledger_Status',
    'Execution_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3380TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3380TargetSheet_(),
    sciipGet3380Headers_()
  );
}

function sciipRun3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3380ProcessorName_(),
    action: sciipGet3380Action_(),
    sourceSheet: sciipGet3380SourceSheet_(),
    targetSheet: sciipGet3380TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_RUNTIME_LEDGER',

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
          'SuperSheet import execution production test execution ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3380TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3380ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestExecutionLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3370_SuperSheetImportExecutionProductionTestExecutionProcessor after 3360 creates execution-ready launch ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER|' +
        ledgerDate;

      if (sciip3380BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3380ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestExecutionLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3380CountProductionTestExecutionLedgerRecords_(sourceRecords);

      const posture =
        sciip3380ResolveProductionTestExecutionLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_LEDGER_' +
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
        sciipGet3380ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3380ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestExecutionLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionReadyCount: counts.ready,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3390_SuperSheetImportExecutionProductionTestResultProcessor'
        })
      });
    }
  });
}

function sciip3380BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3380CountProductionTestExecutionLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3380ResolveProductionTestExecutionLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_TEST_RESULT_BLOCKED',
      summary:
        'SuperSheet import execution production test execution ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production test execution records before production test result capture.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_LEDGER_READY',
      posture: 'PRODUCTION_TEST_RESULT_CAPTURE_READY',
      summary:
        'All SuperSheet import execution production test execution records are ready for production test result capture.',
      nextAction:
        'Proceed to SuperSheet import execution production test result capture.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
      summary:
        'Some production test execution records are ready, but result capture requires review.',
      nextAction:
        'Review production test execution records before production test result capture.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_EXECUTION_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_TEST_RESULT_REVIEW_REQUIRED',
    summary:
      'No production-test-result-ready SuperSheet import execution records were found.',
    nextAction:
      'Run upstream production test execution processor with execution-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor() {
  const result =
    sciipRun3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor',
    result: result
  }));

  return result;
}