/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3290_SuperSheetImportExecutionProductionAcceptanceProcessor
 *******************************************************/

function sciipGet3290ProcessorName_() {
  return '3290_SuperSheetImportExecutionProductionAcceptance';
}

function sciipGet3290SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_HANDOFF_LEDGER_SUMMARY';
}

function sciipGet3290TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCES';
}

function sciipGet3290Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCES';
}

function sciipGet3290Headers_() {
  return [
    'Production_Acceptance_ID',
    'Business_Key',
    'Production_Acceptance_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Production_Acceptance_Ready_Count',
    'Production_Acceptance_Blocked_Count',
    'Review_Required_Count',
    'Production_Acceptance_Status',
    'Production_Acceptance_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3290TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3290TargetSheet_(),
    sciipGet3290Headers_()
  );
}

function sciipRun3290_SuperSheetImportExecutionProductionAcceptanceProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3290ProcessorName_(),
    action: sciipGet3290Action_(),
    sourceSheet: sciipGet3290SourceSheet_(),
    targetSheet: sciipGet3290TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_RUNTIME_LEDGER',

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
          'SuperSheet import execution production acceptance runtime payload created.',
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
      const targetSheet = sciipEnsure3290TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3290ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            productionAcceptanceStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3280_SuperSheetImportExecutionProductionHandoffLedgerProcessor after 3270 creates production handoff records.'
          })
        });
      }

      const acceptanceDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const acceptanceBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE|' + acceptanceDate;

      if (sciip3290BusinessKeyExists_(definition.targetSheet, acceptanceBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3290ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            productionAcceptanceStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            acceptanceBusinessKey: acceptanceBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3290CountProductionAcceptanceRecords_(sourceRecords);
      const posture = sciip3290ResolveProductionAcceptancePosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_' + Utilities.getUuid(),
        acceptanceBusinessKey,
        acceptanceDate,
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
        sciipGet3290ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3290ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          productionAcceptanceStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          productionAcceptanceReadyCount: counts.ready,
          productionAcceptanceBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          productionAcceptancePosture: posture.posture,
          acceptanceBusinessKey: acceptanceBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor'
        })
      });
    }
  });
}

function sciip3290BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3290CountProductionAcceptanceRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_HANDOFF_LEDGER_READY') !== -1 ||
      statusText.indexOf('PRODUCTION_ACCEPTANCE_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_READY') !== -1
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

function sciip3290ResolveProductionAcceptancePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_BLOCKED',
      summary:
        'SuperSheet import execution production acceptance is blocked by production handoff ledger conditions.',
      nextAction:
        'Review blocked production handoff ledger records before production acceptance ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_READY',
      summary:
        'SuperSheet import execution is ready for production acceptance.',
      nextAction:
        'Proceed to SuperSheet import execution production acceptance ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'PRODUCTION_ACCEPTANCE_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
      summary:
        'Some production handoff ledger records are production-acceptance-ready, but production acceptance requires review.',
      nextAction:
        'Review production handoff ledger records before production acceptance ledger summary.'
    };
  }

  return {
    status: 'PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_PRODUCTION_ACCEPTANCE_REVIEW_REQUIRED',
    summary:
      'No production-acceptance-ready SuperSheet import execution production handoff ledger records were found.',
    nextAction:
      'Run upstream production handoff ledger processor with production-acceptance-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3290_SuperSheetImportExecutionProductionAcceptanceProcessor() {
  const result =
    sciipRun3290_SuperSheetImportExecutionProductionAcceptanceProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3290_SuperSheetImportExecutionProductionAcceptanceProcessor',
    result: result
  }));

  return result;
}