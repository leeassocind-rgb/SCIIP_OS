/*******************************************************
 * SCIIP_OS v5.4 SuperSheet Import Firewall
 * 2940_SuperSheetImportReleaseAuthorizationLedgerProcessor
 *******************************************************/

function sciipGet2940ProcessorName_() {
  return '2940_SuperSheetImportReleaseAuthorizationLedger';
}

function sciipGet2940SourceSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATIONS';
}

function sciipGet2940TargetSheet_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet2940Action_() {
  return 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_SUMMARY';
}

function sciipGet2940Headers_() {
  return [
    'Ledger_Summary_ID',
    'Business_Key',
    'Ledger_Date',
    'Source_Sheet',
    'Source_Record_Count',
    'Authorized_Count',
    'Blocked_Count',
    'Review_Required_Count',
    'Authorization_Ledger_Status',
    'Authorization_Posture',
    'Summary',
    'Next_Action',
    'Created_At',
    'Processor'
  ];
}

function sciipEnsure2940TargetSheet_() {
  return SCIIP_RUNTIME_SHEET_FACTORY.getOrCreateSheet(
    sciipGet2940TargetSheet_(),
    sciipGet2940Headers_()
  );
}

function sciipRun2940_SuperSheetImportReleaseAuthorizationLedgerProcessor() {
  return SCIIP_RUNTIME_PROCESSOR_BASE.run({
    processor: sciipGet2940ProcessorName_(),
    action: sciipGet2940Action_(),
    sourceSheet: sciipGet2940SourceSheet_(),
    targetSheet: sciipGet2940TargetSheet_(),
    ledgerSheet: 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_RUNTIME_LEDGER',

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
        summary: 'SuperSheet import release authorization ledger runtime payload created.',
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
      const targetSheet = sciipEnsure2940TargetSheet_();
      const sourceRecords = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(definition.sourceSheet) || [];

      if (!sourceRecords.length) {
        return SCIIP_RUNTIME_RESULT_FACTORY.skippedNoInputs({
          processor: sciipGet2940ProcessorName_(),
          businessKey: context.businessKey,
          recordsRead: 0,
          processed: 0,
          message: JSON.stringify({
            authorizationLedgerStatus: 'SKIPPED_NO_INPUTS',
            sourceSheet: definition.sourceSheet,
            targetSheet: definition.targetSheet,
            transactionId: transaction.transactionId,
            nextAction: 'Run 2930_SuperSheetImportReleaseAuthorizationProcessor after 2920 creates release gate ledger summaries.'
          })
        });
      }

      const ledgerDate = context.dateKey || SCIIP_RUNTIME.getDateKey({});
      const ledgerBusinessKey = 'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER|' + ledgerDate;

      if (sciip2940BusinessKeyExists_(definition.targetSheet, ledgerBusinessKey)) {
        return SCIIP_RUNTIME_RESULT_FACTORY.duplicate({
          processor: sciipGet2940ProcessorName_(),
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

      const counts = sciip2940CountAuthorizationStatuses_(sourceRecords);
      const posture = sciip2940ResolvePosture_(counts, sourceRecords.length);

      targetSheet.appendRow([
        'SUPERSHEET_IMPORT_RELEASE_AUTHORIZATION_LEDGER_' + Utilities.getUuid(),
        ledgerBusinessKey,
        ledgerDate,
        definition.sourceSheet,
        sourceRecords.length,
        counts.authorized,
        counts.blocked,
        counts.reviewRequired,
        posture.status,
        posture.posture,
        posture.summary,
        posture.nextAction,
        new Date().toISOString(),
        sciipGet2940ProcessorName_()
      ]);

      return SCIIP_RUNTIME_RESULT_FACTORY.success({
        processor: sciipGet2940ProcessorName_(),
        businessKey: context.businessKey,
        recordsCreated: 1,
        recordsRead: sourceRecords.length,
        processed: 1,
        message: JSON.stringify({
          authorizationLedgerStatus: posture.status,
          sourceRecordsReviewed: sourceRecords.length,
          authorizedCount: counts.authorized,
          blockedCount: counts.blocked,
          reviewRequiredCount: counts.reviewRequired,
          authorizationPosture: posture.posture,
          ledgerBusinessKey: ledgerBusinessKey,
          transactionId: transaction.transactionId,
          nextProcessor: '2950_SuperSheetImportReleaseCommandProcessor'
        })
      });
    }
  });
}

function sciip2940BusinessKeyExists_(sheetName, businessKey) {
  const records = SCIIP_RUNTIME_SHEET_FACTORY.getAllRecords(sheetName) || [];
  return records.some(function(record) {
    return String(record.Business_Key || '').trim() === businessKey;
  });
}

function sciip2940CountAuthorizationStatuses_(records) {
  return records.reduce(function(counts, record) {
    const statusText = Object.keys(record).map(function(key) {
      return String(record[key] || '').toUpperCase();
    }).join(' ');

    if (
      statusText.indexOf('RELEASE_AUTHORIZED') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_AUTHORIZED') !== -1 ||
      statusText.indexOf('AUTHORIZED') !== -1
    ) {
      counts.authorized += 1;
    } else if (
      statusText.indexOf('BLOCK') !== -1 ||
      statusText.indexOf('FAIL') !== -1 ||
      statusText.indexOf('NOT_AUTHORIZED') !== -1 ||
      statusText.indexOf('IMPORT_RELEASE_BLOCKED') !== -1
    ) {
      counts.blocked += 1;
    } else {
      counts.reviewRequired += 1;
    }

    return counts;
  }, { authorized: 0, blocked: 0, reviewRequired: 0 });
}

function sciip2940ResolvePosture_(counts, total) {
  if (counts.blocked > 0) {
    return {
      status: 'AUTHORIZATION_LEDGER_RECORDED_WITH_BLOCKERS',
      posture: 'IMPORT_RELEASE_BLOCKED',
      summary: 'SuperSheet import release authorization ledger recorded blocking conditions.',
      nextAction: 'Review blocked authorization records before issuing import release command.'
    };
  }

  if (counts.authorized > 0 && counts.authorized === total) {
    return {
      status: 'AUTHORIZATION_LEDGER_AUTHORIZED',
      posture: 'IMPORT_RELEASE_AUTHORIZED',
      summary: 'All SuperSheet import release authorization records are authorized.',
      nextAction: 'Proceed to SuperSheet import release command.'
    };
  }

  if (counts.authorized > 0) {
    return {
      status: 'AUTHORIZATION_LEDGER_PARTIAL_AUTHORIZATION',
      posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
      summary: 'Some SuperSheet import release authorization records are authorized, but not all records reached authorized posture.',
      nextAction: 'Review authorization records before issuing release command.'
    };
  }

  return {
    status: 'AUTHORIZATION_LEDGER_REVIEW_REQUIRED',
    posture: 'IMPORT_RELEASE_REVIEW_REQUIRED',
    summary: 'No authorized SuperSheet import release authorization records were found.',
    nextAction: 'Run upstream authorization processor with release-ready ledger input.'
  };
}

/*******************************************************
 * Test Function
 *******************************************************/

function sciipTest2940_SuperSheetImportReleaseAuthorizationLedgerProcessor() {
  const result = sciipRun2940_SuperSheetImportReleaseAuthorizationLedgerProcessor();

  Logger.log(JSON.stringify({
    test: 'sciipTest2940_SuperSheetImportReleaseAuthorizationLedgerProcessor',
    result: result
  }));

  return result;
}