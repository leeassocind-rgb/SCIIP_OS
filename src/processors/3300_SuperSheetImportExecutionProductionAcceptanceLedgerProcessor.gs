/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor
 *******************************************************/

function sciipGet3300ProcessorName_() {
  return '3300_SuperSheetImportExecutionProductionAcceptanceLedger';
}

function sciipGet3300SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCES';
}

function sciipGet3300TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_SUMMARY';
}

function sciipGet3300Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_SUMMARY';
}

function sciipGet3300Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Production_Acceptance_Ready_Count',
    'Production_Acceptance_Blocked_Count',
    'Review_Required_Count',
    'Production_Acceptance_Ledger_Status',
    'Production_Acceptance_Ledger_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3300TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3300TargetSheet_(),
    sciipGet3300Headers_()
  );
}

function sciipRun3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3300ProcessorName_(),
    action: sciipGet3300Action_(),
    sourceSheet: sciipGet3300SourceSheet_(),
    targetSheet: sciipGet3300TargetSheet_(),
    ledgerSheet:
      'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_RUNTIME_LEDGER',

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
          'SuperSheet import execution production acceptance ledger runtime payload created.',
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
      const targetSheet = sciipEnsure3300TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3300ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionAcceptanceLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3290_SuperSheetImportExecutionProductionAcceptanceProcessor after 3280 creates production acceptance-ready handoff ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER|' +
        ledgerDate;

      if (sciip3300BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3300ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionAcceptanceLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts =
        sciip3300CountProductionAcceptanceLedgerRecords_(sourceRecords);

      const posture =
        sciip3300ResolveProductionAcceptanceLedgerPosture_(
          counts,
          sourceRecords.length
        );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_' +
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
        sciipGet3300ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3300ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionAcceptanceLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          productionAcceptanceReadyCount: counts.ready,
          productionAcceptanceBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          productionAcceptanceLedgerPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3310_SuperSheetImportExecutionEndToEndReadinessProcessor'
        })
      });
    }
  });
}

function sciip3300BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3300CountProductionAcceptanceLedgerRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_ACCEPTANCE_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_ACCEPTANCE_LEDGER_READY') !== -1
    ) {
      counts.ready += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('PRODUCTION_ACCEPTANCE_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { ready: 0, blocked: 0, reviewRequired: 0 });
}

function sciip3300ResolveProductionAcceptanceLedgerPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'END_TO_END_READINESS_BLOCKED',
      summary:
        'SuperSheet import execution production acceptance ledger recorded blocking conditions.',
      nextAction:
        'Review blocked production acceptance records before end-to-end readiness.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_LEDGER_READY',
      posture: 'END_TO_END_READINESS_READY',
      summary:
        'All SuperSheet import execution production acceptance records are ready for end-to-end readiness certification.',
      nextAction:
        'Proceed to SuperSheet import execution end-to-end readiness.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_LEDGER_PARTIAL_READY',
      posture: 'END_TO_END_READINESS_REVIEW_REQUIRED',
      summary:
        'Some production acceptance records are ready, but end-to-end readiness requires review.',
      nextAction:
        'Review production acceptance records before end-to-end readiness.'
    };
  }

  return {
    status: 'PRODUCTION_ACCEPTANCE_LEDGER_REVIEW_REQUIRED',
    posture: 'END_TO_END_READINESS_REVIEW_REQUIRED',
    summary:
      'No end-to-end readiness SuperSheet import execution production acceptance records were found.',
    nextAction:
      'Run upstream production acceptance processor with production-acceptance-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor() {
  const result =
    sciipRun3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor();

  Logger.log(JSON.stringify({
    test:
      'sciipTest3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor',
    result: result
  }));

  return result;
}