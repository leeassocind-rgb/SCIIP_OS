/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3350_SuperSheetImportExecutionProductionTestLaunchProcessor
 *******************************************************/

function sciipGet3350ProcessorName_() {
  return '3350_SuperSheetImportExecutionProductionTestLaunch';
}

function sciipGet3350SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet3350TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCHES';
}

function sciipGet3350Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCHES';
}

function sciipGet3350Headers_() {
  return [
    'Production_Test_Launch_ID',
    'Business_Key',
    'Launch_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Launch_Ready_Count',
    'Launch_Blocked_Count',
    'Review_Required_Count',
    'Launch_Status',
    'Launch_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3350TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3350TargetSheet_(),
    sciipGet3350Headers_()
  );
}

function sciipRun3350_SuperSheetImportExecutionProductionTestLaunchProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3350ProcessorName_(),
    action: sciipGet3350Action_(),
    sourceSheet: sciipGet3350SourceSheet_(),
    targetSheet: sciipGet3350TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_RUNTIME_LEDGER',

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
          'SuperSheet import execution production test launch runtime payload created.',
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
      const targetSheet = sciipEnsure3350TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3350ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestLaunchStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor after 3330 creates production test authorization records.'
          })
        });
      }

      const launchDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const launchBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH|' + launchDate;

      if (sciip3350BusinessKeyExists_(definition.targetSheet, launchBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3350ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestLaunchStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            launchBusinessKey: launchBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3350CountProductionTestLaunchRecords_(sourceRecords);

      const posture =
        sciip3350ResolveProductionTestLaunchPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_LAUNCH_' +
          Utilities.getUuid(),
        launchBusinessKey,
        launchDate,
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
        sciipGet3350ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3350ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestLaunchStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          launchReadyCount: counts.ready,
          launchBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          launchPosture: posture.posture,
          launchBusinessKey: launchBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3360_SuperSheetImportExecutionProductionTestLaunchLedgerProcessor'
        })
      });
    }
  });
}

function sciip3350BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3350CountProductionTestLaunchRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_LAUNCH_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_AUTHORIZED') !== -1
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

function sciip3350ResolveProductionTestLaunchPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_BLOCKED',
      summary:
        'SuperSheet import execution production test launch is blocked by production test authorization ledger conditions.',
      nextAction:
        'Review blocked production test authorization ledger records before production test launch ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_READY',
      summary:
        'SuperSheet import execution is ready to launch the first real AIR SuperSheet end-to-end production test.',
      nextAction:
        'Proceed to SuperSheet import execution production test launch ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_LAUNCH_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
      summary:
        'Some production test authorization ledger records are launch-ready, but production test launch requires review.',
      nextAction:
        'Review production test authorization ledger records before production test launch ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_LAUNCH_REVIEW_REQUIRED',
    summary:
      'No production-test-launch-ready SuperSheet import execution authorization ledger records were found.',
    nextAction:
      'Run upstream production test authorization ledger processor with launch-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3350_SuperSheetImportExecutionProductionTestLaunchProcessor() {
  const result =
    sciipRun3350_SuperSheetImportExecutionProductionTestLaunchProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3350_SuperSheetImportExecutionProductionTestLaunchProcessor',
    result: result
  }));

  return result;
}