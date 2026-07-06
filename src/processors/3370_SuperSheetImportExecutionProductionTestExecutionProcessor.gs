/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3370_SuperSheetImportExecutionProductionTestExecutionProcessor
 *******************************************************/

function sciipGet3370ProcessorName_() {
  return '3370_SuperSheetImportExecutionProductionTestExecution';
}

function sciipGet3370SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_SUMMARY';
}

function sciipGet3370TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTIONS';
}

function sciipGet3370Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTIONS';
}

function sciipGet3370Headers_() {
  return [
    'Production_Test_Execution_ID',
    'Business_Key',
    'Execution_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Execution_Ready_Count',
    'Execution_Blocked_Count',
    'Review_Required_Count',
    'Execution_Status',
    'Execution_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3370TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3370TargetSheet_(),
    sciipGet3370Headers_()
  );
}

function sciipRun3370_SuperSheetImportExecutionProductionTestExecutionProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3370ProcessorName_(),
    action: sciipGet3370Action_(),
    sourceSheet: sciipGet3370SourceSheet_(),
    targetSheet: sciipGet3370TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_RUNTIME_LEDGER',

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
          'SuperSheet import execution production test execution runtime payload created.',
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
      const targetSheet = sciipEnsure3370TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3370ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestExecutionStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor after 3350 creates production test launch records.'
          })
        });
      }

      const executionDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const executionBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION|' +
        executionDate;

      if (sciip3370BusinessKeyExists_(definition.targetSheet, executionBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3370ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestExecutionStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            executionBusinessKey: executionBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3370CountProductionTestExecutionRecords_(sourceRecords);

      const posture =
        sciip3370ResolveProductionTestExecutionPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_EXECUTION_' +
          Utilities.getUuid(),
        executionBusinessKey,
        executionDate,
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
        sciipGet3370ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3370ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestExecutionStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          executionReadyCount: counts.ready,
          executionBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          executionPosture: posture.posture,
          executionBusinessKey: executionBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3380_SuperSheetImportExecutionProductionTestExecutionLedgerProcessor'
        })
      });
    }
  });
}

function sciip3370BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3370CountProductionTestExecutionRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_EXECUTION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_READY') !== -1
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

function sciip3370ResolveProductionTestExecutionPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_BLOCKED',
      summary:
        'SuperSheet import execution production test execution is blocked by production test launch ledger conditions.',
      nextAction:
        'Review blocked production test launch ledger records before production test execution ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_READY',
      summary:
        'SuperSheet import execution is ready to execute the first real AIR SuperSheet end-to-end production test.',
      nextAction:
        'Proceed to SuperSheet import execution production test execution ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_EXECUTION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
      summary:
        'Some production test launch ledger records are execution-ready, but production test execution requires review.',
      nextAction:
        'Review production test launch ledger records before production test execution ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
    summary:
      'No production-test-execution-ready SuperSheet import execution launch ledger records were found.',
    nextAction:
      'Run upstream production test launch ledger processor with execution-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3370_SuperSheetImportExecutionProductionTestExecutionProcessor() {
  const result =
    sciipRun3370_SuperSheetImportExecutionProductionTestExecutionProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3370_SuperSheetImportExecutionProductionTestExecutionProcessor',
    result: result
  }));

  return result;
}