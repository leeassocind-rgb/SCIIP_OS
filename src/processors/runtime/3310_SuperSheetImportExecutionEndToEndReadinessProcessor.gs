/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 3310_SuperSheetImportExecutionEndToEndReadinessProcessor
 *******************************************************/

function sciipGet3310ProcessorName_() {
  return '3310_SuperSheetImportExecutionEndToEndReadiness';
}

function sciipGet3310SourceSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_PRODUCTION_ACCEPTANCE_LEDGER_SUMMARY';
}

function sciipGet3310TargetSheet_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS';
}

function sciipGet3310Action_() {
  return 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS';
}

function sciipGet3310Headers_() {
  return [
    'End_To_End_Readiness_ID',
    'Business_Key',
    'Readiness_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'End_To_End_Ready_Count',
    'End_To_End_Blocked_Count',
    'Review_Required_Count',
    'End_To_End_Readiness_Status',
    'End_To_End_Readiness_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure3310TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet3310TargetSheet_(),
    sciipGet3310Headers_()
  );
}

function sciipRun3310_SuperSheetImportExecutionEndToEndReadinessProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet3310ProcessorName_(),
    action: sciipGet3310Action_(),
    sourceSheet: sciipGet3310SourceSheet_(),
    targetSheet: sciipGet3310TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_RUNTIME_LEDGER',

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
          'SuperSheet import execution end-to-end readiness runtime payload created.',
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
      const targetSheet = sciipEnsure3310TargetSheet_();
      const sourceRecords =
        SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet3310ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            endToEndReadinessStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction:
              'Run 3300_SuperSheetImportExecutionProductionAcceptanceLedgerProcessor after 3290 creates production acceptance records.'
          })
        });
      }

      const readinessDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const readinessBusinessKey =
        'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS|' + readinessDate;

      if (sciip3310BusinessKeyExists_(definition.targetSheet, readinessBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet3310ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            endToEndReadinessStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            readinessBusinessKey: readinessBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip3310CountEndToEndReadinessRecords_(sourceRecords);
      const posture = sciip3310ResolveEndToEndReadinessPosture_(
        counts,
        sourceRecords.length
      );

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_EXECUTION_END_TO_END_READINESS_' + Utilities.getUuid(),
        readinessBusinessKey,
        readinessDate,
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
        sciipGet3310ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet3310ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          endToEndReadinessStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          endToEndReadyCount: counts.ready,
          endToEndBlockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          endToEndReadinessPosture: posture.posture,
          readinessBusinessKey: readinessBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor:
            '3320_SuperSheetImportExecutionEndToEndReadinessLedgerProcessor'
        })
      });
    }
  });
}

function sciip3310BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip3310CountEndToEndReadinessRecords_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('PRODUCTION_ACCEPTANCE_LEDGER_READY') !== -1 ||
      statusText.indexOf('END_TO_END_READINESS_READY') !== -1 ||
      statusText.indexOf('SUPERSHEET_IMPORT_END_TO_END_READY') !== -1
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

function sciip3310ResolveEndToEndReadinessPosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'END_TO_END_READINESS_BLOCKED',
      posture: 'SUPERSHEET_IMPORT_END_TO_END_READINESS_BLOCKED',
      summary:
        'SuperSheet import execution end-to-end readiness is blocked by production acceptance ledger conditions.',
      nextAction:
        'Review blocked production acceptance ledger records before end-to-end readiness ledger summary.'
    };
  }

  if (counts.ready > 0 && counts.ready === total) {
    return {
      status: 'END_TO_END_READINESS_READY',
      posture: 'SUPERSHEET_IMPORT_END_TO_END_READINESS_READY',
      summary:
        'SuperSheet import execution is ready for the first end-to-end AIR SuperSheet production test.',
      nextAction:
        'Proceed to SuperSheet import execution end-to-end readiness ledger summary.'
    };
  }

  if (counts.ready > 0) {
    return {
      status: 'END_TO_END_READINESS_PARTIAL_READY',
      posture: 'SUPERSHEET_IMPORT_END_TO_END_READINESS_REVIEW_REQUIRED',
      summary:
        'Some production acceptance ledger records are end-to-end-ready, but readiness requires review.',
      nextAction:
        'Review production acceptance ledger records before end-to-end readiness ledger summary.'
    };
  }

  return {
    status: 'END_TO_END_READINESS_REVIEW_REQUIRED',
    posture: 'SUPERSHEET_IMPORT_END_TO_END_READINESS_REVIEW_REQUIRED',
    summary:
      'No end-to-end-ready SuperSheet import execution production acceptance ledger records were found.',
    nextAction:
      'Run upstream production acceptance ledger processor with end-to-end-ready input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest3310_SuperSheetImportExecutionEndToEndReadinessProcessor() {
  const result =
    sciipRun3310_SuperSheetImportExecutionEndToEndReadinessProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest3310_SuperSheetImportExecutionEndToEndReadinessProcessor',
    result: result
  }));

  return result;
}