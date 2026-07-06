/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2920_SuperSheetImportReleaseGateLedgerProcessor
 *******************************************************/

function sciipGet2920ProcessorName_() {
  return '2920_SuperSheetImportReleaseGateLedger';
}

function sciipGet2920SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE';
}

function sciipGet2920TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_SUMMARY';
}

function sciipGet2920Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_SUMMARY';
}

function sciipGet2920Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Open_Count',
    'Blocked_Count',
    'Review_Required_Count',
    'Release_Gate_Ledger_Status',
    'Release_Gate_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2920TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2920TargetSheet_(),
    sciipGet2920Headers_()
  );
}

function sciipRun2920_SuperSheetImportReleaseGateLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2920ProcessorName_(),
    action: sciipGet2920Action_(),
    sourceSheet: sciipGet2920SourceSheet_(),
    targetSheet: sciipGet2920TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_RUNTIME_LEDGER',

    buildPayload: function(context, definition) {
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      return SCIIP_RUNTIME_PAYLOAD_FACTORY.create({
        processor: context.processor,
        action: context.action,
        businessKey: context.businessKey,
        sourceSheet: definition.sourceSheet,
        targetSheet: definition.targetSheet,
        ledgerSheet: definition.ledgerSheet,
        inputCount: sourceRecords.length,
        outputCount: sourceRecords.length ? 1 : 0,
        summary: 'SuperSheet import release gate ledger runtime payload created.',
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
      const targetSheet = sciipEnsure2920TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2920ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            releaseGateLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2910_SuperSheetImportReleaseGateProcessor after 2900 creates release-ready certification ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER|' + ledgerDate;

      if (sciip2920BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2920ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: sourceRecords.length,
          processed: 0,
          message: JSON.stringify({
            releaseGateLedgerStatus: 'DUPLICATE_SKIPPED',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            ledgerBusinessKey: ledgerBusinessKey,
            transactionId: transaction.transactionId
          })
        });
      }

      const counts = sciip2920CountReleaseGateStatuses_(sourceRecords);
      const posture = sciip2920ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_GATE_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.open,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2920ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2920ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          releaseGateLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          openCount: counts.open,
          blockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          releaseGatePosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2930_SuperSheetImportReleaseAuthorizationProcessor'
        })
      });
    }
  });
}

function sciip2920BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2920CountReleaseGateStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RELEASE_GATE_OPEN') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_READY') !== -1
    ) {
      counts.open += 1;
    } else if (
      statusText.indexOf('RELEASE_GATE_BLOCKED') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1 ||
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { open: 0, blocked: 0, reviewRequired: 0 });
}

function sciip2920ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'RELEASE_GATE_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_RELEASE_BLOCKED',
      summary: 'SuperSheet import release gate ledger recorded blocking conditions.',
      nextAction: 'Review blocked release gate records before authorizing import release.'
    };
  }

  if (counts.open > 0 && counts.open === total) {
    return {
      status: 'RELEASE_GATE_LEDGER_OPEN',
      posture: 'IMPORT_RELEASE_READY',
      summary: 'All SuperSheet import release gate records are open and ready for release authorization.',
      nextAction: 'Proceed to SuperSheet import release authorization.'
    };
  }

  if (counts.open > 0) {
    return {
      status: 'RELEASE_GATE_LEDGER_PARTIAL_OPEN',
      posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import release gate records are open, but not all records reached release-ready posture.',
      nextAction: 'Review release gate records before authorization.'
    };
  }

  return {
    status: 'RELEASE_GATE_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    summary: 'No fully open SuperSheet import release gate records were found.',
    nextAction: 'Run upstream release gate processor with certified inputs.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2920_SuperSheetImportReleaseGateLedgerProcessor() {
  const result = sciipRun2920_SuperSheetImportReleaseGateLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2920_SuperSheetImportReleaseGateLedgerProcessor',
    result: result
  }));

  return result;
}