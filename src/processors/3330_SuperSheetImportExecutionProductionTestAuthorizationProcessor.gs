/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor
 *******************************************************/

function sciipGet3330ProcessorName_() {
  return '3330_SuperSheetImportExecutionProductionTestAuthorization';
}

function sciipGet3330SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_SUMMARY';
}

function sciipGet3330TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATIONS';
}

function sciipGet3330Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATIONS';
}

function sciipGet3330Headers_() {
  return [
    'Production_Test_Authorization_ID',
    'Business_Key',
    'Authorization_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Authorization_Ready_Count',
    'Authorization_Blocked_Count',
    'Review_Required_Count',
    'Authorization_Status',
    'Authorization_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3330TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3330TargetSheet_(),
    sciipGet3330Headers_()
  );
}

function sciipRun3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3330ProcessorName_(),
    action: sciipGet3330Action_(),
    sourceSheet: sciipGet3330SourceSheet_(),
    targetSheet: sciipGet3330TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_RUNTIME_LEDGER',

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
          'SuperSheet import execution production test authorization runtime payload created.',
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
      const targetSheet = sciipEnsure3330TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3330ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionTestAuthorizationStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor after 3310 creates end-to-end readiness records.'
          })
        });
      }

      const authorizationDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const authorizationBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION|' +
        authorizationDate;

      if (sciip3330BusinessKeyExists_(definition.targetSheet, authorizationBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3330ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionTestAuthorizationStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            authorizationBusinessKey: authorizationBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3330CountProductionTestAuthorizationRecords_(sourceRecords);

      const posture =
        sciip3330ResolveProductionTestAuthorizationPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_TEST_AUTHORIZATION_' +
          Utilities.getUuid(),
        authorizationBusinessKey,
        authorizationDate,
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
        sciipGet3330ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3330ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionTestAuthorizationStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          authorizationReadyCount: counts.ready,
          authorizationBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          authorizationPosture: posture.posture,
          authorizationBusinessKey: authorizationBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3340_SuperSheetImportExecutionProductionTestAuthorizationLedgerProcessor'
        })
      });
    }
  });
}

function sciip3330BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3330CountProductionTestAuthorizationRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('END_TO_END_READINESS_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_TEST_AUTHORIZATION_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_TEST_READY') !== -1
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

function sciip3330ResolveProductionTestAuthorizationPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_BLOCKED',
      summary:
        'SuperSheet import execution production test authorization is blocked by end-to-end readiness ledger conditions.',
      nextAction:
        'Review blocked end-to-end readiness ledger records before production test authorization ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_AUTHORIZED',
      summary:
        'SuperSheet import execution is authorized for the first real AIR SuperSheet end-to-end production test.',
      nextAction:
        'Proceed to SuperSheet import execution production test authorization ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_TEST_AUTHORIZATION_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_REVIEW_REQUIRED',
      summary:
        'Some end-to-end readiness ledger records are production-test-ready, but authorization requires review.',
      nextAction:
        'Review end-to-end readiness ledger records before production test authorization ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_TEST_AUTHORIZATION_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_TEST_REVIEW_REQUIRED',
    summary:
      'No production-test-ready SuperSheet import execution end-to-end readiness ledger records were found.',
    nextAction:
      'Run upstream end-to-end readiness ledger processor with production-test-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor() {
  const result =
    sciipRun3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor',
    result: result
  }));

  return result;
}