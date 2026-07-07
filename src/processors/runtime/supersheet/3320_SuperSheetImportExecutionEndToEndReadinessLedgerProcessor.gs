/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor
 *******************************************************/

function sciipGet3320ProcessorName_() {
  return '3320_SuperSheetImportExecutionEndToEndReadinessLedger';
}

function sciipGet3320SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS';
}

function sciipGet3320TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_SUMMARY';
}

function sciipGet3320Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_SUMMARY';
}

function sciipGet3320Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'End_To_End_Ready_Count',
    'End_To_End_Blocked_Count',
    'Review_Required_Count',
    'End_To_End_Readiness_Ledger_Status',
    'End_To_End_Readiness_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3320TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3320TargetSheet_(),
    sciipGet3320Headers_()
  );
}

function sciipRun3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3320ProcessorName_(),
    action: sciipGet3320Action_(),
    sourceSheet: sciipGet3320SourceSheet_(),
    targetSheet: sciipGet3320TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_RUNTIME_LEDGER',

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
          'SuperSheet import execution end-to-end readiness ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3320TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3320ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            endToEndReadinessLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3310_SuperSheetImportExecutionEndToEndReadinessProcessor after 3300 creates production acceptance ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER|' + ledgerDate;

      if (sciip3320BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3320ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            endToEndReadinessLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3320CountEndToEndReadinessLedgerRecords_(sourceRecords);
      const posture = sciip3320ResolveEndToEndReadinessLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_LEDGER_' +
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
        sciipGet3320ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3320ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          endToEndReadinessLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          endToEndReadyCount: counts.ready,
          endToEndBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          endToEndReadinessLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3330_SuperSheetImportExecutionProductionTestAuthorizationProcessor'
        })
      });
    }
  });
}

function sciip3320BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3320CountEndToEndReadinessLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('END_TO_END_READINESS_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_END_TO_END_READINESS_READY') !== -1 ||
      statusText.indexOf('END_TO_END_READINESS_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('END_TO_END_READINESS_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3320ResolveEndToEndReadinessLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'END_TO_END_READINESS_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_TEST_AUTHORIZATION_BLOCKED',
      summary:
        'SuperSheet import execution end-to-end readiness ledger recorded blocking conditions.',
      nextAction:
        'Review blocked end-to-end readiness records before production test authorization.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'END_TO_END_READINESS_LEDGER_READY',
      posture: 'PRODUCTION_TEST_AUTHORIZATION_READY',
      summary:
        'All SuperSheet import execution end-to-end readiness records are ready for production test authorization.',
      nextAction:
        'Proceed to SuperSheet import execution production test authorization.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'END_TO_END_READINESS_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_TEST_AUTHORIZATION_REVIEW_REQUIRED',
      summary:
        'Some end-to-end readiness records are ready, but production test authorization requires review.',
      nextAction:
        'Review end-to-end readiness records before production test authorization.'
    };
  }

  return {
    status: 'END_TO_END_READINESS_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_TEST_AUTHORIZATION_REVIEW_REQUIRED',
    summary:
      'No production-test-authorization-ready SuperSheet import execution end-to-end readiness records were found.',
    nextAction:
      'Run upstream end-to-end readiness processor with readiness input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor() {
  const result =
    sciipRun3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor',
    result: result
  }));

  return result;
}