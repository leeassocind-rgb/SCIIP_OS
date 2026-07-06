/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor
 *******************************************************/

function sciipGet3360ProcessorName_() {
  return '3360_SuperSheetImportExecutionProductionTestLaunchLedger';
}

function sciipGet3360SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCHES';
}

function sciipGet3360TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_SUMMARY';
}

function sciipGet3360Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_SUMMARY';
}

function sciipGet3360Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Launch_Ready_Count',
    'Launch_Blocked_Count',
    'Review_Required_Count',
    'Launch_Ledger_Status',
    'Launch_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3360TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3360TargetSheet_(),
    sciipGet3360Headers_()
  );
}

function sciipRun3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3360ProcessorName_(),
    action: sciipGet3360Action_(),
    sourceSheet: sciipGet3360SourceSheet_(),
    targetSheet: sciipGet3360TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_RUNTIME_LEDGER',

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
          'SuperSheet import execution production test launch ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3360TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3360ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestLaunchLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3350_SuperSheetImportExecutionProductionTestLaunchProcessor after 3340 creates launch-ready authorization ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER|' +
        ledgerDate;

      if (sciip3360BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3360ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestLaunchLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3360CountProductionTestLaunchLedgerRecords_(sourceRecords);

      const posture =
        sciip3360ResolveProductionTestLaunchLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_LEDGER_' +
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
        sciipGet3360ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3360ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestLaunchLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          launchReadyCount: counts.ready,
          launchBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          launchLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3370_SuperSheetImportExecutionProductionTestExecutionProcessor'
        })
      });
    }
  });
}

function sciip3360BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3360CountProductionTestLaunchLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3360ResolveProductionTestLaunchLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_TEST_EXECUTION_BLOCKED',
      summary:
        'SuperSheet import execution production test launch ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production test launch records before production test execution.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_LEDGER_READY',
      posture: 'PRODUCTION_TEST_EXECUTION_READY',
      summary:
        'All SuperSheet import execution production test launch records are ready for production test execution.',
      nextAction:
        'Proceed to SuperSheet import execution production test execution.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
      summary:
        'Some production test launch records are ready, but production test execution requires review.',
      nextAction:
        'Review production test launch records before production test execution.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_LAUNCH_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_TEST_EXECUTION_REVIEW_REQUIRED',
    summary:
      'No production-test-execution-ready SuperSheet import execution launch records were found.',
    nextAction:
      'Run upstream production test launch processor with launch-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor() {
  const result =
    sciipRun3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor',
    result: result
  }));

  return result;
}