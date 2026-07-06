/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor
 *******************************************************/

function sciipGet3340ProcessorName_() {
  return '3340_SuperSheetImportExecutionProductionTestAuthorizationLedger';
}

function sciipGet3340SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATIONS';
}

function sciipGet3340TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet3340Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet3340Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Authorization_Ready_Count',
    'Authorization_Blocked_Count',
    'Review_Required_Count',
    'Authorization_Ledger_Status',
    'Authorization_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3340TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3340TargetSheet_(),
    sciipGet3340Headers_()
  );
}

function sciipRun3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3340ProcessorName_(),
    action: sciipGet3340Action_(),
    sourceSheet: sciipGet3340SourceSheet_(),
    targetSheet: sciipGet3340TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_RUNTIME_LEDGER',

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
          'SuperSheet import execution production test authorization ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3340TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3340ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            authorizationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor after 3320 creates production-test-ready end-to-end readiness ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER|' +
        ledgerDate;

      if (sciip3340BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3340ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            authorizationLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3340CountProductionTestAuthorizationLedgerRecords_(sourceRecords);

      const posture =
        sciip3340ResolveProductionTestAuthorizationLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_' +
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
        sciipGet3340ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3340ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          authorizationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          authorizationReadyCount: counts.ready,
          authorizationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          authorizationLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3350_SuperSheetImportExecutionProductionTestLaunchProcessor'
        })
      });
    }
  });
}

function sciip3340BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3340CountProductionTestAuthorizationLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_AUTHORIZED') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3340ResolveProductionTestAuthorizationLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_TEST_LAUNCH_BLOCKED',
      summary:
        'SuperSheet import execution production test authorization ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production test authorization records before production test launch.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_LEDGER_READY',
      posture: 'PRODUCTION_TEST_LAUNCH_READY',
      summary:
        'All SuperSheet import execution production test authorization records are ready for production test launch.',
      nextAction:
        'Proceed to SuperSheet import execution production test launch.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
      summary:
        'Some production test authorization records are ready, but production test launch requires review.',
      nextAction:
        'Review production test authorization records before production test launch.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_AUTHORIZATION_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
    summary:
      'No production-test-launch-ready SuperSheet import execution authorization records were found.',
    nextAction:
      'Run upstream production test authorization processor with authorized input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor() {
  const result =
    sciipRun3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor',
    result: result
  }));

  return result;
}