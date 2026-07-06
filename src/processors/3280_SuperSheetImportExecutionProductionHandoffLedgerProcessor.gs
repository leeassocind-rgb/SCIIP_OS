/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor
 *******************************************************/

function sciipGet3280ProcessorName_() {
  return '3280_SuperSheetImportExecutionProductionHandoffLedger';
}

function sciipGet3280SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFFS';
}

function sciipGet3280TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet3280Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet3280Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Production_Handoff_Ready_Count',
    'Production_Handoff_Blocked_Count',
    'Review_Required_Count',
    'Production_Handoff_Ledger_Status',
    'Production_Handoff_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3280TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3280TargetSheet_(),
    sciipGet3280Headers_()
  );
}

function sciipRun3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3280ProcessorName_(),
    action: sciipGet3280Action_(),
    sourceSheet: sciipGet3280SourceSheet_(),
    targetSheet: sciipGet3280TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_RUNTIME_LEDGER',

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
          'SuperSheet import execution production handoff ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3280TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3280ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionHandoffLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3270_SuperSheetImportExecutionProductionHandoffProcessor after 3260 creates production-handoff-ready final certification ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER|' +
        ledgerDate;

      if (sciip3280BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3280ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionHandoffLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3280CountProductionHandoffLedgerRecords_(sourceRecords);
      const posture = sciip3280ResolveProductionHandoffLedgerPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_' +
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
        sciipGet3280ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3280ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionHandoffLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          productionHandoffReadyCount: counts.ready,
          productionHandoffBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          productionHandoffLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3290_SuperSheetImportExecutionProductionAcceptanceProcessor'
        })
      });
    }
  });
}

function sciip3280BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3280CountProductionHandoffLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_HANDOFF_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_HANDOFF_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_HANDOFF_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_HANDOFF_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3280ResolveProductionHandoffLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_HANDOFF_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'PRODUCTION_ACCEPTANCE_BLOCKED',
      summary:
        'SuperSheet import execution production handoff ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production handoff records before production acceptance.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_HANDOFF_LEDGER_READY',
      posture: 'PRODUCTION_ACCEPTANCE_READY',
      summary:
        'All SuperSheet import execution production handoff records are ready for production acceptance.',
      nextAction:
        'Proceed to SuperSheet import execution production acceptance.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_HANDOFF_LEDGER_PARTIAL_READY',
      posture: 'PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
      summary:
        'Some production handoff records are ready, but production acceptance requires review.',
      nextAction:
        'Review production handoff records before production acceptance.'
    };
  }

  return {
    status: 'PRODUCTION_HANDOFF_LEDGER_REVIEW_REQUIRED',
    posture: 'PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
    summary:
      'No production-acceptance-ready SuperSheet import execution production handoff records were found.',
    nextAction:
      'Run upstream production handoff processor with production-handoff-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor() {
  const result =
    sciipRun3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor',
    result: result
  }));

  return result;
}